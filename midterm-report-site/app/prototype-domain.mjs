export const requiredFields = [
  ["activityName", "請輸入活動名稱。"],
  ["date", "請選擇活動日期。"],
  ["startTime", "請選擇開始時間。"],
  ["endTime", "請選擇結束時間。"],
  ["venue", "請輸入活動場地。"],
];

export function validateApplication(form) {
  const errors = {};

  for (const [field, message] of requiredFields) {
    if (!String(form[field] ?? "").trim()) errors[field] = message;
  }

  if (form.startTime && form.endTime && form.endTime <= form.startTime) {
    errors.endTime = "結束時間必須晚於開始時間。";
  }

  return errors;
}

export function findVenueConflict(applications, form, editingId = null) {
  return (
    applications.find(
      (item) =>
        item.id !== editingId &&
        item.status !== "已退回" &&
        item.venue.trim() === form.venue.trim() &&
        item.date === form.date &&
        form.startTime < item.endTime &&
        form.endTime > item.startTime,
    ) ?? null
  );
}

export function validateReviewTransition(currentStatus, targetStatus, note) {
  if (currentStatus !== "待審核") {
    return "目前狀態不可再次審核；請重新整理並確認申請狀態。";
  }

  if (!new Set(["已核准", "待補件", "已退回"]).has(targetStatus)) {
    return "審核結果不在允許範圍內。";
  }

  if (targetStatus !== "已核准" && !String(note ?? "").trim()) {
    return "要求補件或退回申請時，必須先填寫原因。";
  }

  return null;
}

export function canResubmit(status) {
  return status === "待補件";
}
