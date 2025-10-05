# CoinFlip Betting Platform Architecture

## Overview

The CoinFlip betting platform is a decentralized application (dApp) built on Base network that allows users to bet ERC20 tokens on coin flip outcomes. The platform features transparent on-chain betting, automated payouts, platform fees, and treasury management.

## Architecture Components

### 1. Smart Contracts

#### FlipToken.sol (ERC20 Token)
- **Purpose**: Platform's native token for betting
- **Base Contract**: Thirdweb's ERC20Base
- **Key Features**:
  - Standard ERC20 functionality (transfer, approve, etc.)
  - Admin-controlled minting
  - 18 decimal places
  - Total supply tracking

#### CoinFlipBetting.sol (Main Game Contract)
- **Purpose**: Handles all betting logic, payouts, and fee distribution
- **Extensions Used**:
  - `PlatformFee` (Thirdweb): Manages configurable platform fees
  - `Ownable` (Thirdweb): Access control for admin functions
- **Key Features**:
  - Bet placement with ERC20 token deposits
  - Immediate bet resolution with pseudo-random outcomes
  - Automated payout distribution
  - Platform fee collection
  - Treasury integration
  - Player statistics tracking
  - Emergency functions for admin

### 2. Frontend (Next.js 15)

#### Components

**CoinFlipOnChain.tsx**
- Main game interface
- Bet selection UI (Heads/Tails)
- Bet amount input (quick select or custom)
- Balance display (real-time from blockchain)
- Statistics visualization
- Transaction status updates

**WalletConnect.tsx**
- Wallet connection interface
- Supports multiple wallets (MetaMask, Coinbase Wallet, etc.)
- Connection status display

#### Hooks

**useCoinFlip.ts**
- Contract interaction logic
- Key functions:
  - `placeBet()`: Place a bet on-chain
  - `getFlipBalance()`: Read user's FLIP token balance
  - `getTokenSupply()`: Read total token supply
  - `approveTokens()`: Approve token spending
  - `getPlayerStats()`: Fetch player statistics
  - `getPlatformFeeInfo()`: Get platform fee configuration

### 3. Integration Flow

```
User Action → Frontend → Thirdweb SDK → Smart Contract → Blockchain
                ↓                                              ↓
              UI Update ← Event Listening ← Events ← Transaction
```

## Data Flow

### Placing a Bet

1. **User Input**
   - Select Heads or Tails
   - Choose bet amount
   - Click "Place Bet"

2. **Token Approval** (First time only)
   ```
   User → approve() → FlipToken → Approval granted
   ```

3. **Bet Placement**
   ```
   User → placeBet() → CoinFlipBetting
   ```

4. **Contract Processing**
   - Verify user has sufficient tokens
   - Transfer tokens from user to contract
   - Generate random result (heads/tails)
   - Determine win/loss
   - Calculate platform fee
   - Execute payout

5. **Payout Distribution**
   
   **If User Wins:**
   ```
   Contract Balance → User (2x bet - platform fee)
   Contract Balance → Fee Recipient (platform fee)
   ```
   
   **If User Loses:**
   ```
   User's Bet → Treasury (bet - platform fee)
   User's Bet → Fee Recipient (platform fee)
   ```

6. **Event Emission**
   - `BetPlaced` event
   - `BetResolved` event

7. **Frontend Update**
   - Refresh user balance
   - Update statistics
   - Show result message

## Security Model

### Access Control

**Owner-Only Functions:**
- `setPlatformFeeInfo()`: Update platform fee settings
- `updateTreasury()`: Change treasury address
- `updateFlipToken()`: Change token contract (emergency)
- `updateMinBetAmount()`: Adjust minimum bet
- `emergencyWithdraw()`: Withdraw funds in emergency

**User Functions:**
- `placeBet()`: Place a bet (requires token approval)
- View functions (stats, balances, etc.)

### Security Measures

