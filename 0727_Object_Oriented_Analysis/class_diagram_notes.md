### H. 類別圖完成檢查

| 檢查項目               | 是／否 | 證據或待修正                                                                                                                        |
| ---------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| 至少 6 個核心類別      | 是     | E 表包含 ApplicationFormBoundary、ApplicationController、ReviewController、ActivityApplication、VenueBooking、Venue 共 6 個核心類別 |
| 每個核心類別有責任     | 是     | D 類別責任卡與 E 責任摘要均有明確責任                                                                                               |
| 屬性支援責任           | 是     | 申請狀態與版本支援生命週期，場地日期與起訖時間支援衝突檢查                                                                          |
| 操作對應使用案例       | 是     | create／resubmit 對應 UC-01～UC-03，review 對應 UC-05／UC-06，findAll 對應 UC-04                                                    |
| 至少 5 條關係          | 是     | F 表列出 5 條有業務語意的關係                                                                                                       |
| 核心關係有多重性       | 是     | F 表每一端均標示 1、0..1 或 0..*                                                                                                    |
| 關係類型有業務語意     | 是     | 申請與借用採組合，其餘採一般關聯；角色不誤用一般化                                                                                  |
| 可辨識邊界、控制、實體 | 是     | D、E 表明確標示 Boundary、Control、Entity                                                                                           |
| 與實體關係圖相容       | 是     | ActivityApplication、VenueBooking、Venue 對應 ERD 實體及 REL-02、REL-03；SystemUser 保留於候選責任卡                                |
| 沒有把程式檔直接當類別 | 是     | `Prototype.tsx` 與 `Main.java` 只作實作證據；類別名稱依業務責任建立                                                             |
