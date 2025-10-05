# Smart Contracts

This directory contains the smart contracts for the Coin Flip On-Chain application.

## Contracts Overview

### CoinFlipBetting.sol (Production Contract)

Enhanced coin flip game contract with betting functionality, treasury management, and platform fees using Thirdweb's PlatformFee extension.

**Features:**
- **Betting System**: Accept bets with ERC20 tokens
- **Active Bets Tracking**: Track all player bets and status
- **Automated Payouts**: Automatic payout of winnings (2x bet minus platform fee)
- **Platform Fees**: Configurable platform fee using Thirdweb's PlatformFee extension
- **Treasury Integration**: Lost bets are sent to treasury minus platform fee
- **Security**: Owner-only access control for critical functions
- **Statistics**: Comprehensive player statistics and bet history

**Key Functions:**
- `placeBet(uint256 _amount, bool _choice)`: Place a bet with specified amount
- `getPlayerStats(address _player)`: Get player statistics
- `getPlatformFeeInfo()`: Get platform fee recipient and basis points
- `updateTreasury(address _newTreasury)`: Update treasury address (owner only)
- `setPlatformFeeInfo(address _recipient, uint256 _bps)`: Set platform fee (owner only)

### FlipToken.sol

ERC20 token contract for the platform using Thirdweb's ERC20Base.

**Features:**
- Standard ERC20 functionality
- Minting capability (admin only)
- Supply tracking

### CoinFlip.sol (Legacy - Educational)

A simple on-chain coin flip game contract that allows players to:
- Flip coins with their choice (heads or tails)
- Track their flip history
- View their win/loss statistics
- Store all game results on-chain

### Features

- **On-chain Game Logic**: All flip results are stored on the blockchain
- **Player Statistics**: Track wins, losses, and total flips per player
- **Event Emissions**: Emit events for each flip and game result
- **Transparent History**: Anyone can verify past flips and results

### Important Note

⚠️ **This contract uses pseudo-random number generation which is NOT cryptographically secure.** 

The randomness is generated using `block.timestamp`, `block.prevrandao`, and other on-chain data, which can potentially be manipulated by miners. This implementation is for **educational purposes only** and should **not be used in production** for any gambling or financial applications.

For production use, consider using:
- [Chainlink VRF](https://docs.chain.link/vrf/v2/introduction) for verifiable random numbers
- [Gelato VRF](https://docs.gelato.network/developer-services/vrf) for random number generation
- Other oracle solutions for secure randomness

## Deployment

### Deploy FlipToken.sol First

```bash
npx thirdweb deploy
```

Select `FlipToken.sol` and provide:
- `_defaultAdmin`: Your admin wallet address
- `_name`: "Flip Token"
- `_symbol`: "FLIP"

After deployment, mint initial supply using the `mintTo` function.

### Deploy CoinFlipBetting.sol

```bash
npx thirdweb deploy
```

Select `CoinFlipBetting.sol` and provide:
- `_flipToken`: Address of the deployed FlipToken contract
- `_treasury`: Treasury wallet address (where lost bets go)
- `_platformFeeRecipient`: Address to receive platform fees
- `_platformFeeBps`: Platform fee in basis points (e.g., 100 = 1%, 50 = 0.5%)

### Update Environment Variables

After deployment, update your `.env.local`:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<CoinFlipBetting_address>
NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=<FlipToken_address>
```

### Legacy Deployment (CoinFlip.sol)

For the simple educational contract:

```bash
npx thirdweb deploy
```

Select `CoinFlip.sol` and follow the prompts to deploy to Base network

### Using Hardhat

1. Install dependencies:
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. Create a deployment script in `scripts/deploy.js`

3. Deploy:
```bash
npx hardhat run scripts/deploy.js --network base
```

## Contract Functions

### CoinFlipBetting.sol Functions

#### Write Functions

- `placeBet(uint256 _amount, bool _choice)`: Place a bet with FLIP tokens
  - `_amount`: Amount of FLIP tokens to bet (must be >= minBetAmount)
  - `_choice`: `true` for heads, `false` for tails
  - Returns: `betId` of the new bet
  - Note: Requires token approval first

- `setPlatformFeeInfo(address _recipient, uint256 _bps)`: Set platform fee (owner only)
  - `_recipient`: Address to receive platform fees
  - `_bps`: Fee in basis points (e.g., 100 = 1%)

- `updateTreasury(address _newTreasury)`: Update treasury address (owner only)
- `updateFlipToken(address _newToken)`: Update token address (owner only)
- `updateMinBetAmount(uint256 _newMinBet)`: Update minimum bet (owner only)
- `emergencyWithdraw(uint256 _amount)`: Emergency withdraw (owner only)

#### Read Functions

- `getPlayerBets(address _player)`: Get all bet IDs for a player
- `getPlayerStats(address _player)`: Get comprehensive player statistics
  - Returns: `(wins, losses, total, wagered, won, activeBets)`
- `getBet(uint256 _betId)`: Get details of a specific bet
- `getPlatformFeeInfo()`: Get platform fee recipient and basis points
- `getContractBalance()`: Get contract's FLIP token balance
- `flipToken()`: Get FLIP token contract address
- `treasury()`: Get treasury address
- `minBetAmount()`: Get minimum bet amount

### FlipToken.sol Functions

Standard ERC20 functions plus:
- `mintTo(address _to, uint256 _amount)`: Mint tokens (admin only)
- `totalSupply()`: Get total token supply
- `balanceOf(address _account)`: Get token balance of an account

### CoinFlip.sol Functions (Legacy)

#### Write Functions

- `flip(bool _choice)`: Flip the coin with your choice
  - `_choice`: `true` for heads, `false` for tails
  - Returns: `flipId` of the new flip

#### Read Functions

- `getPlayerFlips(address _player)`: Get all flip IDs for a player
- `getPlayerStats(address _player)`: Get wins, losses, and total flips for a player
- `getFlip(uint256 _flipId)`: Get details of a specific flip
- `totalFlips()`: Get total number of flips across all players

## Events

### CoinFlipBetting.sol Events

```solidity
event BetPlaced(address indexed player, uint256 indexed betId, uint256 amount, bool choice, uint256 timestamp);
event BetResolved(address indexed player, uint256 indexed betId, bool result, bool won, uint256 payout, uint256 platformFee);
event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
event FlipTokenUpdated(address indexed oldToken, address indexed newToken);
event PlatformFeeInfoUpdated(address platformFeeRecipient, uint256 platformFeeBps);
```

### CoinFlip.sol Events (Legacy)

```solidity
event CoinFlipped(address indexed player, bool isHeads, uint256 timestamp, uint256 flipId);
event GameResult(address indexed player, bool playerChoice, bool result, bool won, uint256 flipId);
```

## Integration

After deploying the contract, update the `.env.local` file with your contract address:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress
```

Then, use the Thirdweb SDK in your Next.js app to interact with the contract.

## Future Improvements

- [ ] Implement Chainlink VRF for secure randomness
- [ ] Add betting functionality with ETH/tokens
- [ ] Implement house edge and payout mechanisms
- [ ] Add pause/unpause functionality
- [ ] Implement access control for admin functions
- [ ] Add withdrawal mechanisms for contract funds
- [ ] Create comprehensive test suite
- [ ] Add gas optimization
- [ ] Implement upgradeable pattern (UUPS or Transparent Proxy)
