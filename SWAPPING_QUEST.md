# 🔄 Swapping Quest Feature

## Overview

The Swapping Quest is an interactive, gamified feature that guides users through the process of swapping $FLIP tokens on-chain. This quest system provides a structured learning experience while executing real blockchain transactions.

## Features

### 🎯 Quest System

The quest consists of 5 progressive steps:

1. **Connect Your Wallet** (🔗)
   - Connect your Web3 wallet to get started
   - Supports MetaMask, Coinbase Wallet, WalletConnect, and more

2. **Check $FLIP Balance** (💰)
   - Ensure you have at least 10,000 $FLIP tokens
   - Displays your current balance in real-time

3. **Perform First Swap** (🔄)
   - Swap 10,000 $FLIP to complete this quest step
   - Learn the basics of on-chain token swaps

4. **Complete Advanced Swap** (⚡)
   - Swap 100,000 $FLIP for advanced completion
   - Master larger transaction handling

5. **Quest Master** (👑)
   - Swap 1,000,000 $FLIP to become a Quest Master
   - Unlock the final achievement

### 🔐 On-Chain Execution

- All swaps are **real blockchain transactions**
- Transactions are **atomic and secure**
- Uses ERC20 token transfer standard
- Compatible with **Base network** (mainnet and testnet)
- Transaction hashes provided for verification on BaseScan

### 📊 Progress Tracking

- **Visual progress bar** showing quest completion percentage
- **Step-by-step indicators** with active, completed, and pending states
- **Real-time statistics**:
  - Total $FLIP swapped
  - Number of swap transactions completed
  - Current balance display

### 🎉 Achievements Integration

The quest unlocks special achievements:
- **Quest Beginner** - Complete first swap (10,000 $FLIP)
- **Quest Apprentice** - Swap 100,000 $FLIP in quests
- **Quest Master** - Swap 1,000,000 $FLIP in quests

Achievements appear in the main Achievements tab and trigger celebration modals.

### 📜 Swap History

- Complete transaction history stored locally
- Each transaction shows:
  - Amount swapped
  - Timestamp
  - Link to view on BaseScan
- History persists across browser sessions
- Scrollable view for large transaction lists

### 💡 User Interface

- **Quick swap buttons** for common amounts (10,000 / 100,000 / 1,000,000 $FLIP)
- **Custom amount input** for flexible swap sizes
- **Optional recipient address** (defaults to quest address if not specified)
- **Real-time balance display** with visual indicators
- **Success/Error messaging** for transaction feedback
- **Completion celebration modal** when steps are completed

## How It Works

### Technical Implementation

1. **Token Transfers**: Uses the `transferTokens` function from the `useCoinFlip` hook
2. **Transaction Signing**: User signs transaction via their connected wallet
3. **On-Chain Recording**: All transactions are recorded on the Base blockchain
4. **Local Storage**: Quest progress and history saved in browser localStorage
5. **Event Tracking**: Success events trigger achievement unlocks and UI updates

### Security Features

- Minimum swap amount: 10,000 $FLIP
- Balance validation before transaction
- Address format validation for recipients
- Transaction confirmation before execution
- Error handling with user-friendly messages

## Usage Guide

### For Users

1. **Navigate to Quest Tab**
   - Click the "🔄 Quest" tab in the main navigation

2. **Connect Your Wallet**
   - Complete step 1 by connecting your Web3 wallet
   - Ensure you're on the Base network

3. **Check Your Balance**
   - Verify you have enough $FLIP tokens
   - If not, use the "Buy $FLIP Tokens" button on the Play tab

4. **Start Swapping**
   - Choose a quick amount or enter a custom amount
   - Optionally specify a recipient address
   - Click "Swap" and confirm the transaction
   - Wait for on-chain confirmation

5. **Track Progress**
   - Watch your progress bar fill up
   - See completed steps marked with checkmarks
   - View your swap history at the bottom

6. **Complete All Steps**
   - Work through all 5 quest steps
   - Unlock achievements along the way
   - Celebrate becoming a Quest Master!

