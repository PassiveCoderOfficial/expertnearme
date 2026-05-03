#!/usr/bin/env bash
# Zips repo snapshot (excluding node_modules/.next), uploads to Google Drive + FTP.
# Env vars required: GDRIVE_FOLDER_ID, FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR
# Optional: APP_URL, CRON_SECRET
set -euo pipefail

TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
FILENAME="code_backup_${TIMESTAMP}.tar.gz"
TMPFILE="/tmp/${FILENAME}"
REPO_DIR="${GITHUB_WORKSPACE:-.}"

echo "==> Archiving code..."
tar -czf "$TMPFILE" \
  --exclude='./.git' \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./dist' \
  -C "$REPO_DIR" .
CODE_SIZE=$(du -sh "$TMPFILE" | cut -f1)
echo "    Size: $CODE_SIZE"

echo "==> Uploading to Google Drive..."
rclone copy "$TMPFILE" "gdrive:expertnearme-backups/code/" \
  --drive-root-folder-id "$GDRIVE_FOLDER_ID" \
  --transfers 1 \
  --retries 3
echo "    Google Drive: done"

echo "==> Uploading to FTP..."
curl --retry 3 --ftp-create-dirs \
  -T "$TMPFILE" \
  "ftp://${FTP_HOST}/${FTP_DIR}/code/${FILENAME}" \
  --user "${FTP_USER}:${FTP_PASS}" \
  --silent --show-error
echo "    FTP: done"

rm -f "$TMPFILE"

if [ -n "${APP_URL:-}" ] && [ -n "${CRON_SECRET:-}" ]; then
  curl -s -X POST "${APP_URL}/api/admin/backup/status" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Content-Type: application/json" \
    -d "{\"status\":\"success\",\"code_size\":\"${CODE_SIZE}\"}" || true
fi

echo "==> Code backup complete: $FILENAME"
