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

1. **Connect Wallet**: Click the "Connect Wallet" button in the top-right corner
2. **Flip Coin**: Click the "Flip Coin" button to flip
3. **View Stats**: Track your flip history with real-time statistics
4. **On-Chain**: Future updates will record flips on the blockchain

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
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID`
- `NEXT_PUBLIC_CHAIN_ID`
- `NEXT_PUBLIC_CONTRACT_ADDRESS`

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
