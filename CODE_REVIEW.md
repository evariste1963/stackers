# Code Review: Stackers Project

## Project Overview

This is an **Expo/React Native** mobile app called "Stackers" - a gold stack tracking application that lets users track precious metal holdings and monitor live gold prices via the metals.dev API.

### Total Lines of Code
~2,550 lines of TypeScript/TSX source code across 22 files (excluding node_modules, build artifacts).

---

## Redundant / Duplicate Code

| Issue | Locations |
|-------|-----------|
| `getUnitAbbrev()` function | ~~StackItemCard.tsx:15, yourStack.tsx:17, add2stack.tsx:26~~ - **FIXED** |
| Currency symbol logic (`£$€`) | ~~StackValueBlock.tsx:14, StackItemCard.tsx:50, GoldPriceBanner.tsx:17~~ - **FIXED** |
| Date formatting helpers | ~~Multiple components~~ - **FIXED** |

---

## Refactoring Opportunities

### 1. ~~Split goldPriceStorage.ts (506 lines)~~ - DONE

Split into multiple services:
- `src/services/priceService.ts` - Price fetching and caching (GoldPriceData)
- `src/services/settingsService.ts` - User preferences (UserSettings)
- `src/services/historyService.ts` - Historical price data (HistoryEntry)
- `src/services/index.ts` - Re-exports for backwards compatibility

### 2. ~~Extract duplicate currency formatting~~ - DONE

Created `src/utils/formatters.ts`:
- `getUnitAbbrev()`
- `getCurrencySymbol()`
- `formatDate()`

### 3. ~~Remove unused components~~ - DONE

- `HomeHeader.tsx` - **Removed** (empty component)
- `settings.tsx` - **Removed** earlier (no actual settings UI)
- `account.tsx` - **Fixed** (Log Out now works with PIN authentication)

### 4. ~~Add state management~~ - DONE

Created `src/contexts/StackContext.tsx`:
- Provides global stack items state
- Both index and yourStack now use `useStack()` hook
- Eliminates duplicate `getAllItems()` calls

Added `StackProvider` in `_layout.tsx` alongside `AuthProvider`.

### 5. ~~Clean up unused imports~~ - RESOLVED

- `add2stack.tsx:7` - **Actually used** for saving images to document directory

### 6. ~~Simplify UI components~~ - NOT AN ISSUE

- StackGrid + GoldPriceBanner display **different data** - no overlap:
  - **GoldPriceBanner**: Main price, change, change %, date, refresh button
  - **StackGrid**: Ask, Bid, High, Low (trading spread details)
  - Both are useful for different purposes - keep both

---

## Code Quality Notes

### Good
- Clean separation between services (storage vs API)
- Proper TypeScript typing throughout
- Good use of SQLite with proper initialization patterns
- Separated config constants

### Needs Attention
- Large components (add2stack.tsx at 366 lines) could be split
- Some inline styles are verbose (could use StyleSheet constants consistently)
- Error handling present but could be more robust

---

## Summary

The codebase is functional and well-organized. Refactoring completed:

1. ✅ Split `goldPriceStorage.ts` into 3 service files (price, history, settings)
2. ✅ Extracted duplicate utility functions to `src/utils/formatters.ts`
3. Consider a state management solution to reduce repetitive data fetching