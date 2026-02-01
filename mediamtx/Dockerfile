# 第一階段：拿官方已編譯好的 mediamtx
FROM bluenviron/mediamtx:latest AS mediamtx_bin

# 第二階段：精簡 runtime image
FROM alpine:3.19

RUN apk add --no-cache ca-certificates curl bash

# 關鍵：從第一階段 copy 出執行檔
COPY --from=mediamtx_bin /mediamtx /mediamtx

EXPOSE 8554 1935 8888 8889 8189/udp

ENTRYPOINT ["/mediamtx"]
