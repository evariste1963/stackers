# Stackers - Setup & Development Guide

This guide covers setup, development, and building instructions. For app usage info, see README.md.

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

## Building

### Android

```bash
npx expo run:android
```

### iOS (Mac only)

```bash
cd ios && pod install
npx expo run:ios
```

### Web

```bash
npx expo start --web
```

---

## Building APKs for Distribution

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

## Database

This project uses SQLite via `expo-sqlite`. Data persists locally on the device.

### Database File

- **Filename**: `stackers.db`
- **Location (Emulator)**: `files/SQLite/stackers.db` (requires `run-as`)
- **App package**: `com.thisme.stackers`

### Pull DB from Emulator

```bash
adb shell "run-as com.thisme.stackers cat files/SQLite/stackers.db" > ~/Downloads/stackers.db
```

Or for base64 encoding (safer for large files):
```bash
adb shell "run-as com.thisme.stackers base64 files/SQLite/stackers.db" | base64 -d > ~/Downloads/stackers.db
```

> **Note**: The app must be installed on a debuggable emulator/device. Run `npx expo run:android` (not Expo Go) to ensure debuggable build.

To verify:
```bash
sqlite3 ~/Downloads/stackers.db ".tables"
# Output: gold_price_history gold_price_latest stack_items user_settings
```

### Open in DBeaver

1. **Database** → **New Database Connection** → select **SQLite**
2. Set **Database file** to: `~/Downloads/stackers.db`
3. Finish

### Schema

#### stack_items
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `code` | TEXT | Item code (e.g., "1oz gold bar") |
| `weight` | TEXT | Weight as string |
| `purchasePrice` | TEXT | Purchase price as string |
| `premium` | TEXT | Premium as string |
| `imageUri` | TEXT | Image URI or null |
| `createdAt` | DATETIME | Creation timestamp |

#### user_settings
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (always 1) |
| `currency` | TEXT | Currency code (default: GBP) |
| `unit` | TEXT | Unit code (default: toz) |
| `hasApiKey` | INTEGER | 0 or 1 |
| `createdAt` | TEXT | ISO timestamp |
| `updatedAt` | TEXT | ISO timestamp |

#### gold_price_latest
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (always 1) |
| `price` | REAL | Current price |
| `ask` | REAL | Ask price |
| `bid` | REAL | Bid price |
| `high` | REAL | Daily high |
| `low` | REAL | Daily low |
| `change` | REAL | Price change |
| `changePercent` | REAL | Change percentage |
| `date` | TEXT | Date (YYYY-MM-DD) |
| `currency` | TEXT | Currency code |
| `unit` | TEXT | Unit code |
| `fetchedAt` | TEXT | ISO timestamp |

#### gold_price_history
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `date` | TEXT | Date (YYYY-MM-DD) |
| `price` | REAL | Price on that date |
| `change` | REAL | Price change |
| `changePercent` | REAL | Change percentage |

### Query Examples

**List all tables:**
```sql
.tables
```

**Get user settings:**
```sql
SELECT * FROM user_settings;
```

**Get latest gold price:**
```sql
SELECT * FROM gold_price_latest;
```

**Get gold price history (last 30 days):**
```sql
SELECT * FROM gold_price_history ORDER BY date DESC LIMIT 30;
```

**Get all stack items:**
```sql
SELECT * FROM stack_items ORDER BY createdAt DESC;
```

**Get gold prices in a date range:**
```sql
SELECT * FROM gold_price_history
WHERE date BETWEEN '2025-01-01' AND '2025-12-31'
ORDER BY date;
```

**Count records in each table:**
```sql
SELECT 'stack_items' as tbl, COUNT(*) as cnt FROM stack_items
UNION ALL
SELECT 'gold_price_history', COUNT(*) FROM gold_price_history
UNION ALL
SELECT 'gold_price_latest', COUNT(*) FROM gold_price_latest;
```

### CLI Access (No DBeaver)

```bash
# List all tables
sqlite3 ~/Downloads/stackers.db ".tables"

# View user settings
sqlite3 ~/Downloads/stackers.db "SELECT * FROM user_settings;"

# View latest gold price
sqlite3 ~/Downloads/stackers.db "SELECT * FROM gold_price_latest;"

# View gold price history (formatted)
sqlite3 ~/Downloads/stackers.db "SELECT * FROM gold_price_history ORDER BY date DESC LIMIT 10;"

# Interactive mode
sqlite3 ~/Downloads/stackers.db
```

### Reset / Repopulate DB

To clear and repopulate the database:

```bash
adb shell "run-as com.thisme.stackers rm files/stackers.db"
```

Then rebuild and run the app - it will recreate all tables with default data.

---

## Common Issues

**"JAVA_HOME not found"** - Ensure JAVA_HOME is set correctly (see above)

**"SDK not found"** - Open Android Studio and verify SDK is installed in SDK Manager

**"Gradle build failed"** - Try cleaning and rebuilding:
```bash
cd android && ./gradlew clean
cd android && ./gradlew assembleRelease
```

---

## Installing Directly on Physical Phone (ADB)

For direct installation via USB debugging, no file transfer needed.

### Prerequisites

