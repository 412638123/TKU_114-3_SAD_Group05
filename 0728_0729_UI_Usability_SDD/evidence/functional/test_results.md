| 檢查 | 日期 | 實際結果 | 結論 |
| --- | --- | --- | --- |
| `npm test` | 2026-08-03 | 建置成功；前端 SSR、驗證、衝突、狀態轉移 4/4 通過 | 通過 |
| `npm run lint` | 2026-08-03 | 0 errors、0 warnings | 通過 |
| Java `ApplicationServiceTest` | 2026-08-03 | `ApplicationServiceTest: all scenarios passed` | 通過 |
| 瀏覽器衝突流程 | 2026-08-03 | 匿名衝突範例被拒絕並顯示衝突活動、時間與恢復方式 | 通過 |
| 瀏覽器權限狀態 | 2026-08-03 | 顯示缺少權限、正式限制與返回操作 | 通過（介面狀態） |
| 瀏覽器補件與審核 | 2026-08-03 | 待審核→待補件→revision+1 待審核→已核准 | 通過（原型流程） |
| 瀏覽器主控台 | 2026-08-03 | 完成走查後 0 error、0 warning | 通過 |
| 修正後 `npm test` | 2026-08-04 | 建置成功；SSR 同時檢查角色入口與場地提示；新增固定申請編號規則；前端測試 5/5 通過 | 通過 |
| 修正後 `npm run lint` | 2026-08-04 | 0 errors、0 warnings | 通過 |
| 修正後 Java `ApplicationServiceTest` | 2026-08-04 | `ApplicationServiceTest: all scenarios passed` | 通過 |

P01、P02 第二輪真人可用性測試的匿名文字結果記錄於 `../../usability_observations.md`；`../usability/` 說明證據保存與個資原則。本檔的自動與瀏覽器功能測試不取代真人觀察。
