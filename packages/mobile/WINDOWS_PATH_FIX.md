# 🔧 Windows Path Length Issue - Complete Fix Guide

## 🚨 The Problem

Windows has a **260 character path limit** causing React Native Android builds to fail with:
```
ninja: error: Stat(...): Filename longer than 260 characters
```

## ✅ Solution Applied

I've already added the fix to `android/app/build.gradle`:
- Added `CMAKE_OBJECT_PATH_MAX=300` argument
- Added packaging options to handle shared libraries

## 🎯 What You Need To Do

### Option 1: Move Project (FASTEST - 2 minutes)

Move the entire project to a shorter path:

```powershell
# From current location
xcopy "C:\Users\Administrator\Desktop\Projects\Promptzy" "C:\Promptzy" /E /I /H /Y

# Navigate to new location
cd C:\Promptzy\packages\mobile\android

# Clean and rebuild
.\gradlew clean
cd ..
npx react-native run-android
```

### Option 2: Enable Long Paths (PERMANENT FIX - Requires restart)

**PowerShell as Administrator:**
```powershell
# Enable long paths
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
                 -Name "LongPathsEnabled" `
                 -Value 1 `
                 -PropertyType DWORD `
                 -Force

# Verify it's set
Get-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled"
```

**Then restart your computer.**

After restart:
```powershell
cd C:\Users\Administrator\Desktop\Projects\Promptzy\packages\mobile\android
.\gradlew clean
cd ..
npx react-native run-android
```

### Option 3: Build Debug APK Instead

If you just need an APK to test:
```powershell
cd android
.\gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

## 🧪 Verify Build Works

After applying solution:
```powershell
cd packages/mobile/android
.\gradlew clean
.\gradlew assembleDebug
```

Should complete successfully without path errors.

## 📱 Install APK on Device

```powershell
# Install via ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or use Android Studio
# Device → Install APK → Select the .apk file
```

## 🎉 Success Indicators

✅ Build completes without path errors
✅ APK file created in `android/app/build/outputs/apk/`
✅ App installs and runs on device
✅ No CMake warnings about path length

---

**Recommendation:** Use **Option 1** (move project) for immediate solution, then apply **Option 2** for permanent fix.