# MediaMTX 本地使用指南

本專案集成了 MediaMTX 作為直播伺服器。以下是三種主要的運行方式及測試方法。

## 1. 使用 Docker 運行 (推薦)

這是最簡單的方式，因為所有的 Webhook 配置都已經在 `docker-compose.yml` 中設定好了。

### 啟動指令

```bash
docker compose up -d mediamtx
```

### 特點

- **Webhook 自動整合**：推流開始/結束時，會自動通知後端 (透過 `host.docker.internal:3001`)。
- **環境隔離**：不需要安裝任何額外依賴。

---

## 2. 本地直接運行 (Standalone 模式)

如果你不想使用 Docker，可以直接在電腦上執行 `mediamtx` 二進位檔。

### 步驟

1. 確保你的 `mediamtx/mediamtx` 執行檔具有執行權限：
   ```bash
   chmod +x ./mediamtx/mediamtx
   ```
2. 使用專案提供的設定檔啟動：
   ```bash
   ./mediamtx/mediamtx ./mediamtx/config/mediamtx.yml
   ```

### 注意事項

- **Webhook 埠號**：Standalone 模式會使用 `localhost:3001` 與後端通訊。
- **配置同步**：如果你修改了 `mediamtx.yml`，記得確認路徑是否正確。

---

## 3. 測試推流與拉流

### 推流測試 (使用 FFmpeg)

如果你有安裝 FFmpeg，可以用以下指令模擬推流：

```bash
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 -f lavfi -i sine=frequency=1000 -c:v libx264 -preset ultrafast -tune zerolatency -c:a aac -f rtsp rtsp://localhost:8554/mystream
```

### 推流測試 (使用 OBS)

1. **服務**：自訂
2. **伺服器**：`rtsp://localhost:8554`
3. **串流序號**：`mystream` (或任何你喜歡的路徑)

### 拉流播放

你可以在 VLC 或瀏覽器中查看直播：

- **WebRTC (瀏覽器)**: `https://plugins-based-framework-backend.onrender.com/mystream`
- **HLS (瀏覽器)**: `http://localhost:8888/mystream`
- **RTSP (VLC)**: `rtsp://localhost:8554/mystream`

---

## 常見問題

- **推流失敗**：檢查埠號 (`8554`, `8889`) 是否被佔用。
- **Webhook 沒反應**：確保你的後端伺服器 (`yarn dev`) 正在運行於 `3001` 埠，且資料庫連線正常。
