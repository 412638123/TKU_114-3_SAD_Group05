### S. 第四切片或重構紀錄

| 項目 | 內容 |
| --- | --- |
| 選擇 | 重構（依 Q 任務書規劃；尚未修改實作） |
| 對應需求 | FR-05～FR-08、BR-03、UC-03、UC-06、OO-01 |
| 對應模型 | ActivityApplication、ReviewController；SEQ-02；ST-01～ST-05、IST-01～IST-02 |
| 原問題或新情境 | `ApplicationService.updateStatus` 未檢查目前狀態，已核准申請可非法改為待補件或已退回 |
| 修改範圍 | 預計只調整 `ActivityApplication`／`ApplicationService.updateStatus` 狀態責任及 `ApplicationServiceTest`；不改外部已確認流程 |
| 可操作起點 | 建立一筆待審核申請，由課外活動組核准後再次嘗試要求補件 |
| 可觀察結果 | 目前 IST-01 實測失敗；重構完成後應顯示非法轉移錯誤且申請仍為已核准 |
| 狀態變化 | 合法：待審核→已核准；非法嘗試：已核准→待補件，預期不得發生 |
| 已知限制 | 本次只填寫表格，尚未執行重構；資料仍在瀏覽器／Java 記憶體，無正式登入、資料庫及撤銷核准規則 |
| 提交識別 | 尚未提交 |
