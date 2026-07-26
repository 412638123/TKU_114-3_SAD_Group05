# Group05 Java 後端

此目錄提供活動與場地申請的 Java API，對應 FR-01～FR-07 的核心流程：

- `GET /api/health`：服務狀態
- `GET /api/applications`：查詢目前申請
- `POST /api/applications`：驗證資料、檢查場地衝突並建立「待審核」紀錄
- `PATCH /api/applications/{id}`：核准、要求補件或退回，並保留審核原因
- `PUT /api/applications/{id}`：修改待補件申請並重新送出

後端只使用 Java 標準函式庫，資料目前保存在記憶體中，重新啟動後會清除。這與 0720 文件記載的 Mock Data 限制一致。

## 編譯與測試

在 `java-backend` 目錄執行：

```powershell
New-Item -ItemType Directory -Force out
javac -encoding UTF-8 -d out src/main/java/tku/group05/Main.java src/test/java/tku/group05/ApplicationServiceTest.java
java -cp out tku.group05.ApplicationServiceTest
```

## 啟動

```powershell
java -cp out tku.group05.Main
```

預設網址為 `http://localhost:8080`。線上展示網站仍使用瀏覽器記憶體，以確保不依賴尚未部署的正式服務；之後可把前端表單改接此 Java API。
