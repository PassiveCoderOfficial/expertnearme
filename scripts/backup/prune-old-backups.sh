#!/usr/bin/env bash
# Count-based retention: keep last KEEP_HOURLY files per type/day, keep last KEEP_DAILY days.
# Env vars: GDRIVE_FOLDER_ID, FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR, KEEP_HOURLY, KEEP_DAILY
set -euo pipefail

KEEP_HOURLY="${KEEP_HOURLY:-4}"
KEEP_DAILY="${KEEP_DAILY:-6}"

prune_gdrive_type() {
  local TYPE="$1"
  local REMOTE="gdrive:expertnearme-backups/${TYPE}/"

  echo "  [gdrive/${TYPE}] listing files..."
  # List all files sorted by name (timestamps in name → chronological)
  mapfile -t FILES < <(rclone lsf "$REMOTE" \
    --drive-root-folder-id "$GDRIVE_FOLDER_ID" \
    --format "n" | sort)

  local TOTAL=${#FILES[@]}
  echo "  [gdrive/${TYPE}] $TOTAL files found"

  # Group by date prefix (YYYYMMDD from filename like db_backup_20260503_141500.sql.gz)
  declare -A DAY_FILES
  for f in "${FILES[@]}"; do
    local DAY
    DAY=$(echo "$f" | grep -oP '\d{8}' | head -1 || echo "unknown")
    DAY_FILES[$DAY]+="$f "
  done

  local DAYS_SORTED
  mapfile -t DAYS_SORTED < <(printf '%s\n' "${!DAY_FILES[@]}" | sort -r)
  local DAYS_KEPT=0
  local TO_DELETE=()

  for DAY in "${DAYS_SORTED[@]}"; do
    mapfile -t DAY_LIST < <(echo "${DAY_FILES[$DAY]}" | tr ' ' '\n' | grep -v '^$' | sort -r)
    if [ "$DAYS_KEPT" -ge "$KEEP_DAILY" ]; then
      # Day beyond retention window — delete all
      TO_DELETE+=("${DAY_LIST[@]}")
    else
      # Within window — keep last KEEP_HOURLY, delete rest
      local IDX=0
      for f in "${DAY_LIST[@]}"; do
        if [ "$IDX" -ge "$KEEP_HOURLY" ]; then
          TO_DELETE+=("$f")
        fi
        IDX=$((IDX + 1))
      done
      DAYS_KEPT=$((DAYS_KEPT + 1))
    fi
  done

  if [ ${#TO_DELETE[@]} -eq 0 ]; then
    echo "  [gdrive/${TYPE}] nothing to prune"
    return
  fi

  echo "  [gdrive/${TYPE}] pruning ${#TO_DELETE[@]} files..."
  for f in "${TO_DELETE[@]}"; do
    rclone delete "${REMOTE}${f}" \
      --drive-root-folder-id "$GDRIVE_FOLDER_ID" \
      --retries 2 || echo "  WARN: failed to delete $f"
  done
}

prune_ftp_type() {
  local TYPE="$1"
  local REMOTE_DIR="${FTP_DIR}/${TYPE}/"

  echo "  [ftp/${TYPE}] listing + pruning..."
  lftp -u "${FTP_USER},${FTP_PASS}" "ftp://${FTP_HOST}" <<FTPEOF
set ftp:ssl-allow no
set net:timeout 30

# List files, sort, compute what to delete via shell in lftp
ls ${REMOTE_DIR}
bye
FTPEOF
  # lftp doesn't support complex scripting well — use curl to list + delete
  # List files via FTP
  mapfile -t FILES < <(curl -s \
    --user "${FTP_USER}:${FTP_PASS}" \
    "ftp://${FTP_HOST}/${REMOTE_DIR}" \
    --list-only 2>/dev/null | sort || true)

  local TOTAL=${#FILES[@]}
  echo "  [ftp/${TYPE}] $TOTAL files found"

  declare -A DAY_FILES
  for f in "${FILES[@]}"; do
    [ -z "$f" ] && continue
    local DAY
    DAY=$(echo "$f" | grep -oP '\d{8}' | head -1 || echo "unknown")
    DAY_FILES[$DAY]+="$f "
  done

  mapfile -t DAYS_SORTED < <(printf '%s\n' "${!DAY_FILES[@]}" | sort -r)
  local DAYS_KEPT=0
  local TO_DELETE=()

  for DAY in "${DAYS_SORTED[@]}"; do
    mapfile -t DAY_LIST < <(echo "${DAY_FILES[$DAY]}" | tr ' ' '\n' | grep -v '^$' | sort -r)
    if [ "$DAYS_KEPT" -ge "$KEEP_DAILY" ]; then
      TO_DELETE+=("${DAY_LIST[@]}")
    else
      local IDX=0
      for f in "${DAY_LIST[@]}"; do
        if [ "$IDX" -ge "$KEEP_HOURLY" ]; then
          TO_DELETE+=("$f")
        fi
        IDX=$((IDX + 1))
      done
      DAYS_KEPT=$((DAYS_KEPT + 1))
    fi
  done

  if [ ${#TO_DELETE[@]} -eq 0 ]; then
    echo "  [ftp/${TYPE}] nothing to prune"
    return
  fi

  echo "  [ftp/${TYPE}] pruning ${#TO_DELETE[@]} files..."
  for f in "${TO_DELETE[@]}"; do
    curl -s \
      --user "${FTP_USER}:${FTP_PASS}" \
      "ftp://${FTP_HOST}/${REMOTE_DIR}${f}" \
      -Q "DELE ${REMOTE_DIR}${f}" \
      --silent || echo "  WARN: failed to delete $f"
  done
}

echo "==> Pruning backups (keep hourly=$KEEP_HOURLY per day, keep days=$KEEP_DAILY)..."
for TYPE in code database storage; do
  prune_gdrive_type "$TYPE"
  prune_ftp_type "$TYPE"
done
echo "==> Prune complete"
