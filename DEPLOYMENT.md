# 部署指南

本專案採用前後端分離架構,需要分別部署:

## 📦 架構概覽

```
前端 (GitLab Pages)    ←→    後端 (Render/Railway)    ←→    資料庫 (PostgreSQL)
靜態網站                      Node.js + Socket.IO           Prisma ORM
```

---

## 🎯 前端部署 (GitLab Pages)

### 自動部署
前端已配置 GitLab CI/CD,推送到 `main` 分支會自動部署到 GitLab Pages。

### 部署 URL
```
https://louisex222.gitlab.io/plugins-based-framework/
```

### 環境變數配置
在部署前端之前,需要先部署後端並取得後端 URL,然後更新 `.gitlab-ci.yml`:

```yaml
- export VITE_BASE_PATH=/plugins-based-framework/
- export VITE_API_URL=https://your-backend.onrender.com/api
- export VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 🚀 後端部署

### 選項 1: Render.com (推薦)

#### 步驟:

1. **註冊 Render.com**
   - 前往 https://render.com
   - 使用 GitHub/GitLab 帳號登入

2. **連接 GitLab 儲存庫**
   - 在 Render Dashboard 點擊 "New +"
   - 選擇 "Blueprint"
   - 連接你的 GitLab 儲存庫
   - Render 會自動讀取 `render.yaml` 配置

3. **配置環境變數**
   Render 會自動創建以下環境變數:
   - `DATABASE_URL` - 自動從資料庫連接
   - `JWT_SECRET` - 自動生成
   - `CORS_ORIGIN` - 已設定為 GitLab Pages URL

4. **部署**
   - 點擊 "Apply" 開始部署
   - 等待建置完成(約 5-10 分鐘)

5. **取得後端 URL**
   - 部署完成後,複製你的後端 URL
   - 格式: `https://your-app-name.onrender.com`

#### 免費方案限制:
- ✅ 750 小時/月免費運行時間
- ✅ 支援 WebSocket/Socket.IO
- ⚠️ 閒置 15 分鐘後會休眠,首次訪問需要 30-60 秒喚醒

---

### 選項 2: Railway.app

#### 步驟:

1. **註冊 Railway**
   - 前往 https://railway.app
   - 使用 GitHub 帳號登入

2. **創建新專案**
   - 點擊 "New Project"
   - 選擇 "Deploy from GitHub repo"
   - 連接你的 GitLab 儲存庫(需先同步到 GitHub)

3. **添加 PostgreSQL 資料庫**
   - 在專案中點擊 "New"
   - 選擇 "Database" → "PostgreSQL"
   - Railway 會自動設定 `DATABASE_URL`

4. **配置環境變數**
   在 Variables 頁面添加:
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=<生成一個隨機字串>
   CORS_ORIGIN=https://louisex222.gitlab.io
   ```

5. **部署**
   - Railway 會自動讀取 `railway.toml` 並部署
   - 取得部署 URL: `https://your-app.railway.app`

#### 免費方案限制:
- ✅ $5 免費額度/月
- ✅ 無休眠機制
- ⚠️ 額度用完後需升級

---

### 選項 3: Fly.io

#### 步驟:

1. **安裝 Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **登入**
   ```bash
   fly auth login
   ```

3. **初始化專案**
   ```bash
   fly launch
   ```

4. **配置環境變數**
   ```bash
   fly secrets set JWT_SECRET=<隨機字串>
   fly secrets set CORS_ORIGIN=https://louisex222.gitlab.io
   ```

5. **部署**
   ```bash
   fly deploy
   ```

---

## 🔧 部署後配置

### 1. 更新前端環境變數

取得後端 URL 後,更新 `.gitlab-ci.yml` 中的環境變數:

```yaml
# 建置前端 (Vite)
- cd client
- yarn install --immutable
- export VITE_BASE_PATH=/plugins-based-framework/
- export VITE_API_URL=https://your-backend.onrender.com/api
- export VITE_SOCKET_URL=https://your-backend.onrender.com
- cd ..
- yarn build
```

### 2. 推送更新

```bash
git add .gitlab-ci.yml
git commit -m "chore: 更新生產環境後端 URL"
git push
```

### 3. 等待 GitLab Pages 重新部署

GitLab CI/CD 會自動重新建置並部署前端。

---

## ✅ 驗證部署

### 檢查後端
訪問後端健康檢查端點:
```
https://your-backend.onrender.com/health
```

應該回傳:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T..."
}
```

### 檢查前端
訪問 GitLab Pages:
```
https://louisex222.gitlab.io/plugins-based-framework/
```

### 檢查 Socket.IO 連線
打開瀏覽器開發者工具 → Network → WS,應該看到 WebSocket 連線成功。

---

## 🐛 常見問題

### 1. CORS 錯誤
確保後端 `CORS_ORIGIN` 環境變數設定正確:
```
CORS_ORIGIN=https://louisex222.gitlab.io
```

### 2. Socket.IO 連線失敗
- 檢查 `VITE_SOCKET_URL` 是否正確
- 確認後端支援 WebSocket(Render/Railway 預設支援)

### 3. 資料庫連線錯誤
- 確認 `DATABASE_URL` 環境變數已設定
- 執行 Prisma 遷移:
  ```bash
  yarn prisma:migrate:deploy
  ```

### 4. Render 休眠問題
免費方案會在閒置 15 分鐘後休眠,可以:
- 使用 cron job 定期喚醒
- 升級到付費方案

---

## 📚 相關文件

- [Render 文件](https://render.com/docs)
- [Railway 文件](https://docs.railway.app)
- [GitLab Pages 文件](https://docs.gitlab.com/ee/user/project/pages/)
- [Vite 環境變數](https://vitejs.dev/guide/env-and-mode.html)
