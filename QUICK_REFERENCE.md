# Promptzy - Quick Reference Guide

## 🚀 Getting Started

### Web App (Ready to Use ✅)
```bash
cd packages/web
npm run dev
```
Visit: http://localhost:3000

**Production:** https://promptzy.bipro.dev ✅

### Mobile App (Needs Fix ⚠️)
**Problem:** Windows path length limit (260 characters)

**Solution (Choose One):**

#### Option 1: Move Project (Fastest - 2 minutes)
```powershell
xcopy "C:\Users\Administrator\Desktop\Projects\Promptzy" "C:\Promptzy" /E /I /H /Y
cd C:\Promptzy\packages\mobile
npx react-native run-android
```

#### Option 2: Enable Long Paths (Requires Admin + Restart)
```powershell
# Run as Administrator
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
# Restart computer
```

#### Option 3: Debug APK Only
```powershell
cd packages\mobile\android
.\gradlew assembleDebug
# APK: app\build\outputs\apk\debug\app-debug.apk
```

## 📱 What's New - Mobile UI

### ✅ Completed Improvements (3/6 Screens)

#### 1. LoginScreen
- ScrollView for keyboard handling
- Responsive sizing (works on 320px+ screens)
- Icon-enhanced inputs (mail, lock icons)
- Back button with proper touch target
- Loading animation
- Professional design

#### 2. SignUpScreen
- ScrollView with keyboard avoidance
- Password strength hint
- Icon-enhanced inputs
- Loading animation with hourglass
- Responsive on all devices
- Back navigation

#### 3. DashboardScreen
- Rich prompt cards with tags
- Word count stats with icon
- Improved FAB (floating action button)
- Bottom sheet modal with handle
- Project selector in create flow
- Better empty state
- Search with clear button
- Header subtitle (prompt count)
- Responsive design throughout

### ⏳ Pending Improvements (3/6 Screens)
- EditorScreen
- ProjectsScreen
- SettingsScreen

## 🎨 Design System at a Glance

### Screen Size Detection
```typescript
const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;
```

### Responsive Values
| Element | Small (<380px) | Regular (≥380px) |
|---------|----------------|------------------|
| Heading | 20-28px | 22-32px |
| Body | 13-15px | 14-16px |
| Padding | 20px | 24px |
| FAB | 54px | 60px |

### Colors
- Primary: `#3b82f6` (blue)
- Text: `#1f2937` (dark)
- Muted: `#6b7280` (gray)
- Border: `#e5e7eb` (light gray)

## 🛠️ Common Commands

### Development
```bash
# Web
cd packages/web
npm run dev                    # Start dev server
npm run build                  # Production build

# Mobile
cd packages/mobile
npx react-native start         # Metro bundler
npx react-native run-android   # Build & run
npx react-native log-android   # View logs

# Shared Package
cd packages/shared
npm install                    # Install dependencies
```

### Troubleshooting
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clean Android build
cd packages/mobile/android
.\gradlew clean
cd ..

# Reinstall dependencies
rm -rf node_modules
npm install
```

## 📂 Project Structure

```
Promptzy/
├── packages/
│   ├── web/              # React web app (Vite)
│   ├── mobile/           # React Native (Android)
│   └── shared/           # Shared services & logic
├── backend/
│   └── supabase/         # Database schema
└── docs/                 # Documentation
```

## 🔑 Environment Variables

### Web (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key-here
```

### Mobile (.env)
```env
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### Getting Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Select your project
3. Click Settings → API
4. Copy:
   - **URL:** Project URL (https://xxx.supabase.co)
   - **Key:** `anon` `public` key

## ✅ Testing Checklist

### Before Building Android APK
- [ ] Fixed path length issue
- [ ] Updated .env files with Supabase credentials
- [ ] Tested on web first
- [ ] Cleared Metro cache if needed
- [ ] Android device connected OR emulator running

### After Building
- [ ] Login works
- [ ] Signup creates account
- [ ] Dashboard loads prompts
- [ ] Can create new prompt
- [ ] Can edit prompt
- [ ] Keyboard doesn't hide inputs
- [ ] All buttons are tappable (44x44px minimum)

## 📖 Documentation Files

1. **README.md** - Complete project overview
2. **QUICKSTART.md** - 5-minute setup guide
3. **TROUBLESHOOTING.md** - Common issues & solutions
4. **WINDOWS_PATH_FIX.md** - Android build path issue
5. **MOBILE_UI_IMPROVEMENTS.md** - Technical UI details
6. **UI_IMPROVEMENTS_SUMMARY.md** - User-friendly summary
7. **QUICK_REFERENCE.md** - This file

## 🐛 Known Issues

### Android Build Fails
**Problem:** Path too long (>260 chars on Windows)
**Solution:** See WINDOWS_PATH_FIX.md

### Supabase Connection Fails
**Problem:** Wrong environment variables
**Solution:** Check .env files have correct URL and KEY

### Metro Bundler Issues
**Problem:** Cached files causing errors
**Solution:** `npx react-native start --reset-cache`

### TypeScript Errors
**Problem:** Missing type declarations
**Solution:** Already fixed - check packages/mobile/src/types/

## 🎯 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| Web App | ✅ Working | Deployed at promptzy.bipro.dev |
| Database | ✅ Working | Supabase schema configured |
| Auth | ✅ Working | Signup/Login functional |
| Mobile UI | 🔄 50% Complete | 3/6 screens improved |
| Android Build | ⚠️ Needs Fix | Path length issue |
| Documentation | ✅ Complete | 7 comprehensive guides |

## 🚀 Next Steps

### Immediate (To Test)
1. Fix path length issue (2 minutes with Option 1)
2. Build Android app
3. Test improved screens

### Short Term (1-2 days)
1. Complete remaining screen improvements
2. Test on multiple devices
3. Fix any bugs found

### Long Term (Next Week)
1. Add advanced features (versioning, chaining, etc.)
2. Performance optimization
3. App store preparation

## 💡 Pro Tips

### Development
- Test web first (faster iteration)
- Use Chrome DevTools for debugging
- Check console for errors

### Mobile
- Use physical device for best performance
- Enable USB debugging
- Keep Metro bundler running

### Debugging
- Check .env files first
- Clear cache when in doubt
- Read error messages carefully

## 📞 Need Help?

### Common Questions
**Q: Where's my Supabase URL?**
A: Dashboard → Settings → API → Project URL

**Q: Build fails with path error?**
A: Move project to C:\Promptzy (see WINDOWS_PATH_FIX.md)

**Q: Metro bundler won't start?**
A: Clear cache: `npx react-native start --reset-cache`

**Q: UI looks different than described?**
A: Make sure you're testing the improved screens (Login, Signup, Dashboard)

### Get Support
- Check TROUBLESHOOTING.md
- Review error messages
- Test web version first
- Verify environment variables

---

**Last Updated:** 2025-11-16
**Version:** 1.0.0
**Status:** Ready for testing (web ✅ | mobile ⚠️ needs path fix)