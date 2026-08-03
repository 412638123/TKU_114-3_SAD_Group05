import assert from "node:assert/strict";
import test from "node:test";

import {
  canResubmit,
  findVenueConflict,
  validateApplication,
  validateReviewTransition,
} from "../app/prototype-domain.mjs";

const validForm = {
  activityName: "攝影社迎新工作坊",
  date: "2026-08-15",
  startTime: "14:00",
  endTime: "16:00",
  venue: "活動中心 R201",
  description: "匿名測試資料",
};

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Group05 usability prototype", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /校園社團活動與場地智慧管理平台/);
  assert.match(html, /三個核心任務/);
  assert.match(html, /建立活動申請/);
  assert.match(html, /TF-03 · 補件審核/);
  assert.match(html, /課外活動組/);
});

test("validates required fields and time order", () => {
  const missing = validateApplication({ ...validForm, activityName: "" });
  assert.equal(missing.activityName, "請輸入活動名稱。");

  const invalidTime = validateApplication({
    ...validForm,
    startTime: "16:00",
    endTime: "15:00",
  });
  assert.equal(invalidTime.endTime, "結束時間必須晚於開始時間。");
  assert.deepEqual(validateApplication(validForm), {});
});

test("blocks overlapping venue time but allows adjacent time", () => {
  const existing = [{ ...validForm, id: 1, status: "待審核" }];
  assert.equal(
    findVenueConflict(existing, { ...validForm, startTime: "15:00", endTime: "17:00" })?.id,
    1,
  );
  assert.equal(
    findVenueConflict(existing, { ...validForm, startTime: "16:00", endTime: "17:00" }),
    null,
  );
  assert.equal(
    findVenueConflict(existing, { ...validForm, venue: "另一場地" }),
    null,
  );
});

test("enforces review notes and rejects undefined state transitions", () => {
  assert.equal(validateReviewTransition("待審核", "已核准", ""), null);
  assert.match(
    validateReviewTransition("待審核", "待補件", "") ?? "",
    /必須先填寫原因/,
  );
  assert.match(
    validateReviewTransition("已核准", "待補件", "補件") ?? "",
    /不可再次審核/,
  );
  assert.equal(canResubmit("待補件"), true);
  assert.equal(canResubmit("已退回"), false);
});
