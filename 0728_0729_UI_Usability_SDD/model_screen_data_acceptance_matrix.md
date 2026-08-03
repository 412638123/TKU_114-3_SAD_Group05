### K. 模型－畫面－資料－驗收一致性矩陣

| 編號 | 需求／規則 | 使用案例／模型 | 類別責任 | 畫面／狀態 | 資料 | 驗收／測試 | 判斷 | 待處理 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TR-01 | FR-01、FR-02 | UC-01／SEQ-01 | ApplicationController.validate | UI-01、UIS-01 | 活動名稱、日期、時間、場地 | MAT-01／domain validation | 一致 | 真人可用性測試 |
| TR-02 | FR-03、FR-04、BR-01 | UC-02／VenueBooking.overlaps | findVenueConflict | UI-06、UIS-04 | venue、date、start、end | MAT-02／相鄰與重疊測試 | 一致 | 正式資料來源待確認 |
| TR-03 | FR-05、FR-06、BR-03 | UC-03／ST-01 | ActivityApplication.submit | UI-04、UI-05 | status=待審核、revision=1 | MAT-03／Java create | 一致 | 正式持久化待確認 |
| TR-04 | FR-07 | UC-04 | ApplicationCards | UI-05、UIS-02 | 申請清單與狀態 | MAT-04／SSR 與瀏覽器走查 | 一致 | 無 |
| TR-05 | FR-08 待確認 | SEQ-02／ST-03 | ReviewController.review | UI-07、UIS-03 | targetStatus、reviewNote | MAT-05／缺原因測試 | 部分一致 | 正式審核規則待確認 |
| TR-06 | 補件規則待確認 | ST-04、ST-06 | resubmit／cancelSupplement | UI-08 | revision、reviewNote | MAT-06／Java resubmit | 部分一致 | ERD 欄位需同步 |
| TR-07 | IST-01 | 非法狀態轉移 | validateReviewTransition／updateStatus | UI-06、UIS-04 | currentStatus、targetStatus | IST-01 前後端測試 | 一致 | 撤銷規則確認後重查 |
| TR-08 | NFR-01、無障礙要求 | 介面狀態規格 | Boundary 回饋責任 | UI-03、UI-04、UI-09 | error、loading、permission | A11Y-01／lint／瀏覽器走查 | 一致 | 真人測試與 200% 放大 |
