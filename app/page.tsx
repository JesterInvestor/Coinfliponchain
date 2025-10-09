"use client";

import { useState, useEffect } from "react";
import CoinFlipOnChain from "@/components/CoinFlipOnChain";
import WalletConnect from "@/components/WalletConnect";
import Achievements from "@/components/Achievements";
import CreatorSupport from "@/components/CreatorSupport";
import SwappingQuest from "@/components/SwappingQuest";

type TabType = "game" | "achievements" | "creators" | "quest";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("game");
  const [totalBets, setTotalBets] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [totalQuestSwaps, setTotalQuestSwaps] = useState(0);

  // Load quest data from localStorage
  useEffect(() => {
    const loadQuestData = () => {
      const stored = localStorage.getItem("swapQuestHistory");
      if (stored) {
        const history = JSON.parse(stored);
        const total = history.reduce(
          (sum: number, tx: { amount: number }) => sum + tx.amount,
          0
        );
        setTotalQuestSwaps(total);
      }
    };

    loadQuestData();
    // Reload every 5 seconds to catch updates from the quest tab
    const interval = setInterval(loadQuestData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-white to-stone-100 dark:from-neutral-900 dark:via-neutral-800 dark:to-stone-900 flex flex-col">
      {/* Header - Centered */}
      <header className="w-full p-4 sm:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className="text-5xl sm:text-6xl mb-3">🪙</div>
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-800 dark:text-white mb-2">
              Coin Flip Betting
            </h1>
            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
              Bet $FLIP on Base Network
            </p>
          </div>
          <WalletConnect />
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 w-full px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-neutral-800 rounded-t-2xl shadow-lg p-2 flex gap-2">
            <button
              onClick={() => setActiveTab("game")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "game"
                  ? "bg-gradient-to-r from-amber-700 to-yellow-800 text-white shadow-md"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              🎲 Play
            </button>
            <button
              onClick={() => setActiveTab("quest")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "quest"
                  ? "bg-gradient-to-r from-amber-700 to-yellow-800 text-white shadow-md"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              🔄 Quest
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "achievements"
                  ? "bg-gradient-to-r from-amber-700 to-yellow-800 text-white shadow-md"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              🏆 Achievements
            </button>
            <button
              onClick={() => setActiveTab("creators")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "creators"
                  ? "bg-gradient-to-r from-amber-700 to-yellow-800 text-white shadow-md"
                  : "bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
              }`}
            >
              💝 Creators
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-neutral-800 rounded-b-2xl shadow-2xl p-4 sm:p-8">
            {activeTab === "game" && <CoinFlipOnChain />}
            {activeTab === "quest" && <SwappingQuest />}
            {activeTab === "achievements" && (
              <Achievements
                totalBets={totalBets}
                totalWins={totalWins}
                totalVolume={totalVolume}
                totalQuestSwaps={totalQuestSwaps}
              />
            )}
            {activeTab === "creators" && (
              <CreatorSupport />
            )}
          </div>

          {/* Features - Centered */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 sm:p-6 shadow-lg text-center border border-neutral-200 dark:border-neutral-700">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-white mb-2">
                Fast & Secure
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
                Lightning-fast transactions on Base network.
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 sm:p-6 shadow-lg text-center border border-neutral-200 dark:border-neutral-700">
              <div className="text-4xl mb-3">🔗</div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-white mb-2">
                On-Chain Proof
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
                Every flip recorded on-chain.
              </p>
            </div>
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-5 sm:p-6 shadow-lg text-center border border-neutral-200 dark:border-neutral-700">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-800 dark:text-white mb-2">
                $FLIP Betting
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base">
                Bet with $FLIP token.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Centered */}
      <footer className="w-full py-6 text-center text-neutral-600 dark:text-neutral-400">
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
