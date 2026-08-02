### C. 候選類別擷取表

| 候選項目                                | 來源編號                                            | 可能責任                                   | 保留／合併／移除 | 判斷理由                                                                           |
| --------------------------------------- | --------------------------------------------------- | ------------------------------------------ | ---------------- | ---------------------------------------------------------------------------------- |
| 活動申請（ActivityApplication）         | FR-01、FR-05～FR-08；UC-01、UC-03、UC-04；D1；EC-01 | 保存申請資料、維護審核狀態與補件版本       | 保留             | 是核心業務物件，具有獨立識別碼；已確認初始狀態為待審核，其餘審核狀態待確認 |
| 場地借用（VenueBooking）                | FR-02～FR-04；UC-02；D2；EC-02                      | 保存場地時段、判斷同場地時段是否重疊       | 保留             | 是活動申請與場地之間的關聯物件，承擔衝突檢查所需日期與時段資料                     |
| 場地（Venue）                           | FR-01～FR-04、FR-09；EC-08；REL-03、REL-05          | 提供有效場地資料、關聯場地借用紀錄         | 保留             | 具有場地編號、名稱、容量與位置，不是單一表單欄位                                   |
| 系統使用者（SystemUser）                | DOC-01；D3；EC-03；REL-01、REL-04                   | 保存使用者身分與角色、判斷申請或審核權限   | 保留             | ERD 已定義使用者及角色；正式 SSO 未實作，但角色責任仍需保留於分析模型              |
| 活動申請表單（ApplicationFormBoundary） | UC-01 步驟 1～3；SCR-01；`Prototype.tsx`          | 接收活動與場地資料、呈現驗證及送出結果     | 保留             | 是社團幹部與系統互動的邊界類別，不把頁面按鈕或程式檔誤當類別                       |
| 活動審核中心（ReviewCenterBoundary）    | FR-08；UC-05、UC-06；`Prototype.tsx`              | 顯示待審核申請、接收核准／補件／退回與原因 | 保留             | 是課外活動組老師與審核流程互動的邊界類別                                           |
| 申請流程控制（ApplicationController）   | UC-01～UC-03；DFD 1.0、2.0；`ApplicationService`  | 協調驗證、衝突檢查、建立與重新送出         | 保留             | 跨越多個實體且有明確流程協調責任，不能由表單邊界直接修改業務狀態                   |
| 審核流程控制（ReviewController）        | FR-08；UC-05、UC-06；DFD 4.0、5.0；`updateStatus` | 驗證審核動作與原因、協調合法狀態轉移       | 保留             | 審核規則與通知協調不應由畫面或純資料實體單獨承擔                                   |

### D. 類別責任卡

請為至少 8 個候選類別各複製一份。

| 欄位       | 內容                                                                                                      |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| 類別名稱   | ActivityApplication（活動申請）                                                                           |
| 類型       | Entity（實體）                                                                                            |
| 主要責任 1 | 保存活動名稱、日期、起訖時間、場地、說明與申請識別碼                                                      |
| 主要責任 2 | 依已確認規則維護申請狀態、審核原因與補件版本；未確認的轉移不得自行決定                                      |
| 重要屬性   | applicationId、activityName、date、startTime、endTime、venueId、description、status、reviewNote、revision |
| 主要操作   | submit()、changeStatus(targetStatus, reviewNote)、resubmit(revisedData)                                   |
| 協作者     | ApplicationController、ReviewController、VenueBooking、SystemUser                                         |
| 來源編號   | FR-01、FR-05～FR-08；UC-01、UC-03、UC-04；D1；EC-01                                                       |
| 保留理由   | 核心業務實體，具獨立識別、狀態與版本生命週期；對應`activity_applications` 與 `ActivityApplication`    |
| 待確認問題 | 指導老師簽核是否需要獨立狀態與歷程欄位（OI-01）                                                           |

| 欄位       | 內容                                                                                |
| ---------- | ----------------------------------------------------------------------------------- |
| 類別名稱   | VenueBooking（場地借用）                                                            |
| 類型       | Entity（實體）                                                                      |
| 主要責任 1 | 保存場地、借用日期、開始時間、結束時間與對應申請                                    |
| 主要責任 2 | 判斷同場地、同日期的時段是否與既有有效借用重疊                                      |
| 重要屬性   | bookingId、venueId、applicationId、bookingDate、startTime、endTime                  |
| 主要操作   | overlaps(venueId, date, startTime, endTime)、reserve(application)                   |
| 協作者     | ActivityApplication、Venue、ApplicationController                                   |
| 來源編號   | FR-02～FR-04；BR-01；UC-02；D2；EC-02；REL-02、REL-03                               |
| 保留理由   | 承擔場地衝突規則且保存關聯本身的日期與時段，不能只當 ActivityApplication 的單一欄位 |
| 待確認問題 | 是否需加入布置／撤場緩衝時間與跨學期保留權限（OI-02）                               |

| 欄位       | 內容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| 類別名稱   | Venue（場地）                                                            |
| 類型       | Entity（實體）                                                           |
| 主要責任 1 | 保存有效場地的編號、名稱、容量、位置與設備摘要                           |
| 主要責任 2 | 提供場地借用紀錄與可用性查詢所需的穩定場地資料                           |
| 重要屬性   | venueId、venueName、capacity、location、equipment                        |
| 主要操作   | isValid()、findBookings(date)                                             |
| 協作者     | VenueBooking、ActivityApplication、ApplicationController                 |
| 來源編號   | FR-01～FR-04、FR-09；EC-08；REL-03、REL-05                               |
| 保留理由   | 場地具有獨立識別與基本資料，可在沒有任何申請時存在，不是場地下拉選單本身 |
| 待確認問題 | 容量是否形成阻擋規則、設備清單與特殊設備借用是否納入本期資料模型         |

