#!/usr/bin/env bash
# Count-based retention: keep last KEEP_HOURLY per day × last KEEP_DAILY days.
# Env vars: GDRIVE_FOLDER_ID, FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR, KEEP_HOURLY, KEEP_DAILY
set -euo pipefail

KEEP_HOURLY="${KEEP_HOURLY:-4}"
KEEP_DAILY="${KEEP_DAILY:-6}"

prune_gdrive_type() {
  local TYPE="$1"
  local REMOTE="gdrive:${TYPE}/"

  echo "  [gdrive/${TYPE}] listing files..."
  mapfile -t FILES < <(rclone lsf "$REMOTE" --retries 2 | sort || true)

  local TOTAL=${#FILES[@]}
  echo "  [gdrive/${TYPE}] $TOTAL files found"
  [ "$TOTAL" -eq 0 ] && return

  declare -A DAY_FILES
  for f in "${FILES[@]}"; do
    [ -z "$f" ] && continue
    local DAY
    DAY=$(echo "$f" | grep -oP '\d{8}' | head -1 || echo "unknown")
    DAY_FILES[$DAY]+="${f} "
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
        [ "$IDX" -ge "$KEEP_HOURLY" ] && TO_DELETE+=("$f")
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
    [ -z "$f" ] && continue
    rclone delete "${REMOTE}${f}" --retries 2 || echo "  WARN: failed to delete $f"
  done
}

prune_ftp_type() {
  local TYPE="$1"
  local REMOTE_DIR="${FTP_DIR}/${TYPE}/"

  echo "  [ftp/${TYPE}] listing files..."
  mapfile -t FILES < <(curl -s \
    --user "${FTP_USER}:${FTP_PASS}" \
    "ftp://${FTP_HOST}/${REMOTE_DIR}" \
    --list-only 2>/dev/null | sort || true)

  local TOTAL=${#FILES[@]}
  echo "  [ftp/${TYPE}] $TOTAL files found"
  [ "$TOTAL" -eq 0 ] && return

  declare -A DAY_FILES
  for f in "${FILES[@]}"; do
    [ -z "$f" ] && continue
    local DAY
    DAY=$(echo "$f" | grep -oP '\d{8}' | head -1 || echo "unknown")
    DAY_FILES[$DAY]+="${f} "
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
        [ "$IDX" -ge "$KEEP_HOURLY" ] && TO_DELETE+=("$f")
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
    [ -z "$f" ] && continue
    curl -s \
      --user "${FTP_USER}:${FTP_PASS}" \
      "ftp://${FTP_HOST}" \
      -Q "DELE /${REMOTE_DIR}${f}" || echo "  WARN: failed to delete $f"
  done
}

echo "==> Pruning (keep_hourly=$KEEP_HOURLY, keep_daily=$KEEP_DAILY)..."
for TYPE in code database storage; do
  prune_gdrive_type "$TYPE" || echo "WARN: gdrive prune failed for $TYPE"
  prune_ftp_type "$TYPE" || echo "WARN: ftp prune failed for $TYPE"
done
echo "==> Prune complete"