1. Enable **Developer Options** on your phone:
   - Go to **Settings → About Phone**
   - Tap **Build Number** 7 times
   - Enter your PIN/pattern if prompted

2. Enable **USB Debugging**:
   - Go to **Settings → Developer Options**
   - Enable **USB Debugging**

3. Connect your phone via USB to your computer

### Install via ADB

```bash
# Build the APK first
cd android && ./gradlew assembleRelease

# Find the APK
cp android/app/build/outputs/apk/release/app-release.apk ../stackers-release.apk

# Install on connected phone
adb install -r stackers-release.apk
```

This installs the APK directly on your connected Android device.

### If USB Debugging is Already Enabled

```bash
# Check if phone is connected
adb devices

# Install ( -r flag replaces existing app)
adb install -r stackers-release.apk
```

---

## Custom App Icon (Launcher Icon)

The app uses your custom logo as the launcher icon. To update the icon:

### Icon Files Location

- **Source**: `assets/images/stackers-logo.png` (should be square, 1024x1024 recommended)
- **Generated to**: `android/app/src/main/res/mipmap-*/ic_launcher_foreground.webp`

### Regenerate Launcher Icons

```bash
# Update the source logo if needed
# Then regenerate the mipmap icons:

magick assets/images/stackers-logo.png -resize 48x48 \
  android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.webp

magick assets/images/stackers-logo.png -resize 72x72 \
  android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.webp

magick assets/images/stackers-logo.png -resize 96x96 \
  android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.webp

magick assets/images/stackers-logo.png -resize 144x144 \
  android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.webp

magick assets/images/stackers-logo.png -resize 192x192 \
  android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.webp

# Rebuild the APK
cd android && ./gradlew assembleRelease
```

### Using Expo's Asset Generator

```bash
npx expo generate:android-assets
```

This will regenerate all Android icons from your source logo.

---

## Publishing to Google Play Store

### Prerequisites

1. **Google Play Developer Account** - https://play.google.com/console ($25 one-time fee)
2. **Release APK or AAB** (Android App Bundle)

### Target SDK Requirement

As of August 2025, new apps must target **Android API 35** (Android 15). Ensure your `app.json` has:
```json
"android": {
  "targetSdkVersion": 35
}
```

### Step 1: Configure App in Play Console

1. Go to https://play.google.com/console
2. Create a new app (select "Android App")
3. Fill in:
   - App name: Stackers
   - Default language: English
   - App type: Apps
   - Category: Finance

### Step 2: Prepare Store Listing

You'll need:
- **Screenshots**: Take screenshots on a phone/emulator (1080x1920 recommended)
- **Feature graphic**: 1024x500
- **Phone icon**: 512x512
- **Privacy policy URL**: Required if app collects data
- **App description**: Describe the app's functionality

### Step 3: Create Release

1. In Play Console, go to **Release → Production**
2. Upload your AAB or APK:
   ```bash
   # Create Android App Bundle (recommended)
   cd android && ./gradlew assembleRelease
   # AAB location: android/app/build/outputs/apk/release/app-release.apk
   ```

3. Set release notes
4. Click **Review Release** → **Confirm Rollout**

### Using EAS Build (No Local Android Studio)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android (creates AAB)
eas build --platform android

# Follow prompts - download the AAB from the link provided
```

### App Signing

- **Play App Signing** (recommended): Google manages your signing key
- **Self-signed**: You provide your own keystore

For production, keep your keystore safe - you cannot update the app without the same key.

---

## Publishing to iOS App Store

### Prerequisites (Mac Required)

1. **Apple Developer Account** - https://developer.apple.com ($99/year)
2. **Xcode** - From Mac App Store
3. **CocoaPods** - `sudo gem install cocoapods`

### Step 1: Configure in Expo

Update `app.json` with iOS details:
```json
"ios": {
  "bundleIdentifier": "com.thisme.stackers",
  "buildNumber": "1",
  "supportsTablet": true
}
```

### Step 2: Generate Native iOS Project

```bash
npx expo prebuild --platform ios
```

This creates the `ios/` folder.

### Step 3: Configure Xcode

1. Open `ios/Stackers.xcworkspace` in Xcode
2. Select your team in **Signing & Capabilities**
3. Set the bundle identifier if different

### Step 4: Build for App Store

```bash
# Using xcodebuild
cd ios && xcodebuild -workspace Stackers.xcworkspace \
  -scheme Stackers \
  -configuration Release \
  -archive

# Or use EAS
eas build --platform ios
```

### Step 5: Upload via Transporter

1. Download Transporter from Mac App Store
2. Upload your `.ipa` file
3. Go to App Store Connect to manage the release

### Using EAS Submit (Easiest)

```bash
# Build and submit in one command
eas build --platform ios --auto-submit
```

You'll need to log in to your Apple Developer account during the process.

---

## Summary: Build Commands

| Action | Command |
|--------|---------|
| Dev server | `npx expo start` |
| Build Android Debug | `cd android && ./gradlew assembleDebug` |
| Build Android Release | `cd android && ./gradlew assembleRelease` |
| Install on phone (ADB) | `adb install -r stackers-release.apk` |
| Build iOS (Mac) | `cd ios && pod install && xcodebuild` |
| EAS Build (cloud) | `eas build --platform android` |