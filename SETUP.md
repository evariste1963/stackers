# Stackers - Setup & Build Guide

## Prerequisites

- **Node.js** (v20.x or v22.x LTS) - https://nodejs.org
- **Android Studio** (for Android emulator) - https://developer.android.com/studio
- **EAS CLI** - `npx eas-cli` (included in devDependencies)

## Development Setup

```bash
npm install
npx expo start
```

### Running on device/emulator for testing

| Platform | Command |
|----------|---------|
| Android emulator | `npx expo run:android` |
| iOS simulator (Mac) | `npx expo run:ios` |
| Physical device (Expo Go) | Scan QR from `npx expo start` |
| Web | `npx expo start --web` |

---

## ⚠️ CRITICAL: Build Procedures

**The upload keystore is managed by Expo EAS servers. Never use `./gradlew assembleRelease` for production builds — it will sign with the wrong key and be rejected by Play Store.** NO LONGER THE CASE - USE:

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

npx expo prebuild  ---> auto up-issues in the docs

./gradlew bundleRelease  and then upload the .aab file to the create new release page.

path: ~/Coding/stackers/android/app/build/outputs/bundle/release/app-release.aab

--------------  THIS WORKS!!! ----------------------------------------------

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
---

### 1. Building for Local Testing (Install Direct to Device)

For testing changes on your phone without publishing:

```bash
# Build debug APK via Expo
npx expo run:android

# Install via ADB (USB debugging required)
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

> **Note:** Debug builds skip JS minification, ProGuard/R8 stripping, and resource shrinking. Faster builds, larger APK, retains full error details.

Or scan QR code with Expo Go app for instant reload during development.

---

### 2. Building for Upload to Play Store

**Always use EAS Build.** This ensures the correct upload key (managed by Expo servers) signs your AAB.

```bash
# Build production AAB
npx eas build --platform android --profile production
```

This uploads to Expo cloud and returns a download URL for the signed `.aab`.

> **Note:** Production builds enable JS minification (Hermes), ProGuard/R8 Java code stripping, and resource shrinking. Smaller AAB, optimized for Play Store distribution.

#### Submit to Play Store

**Option A — Auto-submit (recommended):**
```bash
npx eas build --platform android --profile production --auto-submit
```

**Option B — Manual upload:**
1. Download the AAB from the URL `eas build` returns
2. Go to https://play.google.com/console
3. **Release → Production → Create new release**
4. Drag the AAB in
5. Fill release notes → Review → Start rollout

---

### Quick Reference

| Action | Command |
|--------|---------|
| Development build (debug) | `npx expo run:android` |
| Install debug build via ADB | `adb install -r android/app/build/outputs/apk/debug/app-debug.apk` |
| Production build for Play Store | `npx eas build --platform android --profile production` |
| Build + submit to Play Store | `npx eas build --platform android --profile production --auto-submit` |

---

## Database

SQLite via `expo-sqlite`. Data persists locally on device at `files/SQLite/stackers.db` (package `com.thisme.stackers`).

### Pull DB from Emulator

```bash
adb shell "run-as com.thisme.stackers cat files/SQLite/stackers.db" > ~/Downloads/stackers.db
```

### Open in DBeaver

Database → New Database Connection → SQLite → select `~/Downloads/stackers.db`

### Schema

#### stack_items
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `code` | TEXT | Item code |
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
| `manualPrice` | REAL | Manual gold price |
| `manualHighPrice` | REAL | Manual gold high |
| `manualLowPrice` | REAL | Manual gold low |
| `previousManualPrice` | REAL | Previous manual gold price |
| `manualSilverPrice` | REAL | Manual silver price |
| `manualSilverHighPrice` | REAL | Manual silver high |
| `manualSilverLowPrice` | REAL | Manual silver low |
| `previousManualSilverPrice` | REAL | Previous manual silver price |
| `manualGoldPremium` | REAL | Gold premium % |
| `manualSilverPremium` | REAL | Silver premium % |
| `defaultMetal` | TEXT | Default metal (gold/silver) |
| `createdAt` | TEXT | ISO timestamp |
| `updatedAt` | TEXT | ISO timestamp |

#### gold_price_latest / silver_price_latest
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

#### gold_price_history / silver_price_history
| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `date` | TEXT | Date (YYYY-MM-DD) |
| `price` | REAL | Price |
| `change` | REAL | Price change |
| `changePercent` | REAL | Change percentage |

### Query Examples

```bash
# List tables
sqlite3 ~/Downloads/stackers.db ".tables"

# Get latest gold price
sqlite3 ~/Downloads/stackers.db "SELECT * FROM gold_price_latest;"

# Recent history
sqlite3 ~/Downloads/stackers.db "SELECT * FROM gold_price_history ORDER BY date DESC LIMIT 10;"

# All stack items
sqlite3 ~/Downloads/stackers.db "SELECT * FROM stack_items ORDER BY createdAt DESC;"
```
