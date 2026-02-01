# 🚂 Railway MediaMTX 部署指南

要在 Railway 上成功運行 MediaMTX 直播伺服器，你需要進行以下步驟：

## 1. 建立服務

1. 登入 [Railway](https://railway.app/)。
2. 建立新專案 (New Project) > **Empty Project**。
3. 選擇 **GitHub Repo** 並連結此專案。

## 2. 設定環境變數與啟動命令

因為這是一個多服務的 Repo，我們需要告訴 Railway 這一個 Service 是要跑 MediaMTX。

在 Railway 的 **Settings** 頁面：

- **Build Command**: (留空)
- **Start Command**: `/mediamtx /mediamtx.yml`
- **Root Directory**: `/`
- **Watch Paths**: `mediamtx.Dockerfile`, `mediamtx.prod.yml`

## 3. 設定 Port (關鍵！)

MediaMTX 預設使用多個 Port，但在 Railway 上你需要特別設定：

### 如果你只用 HTTP (HLS 播放)
Railway 預設會偵測並開放一個 HTTP Port。
在 **Settings** > **Networking**：
- **PORT**: `8888` (對應 `mediamtx.prod.yml` 中的 HLS Port)
- Railway 會給你一個網址 (例如 `xxx.up.railway.app`)。
- 你的 HLS 串流網址就是 `https://xxx.up.railway.app/live/stream.m3u8`。

### 如何推流 (RTMP)?
這比較麻煩，因為 RTMP 是 TCP 1935，不是 HTTP。
Railway 的 Public Domain 只有 HTTP/HTTPS。

**解決方案 A: 使用 Railway TCP Proxy (需付費/驗證)**
1. 使用 Railway CLI 或付費方案開啟 TCP Proxy。
2. 你會得到一個 `railway.tcp.proxy:XXXXX` 的位址。
3. OBS 推流伺服器填寫該位址。

**解決方案 B: 使用 HLS 推流 (OBS 不支援，需特殊軟體)**
不建議。

**解決方案 C: 部署到 VPS (推薦)**
如果你需要標準 RTMP (1935) 推流，建議使用 DigitalOcean 或 AWS，直接用 Docker 跑，因為雲端平台 (PaaS) 對非 HTTP 的支援通常很貴或很麻煩。

## 4. 更新 Dockerfile

確保你的 `mediamtx.Dockerfile` 有將設定檔複製進去：

```dockerfile
FROM bluenviron/mediamtx:latest
COPY mediamtx.prod.yml /mediamtx.yml
ENTRYPOINT [ "/mediamtx", "/mediamtx.yml" ]
```
