#!/bin/bash

# Supabase Setup Script
# This script helps you set up the Supabase database

echo "🚀 Starting Supabase Setup..."
echo ""

# Check if user is logged in
echo "📝 Step 1: Checking Supabase login status..."
if ! command -v npx &> /dev/null; then
    echo "❌ npm/npx not found. Please install Node.js first."
    exit 1
fi

# Initialize Supabase if needed
echo "📝 Step 2: Initializing Supabase project..."
if [ ! -d "supabase" ]; then
    echo "📦 Running supabase init..."
    npx supabase init
else
    echo "✅ Supabase folder already exists, skipping init"
fi

# Link project
echo "📝 Step 3: Linking to Supabase project..."
npx supabase link --project-ref lrypvrlziwwibtvtfdex

# Apply schema
echo ""
echo "📝 Step 4: Applying database schema..."
echo ""
echo "⚠️  IMPORTANT: You need to apply the database schema manually first."
echo ""
echo "Choose one of these options:"
echo ""
echo "Option 1: Via Supabase Dashboard (Easiest)"
echo "  1. Go to: https://supabase.com/dashboard/project/lrypvrlziwwibtvtfdex"
echo "  2. Click 'SQL Editor' in the left sidebar"
echo "  3. Click 'New Query'"
echo "  4. Open the file: supabase-schema.sql"
echo "  5. Copy all contents"
echo "  6. Paste into the SQL editor"
echo "  7. Click 'Run' (or press Ctrl+Enter)"
echo ""
echo "Option 2: Via CLI (If you have migration files)"
echo "  Run: npx supabase db push"
echo ""

read -p "Have you applied the database schema? (y/n): " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo ""
    echo "✅ Great! Database schema applied."
    echo ""
    echo "📝 Step 5: Testing the connection..."
    echo ""
    echo "Starting development server..."
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo ""
    echo "⚠️  Please apply the schema first using one of the options above."
    echo "Then run: npm run dev"
    echo ""
    echo "📖 See SUPABASE-SETUP.md for detailed instructions"
    exit 1
fi
