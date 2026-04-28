# Stackers - Gold Price Tracker

A React Native (Expo) app for tracking gold prices.

## Setup

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

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