| 欄位       | 內容                                                                         |
| ---------- | ---------------------------------------------------------------------------- |
| 類別名稱   | SystemUser（系統使用者）                                                     |
| 類型       | Entity（實體）                                                               |
| 主要責任 1 | 保存使用者帳號、姓名、所屬社團與角色                                         |
| 主要責任 2 | 提供角色是否可提出申請或執行審核的判斷依據                                   |
| 重要屬性   | userId、name、clubId、role                                                   |
| 主要操作   | canSubmitApplication()、canReviewApplication()（權限矩陣確認後才可實作）     |
| 協作者     | ActivityApplication、ApplicationController、ReviewController                 |
| 來源編號   | DOC-01；D3；EC-03；REL-01、REL-04                                            |
| 保留理由   | ERD 已有穩定主鍵與角色資料，支援申請人及審核人關係；不將角色名稱誤建成子類別 |
| 待確認問題 | 是否整合學校 SSO；目前前端角色切換不代表正式身分驗證                         |

| 欄位       | 內容                                                                          |
| ---------- | ----------------------------------------------------------------------------- |
| 類別名稱   | ApplicationFormBoundary（活動申請表單）                                       |
| 類型       | Boundary（邊界）                                                              |
| 主要責任 1 | 接收社團幹部輸入的活動、場地與時段資料                                        |
| 主要責任 2 | 呈現必填、時間、衝突、成功與目前狀態訊息                                      |
| 重要屬性   | formState、editingId、message、canSubmit                                      |
| 主要操作   | submitApplication(formData)、startSupplement(application)、showResult(result) |
| 協作者     | ApplicationController、ActivityApplication                                    |
| 來源編號   | UC-01 步驟 1～3、7；SCR-01、SCR-02；`Prototype.tsx`                         |
| 保留理由   | 隔離外部輸入與輸出呈現，避免畫面直接承擔衝突規則或狀態規則                    |
| 待確認問題 | 正式介面是否仍使用單頁多角色切換，或拆成角色專屬頁面                          |

| 欄位       | 內容                                                             |
| ---------- | ---------------------------------------------------------------- |
| 類別名稱   | ReviewCenterBoundary（活動審核中心）                             |
| 類型       | Boundary（邊界）                                                 |
| 主要責任 1 | 顯示待審核申請、活動內容、場地時段與版本                         |
| 主要責任 2 | 接收核准、要求補件、退回與審核原因，呈現處理結果                 |
| 重要屬性   | pendingApplications、reviewDrafts、staffMessage                  |
| 主要操作   | review(applicationId, decision, note)、showPendingApplications() |
| 協作者     | ReviewController、ActivityApplication、SystemUser                |
| 來源編號   | FR-08；UC-05、UC-06；DFD 4.0、5.0；`Prototype.tsx`             |
| 保留理由   | 代表課外活動組老師的系統邊界，不把核准按鈕當成分析類別           |
| 待確認問題 | 完整審核流程是否需要指導老師簽核、批次審核或補件期限             |

| 欄位       | 內容                                                                                        |
| ---------- | ------------------------------------------------------------------------------------------- |
| 類別名稱   | ApplicationController（申請流程控制）                                                       |
| 類型       | Control（控制）                                                                             |
| 主要責任 1 | 協調必填與時間驗證、取得既有借用並委託 VenueBooking 判斷衝突及建立申請                    |
| 主要責任 2 | 協調待補件申請的修改、重新送出與版本增加                                                    |
| 重要屬性   | applications、nextApplicationId                                                             |
| 主要操作   | create(request)、validate(request)、findConflictingBooking(criteria)、resubmit(id, request)、findAll() |
| 協作者     | ApplicationFormBoundary、ActivityApplication、VenueBooking、Venue                           |
| 來源編號   | FR-01～FR-07；UC-01～UC-04；DFD 1.0～3.0；`ApplicationService`                            |
| 保留理由   | 集中單一使用案例流程的協調工作，避免邊界直接操作實體集合                                    |
| 待確認問題 | 實作重構時如何讓前端與 Java 使用同一組已確認的時段邊界案例                                |

| 欄位       | 內容                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------ |
| 類別名稱   | ReviewController（審核流程控制）                                                                 |
| 類型       | Control（控制）                                                                                  |
| 主要責任 1 | 驗證審核目標狀態與補件／退回原因                                                                 |
| 主要責任 2 | 協調 ActivityApplication 合法轉移並產生角色可見結果                                              |
| 重要屬性   | allowedTransitions、reviewPolicy                                                                 |
| 主要操作   | review(applicationId, targetStatus, reviewNote)、validateTransition(currentStatus, targetStatus) |
| 協作者     | ReviewCenterBoundary、ActivityApplication、SystemUser                                            |
| 來源編號   | FR-08；UC-05、UC-06；DFD 4.0、5.0；`updateStatus`                                              |
| 保留理由   | 將審核流程協調與狀態限制從畫面及資料記錄中分離，便於驗證非法轉移                                 |
| 待確認問題 | FR-08、核准／補件／退回狀態集合及 `已退回` 是否為終止狀態                                    |
