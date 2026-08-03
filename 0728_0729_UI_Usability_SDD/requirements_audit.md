# 0728–0729 作業要求核對與待補清單

核對基準：老師提供的 `10_0728_0729_使用者介面原型可用性測試與SDD.md`、本資料夾成果，以及 `midterm-report-site` 實作。判定以「文件存在」和「證據足以支持結論」分開處理。

| 老師要求 | 現有成果／證據 | 判定 | 交作業前處理 |
| --- | --- | --- | --- |
| 至少 3 個核心任務流程 | `task_flows.md`、`screen_flow.png` | 符合；TF-03 使用待確認的 FR-08 原型規則 | 報告時明示「設計驗證」，不可宣稱正式需求完成 |
| 1 份 IA 與 Screen Flow | `information_architecture.md`、`information_architecture.png`、`screen_flow.png` | 符合 | 保留來源 HTML 以便修改 |
| 至少 8 個畫面或重要介面狀態 | `screen_inventory.md` 定義 UI-01～UI-10；`ui_states_overview.png` | 符合 | 口頭展示時至少操作正常、錯誤、載入、權限狀態 |
| 可完成 3 個端到端任務的互動原型 | `prototype_map.md`、`midterm-report-site` | 符合（原型層級） | FR-08 正式規則仍待確認 |
| 至少 3 個可觀察成功條件的測試任務 | `usability_test_plan.md` 的 UT-01～UT-04 | 符合；兩位皆已執行 | 保留完成、部分完成與提示的原始判定 |
| 至少 2 位測試者匿名觀察 | P01、P02 完成時間、行為、提示與原話摘要 | 符合觀察要求；個資確認部分符合 | P02 是否未參與設計及兩人知情／停止權利未提供書面紀錄，不可自行補寫 |
| 至少 5 個分級排序問題 | `usability_issue_backlog.md` U-01～U-11 | 數量符合 | U-01～U-05 是啟發式／功能問題，U-06～U-11 來自真人觀察或後續建議；報告時需清楚區分 |
| 最高優先 3 個問題修正前後與重測 | U-06、U-08、U-09 已修改並由 P01、P02 重測；最新版程式證據另見 `evidence/functional/current_ui_fix_evidence.md` | 符合；U-06 僅部分改善 | U-08、U-09 結案；U-06 與 U-11 的最新微調需下一輪真人重測，不虛構結果 |
| 模型－畫面－資料－驗收矩陣 | `model_screen_data_acceptance_matrix.md` | 符合 | 正式資料來源與 FR-08 規則仍列待確認 |
| 第五切片或有證據的介面重構 | `fifth_working_slice_or_refactor/`、前後截圖、程式與測試 | 符合 | 前後截圖保留原始證據風格，不美化 |
| 主要、替代、錯誤與狀態測試 | `ui_and_state_tests.md` MAT-01～MAT-08 | 符合 | 程式變更後需重跑並更新日期／結果 |
| SDD v1 | `SDD_v1.md` | 符合初版 | FR-08～FR-10、登入、資料庫、部署不可寫成已完成 |
| GitHub 文件、版本與證據 | README 已記錄成果提交 `0d92ce6`、基準、成果連結與非真人功能證據 | 符合 | 推送後以 GitHub 上的提交紀錄作交付依據 |

## 圖片核對結論

- `screen_flow.png` 的內容與三個任務路徑一致，色彩、框線與圖例清楚；TF-03 應解讀為待確認規則的原型驗證。
- `medium_fidelity.png` 與正式網站及流程圖使用同一組深藍、珊瑚橘、藍綠、米白，視覺一致。
- `low_fidelity.png` 保持黑白是正確的低擬真表現，不應強制上色；它與中擬真圖使用相同資訊架構與畫布，可做前後對照。
- `before_ui_full.png`、`after_ui_full.png`、`conflict_state.png`、`permission_state.png` 是測試證據，應保留瀏覽器原貌，不應套用流程圖風格或生成式美化。
- 新增的 `information_architecture.png` 與 `ui_states_overview.png` 採 `screen_flow.png` 視覺系統，補足老師檢查 IA 與至少 8 個重要狀態時的圖像化證據。

## 仍不可自行補寫的資料

P02 是否未參與設計，以及兩位受測者是否在測試前獲知目的與停止權利，目前沒有書面紀錄，因此保持「未確認」。P01 UT-04 是否完成最後核准也未明確記錄，故維持部分完成。
