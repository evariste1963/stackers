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

## Database

This project uses SQLite via `expo-sqlite` (kv-store). Data persists locally on the device.

### DB File Location (Emulator)

- **Path**: `files/SQLite/ExpoSQLiteStorage`
- **App package**: `com.thisme.stackers`

### Pull DB from Emulator

The app's private DB is not directly accessible. Use `run-as` + base64 encoding to copy it out:

```bash
adb shell "run-as com.thisme.stackers base64 files/SQLite/ExpoSQLiteStorage" | base64 -d > ~/Downloads/stackers.db
```

> **Note**: The app must be installed on a debuggable emulator/device. Run `npx expo run:android` (not Expo Go) to ensure debuggable build.

To verify:
```bash
sqlite3 ~/Downloads/stackers.db ".tables"
# Output: storage
```

### Open in DBeaver

1. **Database** → **New Database Connection** → select **SQLite**
2. Set **Database file** to: `~/Downloads/stackers.db`
3. Finish

**Viewing JSON values**: DBeaver shows each key as one row. The `value` column contains a JSON string. To view full content:

1. Run a query in the **SQL Editor** (Ctrl+Enter):
   ```sql
   SELECT key, value FROM storage;
   ```
2. Click on a **cell** in the `value` column
3. DBeaver opens a **cell editor** — click the **Text** tab or look for an expand button to see the full JSON

> **DBeaver shows "4 entries"**: DBeaver's table view may truncate JSON arrays. The actual data is complete — open the cell editor to see full content.

### Storage Schema

The DB uses a simple key-value store:

| Table | Columns |
|-------|---------|
| `storage` | `key TEXT PRIMARY KEY`, `value TEXT` |

**Keys stored:**
- `gold_price_history` — JSON array of `{date, price}` objects (chart data)
- `gold_price_latest` — JSON object with current price data
- `user_settings` — JSON object with user preferences

### Query Examples

**List all keys:**
```sql
SELECT key, length(value) as len FROM storage;
```

**Get gold price history (chart data):**
```sql
SELECT value FROM storage WHERE key = 'gold_price_history';
```

**Get latest price:**
```sql
SELECT value FROM storage WHERE key = 'gold_price_latest';
```

**Get user settings:**
```sql
SELECT value FROM storage WHERE key = 'user_settings';
```

### CLI Access (No DBeaver)

```bash
# List all keys
sqlite3 ~/Downloads/stackers.db "SELECT key FROM storage;"

# View gold price history as formatted JSON
sqlite3 ~/Downloads/stackers.db "SELECT value FROM storage WHERE key = 'gold_price_history';" | python3 -m json.tool

# View latest price
sqlite3 ~/Downloads/stackers.db "SELECT value FROM storage WHERE key = 'gold_price_latest';" | python3 -m json.tool

# Interactive mode
sqlite3 ~/Downloads/stackers.db
```

### Reset / Repopulate DB

The DB auto-migrates from `assets/priceData.js` on first launch. To manually reset:

```bash
npm run reset-project
```

This runs `scripts/reset-project.js` which clears and repopulates `gold_price_history` from the static data file.

---

## Common Issues

**"JAVA_HOME not found"** - Ensure JAVA_HOME is set correctly (see above)

**"SDK not found"** - Open Android Studio and verify SDK is installed in SDK Manager

**"Gradle build failed"** - Try cleaning and rebuilding:
```bash
cd android && ./gradlew clean
cd android && ./gradlew assembleRelease
```
