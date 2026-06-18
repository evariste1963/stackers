# Stackers — Google Play Store Launch Plan

**Status**: 🟡 In progress

---

## Phase 1: Account & Prerequisites

- [x] Create Google Play Developer account at https://play.google.com/console
  - Personal account, $25 one-time fee
- [x] Complete account verification (phone/ID, may take 48h)
- [x] Set up developer profile (name, email, website)
- [x] Accept Developer Distribution Agreement
- [x] Create app "Stackers" in Play Console (package: `com.thisme.stackers`)

> **⚠️ Critical**: Your personal account was created in 2026 → must complete **closed testing** with **≥12 opted-in testers for 14 consecutive days** before production is unlocked. See Phase 4b.

---

## Phase 2: Code & Config Prep

### 2.1 Signing

- [x] Generate production keystore (`android/app/stackers-release.keystore`)
  - Password: `stackers123` — **change this** before production build
- [x] Change keystore password from dev default (`stackers123`) to strong password
- [x] Backup keystore file + password to password manager
- [x] Add release signing config to `android/app/build.gradle` (uses env vars `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`; falls back to dev defaults)
- [x] Switch `signingConfig` from `debug` to `release` in release build type
- [ ] Decide: **Play App Signing** (recommended) or self-managed

### 2.2 Build Format

- [ ] Build AAB for Play Store: `cd android && ./gradlew bundleRelease`
- [ ] (Optional) Remove ABI splits from `build.gradle` — redundant when using AAB

### 2.3 Privacy Policy

- [x] Create privacy policy (`PRIVACY_POLICY.md` in project root)
  - Covers: local-only storage, camera access, API key storage, no third-party sharing
- [x] Host policy at publicly accessible URL:
  1. Push `PRIVACY_POLICY.md` to GitHub repo
  2. Set repo Settings → Pages → source to main branch via `gh`
  3. URL: `https://evariste1963.github.io/stackers/PRIVACY_POLICY`
- [x] Host privacy policy at public URL via GitHub Pages
- [ ] Add policy URL to Play Console store listing
- [x] Add link to privacy policy from within the app (Account screen)

### 2.4 Permissions

- [x] Review `AndroidManifest.xml` — requested: INTERNET, READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE, VIBRATE, SYSTEM_ALERT_WINDOW
- [x] Removed `RECORD_AUDIO` (app only takes photos, not video)
- [ ] Justify remaining permissions in Play Console
   - **INTERNET**: Required for goldapi.io API (live prices)
  - **READ/WRITE_EXTERNAL_STORAGE** (maxSdk=32): Needed by expo-image-picker for photo capture on older Android
  - **VIBRATE**: Default RN permission, harmless
  - **SYSTEM_ALERT_WINDOW**: Debug-only (not in release build)

### 2.5 Versioning

- [ ] Confirm `app.json` and `build.gradle` are in sync (v1.0.0 / versionCode 1)
- [ ] `eas.json` auto-increment is already enabled for production

### 2.6 Compliance

- [ ] No ads — nothing to configure
- [ ] No in-app purchases — nothing to configure
- [ ] Content rating: fill questionnaire (Finance → Everyone 10+ expected)
- [ ] Data Safety section: "No data collected" / all local
- [ ] Target SDK 35 already set (meets Play Store requirement)

---

## Phase 3: Store Listing Assets

- [x] **Screenshots** (2-8, 1080×1920 or 1080×2160 PNG/JPEG)
  - Home (price banner)
  - Portfolio
  - Your Stack
  - Add-2-Stack
  - Account / Settings
  - Price Charts
- [ ] **Feature graphic** (1024×500 PNG)
- [x] **Phone icon** — verified 1024×1024 (exceeds 512×512 requirement)
- [x] Write **short description** (≤80 chars):
  - "Track gold prices & manage your precious metals portfolio"
