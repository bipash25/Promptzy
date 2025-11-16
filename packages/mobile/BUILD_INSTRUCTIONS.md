# 📱 Promptzy Android - Build Instructions

## 🚀 Quick Build

### **Prerequisites:**
- Node.js 20+ installed
- Android Studio installed with Android SDK
- JDK 17+ installed
- USB debugging enabled on Android device (or emulator running)

---

## 📦 **Method 1: Build APK (Recommended)**

### **Step 1: Install Dependencies**
```powershell
cd C:\Users\Administrator\Desktop\Projects\Promptzy\packages\mobile
npm install
```

### **Step 2: Start Metro Bundler**
```powershell
# Terminal 1 - Keep this running
npx react-native start
```

### **Step 3: Build and Install**
```powershell
# Terminal 2 - Build and run
npx react-native run-android
```

This will:
- Build the APK
- Install it on your connected device/emulator
- Launch the app

---

## 🏗️ **Method 2: Build Release APK**

### **For Production APK:**
```powershell
cd android
./gradlew assembleRelease

# APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### **Install Release APK:**
```powershell
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## 🛠️ **Method 3: Using Android Studio**

1. Open Android Studio
2. **File** → **Open** → Select `packages/mobile/android`
3. Wait for Gradle sync to complete
4. Click **Run** button (or Shift+F10)
5. Select your device/emulator

---

## 🐛 **Troubleshooting**

### **Issue: "SDK location not found"**
```powershell
# Set Android SDK path
$env:ANDROID_HOME = "C:\Users\Administrator\AppData\Local\Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
```

### **Issue: "Metro bundler not found"**
```powershell
# Reset cache and restart
npx react-native start --reset-cache
```

### **Issue: "Build failed - path too long"**
**Solution 1:** Restart computer (long path support enabled, needs restart)

**Solution 2:** Move project to shorter path:
```powershell
# Move entire project
Move-Item "C:\Users\Administrator\Desktop\Projects\Promptzy" "C:\Promptzy"
cd C:\Promptzy\packages\mobile
```

### **Issue: "No connected devices"**
```powershell
# Check connected devices
adb devices

# If none, enable USB debugging on phone:
# Settings → About Phone → Tap "Build Number" 7 times
# Settings → Developer Options → USB Debugging → ON
```

### **Issue: "Gradle sync failed"**
```powershell
cd android
./gradlew clean
cd ..
npx react-native run-android
```

---

## 📱 **Testing on Physical Device**

1. **Enable Developer Options** on your Android phone
2. **Enable USB Debugging**
3. Connect phone via USB
4. Trust computer when prompted
5. Run: `adb devices` to verify connection
6. Run: `npx react-native run-android`

---

## ✅ **Verify Build Success**

After build completes, you should see:
- App installs on device
- App launches automatically
- Login screen appears
- No crashes on launch

---

## 🎯 **Post-Build Checklist**

Test these features:
- [ ] Sign up new account
- [ ] Sign in
- [ ] View dashboard
- [ ] Create project
- [ ] Create prompt
- [ ] Edit prompt
- [ ] Preview markdown
- [ ] Share prompt
- [ ] Delete prompt
- [ ] Sign out

---

## 📊 **Build Variants**

### **Debug Build** (Development)
```powershell
npx react-native run-android --variant=debug
```
- Faster build
- Includes debugging tools
- Larger APK size

### **Release Build** (Production)
```powershell
cd android
./gradlew assembleRelease
```
- Optimized
- Minified code
- Smaller APK size
- No debugging

---

## 🔑 **Signing APK (For Google Play)**

To publish to Google Play Store, you need to sign the APK:

1. **Generate keystore:**
```powershell
keytool -genkeypair -v -storetype PKCS12 -keystore promptzy-release.keystore -alias promptzy -keyalg RSA -keysize 2048 -validity 10000
```

2. **Update `android/gradle.properties`:**
```properties
PROMPTZY_RELEASE_STORE_FILE=promptzy-release.keystore
PROMPTZY_RELEASE_KEY_ALIAS=promptzy
PROMPTZY_RELEASE_STORE_PASSWORD=your_password
PROMPTZY_RELEASE_KEY_PASSWORD=your_password
```

3. **Build signed APK:**
```powershell
cd android
./gradlew assembleRelease
```

---

## 📦 **APK Sizes**

- **Debug APK:** ~50-80 MB
- **Release APK:** ~30-40 MB
- **Split APKs:** ~15-20 MB per architecture

---

## 🚀 **Next Steps After Build**

1. Test all features thoroughly
2. Fix any runtime issues
3. Optimize performance
4. Add app icon and splash screen
5. Prepare for Play Store submission

---

## 💡 **Tips**

- Keep Metro bundler running while developing
- Use `r` in Metro terminal to reload app
- Use `d` to open Dev Menu on device
- Shake device to open Dev Menu
- Use React DevTools for debugging

---

**Happy Building! 🎉**