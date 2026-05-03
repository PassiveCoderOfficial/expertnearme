#!/usr/bin/env bash
# Dumps PostgreSQL DB, compresses, uploads to Google Drive + FTP.
# Env vars required: DATABASE_URL, GDRIVE_FOLDER_ID, FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR
# Optional: APP_URL, CRON_SECRET (for status reporting)
set -euo pipefail

TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
FILENAME="db_backup_${TIMESTAMP}.sql.gz"
TMPFILE="/tmp/${FILENAME}"

echo "==> Dumping database..."
pg_dump "$DATABASE_URL" | gzip > "$TMPFILE"
DB_SIZE=$(du -sh "$TMPFILE" | cut -f1)
echo "    Size: $DB_SIZE"

echo "==> Uploading to Google Drive..."
rclone copy "$TMPFILE" "gdrive:expertnearme-backups/database/" \
  --drive-root-folder-id "$GDRIVE_FOLDER_ID" \
  --transfers 1 \
  --retries 3
echo "    Google Drive: done"

echo "==> Uploading to FTP..."
curl --retry 3 --ftp-create-dirs \
  -T "$TMPFILE" \
  "ftp://${FTP_HOST}/${FTP_DIR}/database/${FILENAME}" \
  --user "${FTP_USER}:${FTP_PASS}" \
  --silent --show-error
echo "    FTP: done"

rm -f "$TMPFILE"

# Report status back to app
if [ -n "${APP_URL:-}" ] && [ -n "${CRON_SECRET:-}" ]; then
  curl -s -X POST "${APP_URL}/api/admin/backup/status" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Content-Type: application/json" \
    -d "{\"status\":\"success\",\"db_size\":\"${DB_SIZE}\"}" || true
fi

echo "==> DB backup complete: $FILENAME"
