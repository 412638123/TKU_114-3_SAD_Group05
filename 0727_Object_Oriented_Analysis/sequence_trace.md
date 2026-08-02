### I. 循序圖範圍卡

請為兩張循序圖各填一份。

| 欄位 | 內容 |
| --- | --- |
| 循序圖編號 | SEQ-01 |
| 使用案例 | UC-01 建立活動申請、UC-02 檢查場地衝突、UC-03 送出活動申請 |
| 流程類型 | 主要 |
| 前置條件 | 社團幹部開啟活動申請；使用課堂假資料；輸入有效且同場地同日無重疊時段 |
| 參與者 | 社團幹部 |
| 邊界類別 | ApplicationFormBoundary |
| 控制類別 | ApplicationController |
| 實體類別 | ActivityApplication、VenueBooking、Venue |
| 成功或失敗結果 | 成功建立 revision=1 的申請；依 D2／REL-02 建立對應場地借用；顯示待審核 |
| 對應後置條件 | FR-05、FR-06、AC-05-01：申請紀錄建立且狀態為待審核 |

| 欄位 | 內容 |
| --- | --- |
| 循序圖編號 | SEQ-02 |
| 使用案例 | UC-05 查看待審核活動、UC-06 更新活動審核結果與補件重送（FR-08 待確認） |
| 流程類型 | 替代／例外 |
| 前置條件 | 已存在待審核的 ActivityApplication；課外活動組老師開啟審核中心；審核狀態集合須先確認 |
| 參與者 | 課外活動組老師、社團幹部 |
| 邊界類別 | ReviewCenterBoundary、ApplicationFormBoundary |
| 控制類別 | ReviewController、ApplicationController |
| 實體類別 | ActivityApplication、VenueBooking |
| 成功或失敗結果 | 依確認後的審核規則核准、要求補件或退回；缺少必要原因時拒絕；待補件可修改重送 |
| 對應後置條件 | 狀態與原因依已確認規則保存；只有待補件申請可沿用編號重送並增加 revision |

### J. 循序圖訊息表

| 順序 | 發送者 | 接收者 | 訊息 | 輸入 | 回傳 | 對應類別操作 | 對應流程步驟 |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | 社團幹部 | ApplicationFormBoundary | 開啟並填寫活動申請 | 活動名稱、日期、起訖時間、場地、說明 | 表單資料 | updateField(field, value) | UC-01-1～2 |
| 2 | 社團幹部 | ApplicationFormBoundary | 檢查並送出申請 | FormState | 送出事件 | submitApplication(formData) | UC-01-3 |
| 3 | ApplicationFormBoundary | ApplicationController | 建立申請 | ApplicationRequest | CreateResult | create(request) | UC-01-3 |
| 4 | ApplicationController | ApplicationController | 驗證必填與時間 | request | ValidatedInput／錯誤 | validate(request) | UC-01-3～4 |
| 5 | ApplicationController | Venue | 取得有效場地 | venueId | Venue／不存在 | isValid() | UC-02-1 |
| 6 | ApplicationController | VenueBooking | 檢查場地時段重疊 | venueId、date、startTime、endTime | conflict／無衝突 | overlaps(venueId, date, start, end) | UC-02-2 |
| 7 | ApplicationController | ActivityApplication | 建立申請並設定初始狀態 | ValidatedInput、revision=1 | 待審核申請 | submit() | UC-03-1 |
| 8 | ApplicationController | VenueBooking | 建立申請對應的場地借用 | ActivityApplication、venueId、date、startTime、endTime | VenueBooking | reserve(application) | UC-03-1；D2、REL-02 |
| 9 | ApplicationController | ApplicationFormBoundary | 回傳建立結果 | ActivityApplication | 成功訊息、待審核狀態 | showResult(result) | UC-01-7 |

| 順序 | 發送者 | 接收者 | 訊息 | 輸入 | 回傳 | 對應類別操作 | 對應流程步驟 |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | 課外活動組老師 | ReviewCenterBoundary | 查看待審核申請 | 查詢事件 | 待審核清單 | showPendingApplications() | UC-05-1 |
| 2 | ReviewCenterBoundary | ReviewController | 送出審核決定 | applicationId、targetStatus、reviewNote | 審核結果／錯誤 | review(id, target, note) | UC-06-1 |
| 3 | ReviewController | ActivityApplication | 檢查目前與目標狀態 | currentStatus、targetStatus | 合法／非法 | validateTransition(current, target) | UC-06-2 |
| 4 | ReviewController | ReviewCenterBoundary | 拒絕缺少原因的補件／退回 | 空白 reviewNote | 錯誤訊息 | showReviewError(message) | UC-06-E1 |
| 5 | ReviewController | ActivityApplication | 依已確認決定變更狀態 | targetStatus、reviewNote | 已更新申請 | changeStatus(targetStatus, note) | UC-06-A1（待確認） |
| 6 | ActivityApplication | ReviewController | 回傳更新結果 | 更新後狀態與原因 | ActivityApplication | review result | UC-06-A1 |
| 7 | ReviewController | ApplicationFormBoundary | 呈現補件結果 | applicationId、reviewNote | 補件提示 | showResult(result) | UC-06-A2 |
| 8 | 社團幹部 | ApplicationFormBoundary | 修改補件資料 | revisedFormData | 重送事件 | startSupplement(application) | UC-06-A2 |
| 9 | ApplicationFormBoundary | ApplicationController | 重新送出待補件申請 | applicationId、ApplicationRequest | revision+1、待審核 | resubmit(id, request) | UC-06-A2 |

### K. alt 與 loop 片段檢查

| 片段 | 守衛或重複條件 | 來源規則 | 結果或終止條件 | 是否可測試 |
| --- | --- | --- | --- | --- |
| alt 分支 1 | [targetStatus = 已核准] | FR-08 與狀態集合待確認；目前實作有此操作 | 確認後才可定義待審核→已核准 | 是；確認規則後測試 |
| alt 分支 2 | [targetStatus = 待補件 and reviewNote 不為空] | 目前實作要求補件原因；需求狀態集合待確認 | 確認後才可定義待審核→待補件及重送 | 是；確認規則後測試 |
| alt 分支 3 | [targetStatus = 已退回 and reviewNote 不為空] | 目前實作支援退回；FR-08 與終止語意待確認 | 確認後才可定義待審核→已退回 | 是；確認規則後測試 |
| alt 例外分支 | [targetStatus = 待補件或已退回 and reviewNote 為空] | 目前實作的審核原因限制；需求待確認 | 拒絕審核動作，狀態維持不變 | 是；確認原因規則後測試 |
| loop | [status = 待補件、尚未取消且尚未成功重送] | UC-06 補件流程與 `resubmit`；FR-08 待確認 | 有效且無衝突時轉回待審核；取消時維持待補件並終止 | 是；確認補件流程後測試成功、失敗與取消 |
