#!/usr/bin/env bash
# Env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, GDRIVE_FOLDER_ID, FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR
# Optional: APP_URL, CRON_SECRET
set -euo pipefail

TIMESTAMP=$(date -u +%Y%m%d_%H%M%S)
FILENAME="storage_backup_${TIMESTAMP}.tar.gz"
TMPDIR="/tmp/storage_backup_${TIMESTAMP}"
TMPFILE="/tmp/${FILENAME}"

mkdir -p "$TMPDIR"

echo "==> Listing Supabase storage buckets..."
BUCKETS_JSON=$(curl -sf \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  "${SUPABASE_URL}/storage/v1/bucket" || echo "[]")

BUCKETS=$(echo "$BUCKETS_JSON" | jq -r '.[].name // empty' || true)

if [ -z "$BUCKETS" ]; then
  echo "    No buckets found or API error — skipping storage backup"
  exit 0
fi

echo "    Buckets: $(echo "$BUCKETS" | tr '\n' ' ')"

while IFS= read -r BUCKET; do
  [ -z "$BUCKET" ] && continue
  echo "==> Downloading bucket: $BUCKET"
  BUCKET_DIR="${TMPDIR}/${BUCKET}"
  mkdir -p "$BUCKET_DIR"

  OFFSET=0
  LIMIT=1000
  while true; do
    OBJECTS=$(curl -sf \
      -X POST \
      -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"prefix\":\"\",\"limit\":${LIMIT},\"offset\":${OFFSET}}" \
      "${SUPABASE_URL}/storage/v1/object/list/${BUCKET}" \
      | jq -r '.[].name // empty' || true)

    [ -z "$OBJECTS" ] && break

    while IFS= read -r OBJECT; do
      [ -z "$OBJECT" ] && continue
      DEST="${BUCKET_DIR}/${OBJECT}"
      mkdir -p "$(dirname "$DEST")"
      curl -sf \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
        "${SUPABASE_URL}/storage/v1/object/${BUCKET}/${OBJECT}" \
        -o "$DEST" || echo "    WARN: failed $OBJECT"
    done <<< "$OBJECTS"

    COUNT=$(echo "$OBJECTS" | wc -l)
    [ "$COUNT" -lt "$LIMIT" ] && break
    OFFSET=$((OFFSET + LIMIT))
  done
done <<< "$BUCKETS"

echo "==> Compressing..."
tar -czf "$TMPFILE" -C "$TMPDIR" .
STORAGE_SIZE=$(du -sh "$TMPFILE" | cut -f1)
echo "    Size: $STORAGE_SIZE"
rm -rf "$TMPDIR"

echo "==> Uploading to Google Drive..."
rclone copy "$TMPFILE" "gdrive:storage/" --retries 3
echo "    Google Drive: done"

echo "==> Uploading to FTP..."
curl --retry 3 --ftp-create-dirs \
  -T "$TMPFILE" \
  "ftp://${FTP_HOST}/${FTP_DIR}/storage/${FILENAME}" \
  --user "${FTP_USER}:${FTP_PASS}" \
  --silent --show-error
echo "    FTP: done"

rm -f "$TMPFILE"

if [ -n "${APP_URL:-}" ] && [ -n "${CRON_SECRET:-}" ]; then
  curl -sf -X POST "${APP_URL}/api/admin/backup/status" \
    -H "Authorization: Bearer ${CRON_SECRET}" \
    -H "Content-Type: application/json" \
    -d "{\"status\":\"success\",\"storage_size\":\"${STORAGE_SIZE}\"}" || true
fi

echo "==> Storage backup complete: $FILENAME"