### For Developers

#### Component Location
```
components/SwappingQuest.tsx
```

#### Integration in Main App
```typescript
import SwappingQuest from "@/components/SwappingQuest";

// In your tab content:
{activeTab === "quest" && <SwappingQuest />}
```

#### Quest Data Structure
```typescript
interface QuestStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  action?: string;
  requirement?: number;
}

interface SwapTransaction {
  from: string;
  amount: number;
  timestamp: number;
  txHash: string;
}
```

#### LocalStorage Keys
- `swapQuestHistory`: Array of SwapTransaction objects

## Configuration

### Default Quest Address
The default recipient address for quest swaps is:
```
0x0000000000000000000000000000000000000001
```

You can change this in `SwappingQuest.tsx`:
```typescript
const DEFAULT_QUEST_ADDRESS = "0xYourAddressHere";
```

### Quick Swap Amounts
Modify the quick swap buttons:
```typescript
const quickSwapAmounts = [10000, 100000, 1000000]; // amounts in $FLIP
```

### Quest Steps
Add or modify quest steps in the component's initial state:
```typescript
const [questSteps, setQuestSteps] = useState<QuestStep[]>([
  // Add your custom quest steps here
]);
```

## Best Practices

### For Quest Designers

1. **Progressive Difficulty**: Start with small amounts and increase gradually
2. **Clear Instructions**: Each step should have a clear description
3. **Meaningful Milestones**: Set requirements that feel achievable
4. **Visual Feedback**: Use icons and colors to indicate progress
5. **Celebration Moments**: Reward users when they complete steps

### For Users

1. **Start Small**: Begin with the minimum amount (10,000 $FLIP)
2. **Verify Addresses**: Double-check recipient addresses before swapping
3. **Check Gas Fees**: Ensure you have enough ETH for transaction fees
4. **Keep History**: Your swap history is stored locally - don't clear browser data
5. **Track Achievements**: Visit the Achievements tab to see unlocked badges

## Troubleshooting

### Common Issues

**"Insufficient balance" error**
- Solution: Buy more $FLIP tokens from the Play tab or external DEX

**"Invalid recipient address" error**
- Solution: Ensure address starts with "0x" and is 42 characters long

**Transaction stuck or pending**
- Solution: Check BaseScan for transaction status, may need to wait for network

**Quest progress not saving**
- Solution: Ensure localStorage is enabled in your browser

**Achievements not unlocking**
- Solution: Wait 5 seconds for the achievement system to update, or switch tabs

## Future Enhancements

Potential improvements for the quest system:

- [ ] Multiple quest paths (beginner, intermediate, advanced)
- [ ] NFT rewards for quest completion
- [ ] Leaderboard for fastest quest completions
- [ ] Social sharing of quest achievements
- [ ] Quest multipliers during special events
- [ ] Advanced quests with multi-step swaps
- [ ] Integration with DEX aggregators for best rates
- [ ] Quest challenges with time limits
- [ ] Team quests with shared progress
- [ ] Seasonal quests with exclusive rewards

## Technical Details

### Dependencies
- React hooks (useState, useEffect)
- useCoinFlip custom hook
- localStorage API
- Base network blockchain

### State Management
- Component-level state for quest progress
- localStorage for persistence
- Global state through main app for achievements

### Transaction Flow
```
User Input → Validation → Wallet Signature → 
On-Chain Execution → Confirmation → 
State Update → Achievement Check → UI Update
```

### Gas Optimization
- Transactions use standard ERC20 transfer
- No batch operations to maintain simplicity
- Users pay their own gas fees
- Estimated gas: ~50,000-70,000 units per swap

## Support

For issues or questions about the Swapping Quest feature:

1. Check the in-app info section (ℹ️)
2. Review transaction on BaseScan
3. Verify wallet connection and network
4. Check browser console for error messages
5. Contact support with transaction hash if needed

## License

This feature is part of the Coin Flip On-Chain project and follows the same license terms.

---

**Built with ❤️ on Base Network**

Powered by Thirdweb & Next.js
