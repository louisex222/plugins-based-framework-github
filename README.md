# Chat Plugin - 插件化聊天框架

這是一個基於插件架構的聊天系統，包含完整的後端 API、資料庫管理和現代化前端介面。使用 **Prisma ORM** 和 **Yarn 3** 構建。

## ✨ 功能特色

- ✅ 完整的聊天室管理（建立、更新、刪除、列表）
- ✅ 即時訊息發送和接收
- ✅ 美觀的現代化 UI 設計
- ✅ TypeScript 全端開發
- ✅ PostgreSQL 資料庫 + Prisma ORM
- ✅ 自動資料庫遷移和版本控制
- ✅ Yarn 3 套件管理
- ✅ 插件化架構，易於擴展

## 🛠 技術棧

### 後端

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL

### 前端

- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **HTTP Client**: Axios

### 開發工具

- **Package Manager**: Yarn 3 (Berry)
- **Database Tools**: Prisma Studio, Prisma Migrate

## 📁 專案結構

```
plugins-based-framework/
├── src/                          # 後端原始碼
│   ├── lib/                      # 共用函式庫
│   │   └── prisma.ts             # Prisma Client 單例
│   ├── plugins/                  # 插件目錄
│   │   └── chat/                 # Chat 插件
│   │       ├── services/         # 業務邏輯層
│   │       │   └── ChatService.ts
│   │       └── routes/           # API 路由
│   │           └── chatRoutes.ts
│   ├── scripts/                  # 工具腳本
│   │   ├── init-db.ts           # 資料庫初始化
│   │   └── check-db.ts          # 資料庫檢查
│   └── server.ts                 # 伺服器入口
├── prisma/                       # Prisma 配置
│   ├── schema.prisma            # 資料模型定義
│   └── migrations/              # 資料庫遷移歷史
├── client/                       # 前端專案
│   ├── src/
│   │   ├── api/                  # API 客戶端
│   │   ├── components/          # React 組件
│   │   ├── types/               # TypeScript 類型
│   │   └── App.tsx              # 主應用程式
│   └── package.json
├── .env                          # 環境變數（需自行建立）
├── package.json
├── .yarnrc.yml                   # Yarn 3 配置
├── MIGRATION_NOTES.md           # TypeORM → Prisma 遷移說明
└── README.md
```

## 🚀 快速開始

### 前置需求

- Node.js 16+
- PostgreSQL 資料庫
- Yarn 3

### 1. 安裝 Yarn 3

```bash
# 使用 Corepack（推薦，Node.js 16+ 內建）
corepack enable
corepack prepare yarn@3.6.4 --activate

# 或使用 npm 全域安裝
npm install -g yarn@3.6.4
```

### 2. 克隆專案並安裝依賴

```bash
# 安裝後端依賴
yarn install

# 安裝前端依賴
cd client
yarn install
cd ..
```

### 3. 設定環境變數

建立 `.env` 檔案在專案根目錄：

```env
# 伺服器設定
PORT=3001
NODE_ENV=development

# PostgreSQL 資料庫連線（必填）
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

**重要**：請將 `username`、`password` 和 `database_name` 替換為您的實際資料庫資訊。

### 4. 初始化資料庫

```bash
# 方法 1：使用初始化腳本（推薦）
yarn init:db

# 方法 2：手動執行
yarn prisma:generate    # 生成 Prisma Client
yarn prisma:migrate     # 執行資料庫遷移
```

初始化腳本會自動：

- ✓ 建立資料庫連接
- ✓ 執行所有 Prisma migrations
- ✓ 驗證資料表結構
- ✓ 顯示資料庫統計資訊

### 5. 啟動開發伺服器

```bash
# 同時啟動前後端（推薦）
yarn dev

