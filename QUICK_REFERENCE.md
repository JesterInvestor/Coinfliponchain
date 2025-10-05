# Quick Reference Guide

## Smart Contract Addresses

After deployment, update these in your `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...        # CoinFlipBetting contract
NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=0x...      # FlipToken (ERC20) contract
```

## Key Contract Functions

### FlipToken (ERC20)

```solidity
// Read functions
balanceOf(address account) → uint256
totalSupply() → uint256
allowance(address owner, address spender) → uint256

// Write functions
approve(address spender, uint256 amount) → bool
transfer(address to, uint256 amount) → bool
mintTo(address to, uint256 amount)  // Admin only
```

### CoinFlipBetting

```solidity
// Place a bet
placeBet(uint256 amount, bool choice) → uint256 betId
// amount: in wei (1 FLIP = 10^18 wei)
// choice: true = heads, false = tails

// Get player stats
getPlayerStats(address player) → (wins, losses, total, wagered, won, activeBets)

// Get platform fee
getPlatformFeeInfo() → (recipient, bps)
// bps: basis points (100 = 1%)

// Admin functions (owner only)
setPlatformFeeInfo(address recipient, uint256 bps)
updateTreasury(address newTreasury)
updateMinBetAmount(uint256 newAmount)
emergencyWithdraw(uint256 amount)
```

## Frontend Integration

### Using the Hook

```typescript
import { useCoinFlip } from "@/hooks/useCoinFlip";

const {
  placeBet,           // Place a bet
  getFlipBalance,     // Get user's FLIP balance
  flipBalance,        // Current balance (auto-updated)
  isFlipping,         // Loading state
  error,              // Error message if any
  isConnected,        // Wallet connection status
  account,            // User's account
  approveTokens,      // Approve token spending
} = useCoinFlip();
```

### Placing a Bet

```typescript
// 1. Check balance
if (flipBalance < betAmount) {
  console.log("Insufficient balance");
  return;
}

// 2. Approve tokens (first time only)
await approveTokens(betAmount);

// 3. Place bet
const choice = selectedSide === "heads"; // true or false
const result = await placeBet(betAmount, choice);

// 4. Wait for confirmation
if (result) {
  console.log("Bet placed!", result.transactionHash);
  await getFlipBalance(); // Refresh balance
}
```

## Token Amounts

Always use proper decimal conversion:

```typescript
// Convert FLIP to wei
const flipAmount = 1000; // 1000 FLIP
const weiAmount = BigInt(flipAmount * 10**18);

// Convert wei to FLIP
const wei = 1000000000000000000000n; // 1000 FLIP in wei
const flip = Number(wei) / 10**18;
```

## Platform Fee Calculation

```typescript
// Get fee info
const { bps } = await getPlatformFeeInfo();

// Calculate fee
const platformFeePercentage = bps / 10000; // 100 bps = 0.01 (1%)
const feeAmount = betAmount * platformFeePercentage;

// Winner payout
const winnerPayout = (betAmount * 2) - feeAmount;

// Treasury amount (if loser)
const treasuryAmount = betAmount - feeAmount;
```

## Event Listening

### Using Thirdweb SDK

```typescript
import { getContractEvents } from "thirdweb";

// Listen for bet placed events
const events = await getContractEvents({
  contract,
  eventName: "BetPlaced",
});

// Listen for bet resolved events
const resolvedEvents = await getContractEvents({
  contract,
  eventName: "BetResolved",
});
```

## Common Errors and Solutions

### "Insufficient balance"
- User doesn't have enough FLIP tokens
- Solution: Direct user to buy FLIP tokens

### "Transfer failed"
- Token approval not granted or expired
- Solution: Call `approveTokens()` again

### "Bet amount too low"
- Bet is below minimum (default 1000 FLIP)
- Solution: Increase bet amount or update `minBetAmount` (owner only)

### "Transaction failed"
- Insufficient gas
- Contract balance too low for payout
- Network congestion
- Solution: Check gas prices, verify contract balance

## Testing Checklist

- [ ] FlipToken deployed and verified
- [ ] CoinFlipBetting deployed and verified
- [ ] Initial FLIP tokens minted
- [ ] Contract funded with FLIP for payouts
- [ ] Environment variables set correctly
- [ ] Wallet connects successfully
- [ ] Balance displays correctly
- [ ] Token approval works
- [ ] Bet placement succeeds
- [ ] Winner receives correct payout
- [ ] Loser's bet goes to treasury
- [ ] Platform fees collected correctly
- [ ] Stats update properly

## Environment Variables

```bash
# Required
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=xxx
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=0x...

# Optional (with defaults)
# None currently
```

## Network Information

### Base Mainnet
- Chain ID: 8453
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

### Base Sepolia (Testnet)
- Chain ID: 84532
- RPC: https://sepolia.base.org
- Explorer: https://sepolia.basescan.org
- Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

## Admin Dashboard Access

For contract owners:

1. Go to [Thirdweb Dashboard](https://thirdweb.com/dashboard)
2. Navigate to your deployed contracts
3. Use the dashboard to:
   - View contract state
   - Execute admin functions
   - Monitor events
   - Manage permissions

## Monitoring Commands

### Check Contract Balance

```typescript
const balance = await readContract({
  contract: tokenContract,
  method: "balanceOf",
  params: [contractAddress],
});
console.log("Contract balance:", Number(balance) / 10**18, "FLIP");
```

### Check Platform Fees Collected

```typescript
const { recipient } = await getPlatformFeeInfo();
const feeBalance = await readContract({
  contract: tokenContract,
  method: "balanceOf",
  params: [recipient],
});
console.log("Fees collected:", Number(feeBalance) / 10**18, "FLIP");
```

### Check Treasury Balance

```typescript
const treasuryAddress = await readContract({
  contract,
  method: "treasury",
  params: [],
});
const treasuryBalance = await readContract({
  contract: tokenContract,
  method: "balanceOf",
  params: [treasuryAddress],
});
console.log("Treasury balance:", Number(treasuryBalance) / 10**18, "FLIP");
```

## Support & Resources

- [Thirdweb Docs](https://portal.thirdweb.com/)
- [Base Network Docs](https://docs.base.org/)
- [Solidity Docs](https://docs.soliditylang.org/)
- [Next.js Docs](https://nextjs.org/docs)

## Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy contracts
npx thirdweb deploy

# Lint code
npm run lint  # if configured
```

## File Structure

```
contracts/
  ├── CoinFlipBetting.sol    # Main betting contract
  ├── FlipToken.sol          # ERC20 token
  └── CoinFlip.sol           # Legacy contract

hooks/
  └── useCoinFlip.ts         # Contract interaction hook

components/
  ├── CoinFlipOnChain.tsx    # Main game UI
  └── WalletConnect.tsx      # Wallet connection

docs/
  ├── DEPLOYMENT_GUIDE.md    # Deployment steps
  ├── ARCHITECTURE.md        # Technical architecture
  └── QUICK_REFERENCE.md     # This file
```

## Version Info

- Next.js: 15.5.4
- React: 19.1.0
- Thirdweb SDK: 5.108.8
- Solidity: ^0.8.0
