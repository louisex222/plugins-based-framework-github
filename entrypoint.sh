#!/bin/sh
set -e

# 1. 啟動 Ngrok
if [ -n "$NGROK_AUTHTOKEN" ]; then
  echo "Starting Ngrok..."
  ngrok config add-authtoken "$NGROK_AUTHTOKEN"
  # 加上 --region jp (或 tw) 可以降低延遲
  ngrok tcp 1935 --log=stdout > /var/log/ngrok.log &

  sleep 8 # 給 Ngrok 多一點啟動時間

  # 修正：若沒 jq，改用 grep 和 sed 抓取網址
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'tcp://[^"]*')

  if [ -n "$NGROK_URL" ] && [ -n "$BACKEND_API_URL" ]; then
    echo "Reporting Tunnel URL: $NGROK_URL"
    # 這裡建議加上超時控制
    curl -m 10 -s -X POST "$BACKEND_API_URL/api/system/update-tunnel" \
      -H "Content-Type: application/json" \
      -d "{\"url\":\"$NGROK_URL\"}" || echo "Failed to report to backend"
  fi
fi

# 2. 修正 envsubst：確保你的模板變數 (如 $MTX_PATH) 不會被誤殺
# 只替換你需要的環境變數，例如 BACKEND_API_URL
envsubst '$BACKEND_API_URL' < /mediamtx.yml.template > /mediamtx.yml

# 3. 啟動 MediaMTX
echo "Starting MediaMTX..."
exec /usr/local/bin/mediamtx /mediamtx.yml