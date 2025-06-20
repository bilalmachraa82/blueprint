#!/bin/bash

echo "Cleaning and starting fresh..."

# Kill any running Next.js processes
pkill -f "next dev" || true

# Remove all cache and build files
rm -rf .next
rm -rf node_modules/.cache

# Regenerate Prisma client
echo "Regenerating Prisma client..."
npx prisma generate

# Start the dev server
echo "Starting development server..."
npm run dev