### T. 主要、替代與狀態轉移測試

| 測試編號 | 類型       | 前置資料與狀態                                                | 操作                                              | 預期互動                                                                     | 預期結果狀態              | 實際結果                                          | 通過／失敗 | 證據                                                               |
| -------- | ---------- | ------------------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------- | ---------- | ------------------------------------------------------------------ |
| MST-01   | 主要       | applications 為空；完整活動資料；活動中心 10:00～12:00 無衝突 | 呼叫 create(request)                              | Boundary→ApplicationController→VenueBooking 檢查→ActivityApplication 建立 | 待審核、revision=1        | 建立成功，狀態為待審核                            | 通過       | `ApplicationServiceTest`；實際執行顯示 all scenarios passed      |
| MST-02   | 主要       | 已有活動中心 10:00～12:00；新申請為另一場地 10:30～11:30      | 呼叫 create(request)                              | 衝突檢查只比較同場地、同日期、重疊時段                                       | 待審核，系統共有 2 筆申請 | 建立成功且未誤判衝突                              | 通過       | `ApplicationServiceTest` 的 differentVenue 情境                  |
| EXT-01   | 替代／例外 | 已有活動中心 10:00～12:00；新申請同日 11:00～13:00            | 呼叫 create(request)                              | VenueBooking 回傳衝突；Controller 不建立資料                                 | 不建立申請／無新紀錄      | 回傳 created=false，申請總數仍為 2                | 通過       | `ApplicationServiceTest` 的 conflict 情境                        |
| EXT-02   | 替代／例外 | 活動名稱空白，其餘日期、時間、場地有效                        | 呼叫 create(request)                              | validateRequired 拒絕，Boundary 應顯示繁體中文錯誤                           | 不建立申請                | 拋出 IllegalArgumentException，訊息含「皆需填寫」 | 通過       | `ApplicationServiceTest` 的缺少活動名稱情境                      |
| ST-01    | 狀態轉移   | 一筆待審核申請                                                | 呼叫 updateStatus(id, "已核准", "")               | ReviewController 驗證後更新 ActivityApplication                              | 已核准                    | 狀態更新為已核准                                  | 通過       | `ApplicationServiceTest` 的 approved 情境                        |
| ST-02    | 狀態轉移   | 一筆待審核申請                                                | 呼叫 updateStatus(id, "待補件", "請補充活動說明") | 保存補件原因並回傳更新後申請                                                 | 待補件                    | 狀態為待補件且原因完整保留                        | 通過       | `ApplicationServiceTest` 的 returned／待補件情境                 |
| ST-03    | 狀態轉移   | 一筆待補件、revision=1 申請；修正版有效且無衝突               | 呼叫 resubmit(id, revisedRequest)                 | 重新驗證、排除自身衝突、清除原因並增加版本                                   | 待審核、revision=2        | 重送成功，版本增加為 2                            | 通過       | `ApplicationServiceTest` 的 resubmitted 情境                     |
| IST-01   | 未定義轉移 | 一筆已核准申請                                                | 呼叫 updateStatus(id, "待補件", "核准後是否可補件") | 先依確認後的 FR-08 判斷；確認前不得自行接受或禁止                            | 待確認                    | 暫時狀態探針顯示目前實作會改為待補件             | 待確認     | 暫時探針輸出`IST-01=FAIL`；`Main.java` 233～268 未檢查目前狀態 |
| IST-02   | 非法轉移   | 一筆已退回申請                                                | 呼叫 resubmit(id, request)                        | Controller 檢查只有待補件可重送並拒絕                                        | 已退回                    | 拋出 IllegalArgumentException，拒絕直接重送       | 通過       | 暫時探針輸出`IST-02=PASS`；`Main.java` 286～288                |

### U. 錯誤診斷與重測紀錄

```text
目前看到的症狀：
IST-01 顯示 ActivityApplication 已核准後，Java 後端仍接受 updateStatus(id, "待補件", note)；此行為是否違反規則須先確認 FR-08。

最可能的原因：
ApplicationService.updateStatus 只驗證目標狀態是否為已核准、待補件或已退回，以及原因是否必填，沒有依目前狀態查 allowedTransitions。

涉及的需求、類別、訊息或狀態：
FR-08、UC-06、ReviewController、ActivityApplication、SEQ-02 訊息 3～5、ST-02～ST-05、IST-01、OO-01。

下一個可驗證的修正步驟：
先確認 FR-08 是否允許「待審核→已核准→待補件」，再依確認結果加入測試並調整 ActivityApplication／狀態規則。

修正內容：
本次依使用者要求只填寫 0727 表格，尚未修改實作；預定修正內容已寫入 Q 任務書與 S 重構紀錄。

重測方式：
重新編譯 Main.java 與 ApplicationServiceTest，執行既有回歸測試、IST-01 與 IST-02；確認錯誤發生時狀態與集合內容不變。

重測結果：
尚待 FR-08 確認及 OO-01 後續處理後重測；目前基準為既有測試全數通過、IST-01 顯示實作接受未定義轉移、IST-02 通過。

保留的證據：
ApplicationServiceTest 實際輸出「all scenarios passed」；暫時狀態探針輸出 `IST-01=FAIL`、`IST-02=PASS`；探針驗證後已移除，未留下額外專案檔案。
```
