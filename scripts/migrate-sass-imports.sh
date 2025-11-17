#!/bin/bash

# Sass @import to @use/@forward Migration Script
# This script migrates deprecated @import statements to the new @use/@forward syntax

set -e

echo "========================================="
echo "Sass Import Migration Tool"
echo "========================================="
echo ""
echo "This script will migrate Sass @import statements to @use/@forward"
echo "for Dart Sass 3.0.0 compatibility."
echo ""

# Check if sass-migrator is installed
if ! command -v sass-migrator &> /dev/null; then
    echo "❌ sass-migrator is not installed."
    echo ""
    echo "Installing sass-migrator..."
    npm install -g sass-migrator

    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Failed to install sass-migrator."
        echo ""
        echo "Please install manually:"
        echo "  npm install -g sass-migrator"
        echo ""
        exit 1
    fi
fi

echo "✅ sass-migrator is installed"
echo ""

# Navigate to admin-ui directory
cd "$(dirname "$0")/../.." || exit 1

ADMIN_UI_DIR="packages/admin-ui"

if [ ! -d "$ADMIN_UI_DIR" ]; then
    echo "❌ Error: $ADMIN_UI_DIR directory not found"
    exit 1
fi

echo "📁 Working directory: $ADMIN_UI_DIR"
echo ""

# Count SCSS files
SCSS_COUNT=$(find "$ADMIN_UI_DIR" -name "*.scss" -type f | wc -l)
echo "📊 Found $SCSS_COUNT SCSS files to process"
echo ""

# Backup option
read -p "Create backup before migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BACKUP_DIR="$ADMIN_UI_DIR.backup-$(date +%Y%m%d-%H%M%S)"
    echo "📦 Creating backup at $BACKUP_DIR..."
    cp -r "$ADMIN_UI_DIR" "$BACKUP_DIR"
    echo "✅ Backup created"
    echo ""
fi

# Run migration
echo "🔧 Running sass-migrator module..."
echo ""

cd "$ADMIN_UI_DIR" || exit 1

# Migrate all SCSS files in the admin-ui package
sass-migrator module \
  --migrate-deps \
  --verbose \
  "src/**/*.scss"

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Migration completed successfully!"
    echo "========================================="
    echo ""
    echo "Next steps:"
    echo "1. Review the changes: git diff"
    echo "2. Test the build: npm run build"
    echo "3. Fix any remaining issues manually"
    echo "4. Commit the changes"
    echo ""
else
    echo ""
    echo "========================================="
    echo "⚠️  Migration completed with warnings"
    echo "========================================="
    echo ""
    echo "Some files may need manual review."
    echo "Check the output above for details."
    echo ""
fi
