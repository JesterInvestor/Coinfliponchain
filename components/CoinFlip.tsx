"use client";

import { useState } from "react";

type CoinSide = "heads" | "tails";

export default function CoinFlip() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [message, setMessage] = useState("Ready to flip!");
  const [stats, setStats] = useState({ heads: 0, tails: 0, total: 0 });

  const flipCoin = () => {
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

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
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
      <p className="text-3xl font-bold text-gray-800 dark:text-white min-h-[3rem]">
        {message}
      </p>

      {/* Flip Button */}
      <button
        onClick={flipCoin}
        disabled={isFlipping}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-xl font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {isFlipping ? "Flipping..." : "Flip Coin"}
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
