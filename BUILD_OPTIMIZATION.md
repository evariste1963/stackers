# Build Optimization Plan

## Objective
Reduce release APK size from 100MB to target ~30-40MB.

## Completed Optimizations

### 1. ABI Splits ✅
**File:** `android/app/build.gradle`

Added splits configuration to generate architecture-specific APKs instead of bundling all 4 ABIs:

```gradle
splits {
    abi {
        enable true
        reset()
        include "arm64-v8a"
        universalApk false
    }
}
```

**Result:** 100MB → 41MB (~59% reduction)
- Single APK: `app-arm64-v8a-release.apk` (41MB)
- Future: Can enable `armeabi-v7a` for older 32-bit devices if needed

**Install command:**
```bash
adb install -r android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

### 2. R8 Minification + Resource Shrinking ✅
**Files:** `android/gradle.properties`, `android/app/proguard-rules.pro`

Enabled in `gradle.properties`:
```
android.enableMinifyInReleaseBuilds=true
android.enableShrinkResourcesInReleaseBuilds=true
```

Added comprehensive ProGuard rules for:
- React Native & Hermes
- react-native-reanimated
- react-native-gesture-handler
- react-native-screens
- react-native-svg
- All Expo modules (reflection-heavy)
- Kotlin metadata
- Enum classes

**Result:** 41MB → 37MB (~10% reduction from minification)

## Remaining Optimizations

### 3. Optimize Splash Screens
- Convert PNG splash images to WebP (smaller file size)
- Use single density or vector-based splash
- Current: 5 density variants totaling ~300KB

### 4. Audit Unused Dependencies
Review `package.json` for unused packages:
- `expo-glass-effect` — verify usage
- `expo-linear-gradient` — verify usage
- `expo-symbols` — verify usage
- `expo-image-manipulator` — listed as extraneous

### 5. App Bundle for Play Store
Consider Android App Bundle (AAB) format:
- Upload single AAB (~100MB)
- Play Store delivers architecture-specific APKs (~40-50MB) to users
- Automatic optimization without manual ABI splits

## Build Commands

**Release build (with optimizations):**
```bash
cd android
./gradlew assembleRelease
```

**Install on device:**
```bash
adb install -r android/app/build/outputs/apk/release/app-arm64-v8a-release.apk
```

**Development build (faster, with hot reload):**
```bash
./gradlew assembleDebug
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

## Build Time Notes

- **Clean build:** 10-20 minutes (native recompilation)
- **Incremental build:** 2-3 minutes (cached)
- Avoid `./gradlew clean` unless necessary
- Use debug builds for development

## Size Summary

| Optimization | Before | After |
|--------------|--------|-------|
| Baseline APK | 100MB | 100MB |
| ABI Splits | 100MB | 41MB |
| + Minification/Shrink | 41MB | 37MB |

**Total reduction: 100MB → 37MB (63% smaller)**