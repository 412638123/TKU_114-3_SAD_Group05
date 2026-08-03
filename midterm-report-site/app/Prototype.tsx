"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  findVenueConflict,
  validateApplication,
  validateReviewTransition,
} from "./prototype-domain.mjs";

type ApplicationStatus = "待審核" | "待補件" | "已核准" | "已退回";
type Role = "club" | "staff" | "venue" | "student";

type Application = {
  id: number;
  activityName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  description: string;
  status: ApplicationStatus;
  reviewNote: string;
  revision: number;
};

type FormState = Pick<
  Application,
  | "activityName"
  | "date"
  | "startTime"
  | "endTime"
  | "venue"
  | "description"
>;

type Notification = {
  id: number;
  role: Role;
  message: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
type MessageTone = "success" | "error" | "info" | "loading";

const emptyForm: FormState = {
  activityName: "",
  date: "",
  startTime: "",
  endTime: "",
  venue: "",
  description: "",
};

const anonymousTestApplications: Application[] = [
  {
    id: 1001,
    activityName: "攝影社迎新工作坊",
    date: "2026-08-15",
    startTime: "14:00",
    endTime: "16:00",
    venue: "活動中心 R201",
    description: "匿名測試資料：提供場地衝突與審核任務使用。",
    status: "待審核",
    reviewNote: "",
    revision: 1,
  },
  {
    id: 1002,
    activityName: "吉他社成果發表",
    date: "2026-08-20",
    startTime: "18:00",
    endTime: "20:00",
    venue: "文錙音樂廳",
    description: "匿名測試資料：提供場地與活動查詢畫面使用。",
    status: "已核准",
    reviewNote: "",
    revision: 1,
  },
];

function waitForFeedback() {
  return new Promise((resolve) => window.setTimeout(resolve, 450));
}

const roles: Array<{
  id: Role;
  label: string;
  requirement: string;
}> = [
  { id: "club", label: "社團幹部", requirement: "FR-01～FR-07" },
  { id: "staff", label: "課外活動組", requirement: "FR-08" },
  { id: "venue", label: "場地管理員", requirement: "FR-09" },
  { id: "student", label: "一般學生", requirement: "FR-10" },
];

function statusClass(status: ApplicationStatus) {
  if (status === "已核准") return "approved";
  if (status === "已退回") return "returned";
  if (status === "待補件") return "supplement";
  return "pending";
}

export default function Prototype() {
  const [activeRole, setActiveRole] = useState<Role>("club");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [reviewDrafts, setReviewDrafts] = useState<Record<number, string>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const [studentVenue, setStudentVenue] = useState("全部場地");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [showPermissionDenied, setShowPermissionDenied] = useState(false);
  const [message, setMessage] = useState<{
    tone: MessageTone;
    text: string;
  }>({
    tone: "info",
    text: "尚未建立申請。請輸入資料，現場驗證核心流程。",
  });
  const [staffMessage, setStaffMessage] = useState<{
    tone: MessageTone;
    text: string;
  }>({
    tone: "info",
    text: "核准可直接送出；要求補件或退回時必須填寫原因。",
  });

  const canSubmit = useMemo(
    () =>
      Boolean(
        form.activityName &&
          form.date &&
          form.startTime &&
          form.endTime &&
          form.venue,
      ),
    [form],
  );
  const pendingApplications = applications.filter(
    (item) => item.status === "待審核",
  );
  const approvedApplications = applications.filter(
    (item) => item.status === "已核准",
  );
  const processedApplications = applications.filter(
    (item) => item.status !== "待審核",
  );
  const activeRoleData = roles.find((role) => role.id === activeRole) ?? roles[0];
  const activeNotifications = notifications.filter(
    (notification) => notification.role === activeRole,
  );
  const studentVenues = [
    "全部場地",
    ...Array.from(new Set(approvedApplications.map((item) => item.venue))),
  ];
  const visibleStudentActivities = approvedApplications.filter((item) => {
    const query = studentQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      item.activityName.toLowerCase().includes(query) ||
      item.venue.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    const matchesVenue =
      studentVenue === "全部場地" || item.venue === studentVenue;
    return matchesQuery && matchesVenue;
  });

  function addNotification(role: Role, notificationMessage: string) {
    setNotifications((current) => [
      { id: Date.now() + Math.random(), role, message: notificationMessage },
      ...current,
    ]);
  }

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const validationErrors = validateApplication(form) as FieldErrors;
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setMessage({
        tone: "error",
        text: "申請尚未送出。請修正標示的欄位後再試一次。",
      });
      return;
    }

    const conflict = findVenueConflict(applications, form, editingId) as
      | Application
      | null;

    if (conflict) {
      setFieldErrors({
        venue: `此場地與「${conflict.activityName}」的使用時間重疊。`,
      });
      setMessage({
        tone: "error",
        text: `無法送出：${conflict.venue} 在 ${conflict.date} ${conflict.startTime}–${conflict.endTime} 已有申請。請更換場地或調整時間。`,
      });
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);
    setMessage({ tone: "loading", text: "正在檢查資料並送出，請勿重複操作。" });
    await waitForFeedback();

    if (editingId !== null) {
      const current = applications.find((item) => item.id === editingId);
      setApplications((items) =>
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...form,
                status: "待審核",
                reviewNote: "",
                revision: item.revision + 1,
              }
            : item,
        ),
      );
      setMessage({
        tone: "success",
        text: "補件資料已重新送出，申請狀態更新為「待審核」。",
      });
      addNotification(
        "staff",
        `${current?.activityName ?? "活動申請"}已完成補件並重新送出。`,
      );
      setEditingId(null);
      setForm(emptyForm);
      setIsSubmitting(false);
      return;
    }

    const newApplication: Application = {
      ...form,
      id: Date.now(),
      status: "待審核",
      reviewNote: "",
      revision: 1,
    };

    setApplications((current) => [newApplication, ...current]);
    setMessage({
      tone: "success",
      text: "申請建立成功，狀態已由「建立中」更新為「待審核」。",
    });
    addNotification(
      "staff",
      `${newApplication.activityName}已送出，等待課外活動組處理。`,
    );
    setForm(emptyForm);
    setIsSubmitting(false);
  }

  function startSupplement(application: Application) {
    setEditingId(application.id);
    setForm({
      activityName: application.activityName,
      date: application.date,
      startTime: application.startTime,
      endTime: application.endTime,
      venue: application.venue,
      description: application.description,
    });
    setMessage({
      tone: "info",
      text: `正在修改「${application.activityName}」。完成後請按下重新送出。`,
    });
    setFieldErrors({});
  }

  function cancelSupplement() {
    setEditingId(null);
    setForm(emptyForm);
    setFieldErrors({});
    setMessage({
      tone: "info",
      text: "已取消修改，原申請仍維持待補件狀態。",
    });
  }

  async function updateApplicationStatus(
    applicationId: number,
    status: "已核准" | "待補件" | "已退回",
  ) {
    if (reviewingId !== null) return;
    const application = applications.find((item) => item.id === applicationId);
    const note = reviewDrafts[applicationId]?.trim() ?? "";
    const reviewError = validateReviewTransition(
      application?.status ?? "",
      status,
      note,
    );

    if (reviewError) {
      setStaffMessage({
        tone: "error",
        text: reviewError,
      });
      return;
    }

    setReviewingId(applicationId);
    setStaffMessage({ tone: "loading", text: "正在保存審核結果，請勿重複操作。" });
    await waitForFeedback();

    setApplications((current) =>
      current.map((item) =>
        item.id === applicationId
          ? { ...item, status, reviewNote: note }
          : item,
      ),
    );
    setReviewDrafts((current) => ({ ...current, [applicationId]: "" }));
    setStaffMessage({
      tone: "success",
      text: `${application?.activityName ?? "活動申請"}已更新為「${status}」。`,
    });
    addNotification(
      "club",
      `${application?.activityName ?? "活動申請"}的審核結果為「${status}」${note ? `：${note}` : "。"}`,
    );
    if (status === "已核准") {
      addNotification(
        "venue",
        `${application?.activityName ?? "活動"}已核准，請查看場地使用資訊。`,
      );
      addNotification(
        "student",
        `${application?.activityName ?? "新活動"}已公布，可查看活動時間與地點。`,
      );
    }
    setReviewingId(null);
  }

  function clearRoleNotifications() {
    setNotifications((current) =>
      current.filter((notification) => notification.role !== activeRole),
    );
  }

  function resetPrototype() {
    setApplications([]);
    setForm(emptyForm);
    setEditingId(null);
    setFieldErrors({});
    setReviewDrafts({});
    setNotifications([]);
    setStudentQuery("");
    setStudentVenue("全部場地");
    setActiveRole("club");
    setIsSubmitting(false);
    setReviewingId(null);
    setShowPermissionDenied(false);
    setMessage({
      tone: "info",
      text: "示範資料已清除，可重新驗證完整跨角色流程。",
    });
    setStaffMessage({
      tone: "info",
      text: "核准可直接送出；要求補件或退回時必須填寫原因。",
    });
  }

  function loadAnonymousTestData() {
    setApplications(anonymousTestApplications);
    setForm({
      activityName: "衝突測試活動",
      date: "2026-08-15",
      startTime: "15:00",
      endTime: "17:00",
      venue: "活動中心 R201",
      description: "匿名測試資料：請觀察衝突訊息並自行決定如何修正。",
    });
    setEditingId(null);
    setFieldErrors({});
    setReviewDrafts({});
    setNotifications([
      { id: 2001, role: "staff", message: "攝影社迎新工作坊已送出，等待審核。" },
      { id: 2002, role: "venue", message: "吉他社成果發表已核准，請查看場地資訊。" },
      { id: 2003, role: "student", message: "吉他社成果發表已公布。" },
    ]);
    setActiveRole("club");
    setShowPermissionDenied(false);
    setMessage({
      tone: "info",
      text: "已載入匿名測試資料與衝突範例。可執行場地衝突、審核、補件與查詢任務。",
    });
  }

  return (
    <section className="section prototype-section" id="prototype">
      <div className="section-heading">
        <span className="section-index">04</span>
        <div>
          <p className="kicker">系統實作成果</p>
          <h2>三個核心任務、六類狀態，可直接操作驗證。</h2>
        </div>
      </div>

      <div className="scenario-guide">
        <div>
          <span>TF-01 · 建立申請</span>
          <p>社團幹部完成有效申請，看到送出處理與待審核結果。</p>
        </div>
        <div>
          <span>TF-02 · 處理衝突</span>
          <p>系統指出衝突場地與時間，使用者修改後可再次送出。</p>
        </div>
        <div>
          <span>TF-03 · 補件審核</span>
          <p>老師要求補件、幹部修改重送，再由老師完成核准。</p>
        </div>
      </div>

      <div className="role-switcher" aria-label="切換操作角色">
        {roles.map((role) => {
          const notificationCount = notifications.filter(
            (notification) => notification.role === role.id,
          ).length;
          return (
            <button
              className={activeRole === role.id ? "active" : ""}
              key={role.id}
              onClick={() => {
                setActiveRole(role.id);
                setShowPermissionDenied(false);
              }}
              type="button"
              aria-pressed={activeRole === role.id}
            >
              <span>
                {role.label}
                {notificationCount > 0 && (
                  <b className="notification-count">{notificationCount}</b>
                )}
              </span>
              <small>{role.requirement}</small>
            </button>
          );
        })}
      </div>

      <div className="prototype-shell">
        <div className="prototype-bar">
          <div>
            <span className="status-light" />
            <strong>{activeRoleData.label}操作畫面</strong>
            <small>{activeRoleData.requirement} / Mock Data</small>
          </div>
          <div className="prototype-tools">
            <button type="button" onClick={loadAnonymousTestData}>
              載入匿名測試資料
            </button>
            <button
              type="button"
              onClick={() => setShowPermissionDenied(true)}
              aria-pressed={showPermissionDenied}
            >
              預覽權限不足
            </button>
            <button type="button" onClick={resetPrototype}>
              清除示範資料
            </button>
          </div>
        </div>

        {activeNotifications.length > 0 && (
          <div className="notification-center" aria-live="polite">
            <div>
              <strong>站內通知</strong>
              <span>{activeNotifications.length} 則新訊息</span>
            </div>
            <ul>
              {activeNotifications.slice(0, 3).map((notification) => (
                <li key={notification.id}>{notification.message}</li>
              ))}
            </ul>
            <button type="button" onClick={clearRoleNotifications}>
              全部標為已讀
            </button>
          </div>
        )}

        {showPermissionDenied ? (
          <PermissionDenied onBack={() => setShowPermissionDenied(false)} />
        ) : activeRole === "club" ? (
          <div className="prototype-grid">
            <form onSubmit={submitApplication} noValidate>
              <div className="form-heading">
                <span>{editingId ? "補件修改" : "UC-01～UC-03"}</span>
                <h3>{editingId ? "修改並重新送出" : "建立活動申請"}</h3>
                <p>
                  標示 * 的欄位為必填。送出時會先檢查資料與場地衝突。
                </p>
              </div>
              <label>
                活動名稱 *
                <input
                  id="activityName"
                  value={form.activityName}
                  onChange={(event) =>
                    updateField("activityName", event.target.value)
                  }
                  placeholder="輸入活動名稱"
                  aria-invalid={Boolean(fieldErrors.activityName)}
                  aria-describedby={fieldErrors.activityName ? "activityName-error" : undefined}
                  disabled={isSubmitting}
                />
                {fieldErrors.activityName && (
                  <small className="field-error" id="activityName-error">
                    {fieldErrors.activityName}
                  </small>
                )}
              </label>
              <div className="form-row">
                <label>
                  日期 *
                  <input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(event) => updateField("date", event.target.value)}
                    aria-invalid={Boolean(fieldErrors.date)}
                    aria-describedby={fieldErrors.date ? "date-error" : undefined}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.date && (
                    <small className="field-error" id="date-error">
                      {fieldErrors.date}
                    </small>
                  )}
                </label>
                <label>
                  場地 *
                  <input
                    id="venue"
                    value={form.venue}
                    onChange={(event) =>
                      updateField("venue", event.target.value)
                    }
                    placeholder="輸入場地"
                    aria-invalid={Boolean(fieldErrors.venue)}
                    aria-describedby={fieldErrors.venue ? "venue-error" : undefined}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.venue && (
                    <small className="field-error" id="venue-error">
                      {fieldErrors.venue}
                    </small>
                  )}
                </label>
              </div>
              <div className="form-row">
                <label>
                  開始時間 *
                  <input
                    id="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={(event) =>
                      updateField("startTime", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.startTime)}
                    aria-describedby={fieldErrors.startTime ? "startTime-error" : undefined}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.startTime && (
                    <small className="field-error" id="startTime-error">
                      {fieldErrors.startTime}
                    </small>
                  )}
                </label>
                <label>
                  結束時間 *
                  <input
                    id="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={(event) =>
                      updateField("endTime", event.target.value)
                    }
                    aria-invalid={Boolean(fieldErrors.endTime)}
                    aria-describedby={fieldErrors.endTime ? "endTime-error" : undefined}
                    disabled={isSubmitting}
                  />
                  {fieldErrors.endTime && (
                    <small className="field-error" id="endTime-error">
                      {fieldErrors.endTime}
                    </small>
                  )}
                </label>
              </div>
              <label>
                活動說明
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(event) =>
                    updateField("description", event.target.value)
                  }
                  placeholder="輸入活動說明"
                  rows={4}
                  disabled={isSubmitting}
                />
              </label>
              <button
                className="submit-button"
                type="submit"
                disabled={isSubmitting}
                aria-describedby="submit-state-hint"
              >
                {isSubmitting
                  ? "正在檢查並送出…"
                  : editingId
                    ? "重新送出申請"
                    : "檢查並送出申請"}
                <span aria-hidden="true">{isSubmitting ? "…" : "→"}</span>
              </button>
              <small className="submit-state-hint" id="submit-state-hint">
                {isSubmitting
                  ? "處理期間欄位與按鈕暫時停用，避免重複送出。"
                  : canSubmit
                    ? "資料看起來完整，送出後仍會檢查時間與場地衝突。"
                    : "請完成所有標示 * 的欄位。"}
              </small>
              {editingId && (
                <button
                  className="cancel-edit-button"
                  type="button"
                  onClick={cancelSupplement}
                  disabled={isSubmitting}
                >
                  取消修改
                </button>
              )}
            </form>

            <div className="application-panel" aria-live="polite">
              <div className="form-heading">
                <span>UC-04</span>
                <h3>我的申請與狀態</h3>
                <p>審核結果、補件原因與版本次數會同步顯示。</p>
              </div>
              <SystemMessage message={message} />
              <div className="record-summary">
                <span>目前紀錄</span>
                <strong>{applications.length}</strong>
                <span>資料儲存</span>
                <strong>瀏覽器記憶體</strong>
              </div>
              <ApplicationCards
                applications={applications}
                emptyText="先在左側建立第一筆資料，再切換角色進行審核。"
                onSupplement={startSupplement}
              />
            </div>
          </div>
        ) : null}

        {!showPermissionDenied && activeRole === "staff" && (
          <div className="role-panel">
            <div className="role-panel-heading">
              <div>
                <span>UC-05／UC-06 · FR-08</span>
                <h3>活動申請審核中心</h3>
                <p>
                  查看申請詳情；核准可直接送出，補件與退回必須留下原因。
                </p>
              </div>
              <strong>{pendingApplications.length} 筆待處理</strong>
            </div>
            <SystemMessage message={staffMessage} />
            {pendingApplications.length === 0 ? (
              <RoleEmpty
                title="目前沒有待審核申請"
                text="請先切換到「社團幹部」建立或重新送出活動申請。"
              />
            ) : (
              <div className="review-list">
                {pendingApplications.map((item) => (
                  <article className="review-card expanded" key={item.id}>
                    <div className="review-card-main">
                      <div className="review-meta">
                        <span className="record-status pending">
                          {item.status}
                        </span>
                        <small>第 {item.revision} 版</small>
                      </div>
                      <h4>{item.activityName}</h4>
                      <dl className="review-details">
                        <div>
                          <dt>日期</dt>
                          <dd>{item.date}</dd>
                        </div>
                        <div>
                          <dt>時間</dt>
                          <dd>
                            {item.startTime}–{item.endTime}
                          </dd>
                        </div>
                        <div>
                          <dt>場地</dt>
                          <dd>{item.venue}</dd>
                        </div>
                        <div>
                          <dt>活動說明</dt>
                          <dd>{item.description || "未填寫"}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="review-decision">
                      <label>
                        補件／退回原因
                        <textarea
                          rows={3}
                          value={reviewDrafts[item.id] ?? ""}
                          onChange={(event) =>
                            setReviewDrafts((current) => ({
                              ...current,
                              [item.id]: event.target.value,
                            }))
                          }
                          placeholder="要求補件或退回時必填"
                          aria-describedby={`review-note-hint-${item.id}`}
                          disabled={reviewingId === item.id}
                        />
                        <small id={`review-note-hint-${item.id}`}>
                          核准可不填；要求補件或退回時必須提供可採取行動的原因。
                        </small>
                      </label>
                      <div className="review-actions three-actions">
                        <button
                          className="approve-action"
                          onClick={() =>
                            updateApplicationStatus(item.id, "已核准")
                          }
                          type="button"
                          disabled={reviewingId === item.id}
                        >
                          {reviewingId === item.id ? "處理中…" : "核准"}
                        </button>
                        <button
                          className="supplement-action"
                          onClick={() =>
                            updateApplicationStatus(item.id, "待補件")
                          }
                          type="button"
                          disabled={reviewingId === item.id}
                        >
                          要求補件
                        </button>
                        <button
                          className="return-action"
                          onClick={() =>
                            updateApplicationStatus(item.id, "已退回")
                          }
                          type="button"
                          disabled={reviewingId === item.id}
                        >
                          退回
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {processedApplications.length > 0 && (
              <div className="processed-section">
                <h4>已處理紀錄</h4>
                <ApplicationCards
                  applications={processedApplications}
                  emptyText=""
                />
              </div>
            )}
          </div>
        )}

        {!showPermissionDenied && activeRole === "venue" && (
          <div className="role-panel">
            <div className="role-panel-heading">
              <div>
                <span>ACT-03 · FR-09</span>
                <h3>已確認場地使用行程</h3>
                <p>
                  查看已核准的場地、活動、日期與使用時間；正式通知服務仍待串接。
                </p>
              </div>
              <strong>{approvedApplications.length} 筆已確認</strong>
            </div>
            {approvedApplications.length === 0 ? (
              <RoleEmpty
                title="目前沒有已核准的場地"
                text="課外活動組核准申請後，場地使用行程會顯示在此處。"
              />
            ) : (
              <div className="venue-grid">
                {approvedApplications
                  .slice()
                  .sort((left, right) =>
                    `${left.date}${left.startTime}`.localeCompare(
                      `${right.date}${right.startTime}`,
                    ),
                  )
                  .map((item) => (
                    <article className="venue-card" key={item.id}>
                      <div className="venue-card-status">
                        <span>{item.date}</span>
                        <b>已確認</b>
                      </div>
                      <h4>{item.venue}</h4>
                      <strong>
                        {item.startTime}–{item.endTime}
                      </strong>
                      <p>{item.activityName}</p>
                      {item.description && <small>{item.description}</small>}
                    </article>
                  ))}
              </div>
            )}
          </div>
        )}

        {!showPermissionDenied && activeRole === "student" && (
          <div className="role-panel student-view">
            <div className="role-panel-heading">
              <div>
                <span>ACT-04 · FR-10</span>
                <h3>可參與與即將舉辦的活動</h3>
                <p>搜尋活動名稱、地點或說明，並依場地篩選已核准活動。</p>
              </div>
              <strong>{visibleStudentActivities.length} 個活動</strong>
            </div>
            <div className="student-filters">
              <label>
                搜尋活動
                <input
                  value={studentQuery}
                  onChange={(event) => setStudentQuery(event.target.value)}
                  placeholder="輸入活動名稱、場地或關鍵字"
                />
              </label>
              <label>
                場地篩選
                <select
                  value={studentVenue}
                  onChange={(event) => setStudentVenue(event.target.value)}
                >
                  {studentVenues.map((venue) => (
                    <option key={venue} value={venue}>
                      {venue}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {visibleStudentActivities.length === 0 ? (
              <RoleEmpty
                title={
                  approvedApplications.length === 0
                    ? "目前沒有可顯示的活動"
                    : "找不到符合條件的活動"
                }
                text={
                  approvedApplications.length === 0
                    ? "活動通過核准後，才會出現在一般學生的活動資訊畫面。"
                    : "請調整搜尋關鍵字或場地篩選。"
                }
              />
            ) : (
              <div className="student-activity-grid">
                {visibleStudentActivities.map((item) => (
                  <article className="student-activity-card" key={item.id}>
                    <span>已核准活動</span>
                    <h4>{item.activityName}</h4>
                    <dl>
                      <div>
                        <dt>日期</dt>
                        <dd>{item.date}</dd>
                      </div>
                      <div>
                        <dt>時間</dt>
                        <dd>
                          {item.startTime}–{item.endTime}
                        </dd>
                      </div>
                      <div>
                        <dt>地點</dt>
                        <dd>{item.venue}</dd>
                      </div>
                    </dl>
                    {item.description && <p>{item.description}</p>}
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="acceptance-strip four-columns">
        <div>
          <span>社團幹部</span>
          <strong>申請、補件、重送、查詢</strong>
        </div>
        <div>
          <span>課外活動組</span>
          <strong>核准、補件、退回與原因</strong>
        </div>
        <div>
          <span>場地管理員</span>
          <strong>已核准場地行程</strong>
        </div>
        <div>
          <span>一般學生</span>
          <strong>活動搜尋與場地篩選</strong>
        </div>
      </div>
    </section>
  );
}

function SystemMessage({
  message,
}: {
  message: { tone: MessageTone; text: string };
}) {
  return (
    <div
      className={`system-message ${message.tone}`}
      role={message.tone === "error" ? "alert" : "status"}
      aria-live={message.tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <span aria-hidden="true">
        {message.tone === "success"
          ? "✓"
          : message.tone === "error"
            ? "!"
            : message.tone === "loading"
              ? "…"
              : "i"}
      </span>
      <p>{message.text}</p>
    </div>
  );
}

function PermissionDenied({ onBack }: { onBack: () => void }) {
  return (
    <div className="permission-denied" role="alert" aria-labelledby="permission-title">
      <span aria-hidden="true">!</span>
      <p className="kicker">權限不足狀態</p>
      <h3 id="permission-title">你目前沒有檢視此功能的權限</h3>
      <p>
        請返回目前角色的操作畫面；正式系統仍須由伺服端驗證身分與權限，不能只靠隱藏按鈕。
      </p>
      <button type="button" onClick={onBack} autoFocus>
        返回目前角色畫面
      </button>
    </div>
  );
}

function ApplicationCards({
  applications,
  emptyText,
  onSupplement,
}: {
  applications: Application[];
  emptyText: string;
  onSupplement?: (application: Application) => void;
}) {
  if (applications.length === 0) {
    return (
      <div className="empty-state">
        <span>＋</span>
        <p>尚無申請紀錄</p>
        <small>{emptyText}</small>
      </div>
    );
  }

  return (
    <div className="records">
      {applications.map((item) => (
        <article className="record-card" key={item.id}>
          <div>
            <span className={`record-status ${statusClass(item.status)}`}>
              {item.status}
            </span>
            <small>
              {item.date} · 第 {item.revision} 版
            </small>
          </div>
          <h4>{item.activityName}</h4>
          <p>
            {item.venue} · {item.startTime}–{item.endTime}
          </p>
          {item.description && <small>{item.description}</small>}
          {item.reviewNote && (
            <div className="review-note">
              <b>{item.status === "待補件" ? "補件原因" : "審核說明"}</b>
              <p>{item.reviewNote}</p>
            </div>
          )}
          {item.status === "待補件" && onSupplement && (
            <button
              className="supplement-edit-button"
              type="button"
              onClick={() => onSupplement(item)}
            >
              修改並重新送出
            </button>
          )}
        </article>
      ))}
    </div>
  );
}

function RoleEmpty({ title, text }: { title: string; text: string }) {
  return (
    <div className="role-empty">
      <span>—</span>
      <h4>{title}</h4>
      <p>{text}</p>
    </div>
  );
}
