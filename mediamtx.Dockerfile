# 使用官方 MediaMTX 映像檔 (基於 Alpine Linux)
FROM bluenviron/mediamtx:latest

# 安裝 curl (用於執行 runOnReady/NotReady) 和 gettext (用於 envsubst)
RUN apk add --no-cache curl gettext

# 複製自定義配置文件模板
COPY mediamtx.prod.yml /mediamtx.yml.template

# 建立啟動腳本
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo '# 使用 envsubst 將環境變數填入設定檔' >> /entrypoint.sh && \
    echo 'envsubst < /mediamtx.yml.template > /mediamtx.yml' >> /entrypoint.sh && \
    echo '# 啟動 MediaMTX' >> /entrypoint.sh && \
    echo 'exec /mediamtx /mediamtx.yml' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Railway 會自動映射 PORT 環境變數
# 但 MediaMTX 需要明確指定埠號
# 預設 RTMP: 1935, HLS: 8888, WebRTC: 8889

# 暴露必要的埠號 (僅供文件參考，實際需在 Railway 設定)
EXPOSE 1935 8888 8889

# 使用自定義啟動腳本
ENTRYPOINT [ "/entrypoint.sh" ]
