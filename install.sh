#!/bin/bash

echo "========================================="
echo "Network Monitor Installation Script"
echo "========================================="
echo ""

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js 20 or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version 18 or higher is required."
    echo "Current version: $(node -v)"
    exit 1
fi

echo "Installing dependencies..."
npm install

echo ""
echo "Building application..."
npm run build

echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
echo ""
echo "To start the application:"
echo "  npm start"
echo ""
echo "The application will be available at:"
echo "  http://localhost:3001"
echo ""
echo "Data will be stored in: ./data/monitor.db"
echo ""
