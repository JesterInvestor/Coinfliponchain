# Examples

This directory contains example code demonstrating how to use various features of the Coin Flip On-Chain application.

## useReadContractExample.tsx

Demonstrates the use of the `useReadContract` hook from `thirdweb/react`. This hook automatically updates when the contract state changes, making it ideal for displaying real-time blockchain data.

### Key Features:

- Uses `useReadContract` hook for automatic state updates
- Reads ERC20 token balance from the contract
- Handles loading and data states properly
- Converts wei to human-readable token amounts

### Usage:

```tsx
import Component from "@/examples/useReadContractExample";

// In your component
<Component owner="0x1234567890abcdef1234567890abcdef12345678" />
```

### How it works:

1. The hook automatically queries the contract on mount
2. Returns `data` containing the balance in wei
3. Returns `isPending` to indicate loading state
4. Automatically re-fetches when the contract state changes

This pattern is also integrated into the main `useCoinFlip` hook in `/hooks/useCoinFlip.ts`, where it's used to automatically update the user's FLIP token balance.
