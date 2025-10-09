"use client";

import { useState, useEffect } from "react";
import { useCoinFlip } from "@/hooks/useCoinFlip";

type CoinSide = "heads" | "tails";

export default function CoinFlipOnChain() {
  const tokenAddress = process.env.NEXT_PUBLIC_FLIP_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";
  const bettingContractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [message, setMessage] = useState("Select Heads or Tails to start!");
  const [stats, setStats] = useState({ heads: 0, tails: 0, total: 0 });
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [betAmount, setBetAmount] = useState<number>(1000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [platformFeeBps, setPlatformFeeBps] = useState<number>(100); // 1% default
  const [showCelebration, setShowCelebration] = useState(false);
  const [useEnhancedAnimation, setUseEnhancedAnimation] = useState(true);

  const { 
    placeBet, 
    getPlayerStats, 
    getFlipBalance, 
    getTokenSupply,
    getPlatformFeeInfo,
    flipBalance, 
    isFlipping: isOnChainFlipping, 
    error, 
    isConnected,
    account 
  } = useCoinFlip();
  
  const effectiveIsConnected = isConnected;

  // Constants for requirements
  const MINIMUM_FLIP_TO_BET = 1000;
  const VIP_FLIP_THRESHOLD = 1000000;
  
  // Calculate platform fee from bps (basis points)
  const BET_FEE_PERCENTAGE = platformFeeBps / 10000;
  
  // Check if user has enough FLIP to bet
  const canBet = flipBalance >= MINIMUM_FLIP_TO_BET;
  const isVIP = flipBalance >= VIP_FLIP_THRESHOLD;

  const quickBetAmounts = [1000, 10000, 100000, 1000000];

  const handleQuickBet = (amount: number) => {
    setBetAmount(amount);
    setCustomAmount("");
  };

  // Load platform fee and stats on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const feeInfo = await getPlatformFeeInfo();
        if (feeInfo.bps > 0) {
          setPlatformFeeBps(feeInfo.bps);
        }
        
        if (account) {
          const playerStats = await getPlayerStats(account.address);
          setStats({
            heads: Math.floor(playerStats.wins / 2), // Approximate
            tails: Math.floor(playerStats.losses / 2),
            total: playerStats.total,
          });
        }
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    if (isConnected) {
      loadData();
      getFlipBalance();
    }
  }, [isConnected, account]);

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      setBetAmount(numValue);
    }
  };

  const handleFlip = async () => {
    if (!effectiveIsConnected) {
      setMessage("⚠️ Please connect your wallet first!");
      return;
    }

    if (!canBet) {
      setMessage(`⚠️ You need at least ${MINIMUM_FLIP_TO_BET.toLocaleString()} $FLIP to bet! Buy more tokens.`);
      return;
    }

    if (!selectedSide) {
      setMessage("⚠️ Please select Heads or Tails!");
      return;
    }

    if (betAmount <= 0 || betAmount < MINIMUM_FLIP_TO_BET) {
      setMessage(`⚠️ Minimum bet is ${MINIMUM_FLIP_TO_BET.toLocaleString()} $FLIP!`);
      return;
    }

    // Calculate fee (from platform fee bps)
    const fee = betAmount * BET_FEE_PERCENTAGE;

    if (flipBalance < betAmount) {
      setMessage(`⚠️ Insufficient $FLIP! You have ${flipBalance.toLocaleString()} $FLIP but need ${betAmount.toLocaleString()} $FLIP`);
      return;
    }

    setIsFlipping(true);
    setMessage(`Betting ${betAmount.toFixed(2)} $FLIP on ${selectedSide}... (${fee.toFixed(2)} $FLIP platform fee)`);
    setResult(null);

    // Use selected side for the flip
    const choice = selectedSide === "heads";
    
    try {
      // Place bet on-chain
      const tx = await placeBet(betAmount, choice);
      
      if (tx) {
        setMessage("⏳ Transaction sent! Waiting for confirmation...");
        
        // Wait a bit and then fetch updated stats
        setTimeout(async () => {
          try {
            // Refresh balance
            await getFlipBalance();
            
            // Update stats from contract
            if (account) {
              const playerStats = await getPlayerStats(account.address);
              setStats({
                heads: Math.floor(playerStats.wins / 2),
                tails: Math.floor(playerStats.losses / 2),
                total: playerStats.total,
              });
            }
            
            setMessage(`✅ Bet placed successfully! Check your transaction for results.`);
            setIsFlipping(false);
          } catch (err) {
            console.error("Error refreshing data:", err);
            setIsFlipping(false);
          }
        }, 3000);
      } else {
        setMessage(error || "❌ Transaction failed");
        setIsFlipping(false);
      }
    } catch (err) {
      console.error("Error placing bet:", err);
      setMessage("❌ Failed to place bet. Please try again.");
      setIsFlipping(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Step 1: Buy Native Token Button */}
      <div className="w-full space-y-3">
        <button
          onClick={() => window.open(`https://matcha.xyz/tokens/base/${tokenAddress}`,'_blank')}
          className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg sm:text-xl font-bold rounded-xl shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 min-h-[60px]"
        >
          💎 Buy $FLIP Tokens
        </button>
      </div>

      {/* Addresses */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="text-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">FLIP Token</p>
          <p className="text-sm sm:text-base font-mono font-semibold text-gray-800 dark:text-white break-all">
            {tokenAddress}
          </p>
        </div>
        <div className="text-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Betting Contract</p>
          <p className="text-sm sm:text-base font-mono font-semibold text-gray-800 dark:text-white break-all">
            {bettingContractAddress}
          </p>
        </div>
      </div>

      {/* User Balance and Status */}
      {effectiveIsConnected && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className={`text-center rounded-lg p-4 ${canBet ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Your $FLIP Balance</p>
            <p className={`text-xl sm:text-2xl font-bold ${canBet ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {flipBalance.toLocaleString()} $FLIP
            </p>
            {!canBet && (
              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mt-1">
                Need {MINIMUM_FLIP_TO_BET.toLocaleString()} $FLIP to bet
              </p>
            )}
          </div>
          <div className={`text-center rounded-lg p-4 ${isVIP ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Status</p>
            <p className={`text-xl sm:text-2xl font-bold ${isVIP ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {isVIP ? '👑 VIP Member' : '👤 Regular'}
            </p>
            {!isVIP && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                VIP at {VIP_FLIP_THRESHOLD.toLocaleString()} $FLIP
              </p>
            )}
          </div>
        </div>
      )}

      {!effectiveIsConnected && (
        <div className="w-full text-center text-base sm:text-lg text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-4 py-3 rounded-lg">
          Connect your wallet to start betting
        </div>
      )}

      {/* Heads or Tails Selection */}
      <div className="w-full space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 dark:text-white">
          Choose Your Side
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setSelectedSide("heads")}
            disabled={isFlipping || !effectiveIsConnected}
            className={`p-6 sm:p-8 rounded-xl font-bold text-2xl sm:text-3xl transition-all transform ${
              selectedSide === "heads"
                ? "bg-blue-600 text-white scale-105 shadow-2xl"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:scale-105 shadow-lg"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[100px] sm:min-h-[120px]`}
          >
            <div className="text-4xl sm:text-5xl mb-2">👑</div>
            <div>HEADS</div>
          </button>
          <button
            onClick={() => setSelectedSide("tails")}
            disabled={isFlipping || !effectiveIsConnected}
            className={`p-6 sm:p-8 rounded-xl font-bold text-2xl sm:text-3xl transition-all transform ${
              selectedSide === "tails"
                ? "bg-purple-600 text-white scale-105 shadow-2xl"
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:scale-105 shadow-lg"
            } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[100px] sm:min-h-[120px]`}
          >
            <div className="text-4xl sm:text-5xl mb-2">⚡</div>
            <div>TAILS</div>
          </button>
        </div>
      </div>

      {/* Quick Bet Amounts */}
      <div className="w-full space-y-3">
        <h3 className="text-xl sm:text-2xl font-bold text-center text-gray-800 dark:text-white">
          Select Bet Amount ($FLIP)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickBetAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleQuickBet(amount)}
              disabled={isFlipping || !effectiveIsConnected}
              className={`p-4 sm:p-5 rounded-lg font-bold text-lg sm:text-xl transition-all transform ${
                betAmount === amount && !customAmount
                  ? "bg-green-600 text-white scale-105 shadow-xl"
                  : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:scale-105 shadow-md"
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[70px]`}
            >
              {amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount Input */}
      <div className="w-full space-y-2">
        <label className="block text-base sm:text-lg font-semibold text-center text-gray-800 dark:text-white">
          Or Enter Custom Amount
        </label>
        <input
          type="number"
          value={customAmount}
          onChange={(e) => handleCustomAmount(e.target.value)}
          placeholder="Enter amount in $FLIP"
          disabled={isFlipping || !effectiveIsConnected}
          className="w-full p-4 text-lg sm:text-xl text-center font-semibold rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[60px]"
          step="0.01"
          min="0.01"
        />
      </div>

      {/* Coin Display */}
      <div className="relative w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center my-4">
        <div
          className={`w-full h-full rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl flex items-center justify-center text-5xl sm:text-6xl font-bold text-white transition-all duration-500 ${
            isFlipping ? (useEnhancedAnimation ? "animate-flip-3d" : "animate-spin-slow") : ""
          } ${showCelebration ? "animate-glow" : ""}`}
          style={{
            transform: isFlipping 
              ? "rotateY(1800deg)" 
              : result === "tails" 
              ? "rotateY(180deg)" 
              : "rotateY(0deg)",
          }}
        >
          {!isFlipping && (result === "tails" ? "⚡" : "👑")}
        </div>
        {/* Particle effects container */}
        {isFlipping && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180;
              const tx = Math.cos(angle) * 100;
              const ty = Math.sin(angle) * 100;
              return (
                <div
                  key={i}
                  className="particle bg-yellow-400"
                  style={{
                    left: '50%',
                    top: '50%',
                    '--tx': `${tx}px`,
                    '--ty': `${ty}px`,
                  } as React.CSSProperties}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Animation Settings */}
      <div className="w-full flex items-center justify-center gap-3 py-2">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={useEnhancedAnimation}
            onChange={(e) => setUseEnhancedAnimation(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span>Enhanced 3D Animation</span>
        </label>
      </div>

      {/* Result Message */}
      <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white min-h-[3rem] text-center px-4">
        {message}
      </p>

      {/* Flip Button */}
      <button
        onClick={handleFlip}
        disabled={isFlipping || isOnChainFlipping || !effectiveIsConnected || !selectedSide || !canBet}
        className="w-full px-8 py-5 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white text-xl sm:text-2xl font-bold rounded-xl shadow-2xl transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[70px]"
      >
        {isFlipping || isOnChainFlipping 
          ? "🎲 Flipping..." 
          : !canBet
          ? `⚠️ Need ${MINIMUM_FLIP_TO_BET.toLocaleString()} $FLIP to Bet`
          : `🎯 Bet ${betAmount.toFixed(2)} $FLIP (Fee: ${(betAmount * BET_FEE_PERCENTAGE).toFixed(2)} $FLIP)`}
      </button>

      {/* Stats */}
      <div className="w-full grid grid-cols-3 gap-4 mt-6">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg text-center">
          <div className="text-3xl sm:text-4xl font-bold text-blue-600">👑</div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">Heads</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.heads}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg text-center">
          <div className="text-3xl sm:text-4xl font-bold text-purple-600">⚡</div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">Tails</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.tails}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-xl shadow-lg text-center">
          <div className="text-3xl sm:text-4xl font-bold text-green-600">∑</div>
          <div className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">Total</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.total}</div>
        </div>
      </div>
    </div>
  );
}
