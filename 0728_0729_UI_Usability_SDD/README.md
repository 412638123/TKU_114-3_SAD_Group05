# 0728–0729 使用者介面、可用性測試與 SDD v1

## 工作範圍與基準

本資料夾將 0722 SRS、0720 使用案例、0727 物件導向模型與既有 `midterm-report-site` 轉成可操作、可測試及可追溯的介面成果。核心採用 FR-01～FR-07、UC-01～UC-04；FR-08～FR-10 保留為原型示範與待確認。

## 三個核心任務

1. TF-01：社團幹部建立有效申請並看到待審核。
2. TF-02：社團幹部理解場地衝突，修改後成功送出。
3. TF-03：老師要求補件、幹部修改重送，再由老師核准。

## 原型操作方式

開啟 `midterm-report-site`，前往「操作驗證」。可使用「載入匿名測試資料」準備衝突範例、審核與查詢情境；使用「清除示範資料」重新開始；使用「預覽權限不足」驗證權限狀態與返回方式。

## 第五切片／介面重構

本次選擇有證據的介面重構，補齊載入、停用、權限不足、欄位級錯誤與無障礙回饋，並修正 Java 未定義狀態回轉及失效的前端測試。操作與範圍見 [fifth_working_slice_or_refactor/README.md](fifth_working_slice_or_refactor/README.md)。

## 測試與修正摘要

功能測試涵蓋主要、替代、錯誤、狀態、權限與回歸。正式結果見 [ui_and_state_tests.md](ui_and_state_tests.md)。真人可用性測試計畫與匿名紀錄表已備妥，但 P01、P02 尚未實際執行，不預填完成、原話、問題頻率或改善結論。

正式真人測試前已依程式碼與啟發式檢查修正三個高影響候選：送出缺載入與防重複、缺權限不足承接、錯誤未與欄位關聯；另修正後端非法狀態回轉及失效前端測試。這些修正仍須由真人重測才能宣稱可用性改善。

## 主要成果

- [任務流程](task_flows.md)
- [資訊架構](information_architecture.md)
- [畫面流程](screen_flow.png)
- [畫面清單](screen_inventory.md)
- [介面狀態與錯誤](ui_state_specification.md)
- [無障礙檢核](accessibility_check.md)
- [原型路徑](prototype_map.md)
- [一致性矩陣](model_screen_data_acceptance_matrix.md)
- [可用性測試計畫](usability_test_plan.md)
- [修正與重測](fix_retest_report.md)
- [SDD v1](SDD_v1.md)
- [程式碼代理紀錄](ai_code_agent_log.md)

## 已知限制與 8/3 銜接

目前為記憶體假資料，沒有正式登入、資料庫、外部通知及伺服端權限；FR-08～FR-10 的正式規則仍待確認。8/3 需確認前後端邊界、資料持久化、身分授權、環境區分、部署、回復、監控與備份。

### V. GitHub 更新紀錄

| 提交識別 | 內容 | 對應任務／問題 | 測試證據 | 文件連結 |
| --- | --- | --- | --- | --- |
| 基準 59fa6ff；目前尚未提交 | 0728–0729 介面重構、測試、流程圖、文件與證據 | TF-01～TF-03、U-01～U-05 | evidence/functional、evidence/before_after | 本資料夾與 ../midterm-report-site |
