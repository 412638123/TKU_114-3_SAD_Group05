### E. 類別明細

| 類別 | 類型 | 責任摘要 | 重要屬性 | 主要操作 | 來源 |
| --- | --- | --- | --- | --- | --- |
| ApplicationFormBoundary | Boundary（邊界） | 接收社團幹部輸入並呈現驗證、衝突、建立及狀態查詢結果 | formState: FormState、editingId: Long?、message: String | submitApplication(formData): Result、startSupplement(application): void、showResult(result): void | UC-01、UC-04、SCR-01、SCR-02、`Prototype.tsx` |
| ApplicationController | Control（控制） | 協調申請驗證、取得借用紀錄、委託重疊判斷、建立、查詢與重新送出 | applications: List<ActivityApplication>、nextId: Long | create(request): CreateResult、findConflictingBooking(criteria): VenueBooking?、resubmit(id, request): CreateResult、findAll(): List<ActivityApplication> | FR-01～FR-07、DFD 1.0～3.0、`ApplicationService` |
| ReviewController | Control（控制） | 依待確認的 FR-08 協調審核原因與狀態轉移，不自行增加審核規則 | allowedTransitions: Map<Status, Set<Status>>（待確認） | review(id, targetStatus, note): ActivityApplication、validateTransition(current, target): Boolean | FR-08（待確認）、DFD 4.0～5.0、`updateStatus` |
| ActivityApplication | Entity（實體） | 保存活動申請並依已確認規則維護狀態、審核原因與補件版本 | applicationId: Long、activityName: String、date: Date、startTime: Time、endTime: Time、venueId: String、status: Status、reviewNote: String、revision: Integer | submit(): void、changeStatus(target, note): void、resubmit(data): void | D1、EC-01、REL-01、REL-02、`ActivityApplication` |
| VenueBooking | Entity（實體） | 保存場地時段並判斷有效借用是否重疊 | bookingId: Long、venueId: String、applicationId: Long、bookingDate: Date、startTime: Time、endTime: Time | overlaps(venueId, date, start, end): Boolean、reserve(application): void | D2、EC-02、REL-02、REL-03、BR-01 |
| Venue | Entity（實體） | 保存有效場地資料並提供借用關聯 | venueId: String、venueName: String、capacity: Integer、location: String | isValid(): Boolean、findBookings(date): List<VenueBooking> | EC-08、REL-03、REL-05、FR-02、FR-09（待確認） |

### F. 類別關係與多重性

| 類別 A | 關係 | 類別 B | A 端多重性 | B 端多重性 | 業務規則或模型依據 |
| --- | --- | --- | --- | --- | --- |
| ApplicationFormBoundary | 一般關聯：送出請求／呈現結果 | ApplicationController | 1 | 1 | UC-01 步驟 1～7；邊界只接收及呈現，控制類別協調流程 |
| ApplicationController | 一般關聯：建立與查詢 | ActivityApplication | 1 | 0..* | FR-05～FR-07、DFD 1.0／3.0；控制類別可管理多筆申請 |
| ReviewController | 一般關聯：審核與轉移狀態 | ActivityApplication | 1 | 0..* | FR-08（待確認）、DFD 4.0／5.0；一個審核控制可處理多筆申請 |
| ActivityApplication | 一般關聯：對應場地借用 | VenueBooking | 1 | 0..1 | REL-02；目前只確認每筆借用對應一筆申請，刪除生命週期不足以判定組合 |
| Venue | 一般關聯：提供借用場地 | VenueBooking | 1 | 0..* | REL-03；一個場地可有多筆借用，每筆借用只對應一個場地 |
| SystemUser | 一般關聯：提出 | ActivityApplication | 1 | 0..* | REL-01；每筆申請必須有一位申請人，一位使用者可提出多筆申請 |
| SystemUser | 一般關聯：審核 | ActivityApplication | 0..1 | 0..* | REL-04；申請可尚未有審核人，一位審核人可處理多筆申請；FR-08 仍待確認 |

關係判斷：

```text
這是一般關聯、聚合、組合或一般化：目前所有核心關係採一般關聯；ActivityApplication 與 VenueBooking 是否為組合列為待確認。SystemUser 的社團幹部、課外活動組老師、場地管理員與一般學生不採一般化，改以角色關聯表示。
整體移除時，部分是否失去存在意義：需求未說明刪除 ActivityApplication 或 Venue 時是否連帶刪除 VenueBooking；在生命週期規則確認前不使用組合。
部分是否可同時屬於多個整體：依目前 REL-02、REL-03，每筆 VenueBooking 只對應一筆 ActivityApplication 與一個 Venue；文件另有多場地敘述，列為待確認。
子類別是否真的是父類別的一種：四種使用角色是 SystemUser 的角色值；同一使用者未來可能具有多角色，因此不建立角色子類別。
最後決定：ActivityApplication ─ VenueBooking 暫採 1 對 0..1 一般關聯；Venue ─ VenueBooking 使用 1 對 0..* 一般關聯；SystemUser 依 REL-01、REL-04 與 ActivityApplication 建立提出及審核關聯，不使用一般化。
理由：此決定只使用 REL-01～REL-05 已提供的關聯與多重性，不自行推論刪除生命週期；角色可能改變，因此不建立固定繼承階層。
```
