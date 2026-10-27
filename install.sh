#!/usr/bin/env bash
# Skill Nexus - Universal Installer (macOS & Linux)
# Usage: curl -fsSL https://raw.githubusercontent.com/Peerawit-Y/skill-nexus/main/install.sh | bash

set -e

REPO="Peerawit-Y/skill-nexus"
INSTALL_DIR="/usr/local/bin"

echo "⚡️ Installing Skill Nexus..."

OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

if [ "$OS" = "darwin" ]; then
    if [ "$ARCH" = "arm64" ]; then
        BINARY_NAME="skill-nexus-macos-arm64"
    else
        BINARY_NAME="skill-nexus-macos-x64"
    fi
elif [ "$OS" = "linux" ]; then
    BINARY_NAME="skill-nexus-linux-x64"
else
    echo "❌ Unsupported operating system: $OS. Please install via npm: npm install -g skill-nexus"
    exit 1
fi

DOWNLOAD_URL="https://github.com/$REPO/releases/latest/download/$BINARY_NAME"
TMP_FILE="/tmp/skill-nexus-$RANDOM"

echo "⬇️  Downloading $BINARY_NAME from GitHub Releases..."
curl -fsSL "$DOWNLOAD_URL" -o "$TMP_FILE" || {
    echo "❌ Failed to download binary. You can install via npm instead: npm install -g skill-nexus"
    exit 1
}

chmod +x "$TMP_FILE"

# Move binary to install dir
if [ -w "$INSTALL_DIR" ]; then
    mv "$TMP_FILE" "$INSTALL_DIR/skill-nexus"
    ln -sf "$INSTALL_DIR/skill-nexus" "$INSTALL_DIR/sn"
else
    echo "🔑 Root permissions required to install to $INSTALL_DIR:"
    sudo mv "$TMP_FILE" "$INSTALL_DIR/skill-nexus"
    sudo ln -sf "$INSTALL_DIR/skill-nexus" "$INSTALL_DIR/sn"
fi

echo "✅ Skill Nexus installed successfully!"
echo "   Run 'skill-nexus' or simply 'sn' to get started."
