# Code Review: Stackers Project

## Project Overview

This is an **Expo/React Native** mobile app called "Stackers" - a gold stack tracking application that lets users track precious metal holdings and monitor live gold prices via the metals.dev API.

### Total Lines of Code
~2,550 lines of TypeScript/TSX source code across 22 files (excluding node_modules, build artifacts).

---

## Redundant / Duplicate Code

| Issue | Locations |
|-------|-----------|
| `getUnitAbbrev()` function | StackItemCard.tsx:15, yourStack.tsx:17, add2stack.tsx:26 |
| Currency symbol logic (`£$€`) | StackValueBlock.tsx:14, StackItemCard.tsx:50, GoldPriceBanner.tsx:17 |
| Date formatting helpers | Multiple components |

---

## Refactoring Opportunities

### 1. Split goldPriceStorage.ts (506 lines)

This file handles: DB init, price CRUD, history, settings, API key, migration. **Split into multiple services**:
- `priceService.ts` - Price fetching and caching
- `settingsService.ts` - User preferences
- `historyService.ts` - Historical price data

### 2. Extract duplicate currency formatting

Create a shared utility:
```typescript
// src/utils/formatCurrency.ts
export const getCurrencySymbol = (code: string) =>
  code === 'GBP' ? '£' : code === 'USD' ? '$' : '€';
```

### 3. Remove unused components

- `HomeHeader.tsx` - Empty component (only renders empty View)
- `settings.tsx` - Only has a header, no actual settings UI (incomplete?)
- `account.tsx` - Log Out button is non-functional

### 4. Add state management

Each screen fetches data independently via `useFocusEffect`. Consider React Context or a global store (Zustand/Redux) to avoid repetition.

### 5. Clean up unused imports

- `add2stack.tsx:7` - `File`, `Directory`, `Paths` imported but not used

### 6. Simplify UI components

- StackGrid + GoldPriceBanner both display ask/bid/high/low - possible UI overlap

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

The codebase is functional and reasonably organized, but has clear refactoring opportunities. The main priorities would be:

1. Split `goldPriceStorage.ts` into smaller services
2. Extract duplicate utility functions (currency, units)
3. Consider a state management solution to reduce repetitive data fetching