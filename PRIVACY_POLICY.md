# Privacy Policy

**Last updated:** June 2026

## Overview

Stackers is a precious metals portfolio tracker. This privacy policy explains how your data is handled when you use the app.

## Data Storage

**All data is stored locally on your device.** Stackers does not transmit, collect, or store any personal information on external servers. Your portfolio data, settings, and preferences remain entirely on your device.

### What data is stored locally

- **Portfolio items**: Records of your precious metals holdings (weight, purchase price, premium, photos)
- **Gold/silver price data**: Historical and current price information fetched from third-party APIs
- **App settings**: Your preferred currency, unit, and display preferences
- **API key**: If you choose to enter a metals.dev API key for live prices, it is stored in encrypted device storage (expo-secure-store)

## Camera Access

Stackers may request access to your device's camera to allow you to take photos of your precious metals items. Photos are stored locally on your device and are never uploaded or shared. You can use the app without granting camera access by simply not adding photos to items.

## Third-Party Services

Stackers can optionally fetch live precious metals prices from **metals.dev** if you provide an API key. When enabled:

- A network request is made to metals.dev with your API key to fetch current prices
- No personal information or portfolio data is sent with these requests
- No data is shared with any other third parties

Without an API key, the app operates fully offline and makes no network requests.

## Data Security

- API keys are stored in encrypted device storage (expo-secure-store)
- PIN codes (if enabled) are hashed with SHA-256 and a unique cryptographic salt
- No data is transmitted over the network except optional API price requests

## Children's Privacy

Stackers is not intended for children under 13. We do not knowingly collect any data from children.

## Changes to This Policy

Updates will be reflected on this page. Continued use of the app after changes constitutes acceptance.

## Contact

For questions, open an issue at the project's GitHub repository.

---

**App**: Stackers
**Developer**: thisme
