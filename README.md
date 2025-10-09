# 🪙 Coin Flip On-Chain

A modern, on-chain coin flipping application built with Next.js, Thirdweb SDK, and Base network. Features wallet connection, blockchain integration, and Farcaster Frames support.

## 🚀 Features

### Core Betting Features
- ⚡ **Next.js 15** with App Router and TypeScript
- 🔗 **Thirdweb Integration** for seamless wallet connection and smart contract interactions
- 🌐 **Base Network** support for fast and low-cost transactions
- 💰 **ERC20 Token Betting** with $FLIP tokens
- 🏦 **Platform Fees** using Thirdweb's PlatformFee extension
- 🔒 **Smart Contract Security** with access control and treasury management
- 📊 **Real-time Balance Tracking** from blockchain
- 🔐 **Web3 Wallet Support** (MetaMask, WalletConnect, Coinbase Wallet, etc.)

### Enhanced User Experience
- 🎨 **Enhanced 3D Coin Animations** with particle effects and dynamic visual feedback
- ✨ **Customizable Animation Modes** - Toggle between standard and enhanced 3D flip animations
- 💫 **Celebration Effects** with glow animations and visual rewards
- 📱 **Fully Responsive** design optimized for mobile and desktop
- 🎮 **Interactive Gameplay** with intuitive bet selection and real-time feedback

### Gamification & Collectibles
- 🏆 **Achievement System** with 15+ unlockable badges and milestones
- 🎖️ **Achievement Categories** including:
  - Betting Milestones (First Flip, Bronze/Silver/Gold/Diamond Bettor)
  - Win Achievements (Lucky Beginner, Triple Win, Hot Streak, Unstoppable)
  - Volume Achievements (Small/Big/Mega Whale)
  - Quest Achievements (Quest Beginner, Apprentice, Master)
- 📊 **Progress Tracking** with visual progress bars and unlock notifications
- 🎁 **Achievement Notifications** with animated popups on unlock
- 🔄 **Swapping Quest** - Interactive guided experience for learning on-chain swaps

### Creator Support & Community
- 💝 **Creator Tipping System** - Support creators directly with $FLIP by entering their wallet address
- 🔗 **Referral System** - Become a creator and earn 5% of referred user bets
- 📋 **Easy Sharing** with one-click referral link copying
- 👥 **Community Building** tools for content creators and influencers

### Additional Features
- 🖼️ **Farcaster Frames** ready with OG image generation
- 👑 **VIP Status** for high-value token holders
- 📈 **Comprehensive Statistics** tracking wins, losses, and total volume

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

### Getting Started
1. **Get $FLIP Tokens**: 
   - Click the "Buy $FLIP Tokens" button in the app
   - Visit Matcha.xyz to swap for $FLIP on Base network
   - Contract: `0x9d8eCa05F0FD5486916471c2145e32cdBF5112dF`

2. **Connect Wallet**: 
   - Click the "Connect Wallet" button in the header
   - Choose your preferred wallet (MetaMask, Coinbase Wallet, WalletConnect, etc.)
   - Approve the connection to Base network

### Playing the Game
3. **Choose Your Side**: 
   - Select either Heads (👑) or Tails (⚡)
   - Your selection will be highlighted

4. **Select Bet Amount**: 
   - Choose from quick bet amounts (1,000 / 10,000 / 100,000 / 1,000,000 $FLIP)
   - Or enter a custom amount
   - Minimum bet: 1,000 $FLIP

5. **Customize Experience**:
   - Toggle "Enhanced 3D Animation" for immersive coin flip effects
   - View your balance and VIP status

6. **Place Your Bet**: 
   - Click the "Bet" button
   - Approve token spending (first time only)
   - Wait for transaction confirmation
   - Results are determined on-chain with automatic payouts

7. **Track Progress**: 
   - View real-time statistics (Heads/Tails/Total)
   - Check your balance updates automatically
   - Monitor platform fee (default 1%)