- [ ] Write **full description**:
  ```
  Stackers is a private, offline-first precious metals portfolio tracker.
  
  Track your gold and silver holdings with real-time price data (optional
  API key required). All data stays on your device — nothing is uploaded
  to the cloud.
  
  Features:
  • Live gold & silver prices in GBP, USD, EUR — updated from goldapi.io
  • Portfolio tracking with purchase details, weights, and premiums
  • Interactive price history charts
  • Off Grid mode — fully offline, no network requests
  • PIN lock with SHA-256 hashed passcode
  • Local storage — your data never leaves your device
  • Add photos to your stack items
  
  Whether you're stacking gold bars, silver coins, or both, Stackers helps
  you keep track of your growing stack — privately and securely.
  ```
- [ ] Set **category**: Finance
- [ ] Add **tags**: gold, silver, precious metals, portfolio, investing

---

## Phase 4a: Build & Internal Test

- [x] Production AAB build (`app-release.aab`, 53MB)
  ```bash
  cd android && ./gradlew bundleRelease
  ```
- [x] Upload AAB to Play Console **Internal testing** track
- [x] Add yourself as internal tester
- [x] Install on test device(s) and verify app works
- [ ] Fix any issues found in testing

---

## Phase 4b: Closed Testing (Required for Production — ⚠️ 14-day gate)

> **Why**: Personal accounts created after Nov 13, 2023 must run a closed test with ≥12 opted-in testers for 14 consecutive days before production is unlocked.

- [ ] Upload AAB to **Closed testing** track (same AAB from Phase 4a)
- [ ] Create tester list (Google Group with tester emails)
- [ ] Recruit **≥15 testers** (aim for 15-20 to buffer against dropouts)
- [ ] Share opt-in link with testers
- [ ] Confirm ≥12 testers have opted in and installed the app
- [ ] **Day 1-14**: Monitor opted-in count daily — a drop below 12 resets the clock
- [ ] Push at least 1 update during testing (shows engagement)
- [ ] Collect feedback from testers
- [ ] After 14 consecutive days at ≥12: fill **Production Access Questionnaire**
  - Describe testing process, bugs fixed, improvements made
- [ ] Wait for Google review (typically 1-7 days)
- [ ] **Production track unlocked** ✅

---

## Phase 5: Production Submission

- [ ] Create app in Play Console:
  - Name: "Stackers"
  - Language: English (US)
  - Type: App | Free
  - Category: Finance
- [ ] Fill store listing with all assets from Phase 3
- [ ] Complete Data Safety section
- [ ] Complete Content Rating questionnaire
- [ ] Set up Play App Signing with upload key
- [ ] Upload AAB to Production track
- [ ] Write release notes (first release)
- [ ] Submit for review
- [ ] Monitor Play Console for review outcome

---

## Phase 6: Post-Launch

- [ ] Monitor Android vitals (crashes, ANRs)
- [ ] Respond to user reviews
- [ ] Prepare v1.0.1 if bugs surface
  - Bump versionCode + versionName
  - Update release notes
  - Build + upload new AAB

---

## Costs

| Item | Cost |
|------|------|
| Google Play Developer account | **$25** (one-time) |
| Keystore generation | Free |
| Privacy policy hosting | Free |
| Expo EAS Build (free tier) | Free |
| **Total** | **$25** |

---

## Key Risks

- ⚠️ Keystore password `stackers123` is a dev default — **change it** before production build
- ⚠️ Privacy policy URL must be live before submission
- ⚠️ Account verification can take 48h — start early
- ⚠️ First app submission on new account may face extra scrutiny

---

## Timeline

```
Week 1: Account + keystore + privacy policy
Week 2: Assets + store listing text + build AAB
Week 3-4: Internal test → closed test recruitment
Week 5-6: 14-day closed testing period
Week 7: Production access application + review
Week 8: Production launch
```

> **Note**: The 14-day closed testing gate adds ~3-4 weeks to the original timeline.
