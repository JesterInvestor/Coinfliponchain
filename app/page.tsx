import CoinFlipOnChain from "@/components/CoinFlipOnChain";
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="w-full p-4 sm:p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🪙</div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
              Coin Flip On-Chain
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Powered by Base Network
            </p>
          </div>
        </div>
        <WalletConnect />
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
              Welcome to On-Chain Coin Flip! 🎮
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Experience the thrill of coin flipping with blockchain transparency.
              Connect your wallet to start playing and track your results on-chain.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                Built with Next.js
              </span>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
                Thirdweb SDK
              </span>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
                Base Chain
              </span>
            </div>
          </div>

          {/* Coin Flip Game */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <CoinFlipOnChain />
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Fast & Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Lightning-fast transactions on Base network with top-tier security.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                On-Chain Proof
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Every flip is recorded on-chain, ensuring complete transparency.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                Modern UX
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Beautiful, responsive design for the best user experience.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 mt-12 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm">
          Built with ❤️ using Next.js, Thirdweb, and Base Chain
        </p>
        <p className="text-xs mt-2">
          Ready for Farcaster Frames integration
        </p>
      </footer>
    </div>
  );
}
