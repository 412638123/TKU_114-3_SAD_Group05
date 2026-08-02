### G. BCE 責任檢核

| 使用案例步驟 | 輸入或事件 | Boundary（邊界）責任 | Control（控制）責任 | Entity（實體）責任 | 問題與修正 |
| --- | --- | --- | --- | --- | --- |
| UC-01-1 開啟活動申請 | 社團幹部選擇建立活動申請 | ApplicationFormBoundary 顯示表單與必要提示 | ApplicationController 準備建立流程並取得可用場地 | Venue 提供穩定場地資料 | 現有前端以自由文字輸入場地，與 ERD 的 Venue 不一致；是否改為清單依目前有效場地資料確認，不新增場地規則 |
| UC-01-2 輸入資料 | 活動名稱、日期、開始時間、結束時間、場地、說明 | ApplicationFormBoundary 接收並暫存輸入 | ApplicationController 建立申請請求 | ActivityApplication 定義申請資料 | 符合；Boundary 不應在此直接建立或改變實體狀態 |
| UC-01-3 檢查必填 | 送出事件 | ApplicationFormBoundary 顯示錯誤並保留輸入 | ApplicationController 協調 validate(request) | ActivityApplication 提供建立所需資料 | 前端與 Java 重複相同規則；應以相同驗收案例檢查結果，不要求依 UML 方框機械式拆檔 |
| UC-01-4 檢查時間 | 開始與結束時間 | ApplicationFormBoundary 呈現時間錯誤 | ApplicationController 協調時間驗證 | VenueBooking 保存有效起訖時間 | BR-02 支援 endTime > startTime；判斷放在 Control 或 VenueBooking 的最終位置仍需與責任模型一致 |
| UC-01-5 檢查衝突 | 場地、日期、起訖時間 | ApplicationFormBoundary 呈現衝突原因 | ApplicationController 取得既有借用並委託判斷 | VenueBooking.overlaps() 判斷同場地同日重疊 | 目前規則在 `Prototype.submitApplication` 與 `ApplicationService.findConflict` 重複；應由 VenueBooking 承擔判斷責任，Control 只協調 |
| UC-01-6 建立申請與借用 | 已驗證且無衝突資料 | ApplicationFormBoundary 不直接修改狀態 | ApplicationController 協調建立申請及借用 | ActivityApplication 建立 revision=1；VenueBooking.reserve() 建立對應借用 | 原循序圖缺少 reserve 訊息；應補回既有操作。若實作不建立獨立借用，須先確認 D2 與 REL-02，不得假裝已完成 |
| UC-01-7 設定待審核 | 申請與借用建立成功 | ApplicationFormBoundary 顯示成功 | ApplicationController 協調初始結果 | ActivityApplication 維護初始狀態為待審核 | ActivityApplication 在 Java 中只有資料；應依已確認狀態規則維護自身狀態。核准／補件／退回集合仍標待確認 |
| UC-01-8 顯示與查詢結果 | 新申請與目前狀態 | ApplicationFormBoundary 顯示活動、場地、時間及狀態 | ApplicationController 回傳 CreateResult 並提供查詢 | ActivityApplication 提供狀態與版本 | UC-04 不新增 Boundary；由既有 ApplicationFormBoundary 明確承擔申請紀錄與狀態呈現 |
