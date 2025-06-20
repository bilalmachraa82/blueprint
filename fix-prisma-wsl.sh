#!/bin/bash

echo "Fixing Prisma client for WSL..."

# Remove the problematic files
echo "Removing existing Prisma client..."
rm -rf node_modules/.prisma 2>/dev/null || true
rm -rf node_modules/@prisma/client/runtime 2>/dev/null || true

# Set environment variable to skip binary download issues
export PRISMA_SKIP_POSTINSTALL_GENERATE=true

# Reinstall Prisma client
echo "Reinstalling Prisma client..."
npm uninstall @prisma/client prisma
npm install prisma @prisma/client

# Generate Prisma client with proper settings
echo "Generating Prisma client..."
export PRISMA_GENERATE_SKIP_AUTOINSTALL=false
npx prisma generate

echo "Done! Prisma client should now work in WSL."