# 或分別啟動
yarn dev:server  # 後端: http://localhost:3001
yarn dev:client  # 前端: http://localhost:3000
```

### 6. 開始使用

開啟瀏覽器訪問 **http://localhost:3000** 即可開始使用聊天功能！

## 📡 API 端點

### 聊天室 (Rooms)

| Method | Endpoint              | 說明           |
| ------ | --------------------- | -------------- |
| POST   | `/api/chat/rooms`     | 建立新聊天室   |
| GET    | `/api/chat/rooms`     | 取得所有聊天室 |
| GET    | `/api/chat/rooms/:id` | 取得特定聊天室 |
| PUT    | `/api/chat/rooms/:id` | 更新聊天室資訊 |
| DELETE | `/api/chat/rooms/:id` | 刪除聊天室     |

### 訊息 (Messages)

| Method | Endpoint                           | 說明           |
| ------ | ---------------------------------- | -------------- |
| POST   | `/api/chat/rooms/:roomId/messages` | 發送訊息       |
| GET    | `/api/chat/rooms/:roomId/messages` | 取得聊天室訊息 |
| GET    | `/api/chat/messages/:id`           | 取得特定訊息   |
| DELETE | `/api/chat/messages/:id`           | 刪除訊息       |

## 🗄 資料庫結構

### ChatRoom (聊天室)

| 欄位        | 類型         | 說明       | 約束                        |
| ----------- | ------------ | ---------- | --------------------------- |
| id          | UUID         | 主鍵       | Primary Key, Auto-generated |
| name        | VARCHAR(255) | 聊天室名稱 | Required                    |
| description | TEXT         | 描述       | Optional                    |
| createdBy   | VARCHAR(100) | 建立者     | Optional                    |
| createdAt   | TIMESTAMP    | 建立時間   | Auto-generated              |
| updatedAt   | TIMESTAMP    | 更新時間   | Auto-updated                |

### ChatMessage (訊息)

| 欄位      | 類型         | 說明       | 約束                        |
| --------- | ------------ | ---------- | --------------------------- |
| id        | UUID         | 主鍵       | Primary Key, Auto-generated |
| roomId    | UUID         | 聊天室 ID  | Foreign Key → ChatRoom.id   |
| username  | VARCHAR(100) | 發送者名稱 | Required                    |
| content   | TEXT         | 訊息內容   | Required                    |
| type      | VARCHAR(50)  | 訊息類型   | Optional                    |
| createdAt | TIMESTAMP    | 建立時間   | Auto-generated              |

**關聯關係**：

- `ChatMessage.roomId` → `ChatRoom.id` (Cascade Delete)

## 🔧 Prisma 常用命令

### 開發環境

```bash
# 生成 Prisma Client（修改 schema 後必須執行）
yarn prisma:generate

# 建立並應用新的遷移
yarn prisma:migrate

# 重置資料庫（⚠️ 會刪除所有資料）
yarn prisma:migrate:reset

# 開啟 Prisma Studio（資料庫 GUI 管理工具）
yarn prisma:studio

# 驗證 Schema 語法
yarn prisma:validate

# 格式化 Schema 檔案
yarn prisma:format
```

### 生產環境

```bash
# 部署遷移（不會建立新的遷移檔案）
yarn prisma:migrate:deploy
```

### 資料庫檢查

```bash
# 檢查資料庫連線和結構
yarn check:db
```

## 🏗 建置生產版本

```bash
# 建置全部（前端 + 後端）
yarn build

# 或分別建置
yarn build:server  # 編譯 TypeScript → dist/
yarn build:client  # 建置 React 應用

# 啟動生產伺服器
yarn start
```

## ⚙️ 環境變數說明

| 變數           | 說明                | 預設值      | 必填 |
| -------------- | ------------------- | ----------- | ---- |
| `PORT`         | 後端伺服器埠號      | 3001        | ✗    |
| `NODE_ENV`     | 執行環境            | development | ✗    |
| `DATABASE_URL` | PostgreSQL 連線字串 | -           | ✓    |

### DATABASE_URL 格式

```
postgresql://[username]:[password]@[host]:[port]/[database]?schema=public
```

範例：

```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/chatdb?schema=public"
```

## 📦 Yarn 3 特色

本專案使用 Yarn 3 (Berry) 的優勢：

1. **⚡️ 更快的安裝速度** - 優化的依賴解析算法
2. **🎯 更精確的依賴管理** - 避免幽靈依賴問題
3. **🔒 更好的安全性** - 內建依賴檢查
4. **📊 更好的 Monorepo 支援** - 為未來擴展做準備

### Yarn 3 配置

專案使用 `nodeLinker: node-modules` 模式（在 `.yarnrc.yml` 中配置），與傳統 npm/yarn 行為一致，降低學習曲線。

## 🔍 故障排除

### 資料庫連線失敗

**錯誤**: `Error: P1001: Can't reach database server`

**解決方案**:

1. 確認 PostgreSQL 服務正在運行
2. 檢查 `.env` 中的 `DATABASE_URL` 是否正確
3. 確認資料庫已建立（Prisma 不會自動建立資料庫）

```bash
# 建立資料庫（使用 psql）
createdb your_database_name
```

### Prisma Client 未生成

**錯誤**: `Cannot find module '@prisma/client'`

**解決方案**:

```bash
yarn prisma:generate
```

### 遷移失敗

**錯誤**: `Migration failed to apply`

**解決方案**:

```bash
# 重置資料庫（開發環境）
yarn prisma:migrate:reset

# 或手動刪除失敗的遷移記錄
# 然後重新執行
yarn prisma:migrate
```

### 前端無法連接後端

**解決方案**:

1. 確認後端伺服器正在運行（`http://localhost:3001`）
2. 檢查前端 Vite 配置中的 proxy 設定
3. 確認防火牆未阻擋連接埠

## 📚 開發說明

- **後端 API**: `http://localhost:3001`
- **前端開發伺服器**: `http://localhost:3000`
- **API 代理**: 前端自動將 `/api/*` 請求代理到後端
- **熱重載**: 前後端均支援程式碼修改後自動重載

## 📖 相關文件

- [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) - TypeORM 到 Prisma 的遷移說明
- [Prisma 官方文件](https://www.prisma.io/docs)
- [Yarn 3 官方文件](https://yarnpkg.com/)

## 📄 授權

MIT License

---

**專案維護者**: louisex222  
**最後更新**: 2025-11-28
