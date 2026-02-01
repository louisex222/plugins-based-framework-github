#!/bin/bash

echo "🚀 啟動 Chat Plugin Demo (Yarn 3)..."
echo ""

# 檢查是否已安裝依賴
if [ ! -d "node_modules" ]; then
    echo "📦 安裝後端依賴..."
    yarn install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 安裝前端依賴..."
    cd client
    yarn install
    cd ..
fi

# 初始化資料庫
echo "🗄️  初始化資料庫..."
yarn init:db

# 啟動開發伺服器
echo "🎉 啟動開發伺服器..."
yarn dev
