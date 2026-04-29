# Stackers - Gold Price Tracker

A React Native (Expo) app for tracking gold prices.

## Prerequisites

### Required on All Platforms

- **Node.js** (v20.x or v22.x LTS recommended) - https://nodejs.org

### For iOS Development (Mac only)

- **Xcode** - From Mac App Store (free)
- **CocoaPods** - Usually installed automatically via `pod install`

### For Android Development (Windows/Mac/Linux)

- **Android Studio** - https://developer.android.com/studio
- **Java JDK 17** - Usually included with Android Studio
- **Android SDK** - Install via Android Studio SDK Manager

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. For iOS only, install CocoaPods:

   ```bash
   cd ios && pod install && cd ..
   ```

3. Start the app

   ```bash
   npx expo start
   ```

### Running on Specific Platforms

- **Web**: `npx expo start --web`
- **iOS Simulator** (Mac): `npx expo run:ios`
- **Android Emulator**: `npx expo run:android`
- **Physical Device**: Use Expo Go app on your phone and scan QR code from `npx expo start`

## Chart Library

This project uses **Victory Native** (legacy version) for charting.

### Installation

```bash
npm install victory-native@legacy
```

Note: The project already has required dependencies:
- `react-native-svg`
- `react-native-reanimated`
- `react-native-gesture-handler`

### Removing Old Chart Library

If previously using react-native-gifted-charts:

```bash
npm uninstall react-native-gifted-charts
```

## Build

- Android: `npx expo run:android`
- iOS: `npx expo run:ios`
- Web: `npx expo start --web`

## Building & Distribution

### Prerequisites

Before building for Android, ensure you have:

1. **Node.js** (already installed for development)
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java JDK 17** - Usually included with Android Studio, or download from https://adoptium.net

#### Android Studio Setup

1. Open Android Studio after installation
2. Go to **More Actions → SDK Manager**
3. Under **SDK Platforms**, ensure these are checked:
   - Android SDK (latest version)
4. Under **SDK Tools**, ensure these are checked:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android Emulator

#### Set JAVA_HOME Environment Variable

**Windows:**
```cmd
setx JAVA_HOME "C:\Program Files\Android\Android Studio\jbr"
```

**Mac/Linux:**
Add to your `~/.bashrc` or `~/.zshrc`:
```bash
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr"
```

---

### Building an APK

The built APK includes the bundled JavaScript, so it works **without** needing a development server.

#### Step 1: Generate Android Project

```bash
npx expo prebuild --platform android
```

This creates the `android/` folder with native Android code.

#### Step 2: Build the Release APK

```bash
cd android && ./gradlew assembleRelease
```

#### Step 3: Locate the APK

Your APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

#### Step 4: Transfer to Phone

- Connect your phone via USB and copy the APK
- Or email/cloud transfer to your phone
- Or use a file sharing app (AirDroid, ShareMe, etc.)

#### Step 5: Install on Phone

1. Enable **Install from unknown sources** in your phone's Settings (under Security or Apps)
2. Open the APK file on your phone
3. Tap to install

---

### Debug APK (Alternative)

If you want a debug build with development tools:

```bash
cd android && ./gradlew assembleDebug
```

The debug APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

---

### EAS Build (No Local Setup Required)

If you don't want to install Android Studio, you can use Expo's cloud build service:

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Build:
   ```bash
   eas build --platform android
   ```

This will upload your project to Expo's servers and return a downloadable APK.

---

### Notes

- The release APK is optimized and smaller than debug
- Both APK types work without a development server
- The app's data is stored locally on the device (SQLite)
- Uninstalling the app will delete all stored data

---

## Common Issues

**"JAVA_HOME not found"** - Ensure JAVA_HOME is set correctly (see above)

**"SDK not found"** - Open Android Studio and verify SDK is installed in SDK Manager

**"Gradle build failed"** - Try cleaning and rebuilding:
```bash
cd android && ./gradlew clean
cd android && ./gradlew assembleRelease
```
