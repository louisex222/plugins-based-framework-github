# TypeORM 到 Prisma 遷移說明

## 遷移完成

專案已成功從 TypeORM 遷移到 Prisma ORM。

## 主要變更

### 1. 資料庫連接

- **之前**: `src/config/data-source.ts` (TypeORM DataSource)
- **現在**: `src/lib/prisma.ts` (Prisma Client)

### 2. 資料模型定義

- **之前**: TypeORM Entities (`src/plugins/chat/entities/`)
- **現在**: Prisma Schema (`prisma/schema.prisma`)

### 3. 資料庫遷移

- **之前**: TypeORM Migrations (`src/migrations/`)
- **現在**: Prisma Migrations (`prisma/migrations/`)

### 4. Service 層

- `ChatService` 已更新為使用 Prisma Client
- API 接口保持不變，無需修改路由檔案

## 已刪除的檔案

以下 TypeORM 相關檔案已不再需要（可選擇性保留作為參考）：

- `src/config/data-source.ts` - TypeORM 資料來源配置
- `src/migrations/1700000000000-CreateChatTables.ts` - TypeORM 遷移檔案
- `src/plugins/chat/entities/ChatRoom.ts` - TypeORM Entity
- `src/plugins/chat/entities/ChatMessage.ts` - TypeORM Entity

## 新的 Prisma 命令

```bash
# 生成 Prisma Client
yarn prisma:generate # 只更新 Client，不碰資料庫

# 建立並應用遷移（開發環境）
yarn prisma:migrate

# 部署遷移（生產環境）
yarn prisma:migrate:deploy

# 開啟 Prisma Studio
yarn prisma:studio

# 檢查資料庫結構
yarn check:db
```

## 環境變數

確保 `.env` 檔案中包含：

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

## 注意事項

1. Prisma Client 需要在每次修改 `schema.prisma` 後執行 `yarn prisma:generate`
2. 資料庫遷移使用 `yarn prisma:migrate` 或 `yarn prisma:migrate:deploy`
3. TypeORM 相關依賴仍保留在 `package.json` 中，但已不再使用，可以選擇性移除

# 情況 A：修改資料結構（新增/刪除欄位、表格等）

yarn prisma:migrate

# ↑ 這個命令會：

# 1. 生成 migration.sql

# 2. 應用到資料庫

# 3. 自動執行 prisma generate

# 情況 B：不修改資料結構（只更新註解、配置等）

yarn prisma:generate

# ↑ 這個命令只會：

# 1. 重新生成 Prisma Client

# 2. 不碰資料庫

# 情況 C：首次設定或切換分支

yarn prisma:generate

# ↑ 確保 Client 與 Schema 同步
