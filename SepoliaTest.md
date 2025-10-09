# Base Sepolia Test Guide

This guide shows how to deploy and test the CoinFlipBetting contract on Base Sepolia and wire it into the Next.js frontend.

## Prerequisites
- Node.js and npm installed
- A wallet private key with funds on Base Sepolia (for gas)
  - Faucet: https://www.alchemy.com/faucets/base-sepolia
- RPC endpoint for Base Sepolia
- This repo installed (npm i)

## Environment variables
Create or update your `.env` in the repo root with the following (examples shown are placeholders):

- Required for deployment
  - BASE_SEPOLIA_RPC_URL=https://base-sepolia.infura.io/v3/<your-key>
  - PRIVATE_KEY=0x<your_private_key>
  - FLIP_TOKEN_ADDRESS_SEPOLIA=0x<test_flip_token_address>
  - PLATFORM_FEE_BPS_SEPOLIA=100
  - (optional) TREASURY_ADDRESS_SEPOLIA=0x<your_treasury_address>
  - (optional) PLATFORM_FEE_RECIPIENT_SEPOLIA=0x<your_fee_recipient>

- Frontend config
  - NEXT_PUBLIC_CHAIN_ID=84532
  - NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=0x<test_flip_token_address>
  - NEXT_PUBLIC_CONTRACT_ADDRESS=0x<filled_after_deploy>
  - (optional) NEXT_PUBLIC_THIRDWEB_CLIENT_ID=<your_thirdweb_client_id>

Notes:
- The deploy script auto-detects the network from Hardhat and selects Base Sepolia envs when you run the sepolia script.
- If a “SEPOLIA” env isn’t set, it falls back to the non-suffixed value (e.g., FLIP_TOKEN_ADDRESS).

## Deploy on Base Sepolia
1) Compile contracts (optional if already compiled)

   npm run compile:contracts

2) Deploy to Base Sepolia

   npm run deploy:base:sepolia

3) The script will print helpful lines like:
   - NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
   - NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=0x...

   Copy these into your `.env.local` (or `.env`) used by the Next.js app.

## Run the frontend against Base Sepolia
1) Ensure your `.env.local` includes:
   - NEXT_PUBLIC_CHAIN_ID=84532
   - NEXT_PUBLIC_CONTRACT_ADDRESS=0x<your_deployed_contract>
   - NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=0x<your_test_flip_token>

2) Start the app:

   npm run dev

3) In your wallet, switch network to Base Sepolia and connect.

4) Use the app normally. The Buy $FLIP link and displayed addresses in the UI will reflect your env configuration.

## Troubleshooting
- Missing env var: The deploy script will error with a clear message (e.g., “Missing required env var …”). Set the variable and re-run.
- Insufficient funds: Ensure the deployer wallet has Base Sepolia ETH (see faucet link above).
- Wrong chain in wallet: The UI reads NEXT_PUBLIC_CHAIN_ID and will default to Base Sepolia if it’s not set to 8453. Make sure your wallet is on the same network.
- RPC throttling: If you hit rate limits, try a different provider or key.
- Windows shell quoting: Keep values simple (no trailing spaces); do not wrap values in quotes inside `.env`.

## Switching back to Base mainnet
- Set NEXT_PUBLIC_CHAIN_ID=8453
- Use `npm run deploy:base` to deploy to mainnet (requires BASE_RPC_URL and mainnet constructor envs)
- Update NEXT_PUBLIC_CONTRACT_ADDRESS to the mainnet deployment address

## Reference
- Deploy scripts:
  - `npm run deploy:base` → uses BASE_RPC_URL
  - `npm run deploy:base:sepolia` → uses BASE_SEPOLIA_RPC_URL
- Network IDs:
  - Base mainnet: 8453
  - Base sepolia: 84532
