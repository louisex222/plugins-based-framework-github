# 第一階段：獲取官方 MediaMTX 二進位檔案
FROM bluenviron/mediamtx:latest AS mediamtx

# 第二階段：建立執行環境
FROM alpine:3.18

# 安裝必要的工具：curl (發送 Webhook) 和 gettext (提供 envsubst)
RUN apk add --no-cache curl gettext

# 從第一階段複製 mediamtx 執行檔
COPY --from=mediamtx /mediamtx /usr/local/bin/mediamtx

# 複製自定義配置文件模板
COPY mediamtx.prod.yml /mediamtx.yml.template

# 建立啟動腳本
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'envsubst < /mediamtx.yml.template > /mediamtx.yml' >> /entrypoint.sh && \
    echo 'exec /usr/local/bin/mediamtx /mediamtx.yml' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# 暴露必要的埠號 (僅供參考)
EXPOSE 1935 8889 8189/udp

# 使用自定義啟動腳本
ENTRYPOINT [ "/entrypoint.sh" ]
