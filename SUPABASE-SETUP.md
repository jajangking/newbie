# Supabase Setup Guide

## Database Setup

To set up the Supabase database, you have two options:

### Option 1: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project: https://supabase.com/dashboard/project/lrypvrlziwwibtvtfdex
2. Navigate to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `supabase-schema.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press `Ctrl+Enter` / `Cmd+Enter`)

This will create all necessary tables, policies, and indexes.

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase (if not already logged in)
npx supabase login

# Initialize Supabase project (if not already done)
npx supabase init

# Link to your project
npx supabase link --project-ref lrypvrlziwwibtvtfdex

# Apply the schema migration
npx supabase db push
```

## Environment Variables

The `.env.local` file has been created with your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://lrypvrlziwwibtvtfdex.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_-KxHvM9ZGAfmZV-A0sq1Jw_NwQ6RU8Y
```

⚠️ **Important:** Never commit this file to version control. It's already in `.gitignore`.

## Database Schema

The following tables will be created:

- **modules** - Stores your learning modules
- **steps** - Steps within each module
- **tasks** - Individual checklist items
- **task_states** - Daily completion tracking
- **module_completions** - Module completion status

All tables have Row Level Security (RLS) policies that allow public read/write access for development. For production, you should implement proper authentication.

## Migration from localStorage

The app now uses Supabase as the primary data source with localStorage as a fallback:

1. **Primary**: Data is stored in Supabase cloud database
2. **Fallback**: If Supabase is unavailable, the app falls back to localStorage
3. **Daily Reset**: Task progress still resets daily (stored in both Supabase and localStorage)

### Migrating Existing Data

If you have existing data in localStorage that you want to migrate to Supabase:

1. Open your browser console on the app page
2. Run this script:

```javascript
// Get data from localStorage
const modules = JSON.parse(localStorage.getItem('custom-modules') || '[]');

// The app will automatically sync this data to Supabase
// when you create/edit modules through the UI
```

Or manually:
1. Export your modules through the app
2. The app will automatically push new data to Supabase when you interact with it

## Testing the Connection

After setting up the database:

1. Run the development server: `npm run dev`
2. Open http://localhost:3000
3. Try creating a new module
4. Check your Supabase dashboard to see the data

## Troubleshooting

**"Missing Supabase environment variables"**
- Make sure `.env.local` exists and has the correct variables
- Restart the development server after creating `.env.local`

**Data not syncing to Supabase**
- Check browser console for errors
- Verify your Supabase project is active
- Ensure the SQL schema has been applied

**Fallback to localStorage**
- If Supabase is unreachable, the app automatically falls back to localStorage
- Check the browser console for error messages
