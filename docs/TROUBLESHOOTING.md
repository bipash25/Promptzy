# 🔧 Promptzy - Troubleshooting Guide

**Solutions to common problems and questions**

---

## 🔗 Supabase URL Configuration

### ❓ Question: "How do I get the correct Supabase URL?"

You mentioned getting this PostgreSQL connection string:
```
postgresql://postgres:[YOUR_PASSWORD]@db.onawxepwcyljveyauiau.supabase.co:5432/postgres
```

**This is NOT what you need!** That's the direct database connection string.

### ✅ Correct Way to Get Supabase URL:

1. **Go to your Supabase project dashboard**
2. Click **"Settings"** (gear icon) in the left sidebar
3. Click **"API"** section
4. Look for **"Project URL"** section at the top

**It should look like:**
```
https://onawxepwcyljveyauiau.supabase.co
```

**And your Anon Key below it looks like:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYXd4ZXB3Y3lsanZleWF1aWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk...
```

### 📝 Example Configuration:

**packages/web/.env:**
```env
VITE_SUPABASE_URL=https://onawxepwcyljveyauiau.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYXd4ZXB3Y3lsanZleWF1aWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk...
```

**packages/mobile/.env:**
```env
EXPO_PUBLIC_SUPABASE_URL=https://onawxepwcyljveyauiau.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uYXd4ZXB3Y3lsanZleWF1aWF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODk...
```

### 🚫 Common Mistakes:

❌ **WRONG:**
```env
# PostgreSQL connection string - DON'T USE THIS!
VITE_SUPABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.onawxepwcyljveyauiau.supabase.co:5432/postgres

# Missing https://
VITE_SUPABASE_URL=onawxepwcyljveyauiau.supabase.co

# Using database URL instead of API URL
VITE_SUPABASE_URL=https://db.onawxepwcyljveyauiau.supabase.co
```

✅ **CORRECT:**
```env
VITE_SUPABASE_URL=https://onawxepwcyljveyauiau.supabase.co
```

### 🔍 How to Verify Your Configuration:

1. Open browser console on your web app
2. You should see these logs when app loads:
```
[Supabase] Initializing with URL: https://onawxepwcyljveyauiau.supabase.co
[Supabase] Client created successfully
```

3. If you see errors like:
```
[Supabase] ❌ Connection failed
Failed to fetch
```
Then your URL or Key is incorrect.

---

## 📦 Package Naming Issue (com.mobile → com.promptzy)

### ❓ Question: "The app name is 'mobile' instead of 'promptzy'. How do I fix this?"

When you ran `npx react-native init mobile`, it created a package named `com.mobile`. Here's how to fix it:

### ✅ Files Already Fixed:

I've already updated these files for you:

1. ✅ [`packages/mobile/android/app/build.gradle`](packages/mobile/android/app/build.gradle:1)
   - Changed `applicationId "com.mobile"` → `applicationId "com.promptzy"`
   - Changed `namespace "com.mobile"` → `namespace "com.promptzy"`

2. ✅ [`packages/mobile/android/app/src/main/res/values/strings.xml`](packages/mobile/android/app/src/main/res/values/strings.xml:1)
   - Changed `<string name="app_name">mobile</string>` → `<string name="app_name">Promptzy</string>`

3. ✅ [`packages/mobile/package.json`](packages/mobile/package.json:1)
   - Changed `"name": "mobile"` → `"name": "promptzy"`

4. ✅ [`packages/mobile/app.json`](packages/mobile/app.json:1)
   - Changed `"name": "mobile"` → `"name": "Promptzy"`
   - Changed `"displayName": "mobile"` → `"displayName": "Promptzy"`

### 🔄 Files You Need to Rename Manually:

**Step 1:** Rename Java/Kotlin package directories:

**Old path:**
```
packages/mobile/android/app/src/main/java/com/mobile/
├── MainActivity.kt
└── MainApplication.kt
```

**New path (rename `mobile` folder to `promptzy`):**
```
packages/mobile/android/app/src/main/java/com/promptzy/
├── MainActivity.kt
└── MainApplication.kt
```

**PowerShell commands:**
```powershell
cd packages/mobile/android/app/src/main/java/com
mv mobile promptzy
```

**Step 2:** Update package declarations in Kotlin files:

I've already updated these, but verify they show:

**MainActivity.kt:**
```kotlin
package com.promptzy  // ✅ Changed from com.mobile
```

**MainApplication.kt:**
```kotlin
package com.promptzy  // ✅ Changed from com.mobile
```

### 🧹 Clean Build (Required after package rename):

```powershell
cd packages/mobile/android
.\gradlew clean

# Or if that fails:
rm -rf .gradle
rm -rf app/build

cd ..
npx react-native run-android
```

### ✅ Verify the Changes:

After successful build:
1. App name on device should show **"Promptzy"** (not "mobile")
2. App package in Android settings: **com.promptzy**
3. No build errors related to package mismatch

---

## 📱 Android Build Issues

### Issue: "Windows path too long"

**Symptoms:**
```
Error: EPERM: operation not permitted, lstat '\\?\C:\Users\Administrator\Desktop\Projects\Promptzy\packages\mobile\node_modules\...'
```

**Solutions (choose one):**

**Option 1: Enable Long Paths (Requires Restart)**
```powershell
# Run PowerShell as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Restart computer
```

**Option 2: Move Project to Shorter Path**
```powershell
# Move entire project
xcopy "C:\Users\Administrator\Desktop\Projects\Promptzy" "C:\Promptzy" /E /I /H
cd C:\Promptzy\packages\mobile
npx react-native run-android
```

**Option 3: Use WSL2 (Advanced)**
```bash
# In WSL2 Ubuntu terminal
cd /mnt/c/Users/Administrator/Desktop/Projects/Promptzy/packages/mobile
npx react-native run-android
```

### Issue: "Metro bundler not starting"

**Fix:**
```powershell
cd packages/mobile
npx react-native start --reset-cache

