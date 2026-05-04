#!/usr/bin/env bash
# Count-based retention via Google Drive API + FTP curl.
# Env: GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET, GDRIVE_REFRESH_TOKEN, GDRIVE_FOLDER_ID
#      FTP_HOST, FTP_USER, FTP_PASS, FTP_DIR, KEEP_HOURLY, KEEP_DAILY
set -euo pipefail

KEEP_HOURLY="${KEEP_HOURLY:-4}"
KEEP_DAILY="${KEEP_DAILY:-6}"

# Refresh access token once
ACCESS_TOKEN=$(curl -sf -X POST https://oauth2.googleapis.com/token \
  -d "client_id=${GDRIVE_CLIENT_ID}" \
  -d "client_secret=${GDRIVE_CLIENT_SECRET}" \
  -d "refresh_token=${GDRIVE_REFRESH_TOKEN}" \
  -d "grant_type=refresh_token" | jq -r '.access_token')

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo "ERROR: Failed to refresh access token"
  exit 1
fi

gdrive_get_folder_id() {
  local PARENT="$1" NAME="$2"
  curl -sf \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    "https://www.googleapis.com/drive/v3/files?q=name='${NAME}'+and+'${PARENT}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false&fields=files(id)" \
    | jq -r '.files[0].id // empty'
}

gdrive_list_files() {
  local FOLDER_ID="$1"
  curl -sf \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    "https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name)&orderBy=name&pageSize=1000" \
    | jq -r '.files[] | "\(.name) \(.id)"'
}

gdrive_delete_file() {
  local FILE_ID="$1"
  curl -sf -X DELETE \
    -H "Authorization: Bearer $ACCESS_TOKEN" \
    "https://www.googleapis.com/drive/v3/files/${FILE_ID}" || echo "  WARN: failed to delete $FILE_ID"
}

prune_gdrive_type() {
  local TYPE="$1"
  local SUBFOLDER_ID
  SUBFOLDER_ID=$(gdrive_get_folder_id "$GDRIVE_FOLDER_ID" "$TYPE")
  [ -z "$SUBFOLDER_ID" ] && echo "  [gdrive/$TYPE] folder not found, skip" && return

  echo "  [gdrive/$TYPE] listing files..."
  mapfile -t FILE_LINES < <(gdrive_list_files "$SUBFOLDER_ID" | sort || true)
  local TOTAL=${#FILE_LINES[@]}
  echo "  [gdrive/$TYPE] $TOTAL files"
  [ "$TOTAL" -eq 0 ] && return

  declare -A DAY_NAMES DAY_IDS
  for LINE in "${FILE_LINES[@]}"; do
    [ -z "$LINE" ] && continue
    local NAME ID DAY
    NAME=$(echo "$LINE" | awk '{print $1}')
    ID=$(echo "$LINE" | awk '{print $2}')
    DAY=$(echo "$NAME" | grep -oP '\d{8}' | head -1 || echo "unknown")
    DAY_NAMES[$DAY]+="${NAME} "
    DAY_IDS[$DAY]+="${ID} "
  done

  mapfile -t DAYS_SORTED < <(printf '%s\n' "${!DAY_NAMES[@]}" | sort -r)
  local DAYS_KEPT=0

  for DAY in "${DAYS_SORTED[@]}"; do
    mapfile -t DAY_NAME_LIST < <(echo "${DAY_NAMES[$DAY]}" | tr ' ' '\n' | grep -v '^$' | sort -r)
    mapfile -t DAY_ID_LIST < <(echo "${DAY_IDS[$DAY]}" | tr ' ' '\n' | grep -v '^$')
    # Re-sort IDs by name order
    mapfile -t DAY_ID_LIST < <(
      for N in "${DAY_NAME_LIST[@]}"; do
        for LINE in "${FILE_LINES[@]}"; do
          [[ "$LINE" == "$N "* ]] && echo "$LINE" | awk '{print $2}' && break
        done
      done
    )

    if [ "$DAYS_KEPT" -ge "$KEEP_DAILY" ]; then
      for ID in "${DAY_ID_LIST[@]}"; do
        [ -z "$ID" ] && continue
        echo "  [gdrive/$TYPE] delete $ID"
        gdrive_delete_file "$ID"
      done
    else
      local IDX=0
      for ID in "${DAY_ID_LIST[@]}"; do
        [ -z "$ID" ] && continue
        if [ "$IDX" -ge "$KEEP_HOURLY" ]; then
          echo "  [gdrive/$TYPE] delete $ID"
          gdrive_delete_file "$ID"
        fi
        IDX=$((IDX + 1))
      done
      DAYS_KEPT=$((DAYS_KEPT + 1))
    fi
  done
}

prune_ftp_type() {
  local TYPE="$1"
  local REMOTE_DIR="${FTP_DIR}/${TYPE}/"

  mapfile -t FILES < <(curl -s \
    --user "${FTP_USER}:${FTP_PASS}" \
    "ftp://${FTP_HOST}/${REMOTE_DIR}" \
    --list-only 2>/dev/null | sort || true)

  local TOTAL=${#FILES[@]}
  echo "  [ftp/$TYPE] $TOTAL files"
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

  for DAY in "${DAYS_SORTED[@]}"; do
    mapfile -t DAY_LIST < <(echo "${DAY_FILES[$DAY]}" | tr ' ' '\n' | grep -v '^$' | sort -r)
    if [ "$DAYS_KEPT" -ge "$KEEP_DAILY" ]; then
      for f in "${DAY_LIST[@]}"; do
        [ -z "$f" ] && continue
        curl -s --user "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}" \
          -Q "DELE /${REMOTE_DIR}${f}" || echo "  WARN: ftp delete failed $f"
      done
    else
      local IDX=0
      for f in "${DAY_LIST[@]}"; do
        [ -z "$f" ] && continue
        if [ "$IDX" -ge "$KEEP_HOURLY" ]; then
          curl -s --user "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}" \
            -Q "DELE /${REMOTE_DIR}${f}" || echo "  WARN: ftp delete failed $f"
        fi
        IDX=$((IDX + 1))
      done
      DAYS_KEPT=$((DAYS_KEPT + 1))
    fi
  done
}

echo "==> Pruning (keep_hourly=$KEEP_HOURLY, keep_daily=$KEEP_DAILY)..."
for TYPE in code database storage; do
  prune_gdrive_type "$TYPE" || echo "WARN: gdrive prune failed for $TYPE"
  prune_ftp_type "$TYPE" || echo "WARN: ftp prune failed for $TYPE"
done
echo "==> Prune complete"
