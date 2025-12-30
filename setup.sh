#!/bin/bash

echo "🐝 BeeSeek Marketing - Quick Setup"
echo "=================================="
echo ""

echo "📋 Step 1: Database Setup"
echo "Please run the SQL from 'supabase-setup.sql' in your Supabase SQL Editor"
echo "URL: https://npxxvrqbicymhrttjyrh.supabase.co"
echo ""
read -p "Press Enter when you've created the table..."

echo ""
echo "📊 Step 2: Seeding the database with managers..."
echo "Starting dev server temporarily..."

# Start dev server in background
npm run dev &
DEV_PID=$!

# Wait for server to be ready
echo "Waiting for server to start..."
sleep 5

# Seed the database
echo "Seeding database..."
curl -X POST http://localhost:3000/api/seed

# Kill dev server
kill $DEV_PID

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 You can now run: npm run dev"
echo ""
echo "🔐 Login credentials:"
echo "   - Tosin: tosin"
echo "   - Jimi: jimi"
echo "   - Kunle: kunle"
echo ""
echo "📍 URLs:"
echo "   - Homepage: http://localhost:3000"
echo "   - Login: http://localhost:3000/login"
echo "   - Dashboard: http://localhost:3000/dashboard"
