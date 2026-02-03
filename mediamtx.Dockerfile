FROM bluenviron/mediamtx:latest-ffmpeg AS mediamtx

FROM alpine:3.18

# 增加 jq 以利處理 JSON (如果 entrypoint 用 grep 則非必要，但建議帶著)
RUN apk add --no-cache curl gettext jq

COPY --from=mediamtx /mediamtx /usr/local/bin/mediamtx
# 同時複製官方的 ffmpeg 相關組件 (若有用到轉碼)
COPY --from=mediamtx /usr/local/bin/ffmpeg /usr/local/bin/ffmpeg

# 安裝 Ngrok (修正語法)
RUN curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | tee /etc/apk/keys/ngrok.asc >/dev/null && \
    echo "https://ngrok-agent.s3.amazonaws.com" >> /etc/apk/repositories && \
    apk update && apk add ngrok

COPY mediamtx.prod.yml /mediamtx.yml.template
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# 建立 log 檔案避免 ngrok 噴錯
RUN touch /var/log/ngrok.log && chmod 666 /var/log/ngrok.log

ENTRYPOINT [ "/entrypoint.sh" ]