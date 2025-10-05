"use client";

import { useState } from "react";
import { useCoinFlip } from "@/hooks/useCoinFlip";

type CoinSide = "heads" | "tails";

export default function CoinFlipOnChain() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [message, setMessage] = useState("Ready to flip!");
  const [stats, setStats] = useState({ heads: 0, tails: 0, total: 0 });
  const [mode, setMode] = useState<"local" | "onchain">("local");

  const { flipCoinOnChain, isFlipping: isOnChainFlipping, error, isConnected } = useCoinFlip();

  const flipCoinLocal = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setMessage("Flipping...");
    setResult(null);

    // Simulate coin flip animation
    setTimeout(() => {
      const isHeads = Math.random() < 0.5;
      const outcome: CoinSide = isHeads ? "heads" : "tails";
      
      setResult(outcome);
      setMessage(isHeads ? "🎉 Heads!" : "🎊 Tails!");
      setStats(prev => ({
        heads: prev.heads + (isHeads ? 1 : 0),
        tails: prev.tails + (isHeads ? 0 : 1),
        total: prev.total + 1
      }));
      setIsFlipping(false);
    }, 600);
  };

  const handleFlipOnChain = async () => {
    if (!isConnected) {
      setMessage("⚠️ Please connect your wallet first!");
      return;
    }

    setIsFlipping(true);
    setMessage("Sending transaction...");
    setResult(null);

    // Randomly choose heads or tails for demo
    const choice = Math.random() < 0.5;
    
    const tx = await flipCoinOnChain(choice);
    
    if (tx) {
      setMessage("⏳ Transaction sent! Waiting for confirmation...");
      
      // Simulate waiting for confirmation
      setTimeout(() => {
        const isHeads = Math.random() < 0.5;
        const outcome: CoinSide = isHeads ? "heads" : "tails";
        
        setResult(outcome);
        setMessage(isHeads ? "🎉 Heads! (On-chain)" : "🎊 Tails! (On-chain)");
        setStats(prev => ({
          heads: prev.heads + (isHeads ? 1 : 0),
          tails: prev.tails + (isHeads ? 0 : 1),
          total: prev.total + 1
        }));
        setIsFlipping(false);
      }, 2000);
    } else {
      setMessage(error || "❌ Transaction failed");
      setIsFlipping(false);
    }
  };

  const handleFlip = () => {
    if (mode === "local") {
      flipCoinLocal();
    } else {
      handleFlipOnChain();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
        <button
          onClick={() => setMode("local")}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            mode === "local"
              ? "bg-white dark:bg-gray-800 text-blue-600 shadow-md"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          Local Mode
        </button>
        <button
          onClick={() => setMode("onchain")}
          disabled={!isConnected}
          className={`px-4 py-2 rounded-md font-medium transition-all ${
            mode === "onchain"
              ? "bg-white dark:bg-gray-800 text-purple-600 shadow-md"
              : "text-gray-600 dark:text-gray-400"
          } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          On-Chain Mode
        </button>
      </div>

      {mode === "onchain" && !isConnected && (
        <div className="text-sm text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-lg">
          Connect your wallet to play on-chain
        </div>
      )}

      {/* Coin Display */}
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl flex items-center justify-center text-6xl font-bold text-white transition-all duration-500 ${
            isFlipping ? "animate-spin-slow" : ""
          }`}
          style={{
            transform: isFlipping 
              ? "rotateY(1800deg)" 
              : result === "tails" 
              ? "rotateY(180deg)" 
              : "rotateY(0deg)",
          }}
        >
          {!isFlipping && (result === "tails" ? "T" : "H")}
        </div>
      </div>

      {/* Result Message */}
      <p className="text-3xl font-bold text-gray-800 dark:text-white min-h-[3rem] text-center">
        {message}
      </p>

      {/* Flip Button */}
      <button
        onClick={handleFlip}
        disabled={isFlipping || isOnChainFlipping || (mode === "onchain" && !isConnected)}
        className={`px-8 py-4 ${
          mode === "onchain" 
            ? "bg-purple-600 hover:bg-purple-700" 
            : "bg-blue-600 hover:bg-blue-700"
        } disabled:bg-gray-400 text-white text-xl font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100`}
      >
        {isFlipping || isOnChainFlipping 
          ? "Flipping..." 
          : mode === "onchain" 
          ? "🔗 Flip On-Chain" 
          : "🪙 Flip Coin"}
      </button>

      {/* Stats */}
      <div className="flex gap-6 mt-8 text-center">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md min-w-[100px]">
          <div className="text-3xl font-bold text-blue-600">H</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Heads</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.heads}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md min-w-[100px]">
          <div className="text-3xl font-bold text-purple-600">T</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Tails</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.tails}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md min-w-[100px]">
          <div className="text-3xl font-bold text-green-600">∑</div>
          <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
          <div className="text-2xl font-semibold text-gray-800 dark:text-white">{stats.total}</div>
        </div>
      </div>
    </div>
  );
}
