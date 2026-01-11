#!/bin/bash

# Start the Next.js development server from the frontend directory
# This script should be run from the frontend folder

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Change to the frontend directory
cd "$SCRIPT_DIR"

echo "Starting Next.js development server from: $(pwd)"
echo "-------------------------------------------"

# Run the development server
npm run dev
