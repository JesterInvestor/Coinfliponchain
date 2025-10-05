# Deployment Guide for CoinFlip Betting Platform

This guide walks you through deploying the smart contracts and configuring the frontend for the CoinFlip betting platform.

## Prerequisites

- Node.js 16+ installed
- A wallet with funds on Base network (for mainnet) or Base Sepolia (for testnet)
- Thirdweb account (get your Client ID from https://thirdweb.com/dashboard)

## Step 1: Deploy FlipToken (ERC20)

The FLIP token is used for betting on the platform.

### Deploy using Thirdweb

```bash
cd contracts
npx thirdweb deploy
```

When prompted:
1. Select `FlipToken.sol`
2. Choose your network (Base Mainnet or Base Sepolia)
3. Fill in constructor parameters:
   - `_defaultAdmin`: Your admin wallet address
   - `_name`: "Flip Token"
   - `_symbol`: "FLIP"

### Mint Initial Supply

After deployment:
1. Go to the Thirdweb dashboard
2. Navigate to your deployed FlipToken contract
3. Use the `mintTo` function to mint initial supply
   - `_to`: Address to receive tokens (your wallet or treasury)
   - `_amount`: Amount in wei (e.g., `1000000000000000000000000` = 1M tokens with 18 decimals)

### Save the Token Address

Copy the deployed contract address. You'll need it for:
- Deploying CoinFlipBetting contract
- Updating frontend environment variables

## Step 2: Deploy CoinFlipBetting Contract

This is the main game contract that handles bets, payouts, and fees.

### Deploy using Thirdweb

```bash
npx thirdweb deploy
```

When prompted:
1. Select `CoinFlipBetting.sol`
2. Choose your network (same as FlipToken)
3. Fill in constructor parameters:
   - `_flipToken`: Address of your deployed FlipToken contract
   - `_treasury`: Wallet address where lost bets will be sent
   - `_platformFeeRecipient`: Wallet address to receive platform fees
   - `_platformFeeBps`: Platform fee in basis points (e.g., `100` = 1%, `50` = 0.5%)

### Understanding Platform Fees

Platform fees are charged on every bet:
- **Winner scenario**: Player receives 2x bet - platform fee, platform fee goes to fee recipient
- **Loser scenario**: Bet amount - platform fee goes to treasury, platform fee goes to fee recipient

Example with 1% (100 bps) fee and 1000 FLIP bet:
- **If player wins**: Player receives 1980 FLIP (2000 - 20), 20 FLIP to fee recipient
- **If player loses**: Treasury receives 980 FLIP, 20 FLIP to fee recipient

### Save the Contract Address

Copy the deployed contract address for updating frontend environment variables.

## Step 3: Configure Frontend

### Update Environment Variables

Create or update `.env.local` in the project root:

```bash
# Thirdweb Client ID (Get from https://thirdweb.com/dashboard)
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here

# Base Chain ID (8453 for Base Mainnet, 84532 for Base Sepolia)
NEXT_PUBLIC_CHAIN_ID=8453

# CoinFlipBetting Contract Address (from Step 2)
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourCoinFlipBettingAddress

# FLIP Token Contract Address (from Step 1)
NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=0xYourFlipTokenAddress
```

### Install Dependencies

```bash
npm install
```

### Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and test:
1. Connect wallet
2. Ensure you have FLIP tokens
3. Approve token spending
4. Place a bet
5. Check results

## Step 4: Fund the Contract

For the betting to work properly, the contract needs to have enough FLIP tokens to pay winners.

### Calculate Required Liquidity

Recommended minimum: 100x your maximum bet amount

Example: If max bet is 1M FLIP, contract should hold at least 100M FLIP

### Send Tokens to Contract

1. Use your wallet to send FLIP tokens to the CoinFlipBetting contract address
2. Or use the FlipToken contract's `transfer` function

## Step 5: Configure Platform Settings

As the contract owner, you can adjust settings:

### Update Platform Fee

```solidity
// On Thirdweb dashboard or using contract interaction
setPlatformFeeInfo(
  recipientAddress,  // Where fees go
  100                // Basis points (100 = 1%)
)
```

### Update Treasury

```solidity
updateTreasury(newTreasuryAddress)
```

### Update Minimum Bet

```solidity
updateMinBetAmount(1000000000000000000000) // 1000 FLIP in wei
```

## Step 6: Deploy Frontend

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_FLIP_TOKEN_ADDRESS`
4. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- etc.

Make sure to configure environment variables on your chosen platform.

## Security Checklist

Before going to production:

- [ ] Verify all contract addresses in environment variables
- [ ] Test with small amounts first
- [ ] Ensure contract has sufficient FLIP tokens for payouts
- [ ] Verify treasury and platform fee recipient addresses
- [ ] Test bet placement and payout flow
- [ ] Monitor contract balance regularly
- [ ] Set appropriate minimum bet amount
- [ ] Consider implementing rate limiting on frontend
- [ ] Set up monitoring for contract events
- [ ] Keep private keys secure (use hardware wallet for owner functions)

## Maintenance

### Regular Tasks

1. **Monitor Contract Balance**: Ensure sufficient funds for payouts
2. **Collect Platform Fees**: Withdraw fees from recipient address regularly
3. **Monitor Treasury**: Track lost bets accumulation
4. **Update Settings**: Adjust fees and limits as needed

### Emergency Procedures

If something goes wrong:

1. **Pause Operations**: Stop accepting bets by updating frontend
2. **Emergency Withdraw**: Use `emergencyWithdraw` function (owner only)
3. **Update Contract**: Deploy new version and update frontend

## Troubleshooting

### Users Can't Place Bets

- Check if they have enough FLIP tokens
- Verify they approved token spending
- Check minimum bet amount
- Ensure contract has sufficient balance

### Transactions Failing

- Check gas prices on Base network
- Verify contract addresses in environment variables
- Check user's wallet balance for gas fees

### Balance Not Updating

- Check RPC endpoint connectivity
- Clear browser cache
- Verify contract addresses

## Support

For issues or questions:
- Check contract events on block explorer
- Review transaction logs
- Check console for errors
- Verify all addresses and amounts

## Next Steps

After successful deployment:
1. Test thoroughly with small amounts
2. Monitor for 24 hours
3. Gradually increase limits
4. Market your platform
5. Collect feedback
6. Iterate and improve

## Important Notes

⚠️ **Random Number Generation**: This implementation uses pseudo-random number generation which is NOT cryptographically secure. For production use with significant value, integrate Chainlink VRF or similar secure randomness solution.

⚠️ **Regulatory Compliance**: Ensure compliance with local gambling and gaming regulations before launching.

⚠️ **Smart Contract Audits**: Consider getting the contracts audited by a professional security firm before handling significant value.
