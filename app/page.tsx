import CoinFlipOnChain from "@/components/CoinFlipOnChain";
import WalletConnect from "@/components/WalletConnect";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header - Centered */}
      <header className="w-full p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl sm:text-6xl mb-3">🪙</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              Coin Flip Betting
            </h1>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Bet $FLIP on Base Network
            </p>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 w-full px-4 py-6">
        <div className="max-w-2xl mx-auto">
          {/* Coin Flip Betting Game */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-8">
            <CoinFlipOnChain />
          </div>

          {/* Features - Centered */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
                Fast & Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Lightning-fast transactions on Base network.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
                On-Chain Proof
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Every flip recorded on-chain.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 sm:p-6 shadow-lg text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white mb-2">
                $FLIP Betting
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
                Bet with $FLIP token.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Centered */}
      <footer className="w-full py-6 text-center text-gray-600 dark:text-gray-400">
        <p className="text-sm sm:text-base">
          Built with ❤️ on Base Network
        </p>
        <p className="text-xs sm:text-sm mt-2">
          Powered by Thirdweb & Next.js
        </p>
      </footer>
    </div>
  );
}