# In another terminal:
npx react-native run-android
```

### Issue: "Unable to load script"

**Fix:**
```powershell
# Check Metro is running on port 8081
# If blocked by firewall:
netsh advfirewall firewall add rule name="Metro" dir=in action=allow protocol=TCP localport=8081

# Then reload app:
# Shake device → "Reload" OR Press 'r' in Metro terminal
```

---

## 🌐 Web App Issues

### Issue: "Environment variables not loading"

**Symptoms:**
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL); // undefined
```

**Fix:**
1. Ensure file is named exactly `.env` (not `.env.txt`)
2. Variables MUST start with `VITE_`
3. Restart dev server after changing `.env`
4. Check `vite.config.js` has:
```javascript
export default defineConfig({
  define: {
    'process.env': {}
  }
});
```

### Issue: "Module not found: @promptzy/shared"

**Fix:**
```powershell
cd packages/web
rm -rf node_modules/@promptzy
npm install ../shared
npm run dev
```

### Issue: "Tailwind styles not working"

**Fix:**
1. Verify `postcss.config.js` exists
2. Check `index.css` imports:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```
3. Restart dev server

---

## 🔐 Authentication Issues

### Issue: "Sign up fails with 500 error"

**Symptoms:**
```
Error: new row violates row-level security policy for table "user_settings"
```

**Fix:**
Run this in Supabase SQL Editor:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Failed to create user settings for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Issue: "Session not persisting"

**Fix:**
1. Check browser allows localStorage
2. Clear browser cache and cookies
3. Verify Supabase URL is correct (with `https://`)

---

## 🗄️ Database Issues

### Issue: "Row Level Security blocking queries"

**Symptoms:**
```
Error: new row violates row-level security policy
```

**Check RLS is properly configured:**
```sql
-- Verify policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Should show policies for:
-- projects, prompts, user_settings, etc.
```

**If missing, re-run:** `backend/supabase/schema.sql`

### Issue: "Tables not found"

**Fix:**
1. Go to Supabase **SQL Editor**
2. Run entire `backend/supabase/schema.sql`
3. Verify in **Table Editor** - should see 11 tables

---

## 🔄 Sync & Offline Issues

### Issue: "Changes not syncing"

**Check:**
1. Internet connection active
2. Supabase project not paused (free tier)
3. Check browser console for errors
4. Verify RLS policies allow updates

**Manual sync:**
```javascript
import { syncService } from '@promptzy/shared';

// Check pending operations
const pending = await syncService.getPendingOperations();
console.log('Pending:', pending);

// Force sync
await syncService.forceSyncAll();
```

---

## 📊 Performance Issues

### Issue: "App loading slowly"

**Optimizations:**
1. Reduce number of prompts loaded initially
2. Add pagination to prompt list
3. Enable Supabase connection pooling
4. Optimize database indexes

### Issue: "Large prompts causing lag"

**Fix:**
1. Implement virtual scrolling for long lists
2. Lazy load markdown preview
3. Add debouncing to search input

---

## 🆘 Getting Help

If you're still stuck after trying these solutions:

1. **Check Logs:**
   - Web: Browser console (F12)
   - Mobile: `npx react-native log-android`
   - Supabase: Dashboard → Logs

2. **Provide Details:**
   - Error message (complete stack trace)
   - Steps to reproduce
   - What you've already tried
   - Environment (OS, Node version, etc.)

3. **Contact:**
   - GitHub Issues: [github.com/yourusername/promptzy/issues](https://github.com/yourusername/promptzy/issues)
   - Email: support@promptzy.com
   - Discord: [Join community](https://discord.gg/promptzy)

---

## ✅ Quick Diagnostic Checklist

Run through this when something isn't working:

### Web App:
- [ ] `.env` file exists in `packages/web/`
- [ ] Variables start with `VITE_`
- [ ] Supabase URL format: `https://xxxxx.supabase.co`
- [ ] Dev server restarted after `.env` changes
- [ ] Browser console shows no errors
- [ ] Can access http://localhost:3000

### Android App:
- [ ] `.env` file exists in `packages/mobile/`
- [ ] Variables start with `EXPO_PUBLIC_`
- [ ] Metro bundler running (port 8081)
- [ ] Device connected via USB OR emulator running
- [ ] Package name is `com.promptzy`
- [ ] App name shows "Promptzy"
- [ ] No path length issues

### Database:
- [ ] All 11 tables exist in Supabase
- [ ] RLS policies enabled
- [ ] Trigger function has `SECURITY DEFINER`
- [ ] Can see tables in Table Editor
- [ ] Auth provider enabled (Email)

### Authentication:
- [ ] Supabase Email provider enabled
- [ ] Can sign up new account
- [ ] Can sign in
- [ ] Session persists after refresh
- [ ] User data appears in auth.users table

---

**Still need help?** Open an issue with the diagnostic checklist results!

---

*Last updated: 2025-11-16*