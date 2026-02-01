# 前後端連接設定指南

本專案採用前後端分離部署，當部署完成後，你需要手動將「後端網址」告訴前端，這樣前端才能正確呼叫 API。

## 步驟 1: 取得後端 URL

1. 登入 [Render.com Dashboard](https://dashboard.render.com/)。
2. 點擊你的 Web Service (例如 `plugins-based-framework-backend`)。
3. 在左上角找到你的應用程式網址，看起來會像這樣：
   `https://plugins-based-framework-backend-xxxx.onrender.com`
   *(如果不確定，點擊該連結確認會顯示 `{ "status": "ok", ... }` 或類似訊息)*
4. **複製這個網址**。

## 步驟 2: 設定 GitLab 環境變數

1. 前往你的 GitLab 專案頁面。
2. 在左側選單選擇 **Settings** (設定) > **CI/CD**。
3. 展開 **Variables** (變數)區塊。
4. 點擊 **Add variable**，加入以下兩個變數：

   **變數 1: API 網址**
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<你的後端網址>/api`  (注意後面要加 `/api`)
     - 例如: `https://plugins-based-framework-backend-xxxx.onrender.com/api`
   - Uncheck "Protect variable" (如果你的分支不是 protected)
   - Uncheck "Mask variable"

   **變數 2: Socket 網址**
   - **Key**: `VITE_SOCKET_URL`
   - **Value**: `https://<你的後端網址>` (這就是原本複製的網址，不需要加任何東西)
     - 例如: `https://plugins-based-framework-backend-xxxx.onrender.com`
   - Uncheck "Protect variable"
   - Uncheck "Mask variable"

5. 儲存變數。

## 步驟 3: 更新 GitLab Pages

設定好變數後，需要重新部署前端才能讓設定生效。

1. 前往 **Build** > **Pipelines**。
2. 點擊右上角的 **Run pipeline**。
3. 選擇 `main` 分支並執行。
4. 等待 pipeline 完成 (特別是 `pages` 這個 job)。

完成後，重新整理你的 GitLab Pages 前端網站，前後端就應該成功連接了！
