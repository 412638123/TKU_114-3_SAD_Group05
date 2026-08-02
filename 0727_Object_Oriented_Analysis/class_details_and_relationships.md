### E. 類別明細

| 類別                    | 類型             | 責任摘要                                     | 重要屬性                                                                                                                                                      | 主要操作                                                                                                                       | 來源                                               |
| ----------------------- | ---------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| ApplicationFormBoundary | Boundary（邊界） | 接收社團幹部輸入並呈現驗證、衝突與建立結果   | formState: FormState、editingId: Long?、message: String                                                                                                       | submitApplication(formData): Result、startSupplement(application): void                                                        | UC-01、SCR-01、`Prototype.tsx`                   |
| ApplicationController   | Control（控制）  | 協調申請驗證、衝突檢查、建立、查詢與重新送出 | applications: List<ActivityApplication></activityapplication>、nextId: Long                                                                                   | create(request): CreateResult、resubmit(id, request): CreateResult、findAll(): List<ActivityApplication></activityapplication> | FR-01～FR-07、DFD 1.0～3.0、`ApplicationService` |
| ReviewController        | Control（控制）  | 驗證審核原因與合法狀態轉移並協調審核結果     | allowedTransitions: Map<Status, Set<Status></status>>                                                                                                         | review(id, targetStatus, note): ActivityApplication、validateTransition(current, target): Boolean                              | FR-08、DFD 4.0～5.0、`updateStatus`              |
| ActivityApplication     | Entity（實體）   | 保存活動申請並維護狀態、審核原因與補件版本   | applicationId: Long、activityName: String、date: Date、startTime: Time、endTime: Time、venueId: String、status: Status、reviewNote: String、revision: Integer | submit(): void、changeStatus(target, note): void、resubmit(data): void                                                         | D1、EC-01、REL-01、REL-02、`ActivityApplication` |
| VenueBooking            | Entity（實體）   | 保存場地時段並判斷有效借用是否重疊           | bookingId: Long、venueId: String、applicationId: Long、bookingDate: Date、startTime: Time、endTime: Time                                                      | overlaps(venueId, date, start, end): Boolean、reserve(application): void                                                       | D2、EC-02、REL-02、REL-03、BR-01                   |
| Venue                   | Entity（實體）   | 保存有效場地資料並提供借用關聯               | venueId: String、venueName: String、capacity: Integer、location: String                                                                                       | findBookings(date): List<VenueBooking></venuebooking>、supportsCapacity(expectedPeople): Boolean                               | EC-08、REL-03、REL-05、FR-02、FR-09                |

### F. 類別關係與多重性

| 類別 A                  | 關係                         | 類別 B                | A 端多重性 | B 端多重性 | 業務規則或模型依據                                             |
| ----------------------- | ---------------------------- | --------------------- | ---------- | ---------- | -------------------------------------------------------------- |
| ApplicationFormBoundary | 一般關聯：送出請求／呈現結果 | ApplicationController | 1          | 1          | UC-01 步驟 1～7；邊界只接收及呈現，控制類別協調流程            |
| ApplicationController   | 一般關聯：建立與查詢         | ActivityApplication   | 1          | 0..*       | FR-05～FR-07、DFD 1.0／3.0；控制類別可管理多筆申請             |
| ReviewController        | 一般關聯：審核與轉移狀態     | ActivityApplication   | 1          | 0..*       | FR-08、DFD 4.0／5.0；一個審核控制可處理多筆申請                |
| ActivityApplication     | 組合：產生場地借用           | VenueBooking          | 1          | 0..1       | REL-02；每筆借用必須隸屬一筆申請，申請未成功時不得留下借用紀錄 |
| Venue                   | 一般關聯：提供借用場地       | VenueBooking          | 1          | 0..*       | REL-03；一個場地可有多筆借用，每筆借用只對應一個場地           |

關係判斷：

```text
這是一般關聯、聚合、組合或一般化：ActivityApplication 與 VenueBooking 採組合；Venue 與 VenueBooking 採一般關聯；其餘採一般關聯。SystemUser 的社團幹部、課外活動組老師、場地管理員與一般學生不採一般化，改以角色關聯表示。
整體移除時，部分是否失去存在意義：VenueBooking 若失去對應 ActivityApplication 即無業務存在意義；Venue 移除時仍需保留既有借用歷程，因此不將 Venue 與 VenueBooking 建成組合。
部分是否可同時屬於多個整體：每筆 VenueBooking 只屬於一筆 ActivityApplication，且只對應一個 Venue。
子類別是否真的是父類別的一種：四種使用角色不是不同種類的資料物件，而是 SystemUser 的角色值；同一使用者未來可能具有多角色，因此不建立角色子類別。
最後決定：ActivityApplication ◆─ VenueBooking 使用 1 對 0..1 組合；Venue ─ VenueBooking 使用 1 對 0..* 一般關聯；角色以 SystemUser.role 關聯處理，不使用一般化。
理由：此決定符合 REL-01～REL-05、ERD 外來鍵與借用紀錄生命週期，並避免把可變角色誤建成固定繼承階層。
```
