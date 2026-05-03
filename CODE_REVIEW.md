# Code Review: Stackers Project

## Project Overview

This is an **Expo/React Native** mobile app called "Stackers" - a gold stack tracking application that lets users track precious metal holdings and monitor live gold prices via the metals.dev API.

### Total Lines of Code
~2,550 lines of TypeScript/TSX source code across 22 files (excluding node_modules, build artifacts).

---

## Security Fixes (Completed)

### 1. Secure PIN Hashing - DONE

**File**: `src/services/authService.ts`

**Issue**: Weak PIN hashing using simple integer hash with collisions
- No salt - vulnerable to pre-computed rainbow table attacks
- Integer overflow caused hash collisions

**Fix**: SHA-256 hashing with unique salt per user
- Uses `expo-crypto` for secure hashing
- Generates unique salt stored alongside PIN hash
- Each PIN verification uses stored salt in hash computation

```typescript
// Before (INSECURE)
function simpleHash(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;  // Integer overflow
  }
  return PIN_HASH_PREFIX + Math.abs(hash).toString(16);
}

// After (SECURE)
async function hashPin(pin: string, salt: string): Promise<string> {
  const normalized = pin + salt;
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    normalized,
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  return digest;
}
```

---

## Refactoring Completed

### 2. Remove Duplicate Hook - DONE

**Removed**: `src/hooks/useGoldPrice.ts`

The `useGoldPrice` hook was a duplicate of `PriceContext` - both provided identical functionality. Removed to eliminate confusion.

### 3. Fix useEffect Dependencies (Stale Closure Bug) - DONE

**File**: `src/contexts/PriceContext.tsx`

**Issue**: useCallback functions in dependency array caused unnecessary re-renders and potential stale closures.

**Fix**: 
- Consolidated all initialization into single useEffect
- Used `useRef` to access current settings without closure issues
- Proper cleanup with `mounted` flag

### 4. Single Shared SQLite Module - DONE

**Created**: `src/services/db.ts`

Before: Each service initialized its own database connection

```typescript
// Before: 4 separate initializations
// stackStorage.ts - getDb()
// priceService.ts - initPriceTables()
// historyService.ts - initHistoryTables()  
// settingsService.ts - initSettingsTables()
```

After: Single shared module

```typescript
// After: One shared module
// src/services/db.ts - getDb() + initAllTables()

// All services now import from db.ts
import { getDb } from './db';
```

Benefits:
- Single database connection
- All tables initialized at app startup
- Type-safe queries across all services

### 5. Type-Safe SQL Queries - DONE

All service files updated with proper TypeScript generics:

```typescript
// Before (unsafe)
const rows = await database.getAllAsync('SELECT * FROM stack_items') as any[];

// After (type-safe)
interface StackItemRow {
  id: number;
  code: string;
  weight: string;
  // ...
}
const rows = await database.getAllAsync<StackItemRow>('SELECT * FROM stack_items');
```

### 6. React Error Boundary - DONE

**Created**: `src/components/ErrorBoundary.tsx`

Added error boundary in `_layout.tsx` to catch UI crashes and prevent white screens.

---

## Previously Fixed Items

| Issue | Locations |
|-------|-----------|
| `getUnitAbbrev()` function | ~~StackItemCard.tsx:15, yourStack.tsx:17, add2stack.tsx:26~~ - **FIXED** |
| Currency symbol logic (`£$€`) | ~~StackValueBlock.tsx:14, StackItemCard.tsx:50, GoldPriceBanner.tsx:17~~ - **FIXED** |
| Date formatting helpers | ~~Multiple components~~ - **FIXED** |

### Split goldPriceStorage.ts (506 lines) - DONE

Split into multiple services:
- `src/services/priceService.ts` - Price fetching and caching (GoldPriceData)
- `src/services/settingsService.ts` - User preferences (UserSettings)
- `src/services/historyService.ts` - Historical price data (HistoryEntry)

### Extract duplicate currency formatting - DONE

Created `src/utils/formatters.ts`:
- `getUnitAbbrev()`
- `getCurrencySymbol()`
- `formatDate()`

### Add state management - DONE

Created `src/contexts/StackContext.tsx`:
- Provides global stack items state
- Both index and yourStack now use `useStack()` hook
- Eliminates duplicate `getAllItems()` calls

---

## Code Quality Notes

### Good
- Clean separation between services (storage vs API)
- Proper TypeScript typing throughout
- Good use of SQLite with proper initialization patterns
- Separated config constants
- Error boundaries for crash recovery
- Secure PIN storage with salt

### Needs Attention
- Large components (add2stack.tsx at 366 lines) could be split - Low priority, works fine as-is
- Some inline styles are verbose - Low priority, minimal issue
- ChartArea has multiple useEffect hooks (could be memoized) - Low priority

---

## Summary - All Fixes Completed

1. ✅ Secure PIN hashing with SHA-256 + salt
2. ✅ Remove duplicate `useGoldPrice` hook
3. ✅ Fix useEffect dependencies (stale closure bug)
4. ✅ Single shared SQLite database module
5. ✅ Type-safe SQL queries
6. ✅ React error boundary
7. ✅ Split `goldPriceStorage.ts` into service files
8. ✅ Extracted utility functions to `src/utils/formatters.ts`
9. ✅ State management with StackContext