#!/usr/bin/env bash
# Upload file to Google Drive using OAuth2 refresh token (no rclone).
# Args: $1 = local file path, $2 = subfolder name (code/database/storage)
# Env: GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID
set -euo pipefail

LOCAL_FILE="$1"
SUBFOLDER="$2"
FILENAME=$(basename "$LOCAL_FILE")

# Refresh access token
ACCESS_TOKEN=$(curl -sf -X POST https://oauth2.googleapis.com/token \
  -d "client_id=${GDRIVE_CLIENT_ID}" \
  -d "client_secret=${GDRIVE_CLIENT_SECRET}" \
  -d "refresh_token=${GDRIVE_REFRESH_TOKEN}" \
  -d "grant_type=refresh_token" | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "ERROR: Failed to refresh Google Drive access token"
  exit 1
fi

# Find or create subfolder inside GDRIVE_FOLDER_ID
SUBFOLDER_ID=$(curl -sf \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://www.googleapis.com/drive/v3/files?q=name='${SUBFOLDER}'+and+'${GDRIVE_FOLDER_ID}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id,name)" \
  | jq -r '.files[0].id // empty')

if [ -z "$SUBFOLDER_ID" ]; then
  SUBFOLDER_ID=$(curl -sf -X POST \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\":\"${SUBFOLDER}\",\"mimeType\":\"application/vnd.google-apps.folder\",\"parents\":[\"${GDRIVE_FOLDER_ID}\"]}" \
    "https://www.googleapis.com/drive/v3/files?fields=id" | jq -r '.id')
  echo "    Created subfolder '$SUBFOLDER': $SUBFOLDER_ID"
fi

# Upload file (multipart)
FILE_SIZE=$(wc -c < "$LOCAL_FILE")
echo "    Uploading $FILENAME ($FILE_SIZE bytes) to Drive/$SUBFOLDER/..."

UPLOAD_RESPONSE=$(curl -sf -X POST \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -F "metadata={\"name\":\"${FILENAME}\",\"parents\":[\"${SUBFOLDER_ID}\"]};type=application/json;charset=UTF-8" \
  -F "file=@${LOCAL_FILE}" \
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name")

FILE_ID=$(echo "$UPLOAD_RESPONSE" | jq -r '.id // empty')
if [ -z "$FILE_ID" ]; then
  echo "ERROR: Upload failed. Response: $UPLOAD_RESPONSE"
  exit 1
fi

echo "    Uploaded to Drive: $FILE_ID"
