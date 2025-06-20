#!/bin/bash

echo "🚀 Optimizing Blueprint Pro for production..."

# Clean cache
echo "📦 Cleaning cache..."
rm -rf .next
rm -rf node_modules/.cache

# Install dependencies
echo "📥 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build for production
echo "🏗️ Building for production..."
npm run build

echo "✅ Optimization complete!"
echo "📌 To start the production server, run: npm start"