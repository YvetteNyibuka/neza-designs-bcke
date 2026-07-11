#!/usr/bin/env bash
# Simple backup script for uploads directory
set -euo pipefail
BASE_DIR="/root/neza-designs/neza-designs-bcke"
BACKUP_DIR="$BASE_DIR/backups"
UPLOADS_DIR="$BASE_DIR/uploads"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
mkdir -p "$BACKUP_DIR"
ARCHIVE="$BACKUP_DIR/uploads-$TIMESTAMP.tar.gz"
tar -czf "$ARCHIVE" -C "$BASE_DIR" "uploads"
# Keep only last 14 backups
ls -1t "$BACKUP_DIR"/uploads-*.tar.gz | tail -n +15 | xargs -r rm --
echo "Created $ARCHIVE"
