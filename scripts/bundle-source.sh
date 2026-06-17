#!/bin/bash
# Bundle B&B CRM source code into a tarball for download.
# Excludes node_modules, build artifacts, database files, logs.

set -e
cd /home/z/my-project

OUT=/home/z/my-project/download/bnb-crm-source.tar.gz

# Remove old tarball
rm -f "$OUT"

# Create tarball — walk current dir, exclude the heavy stuff
tar -czf "$OUT" \
  --exclude='./node_modules' \
  --exclude='./.next' \
  --exclude='./dist' \
  --exclude='./db/custom.db' \
  --exclude='./db/custom.db-journal' \
  --exclude='./.zscripts' \
  --exclude='./dev.log' \
  --exclude='./server.log' \
  --exclude='./.git' \
  --exclude='./download' \
  --exclude='./mini-services' \
  --exclude='./examples' \
  --exclude='./.z-ai-config' \
  --exclude='./skills' \
  --exclude='./upload' \
  --exclude='./bun.lock' \
  --exclude='./*.log' \
  --exclude='./build/icons/[0-9]*x[0-9]*.png' \
  -C /home/z/my-project \
  .

echo "Tarball created: $OUT"
echo "Size: $(du -h "$OUT" | cut -f1)"
echo ""
echo "Top-level contents:"
tar -tzf "$OUT" | grep -v '/' | head -20
echo "..."
echo "Folders:"
tar -tzf "$OUT" | grep '/$' | head -20
echo ""
echo "Total entries: $(tar -tzf "$OUT" | wc -l)"
