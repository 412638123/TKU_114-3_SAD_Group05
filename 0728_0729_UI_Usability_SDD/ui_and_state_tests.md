### M. 功能與狀態測試

| 測試編號 | 類型 | 前置資料／狀態 | 操作 | 預期畫面 | 預期資料／狀態 | 實際結果 | 結論 | 證據 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MAT-01 | 主要 | 空白資料 | 輸入有效申請並送出 | 處理中→成功→我的申請 | 新增 revision=1、待審核 | domain 與 Java 建立流程通過；瀏覽器補件重送可見待審核 | 通過 | evidence/functional/test_results.md |
| MAT-02 | 替代 | 已有相同場地活動 | 使用相鄰時段送出 | 成功 | 不視為衝突 | 前端 domain 相鄰時段測試通過 | 通過 | npm test |
| MAT-03 | 錯誤 | 已有重疊場地活動 | 送出重疊時段 | 衝突訊息與欄位錯誤 | 不新增資料 | 前端 domain、Java 與瀏覽器衝突流程通過 | 通過 | evidence/functional/conflict_state.png |
| MAT-04 | 錯誤 | 空白或時間無效 | 送出 | 欄位級錯誤 | 不新增資料 | 前端 domain 與 Java 必填測試通過；瀏覽器顯示欄位關聯錯誤 | 通過 | npm test、Java test |
| MAT-05 | 狀態 | 待審核 | 要求補件→修改重送 | 待補件→待審核 | reviewNote 保存後清除、revision+1 | 瀏覽器完整走查與 Java 測試通過 | 通過 | evidence/before_after/after_ui_full.png |
| MAT-06 | 狀態 | 已核准 | 嘗試再改待補件 | 顯示不可再次審核 | 保留已核准 | 前端 domain 與 Java IST-01 通過 | 通過 | npm test、Java test |
| MAT-07 | 權限 | 任一角色 | 預覽權限不足 | 顯示原因與返回操作 | 不變更資料 | 瀏覽器顯示原因、正式限制與返回按鈕 | 通過（介面狀態） | evidence/functional/permission_state.png |
| MAT-08 | 回歸 | 完整專案 | build、lint、npm test、Java test | 無建置或檢查錯誤 | 核心規則測試通過 | build 通過；lint 0 錯誤；前端 5/5；Java all scenarios passed；既有瀏覽器走查 0 console error | 通過 | evidence/functional/test_results.md |
