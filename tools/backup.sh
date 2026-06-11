#!/bin/bash

# 1. Get path to tools/ where this script lives
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 2. Go one level up — project root (GAME folder)
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# 3. Folder name will be GAME
FOLDER_NAME="$(basename "$PROJECT_DIR")"

# 4. Backup target: one level above GAME
BACKUP_DIR="$(dirname "$PROJECT_DIR")"

# Create target directory
TARGET_DIR="${BACKUP_DIR}/${FOLDER_NAME}_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$TARGET_DIR"

# Copy everything
cp -r "$PROJECT_DIR"/* "$TARGET_DIR"/

echo "Backup saved to: ${TARGET_DIR}"
