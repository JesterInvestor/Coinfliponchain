# Fix for Native Token Balance Display Issue

## Problem
The connected wallet's native token (ETH on Base network) balance was not displaying correctly in the ConnectButton component.

## Root Cause
The `ConnectButton` from thirdweb SDK was not explicitly configured with `detailsButton` and `detailsModal` props. While the default behavior should show the native token balance, explicitly configuring these props ensures proper initialization and display.

## Solution
Added explicit configuration for `detailsButton` and `detailsModal` in the `WalletConnect` component:

### Changes Made

#### 1. Added `detailsButton` Configuration
```tsx
detailsButton={{
  className: "!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-white !px-6 !py-3 !rounded-lg !font-semibold !text-base !shadow-lg hover:!bg-gray-50 dark:hover:!bg-gray-700 !transition-all !min-h-[56px]",
  // Not setting displayBalanceToken ensures native token (ETH) balance is shown
}}
```

The key aspect is that we **do NOT set** the `displayBalanceToken` property. According to thirdweb documentation:
- When `displayBalanceToken` is NOT set, the button shows the **native token** (ETH) balance
- When `displayBalanceToken` IS set to a mapping of chain IDs to token addresses, the button shows that specific token's balance

#### 2. Added `detailsModal` Configuration
```tsx
detailsModal={{
  // Configure the modal shown when connected wallet button is clicked
  // Displays wallet details, balance, and transaction options
}}
```

This ensures the modal is properly initialized to display wallet details.

## How It Works

1. **Native Token Display**: By default, when `displayBalanceToken` is not configured, the ConnectButton displays the native token balance for the connected chain (ETH on Base mainnet, or ETH on Base Sepolia testnet).

2. **Chain-Specific Balance**: The balance is automatically fetched for the chain specified in the `chain` prop of the ConnectButton, which is set to either `base` (mainnet) or `baseSepolia` (testnet) based on the `NEXT_PUBLIC_CHAIN_ID` environment variable.

3. **Automatic Updates**: The thirdweb ConnectButton automatically updates the displayed balance when:
   - The user switches their wallet to a different account
   - The balance changes (e.g., after a transaction)
   - The user switches to a different network

## Alternative: Showing a Custom Token Balance

If you wanted to show a custom ERC20 token balance (like $FLIP) instead of the native ETH balance, you would set the `displayBalanceToken` property:

```tsx
detailsButton={{
  displayBalanceToken: {
    // Show $FLIP token balance when connected to Base mainnet
    [base.id]: process.env.NEXT_PUBLIC_FLIP_TOKEN_ADDRESS,
    // Show $FLIP token balance when connected to Base Sepolia
    [baseSepolia.id]: process.env.NEXT_PUBLIC_FLIP_TOKEN_ADDRESS,
  }
}}
```

However, for this application, we want to show the **native ETH balance** so users can see they have enough gas for transactions, which is why we do NOT set this property.

## Testing

To verify the fix works correctly:

1. Build the application: `npm run build`
2. Run the application: `npm run dev`
3. Connect your wallet using the "Connect Wallet" button
4. After connection, you should see your wallet address and **ETH balance** displayed on the connected wallet button
5. Click the connected wallet button to open the details modal
6. In the modal, you should see your full wallet details including the native ETH balance

## References

- [Thirdweb ConnectButton Documentation](https://portal.thirdweb.com/references/typescript/v5/ConnectButton)
- [ConnectButtonProps Type Definition](https://portal.thirdweb.com/references/typescript/v5/ConnectButtonProps)
- [displayBalanceToken Documentation](https://portal.thirdweb.com/references/typescript/v5/ConnectButton_detailsButtonOptions#displaybalancetoken)
