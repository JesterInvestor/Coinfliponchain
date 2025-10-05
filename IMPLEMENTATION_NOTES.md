# Implementation Notes: useReadContract Hook Integration

## Summary

Successfully integrated the `useReadContract` hook from `thirdweb/react` into the project as requested in the problem statement.

## Changes Made

### 1. Updated `hooks/useCoinFlip.ts`

**Added Import:**
```typescript
import { useActiveAccount, useReadContract } from "thirdweb/react";
```

**Added useReadContract Hook:**
```typescript
const { data: balanceData, isPending: isBalancePending } = useReadContract(
  account
    ? {
        contract: tokenContract,
        method: "function balanceOf(address owner) view returns (uint256 result)",
        params: [account.address],
      }
    : {
        contract: tokenContract,
        method: "function balanceOf(address owner) view returns (uint256 result)",
        params: ["0x0000000000000000000000000000000000000000"],
        queryOptions: { enabled: false },
      }
);
```

**Added Auto-Update Effect:**
```typescript
useEffect(() => {
  if (balanceData && account) {
    const balanceInTokens = Number(balanceData) / 10**18;
    setFlipBalance(balanceInTokens);
  }
}, [balanceData, account]);
```

**Exported New Values:**
- `balanceData`: Raw balance data (in wei) from the contract
- `isBalancePending`: Loading state for the balance query

### 2. Updated `QUICK_REFERENCE.md`

Added documentation for the new functionality:
- Updated hook usage section to include new exports
- Added "Using useReadContract Hook" section with examples
- Documented the automatic update behavior

### 3. Created `examples/` Directory

**Created `examples/useReadContractExample.tsx`:**
- Standalone component demonstrating exact pattern from problem statement
- Shows proper usage of useReadContract hook
- Includes loading state handling
- Demonstrates wei to token conversion

**Created `examples/README.md`:**
- Documentation for the example
- Explains key features and usage
- Links back to main hook implementation

## Key Features

1. **Automatic Updates**: The `useReadContract` hook automatically re-fetches balance when the contract state changes
2. **React Query Integration**: Built on top of React Query for efficient data fetching and caching
3. **Loading States**: Provides `isPending` state for better UX
4. **Conditional Execution**: Query is disabled when no account is connected (using `enabled: false`)
5. **Type Safety**: Full TypeScript support with proper types from thirdweb

## Benefits

- **Real-time Updates**: Balance automatically updates without manual refresh
- **Better Performance**: React Query handles caching and request deduplication
- **Improved UX**: Loading states allow for better user feedback
- **Maintainability**: Declarative approach is easier to understand and maintain
- **Standards Compliance**: Follows the exact pattern shown in the problem statement

## Testing

- ✅ Build passes successfully
- ✅ TypeScript compilation succeeds
- ✅ No breaking changes to existing functionality
- ✅ Hook maintains backward compatibility (existing `getFlipBalance()` still works)

## Usage Example

```typescript
import { useCoinFlip } from "@/hooks/useCoinFlip";

function MyComponent() {
  const { 
    flipBalance,        // Auto-updated balance in tokens
    balanceData,        // Raw balance in wei
    isBalancePending    // Loading state
  } = useCoinFlip();

  if (isBalancePending) {
    return <div>Loading balance...</div>;
  }

  return <div>Balance: {flipBalance.toFixed(2)} FLIP</div>;
}
```

## Implementation Notes

- The hook uses a conditional approach to handle cases when no account is connected
- When disconnected, the query is disabled using `queryOptions: { enabled: false }`
- The balance state is automatically synced via useEffect
- Both the new hook-based approach and the existing async function approach coexist for flexibility
