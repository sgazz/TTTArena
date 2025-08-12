#!/bin/bash

# Build script for TTT Arena - deploys to why-games project
# This script copies the game to /Users/const/dev/why-games/public/games/[game_name]

echo "🎮 TTT Arena Deployment Script"
echo "================================"
echo ""

# Ask for game name
read -p "Enter game name (folder name for deployment): " GAME_NAME

# Validate input
if [ -z "$GAME_NAME" ]; then
    echo "❌ Error: Game name cannot be empty"
    exit 1
fi

# Define target directory
TARGET_DIR="/Users/const/dev/why-games/public/games/$GAME_NAME"

echo ""
echo "📂 Target directory: $TARGET_DIR"
read -p "Continue? (y/n): " CONFIRM

if [ "$CONFIRM" != "y" ]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

# Create target directory
echo "📁 Creating target directory..."
mkdir -p "$TARGET_DIR/sounds"

# Copy game files
echo "📦 Copying game files..."
cp index.html "$TARGET_DIR/"
cp main.js "$TARGET_DIR/"
cp GameScene.js "$TARGET_DIR/"
cp ai.js "$TARGET_DIR/"
cp -r sounds/* "$TARGET_DIR/sounds/"

# Optional: Minify JavaScript files (requires terser)
if command -v terser &> /dev/null; then
    echo "📦 Minifying JavaScript files..."
    terser main.js -o "$TARGET_DIR/main.js" -c -m
    terser GameScene.js -o "$TARGET_DIR/GameScene.js" -c -m
    terser ai.js -o "$TARGET_DIR/ai.js" -c -m
    echo "✅ JavaScript minified"
else
    echo "⚠️  terser not found, skipping minification"
    echo "   Install with: npm install -g terser"
fi

# Optional: Minify HTML (requires html-minifier)
if command -v html-minifier &> /dev/null; then
    echo "📦 Minifying HTML..."
    html-minifier --collapse-whitespace --remove-comments --minify-css true --minify-js true index.html -o "$TARGET_DIR/index.html"
    echo "✅ HTML minified"
else
    echo "⚠️  html-minifier not found, skipping HTML minification"
    echo "   Install with: npm install -g html-minifier"
fi

echo ""
echo "✨ Deployment complete!"
echo "📁 Game deployed to: $TARGET_DIR"
echo "📊 Total size: $(du -sh "$TARGET_DIR" | cut -f1)"
echo ""
echo "Next steps:"
echo "  1. cd /Users/const/dev/why-games"
echo "  2. git add public/games/$GAME_NAME"
echo "  3. git commit -m 'Add $GAME_NAME game'"
echo "  4. git push"