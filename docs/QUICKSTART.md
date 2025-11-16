# 🚀 Promptzy - Quick Start Guide

**Get up and running in 10 minutes!**

---

## 📋 Prerequisites Checklist

Before you begin, make sure you have:

- ✅ **Node.js 20+** installed ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Git** for version control
- ✅ **Supabase account** (free tier works great)
- ✅ **Android Studio** (only for mobile development)
- ✅ **Code editor** (VS Code recommended)

---

## ⚡ 5-Minute Web Setup

### Step 1: Get the Code
```bash
git clone https://github.com/bipash25/Promptzy.git
cd promptzy
```

### Step 2: Setup Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create account
2. Click **"New Project"**
3. Fill in project details and wait for setup (~2 minutes)
4. Go to **Settings → API** and copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...`

### Step 3: Load Database Schema

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `backend/supabase/schema.sql` from your project
4. Copy all content and paste into SQL Editor
5. Click **"Run"** - should see "Success. No rows returned"
6. Run the trigger fix from `backend/supabase/fix_trigger.sql`

### Step 4: Configure Environment

Create `packages/web/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:** Replace with YOUR actual values from Supabase!

### Step 5: Install & Run

```bash
# Install shared package
cd packages/shared
npm install

# Setup web app
cd ../web
npm install ../shared
npm install

# Start development server
npm run dev
```

**🎉 Open http://localhost:3000** - Your web app is running!

---

## 📱 Android Setup (Additional 10 minutes)

### Prerequisites
- Android Studio installed
- JDK 17+ configured
- Android SDK installed
- USB debugging enabled on device OR emulator running

### Step 1: Configure Environment

Create `packages/mobile/.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 2: Install Dependencies

```bash
cd packages/mobile
npm install ../shared
npm install
```

### Step 3: Fix Windows Path Issue (if needed)

**Option A:** Restart your computer (enables long paths)

**Option B:** Move project to shorter path:
```bash
# Move to C:\Promptzy instead of Desktop path
move "C:\Users\Administrator\Desktop\Projects\Promptzy" "C:\Promptzy"
cd C:\Promptzy\packages\mobile
```

### Step 4: Run Android App

**Terminal 1** - Start Metro bundler:
```bash
npx react-native start
```

**Terminal 2** - Build and install on device:
```bash
npx react-native run-android
```

**First build takes 5-10 minutes** ☕ - be patient!

---

## ✅ Verify Everything Works

### Web App Test:
1. ✅ Open http://localhost:3000
2. ✅ Click "Sign up" and create account
3. ✅ Sign in with your credentials
4. ✅ Click "New Project" in sidebar
5. ✅ Click FAB button (bottom right) to create prompt
6. ✅ Write markdown and see live preview
7. ✅ Click Save and see in dashboard

### Android App Test:
1. ✅ App launches without errors
2. ✅ Sign in works
3. ✅ Dashboard shows prompts
4. ✅ FAB button opens create modal
5. ✅ Can create and edit prompts
6. ✅ Editor shows markdown rendering

---

## 🐛 Common Issues & Quick Fixes

### Issue: "Module not found @promptzy/shared"
**Fix:**
```bash
cd packages/web  # or packages/mobile
npm install ../shared
```

### Issue: "Supabase connection failed"
**Fix:**
1. Check `.env` file exists in correct location
2. Verify URL has `https://` prefix
3. Confirm Anon Key is complete (very long string)
4. No trailing slashes in URL

### Issue: "Row Level Security" error on signup
**Fix:**
```bash
# Run this in Supabase SQL Editor
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
    RETURN NEW;
END;
$$;
```

### Issue: Android build fails with path error
**Fix:**
```bash
# Option 1: Restart computer (enables long paths)
# Option 2: Move to C:\Promptzy
# Option 3: Clean and rebuild
cd packages/mobile/android
.\gradlew clean
cd ..
npx react-native run-android
```

### Issue: Metro bundler cache problems
**Fix:**
```bash
cd packages/mobile
npx react-native start --reset-cache
```

### Issue: "Cannot find module 'react-native-vector-icons'"
**Fix:**
```bash
cd packages/mobile
npm install react-native-vector-icons
npx react-native link react-native-vector-icons
```

---

## 🎯 What to Do Next

### 1. Customize Your Setup
- Change app theme colors in `tailwind.config.js`
- Update app name in `packages/mobile/app.json`
- Configure authentication settings in Supabase

### 2. Add Your Content
- Create projects to organize prompts
- Import existing prompts (JSON format supported)
- Set up tags for categorization

### 3. Deploy to Production
- **Web:** Follow [`packages/web/BUILD_INSTRUCTIONS.md`](packages/web/BUILD_INSTRUCTIONS.md)
- **Mobile:** Follow [`packages/mobile/BUILD_INSTRUCTIONS.md`](packages/mobile/BUILD_INSTRUCTIONS.md)

### 4. Explore Features
- ⭐ Favorite important prompts
- 📊 Check word/character/token counts
- 🔗 Chain related prompts together
- 📤 Export prompts in multiple formats
- 🎨 Use markdown formatting with live preview
- 📱 Sync across all devices automatically

---

## 📚 Additional Resources

- **Full Documentation:** [README.md](README.md)
- **Web Build Guide:** [packages/web/BUILD_INSTRUCTIONS.md](packages/web/BUILD_INSTRUCTIONS.md)
- **Android Build Guide:** [packages/mobile/BUILD_INSTRUCTIONS.md](packages/mobile/BUILD_INSTRUCTIONS.md)
- **Database Schema:** [backend/supabase/schema.sql](backend/supabase/schema.sql)

---

## 💡 Pro Tips

1. **Use keyboard shortcuts:**
   - `Ctrl/Cmd + K` - Quick search
   - `Ctrl/Cmd + N` - New prompt
   - `Ctrl/Cmd + S` - Save

2. **Template variables:**
   ```markdown
   Write a {{tone}} blog post about {{topic}} for {{audience}}
   ```

3. **Markdown shortcuts:**
   - `**bold**` → **bold**
   - `*italic*` → *italic*
   - `` `code` `` → `code`
   - `{{variable}}` → highlighted variable

4. **Organization:**
   - Use projects for different categories
   - Tag prompts for quick filtering
   - Star favorites for quick access

---

## 🆘 Need Help?

- **Issues:** Open an issue on GitHub
- **Questions:** Join our Discord community
- **Email:** support@promptzy.com
- **Documentation:** Check README.md for detailed info

---

## ✨ Success!

You should now have:
- ✅ Web app running on localhost:3000
- ✅ Database configured and ready
- ✅ Authentication working
- ✅ Able to create and manage prompts
- ✅ (Optional) Android app running on device

**Start organizing your prompts and boost your productivity!** 🚀

---

**Next Steps:**
1. ⭐ Star the repo if you find it useful
2. 🐛 Report any bugs you encounter
3. 💬 Share feedback and suggestions
4. 🤝 Contribute improvements

---

*Made with ❤️ for the developer community*