1. **Token Approval Pattern**: Users must explicitly approve token spending
2. **Input Validation**: Minimum bet amount, balance checks
3. **Immediate Settlement**: Bets are resolved atomically (no pending state)
4. **Event Logging**: All actions emit events for transparency
5. **Access Control**: Critical functions restricted to owner
6. **Emergency Functions**: Owner can withdraw funds if needed

### Known Limitations

⚠️ **Pseudo-Random Number Generation**
- Current implementation uses `keccak256` of on-chain data
- Not cryptographically secure
- Potentially manipulable by miners
- **Recommendation**: Integrate Chainlink VRF for production

## Platform Economics

### Fee Structure

Platform fees are charged in basis points (bps):
- 1 bps = 0.01%
- 100 bps = 1%
- 50 bps = 0.5%

### Revenue Streams

1. **Platform Fees**: Collected on every bet (win or lose)
2. **Treasury**: Accumulates lost bets (minus platform fee)

### Example Economics (1% fee, 1000 FLIP bet)

**Winning Bet:**
- User bets: 1000 FLIP
- Platform fee: 10 FLIP (1%)
- User wins: 1990 FLIP (2x - fee)
- Platform receives: 10 FLIP

**Losing Bet:**
- User bets: 1000 FLIP
- Platform fee: 10 FLIP (1%)
- Treasury receives: 990 FLIP
- Platform receives: 10 FLIP

### Liquidity Requirements

The contract must hold sufficient FLIP tokens to pay winners:
- Minimum recommended: 100x maximum bet amount
- Monitor contract balance regularly
- Refill as needed to ensure payouts

## Technology Stack

### Smart Contracts
- **Language**: Solidity ^0.8.0
- **Extensions**: Thirdweb Contracts
- **Network**: Base (Ethereum L2)

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3 Library**: Thirdweb SDK v5
- **Wallet Connection**: Thirdweb ConnectButton

### Deployment
- **Smart Contracts**: Thirdweb Deploy
- **Frontend**: Vercel (recommended)
- **Environment**: Production or Testnet (Base Sepolia)

## Monitoring & Maintenance

### Key Metrics to Monitor

1. **Contract Balance**: Ensure sufficient funds for payouts
2. **Platform Fee Collection**: Track revenue
3. **Treasury Balance**: Monitor accumulated funds
4. **Bet Volume**: Daily/weekly betting activity
5. **Win Rate**: Should be ~50% over time
6. **User Statistics**: Active users, total bets

### Regular Tasks

1. **Check Contract Balance**: Daily
2. **Collect Platform Fees**: Weekly
3. **Review Treasury**: Weekly
4. **Monitor Events**: Continuous
5. **Update Configuration**: As needed

### Emergency Procedures

1. **Pause Operations**: Update frontend to disable betting
2. **Emergency Withdraw**: Use owner function to recover funds
3. **Deploy New Contract**: If critical bug found
4. **Migrate Users**: Announce and guide users to new contract

## Future Enhancements

### Security
- [ ] Integrate Chainlink VRF for secure randomness
- [ ] Smart contract audit by professional firm
- [ ] Add circuit breaker mechanism
- [ ] Implement rate limiting

### Features
- [ ] Multi-sided bets (not just heads/tails)
- [ ] Betting pools
- [ ] Multiplayer modes
- [ ] NFT rewards for top players
- [ ] Referral system

### Optimization
- [ ] Gas optimization
- [ ] Batch operations
- [ ] Layer 2 scaling solutions
- [ ] Caching strategies

### User Experience
- [ ] Historical bet replay
- [ ] Leaderboards
- [ ] Achievement system
- [ ] Social features
- [ ] Mobile app

## Compliance Considerations

⚠️ **Legal Requirements**
- Check local gambling regulations
- Implement KYC/AML if required
- Age verification for restricted jurisdictions
- Terms of service and privacy policy
- Responsible gambling features

## Conclusion

The CoinFlip betting platform provides a solid foundation for decentralized betting with transparent on-chain logic, automated payouts, and flexible fee management. The architecture is modular and extensible, allowing for future enhancements while maintaining security and user experience.

For deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

For contract details, see [contracts/README.md](./contracts/README.md).
