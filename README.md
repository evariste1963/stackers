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
