# 🪙 Coin Flip On-Chain

A modern, on-chain coin flipping application built with Next.js, Thirdweb SDK, and Base network. Features wallet connection, blockchain integration, and Farcaster Frames support.

## 🚀 Features

- ⚡ **Next.js 15** with App Router and TypeScript
- 🔗 **Thirdweb Integration** for seamless wallet connection and smart contract interactions
- 🌐 **Base Network** support for fast and low-cost transactions
- 🎨 **Modern UI/UX** with Tailwind CSS and smooth animations
- 📱 **Fully Responsive** design for all devices
- 🎮 **Interactive Gameplay** with real-time statistics
- 🖼️ **Farcaster Frames** ready with OG image generation
- 🔐 **Web3 Wallet Support** (MetaMask, WalletConnect, Coinbase Wallet, etc.)
- 💰 **ERC20 Token Betting** with $FLIP tokens
- 🏦 **Platform Fees** using Thirdweb's PlatformFee extension
- 🔒 **Smart Contract Security** with access control and treasury management
- 📊 **Real-time Balance Tracking** from blockchain

## 🛠️ Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Web3:** Thirdweb SDK, Ethers.js
- **Blockchain:** Base (Ethereum L2)
- **Deployment:** Ready for Vercel/Netlify

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/JesterInvestor/Coinfliponchain.git
cd Coinfliponchain
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_CHAIN_ID=8453
NEXT_PUBLIC_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
```

Get your Thirdweb Client ID from [https://thirdweb.com/dashboard](https://thirdweb.com/dashboard)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

1. **Get $FLIP Tokens**: Buy $FLIP tokens from the exchange or receive from admin
2. **Connect Wallet**: Click the "Connect Wallet" button in the top-right corner
3. **Select Your Bet**: Choose Heads or Tails and your bet amount
4. **Place Bet**: Approve token spending and place your bet
5. **Win or Lose**: Results are determined on-chain with automatic payouts
6. **View Stats**: Track your betting history and statistics on-chain

## 🏗️ Project Structure

```
Coinfliponchain/
├── app/
│   ├── api/
│   │   ├── flip/         # Flip API for Farcaster Frames
│   │   └── og/           # OG image generation
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Main page
│   ├── providers.tsx     # Thirdweb provider wrapper
│   └── globals.css       # Global styles
├── components/
│   ├── CoinFlip.tsx      # Main coin flip game component
│   └── WalletConnect.tsx # Wallet connection component
├── public/               # Static assets
└── .env.local           # Environment variables
```

## 🔧 Configuration

### Base Network Setup

The app is configured to work with Base network:
- **Mainnet Chain ID**: 8453
- **Testnet Chain ID**: 84532 (Base Sepolia)

Update the `NEXT_PUBLIC_CHAIN_ID` in `.env.local` to switch between networks.

### Thirdweb Configuration

The app uses Thirdweb SDK for:
- Wallet connection and authentication
- Smart contract interactions
- User onboarding
- Transaction management

## 🎨 Customization

### Styling
- Modify `app/globals.css` for global styles
- Update Tailwind classes in components for UI changes
- Customize color schemes in component files

### Game Logic
- Edit `components/CoinFlip.tsx` to modify game behavior
- Add smart contract integration for on-chain gameplay
- Implement betting or wagering features

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Environment Variables
Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Your Thirdweb client ID
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID (8453 for Base Mainnet, 84532 for Base Sepolia)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - CoinFlipBetting contract address
- `NEXT_PUBLIC_FLIP_TOKEN_ADDRESS` - FLIP token (ERC20) contract address

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🔗 Links

- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [Base Network](https://base.org/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📞 Support

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Thirdweb, and Base Chain
