### Q. 更新後的模型驅動實作任務書

```text
任務名稱：確認 FR-08 狀態規則後修正 ActivityApplication 狀態轉移

需求與模型版本：0714 Requirements Package v0.1、BASELINE-2026-0722-V1、0727 D～P 表；實作基準提交 3d664da，目前分支 main／提交 89904ac。

目前症狀：ApplicationService.updateStatus 只檢查目標狀態與補件／退回原因，未檢查目前狀態；已核准申請仍可改成待補件或已退回，但 FR-08 的完整轉移規則尚未確認。

重現方式：建立有效申請使其為待審核；核准成已核准；再次呼叫 updateStatus(id, "待補件", "原因")；目前系統接受並改變狀態，IST-01 失敗。

正確責任分配：ReviewCenterBoundary 只接收及呈現審核結果；ReviewController 協調審核；ActivityApplication 依確認後的規則驗證目前狀態與目標狀態；ApplicationService 不得繞過實體狀態規則。

涉及類別：ReviewCenterBoundary、ReviewController、ActivityApplication、ApplicationService、ApplicationServiceTest。

涉及訊息與互動順序：課外活動組老師→ReviewCenterBoundary.review→ReviewController.review→ActivityApplication.changeStatus→ReviewCenterBoundary.showResult；非法時由 ActivityApplication 回傳錯誤，不更新集合。

合法狀態轉移：已確認為有效新申請→待審核；其餘候選轉移為待審核→已核准、待審核→待補件、待補件→待審核、待審核→已退回，須先確認 FR-08。

非法狀態轉移：非待補件申請→重新送出已由目前實作拒絕；已核准回轉、已退回復原及補件／退回原因規則尚未確認，不可先宣告為業務規則。

要保留：既有必填、時間、同場地重疊、不同場地、補件原因、版本增加與繁體中文訊息行為。

要修改：取得 FR-08 確認結果後，在 ActivityApplication 或明確的狀態規則中加入相符的目前狀態檢查。

要新增：IST-01、IST-02 自動測試，以及合法狀態轉移的回歸斷言。

要刪除：無。

本次不做：正式登入、正式資料庫、付款、外部 Email／LINE 通知、跨校區、自動排程、指導老師簽核與撤銷核准流程。

不可自行判斷：不得新增狀態；不得自行禁止或允許已核准撤銷、核准後回轉或已退回復原；必須先取得課外活動組規則並更新需求與狀態模型。

主要流程測試：有效無衝突申請建立成功且為待審核；相同時間不同場地可建立。

替代或例外測試：缺必填拒絕；同場地重疊拒絕；相鄰時段可建立；待補件可修改重送且 revision 增加。

狀態轉移測試：先確認待審核的審核結果、原因限制與終止語意，再測試合法轉移及未定義轉移；待補件重送維持既有回歸測試。

完成定義：FR-08 已確認；所有既有 ApplicationServiceTest 通過；新增的合法與非法轉移測試符合確認規則；拒絕的動作不修改資料；M～P 與程式行為一致；未加入範圍外功能。

完成後回報格式：列出修改檔案、責任與狀態規則差異、執行的測試與結果、未解問題、Git 提交識別碼。
```
