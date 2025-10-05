# Smart Contracts

This directory contains the smart contracts for the Coin Flip On-Chain application.

## CoinFlip.sol

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

### Using Thirdweb

1. Install Thirdweb CLI:
```bash
npm install -g @thirdweb-dev/cli
```

2. Deploy the contract:
```bash
npx thirdweb deploy
```

3. Follow the prompts to deploy to Base network

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

### Write Functions

- `flip(bool _choice)`: Flip the coin with your choice
  - `_choice`: `true` for heads, `false` for tails
  - Returns: `flipId` of the new flip

### Read Functions

- `getPlayerFlips(address _player)`: Get all flip IDs for a player
- `getPlayerStats(address _player)`: Get wins, losses, and total flips for a player
- `getFlip(uint256 _flipId)`: Get details of a specific flip
- `flips(uint256)`: Public mapping to access flip data
- `playerWins(address)`: Get total wins for a player
- `playerLosses(address)`: Get total losses for a player
- `totalFlips()`: Get total number of flips across all players

## Events

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