### Exploring Additional Features
8. **Unlock Achievements** (🏆 Achievements Tab):
   - Complete betting milestones to unlock badges
   - Track your progress across different categories
   - Get notified when you unlock new achievements

9. **Support Creators** (💝 Creators Tab):
   - Browse featured creators
   - Tip creators directly with $FLIP tokens
   - Generate your own referral link
   - Earn 5% commission on referred user bets

### Tips for Success
- Start with smaller bets to familiarize yourself with the platform
- VIP status unlocks at 1,000,000 $FLIP balance
- Achievement system rewards consistent play
- Use referral links to earn passive income

## 🏗️ Project Structure

```
Coinfliponchain/
├── app/
│   ├── api/
│   │   ├── flip/                # Flip API for Farcaster Frames
│   │   └── og/                  # OG image generation
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Main page with tab navigation
│   ├── providers.tsx            # Thirdweb provider wrapper
│   └── globals.css              # Global styles & animations
├── components/
│   ├── CoinFlip.tsx             # Basic coin flip demo component
│   ├── CoinFlipOnChain.tsx      # Main on-chain betting component
│   ├── WalletConnect.tsx        # Wallet connection component
│   ├── Achievements.tsx         # Achievement/collectibles system
│   └── CreatorSupport.tsx       # Creator tipping & referrals
├── hooks/
│   └── useCoinFlip.ts           # Custom hook for contract interactions
├── contracts/
│   ├── CoinFlipBetting.sol      # Main betting smart contract
│   ├── FlipToken.sol            # ERC20 token contract
│   └── README.md                # Contract documentation
├── public/                      # Static assets
├── examples/                    # Code examples
├── .env.local                   # Environment variables
└── Documentation files          # Various .md files
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

## 📖 Feature Deep Dive

### Enhanced Coin Flip Animation
The app features multiple animation modes for an engaging user experience:

**Standard Animation**:
- Smooth 360° coin rotation
- Clean and performant
- Works on all devices

**Enhanced 3D Animation**:
- Full 3D perspective with rotateY and rotateX transformations
- Dynamic scaling during flip
- Particle burst effects on flip
- Glow effects for wins
- Toggle-able via checkbox in the UI

**Technical Details**:
- CSS keyframe animations defined in `app/globals.css`
- Animations: `flip-3d`, `particle-burst`, `glow-pulse`, `confetti-fall`
- React state management for animation control
- Performance-optimized with CSS transforms

### Achievement System
A comprehensive gamification system to keep users engaged:

**Achievement Categories**:
1. **Betting Milestones**: First Flip → Bronze → Silver → Gold → Diamond (1 to 500 bets)
2. **Win Achievements**: Lucky Beginner, Triple Win, Hot Streak, Unstoppable
3. **Volume Achievements**: Small/Big/Mega Whale (10K to 1M $FLIP wagered)
4. **Quest Achievements**: Quest Beginner → Apprentice → Master (1K to 10K $FLIP swapped)

**Features**:
- Real-time progress tracking
- Visual progress bar showing completion percentage
- Animated unlock notifications with confetti effects
- Persistent state tracking (can be extended to on-chain or backend)
- Badge display with icons and descriptions

**Implementation**:
- Component: `components/Achievements.tsx`
- Automatic unlock detection based on user statistics
- Modal popups for new achievements
- Grid layout responsive to all screen sizes

### Swapping Quest
An interactive, gamified quest system that teaches users how to swap $FLIP tokens on-chain:

**Quest Steps**:
1. **Connect Wallet**: Connect your Web3 wallet to begin
2. **Check Balance**: Verify you have sufficient $FLIP tokens
3. **First Swap**: Complete your first swap (1,000 $FLIP)
4. **Advanced Swap**: Execute a larger swap (5,000 $FLIP)
5. **Quest Master**: Become a master by swapping 10,000 $FLIP

**Features**:
- Step-by-step guided experience
- Real on-chain transactions with blockchain verification
- Quick swap buttons (1K, 5K, 10K $FLIP) and custom amounts
- Complete swap history with BaseScan links
- Progress tracking with visual indicators
- Achievement integration for quest completion
- Optional custom recipient addresses
- LocalStorage persistence for quest progress

**Technical Details**:
- Component: `components/SwappingQuest.tsx`
- Uses ERC20 token transfer standard
- Atomic and secure on-chain swaps
- Transaction hash recording for verification
- Integration with achievement system
- See `SWAPPING_QUEST.md` for complete documentation

### Creator Support & Referral System
Build and support your community:

**Tipping System**:
- Tip featured creators or any address
- Quick tip amounts: 1K, 5K, 10K, 50K $FLIP
- Custom tip amounts supported
- Transaction integration ready

**Referral Program**:
- Generate unique referral codes based on wallet address
- One-click link copying for easy sharing
- Earn 5% commission on referred user bets (implementation ready)
- Track supporters and total support received

**How to Become a Creator**:
1. Connect your wallet
2. Navigate to Creators tab
3. Click "Show My Referral Code"
4. Copy and share your referral link
5. Earn rewards automatically

## 🎨 Customization

### Styling
- Modify `app/globals.css` for global styles and custom animations
- Update Tailwind classes in components for UI changes
- Customize color schemes in component files
- Add new animations by defining CSS keyframes

### Game Logic
- Edit `components/CoinFlipOnChain.tsx` for betting behavior
- Modify `hooks/useCoinFlip.ts` for contract interaction logic
- Extend achievement criteria in `components/Achievements.tsx`
- Add new creator features in `components/CreatorSupport.tsx`

### Smart Contracts
- Review `contracts/CoinFlipBetting.sol` for betting logic
- Modify platform fee structure
- Add new game modes or betting options
- Extend with creator reward distribution logic

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

Note on dependencies:
- This project uses ethers v6 and the modern `thirdweb` SDK package (v5+). We do not use `@thirdweb-dev/sdk` or `@thirdweb-dev/react` here to avoid peer dependency conflicts that require ethers v5. If you add those packages later, pin compatible versions or consider using `--legacy-peer-deps` on your own risk.

### Environment Variables
Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_THIRDWEB_CLIENT_ID` - Your Thirdweb client ID
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID (8453 for Base Mainnet, 84532 for Base Sepolia)
- `NEXT_PUBLIC_CONTRACT_ADDRESS` - CoinFlipBetting contract address
- `NEXT_PUBLIC_FLIP_TOKEN_ADDRESS` - FLIP token (ERC20) contract address

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions. For Base Sepolia testnet setup and deployment, see [SepoliaTest.md](./SepoliaTest.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🔗 Links

- [Thirdweb Documentation](https://portal.thirdweb.com/)
- [Base Network](https://base.org/)
- [Next.js Documentation](https://nextjs.org/docs)

## 📚 Additional Documentation

- **[FEATURES.md](./FEATURES.md)** - Detailed documentation of all new features including animations, achievements, and creator support
- **[USER_GUIDE.md](./USER_GUIDE.md)** - Comprehensive user guide with step-by-step instructions, tips, and troubleshooting
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Instructions for deploying the application
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture and design decisions
- **[contracts/README.md](./contracts/README.md)** - Smart contract documentation
- **[SepoliaTest.md](./SepoliaTest.md)** - Base Sepolia (testnet) deployment and frontend wiring guide

## 📞 Support

For questions or support:
- Check [USER_GUIDE.md](./USER_GUIDE.md) for common questions and troubleshooting
- Review [FEATURES.md](./FEATURES.md) for feature-specific documentation
- Open an issue on GitHub for bugs or feature requests

## 🤝 For Developers

Want to contribute or customize?
- See [FEATURES.md](./FEATURES.md) for customization guides
- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Review [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines

---

Built with ❤️ using Next.js, Thirdweb, and Base Chain
