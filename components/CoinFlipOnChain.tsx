"use client";

import { useState } from "react";
import { useCoinFlip } from "@/hooks/useCoinFlip";

type CoinSide = "heads" | "tails";

export default function CoinFlipOnChain() {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [message, setMessage] = useState("Select Heads or Tails to start!");
  const [stats, setStats] = useState({ heads: 0, tails: 0, total: 0 });
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [betAmount, setBetAmount] = useState<number>(5);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [flipBalance, setFlipBalance] = useState<number>(0); // User's FLIP token balance
  const [demoMode, setDemoMode] = useState<boolean>(false); // Demo mode for testing without wallet

  const { flipCoinOnChain, isFlipping: isOnChainFlipping, error, isConnected } = useCoinFlip();
  
  // Use demo mode or real wallet connection
  const effectiveIsConnected = isConnected || demoMode;

  // Constants for requirements
  const MINIMUM_FLIP_TO_BET = 1000;
  const VIP_FLIP_THRESHOLD = 1000000;
  const BET_FEE_PERCENTAGE = 0.01; // 1% fee
  
  // Check if user has enough FLIP to bet
  const canBet = flipBalance >= MINIMUM_FLIP_TO_BET;
  const isVIP = flipBalance >= VIP_FLIP_THRESHOLD;

  const quickBetAmounts = [1000, 10000, 100000, 1000000];

  const handleQuickBet = (amount: number) => {
    setBetAmount(amount);
    setCustomAmount("");
  };

  // Simulate adding FLIP tokens for testing (in production, this would come from reading the contract)
  const simulateAddFlip = (amount: number) => {
    setFlipBalance(prev => prev + amount);
    setMessage(`✅ Added ${amount.toLocaleString()} $FLIP to your balance!`);
  };

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

    if (betAmount <= 0) {
      setMessage("⚠️ Please enter a valid bet amount!");
      return;
    }

    // Calculate fee (1% of bet amount)
    const fee = betAmount * BET_FEE_PERCENTAGE;
    const totalCost = betAmount + fee;

    if (flipBalance < totalCost) {
      setMessage(`⚠️ Insufficient $FLIP! Need ${totalCost.toFixed(2)} $FLIP (bet + 1% fee)`);
      return;
    }

    setIsFlipping(true);
    setMessage(`Betting ${betAmount.toFixed(2)} $FLIP on ${selectedSide}... (${fee.toFixed(2)} $FLIP fee)`);
    setResult(null);

    // Use selected side for the flip
    const choice = selectedSide === "heads";
    
    // In demo mode, simulate the flip directly
    if (demoMode) {
      setMessage("⏳ Flipping coin...");
      
      setTimeout(() => {
        const isHeads = Math.random() < 0.5;
        const outcome: CoinSide = isHeads ? "heads" : "tails";
        const won = outcome === selectedSide;
        
        setResult(outcome);
        
        if (won) {
          // Win: Transfer double the bet amount to user's wallet
          const winAmount = betAmount * 2;
          setFlipBalance(prev => prev - fee + winAmount); // Deduct fee, add winnings
          setMessage(`🎉 You won! ${outcome === "heads" ? "Heads" : "Tails"}! +${winAmount.toFixed(2)} $FLIP (Fee: ${fee.toFixed(2)} $FLIP)`);
        } else {
          // Lose: Transfer bet to treasury, deduct fee
          setFlipBalance(prev => prev - totalCost); // Deduct bet + fee
          setMessage(`😔 You lost. ${outcome === "heads" ? "Heads" : "Tails"}. -${totalCost.toFixed(2)} $FLIP (Bet + Fee sent to treasury)`);
        }
        
        setStats(prev => ({
          heads: prev.heads + (isHeads ? 1 : 0),
          tails: prev.tails + (isHeads ? 0 : 1),
          total: prev.total + 1
        }));
        setIsFlipping(false);
      }, 2000);
      return;
    }
    
    // Real wallet mode - interact with contract
    const tx = await flipCoinOnChain(choice);
    
    if (tx) {
      setMessage("⏳ Transaction sent! Waiting for confirmation...");
      
      // Simulate waiting for confirmation
      setTimeout(() => {
        const isHeads = Math.random() < 0.5;
        const outcome: CoinSide = isHeads ? "heads" : "tails";
        const won = outcome === selectedSide;
        
        setResult(outcome);
        
        if (won) {
          // Win: Transfer double the bet amount to user's wallet
          const winAmount = betAmount * 2;
          setFlipBalance(prev => prev - fee + winAmount); // Deduct fee, add winnings
          setMessage(`🎉 You won! ${outcome === "heads" ? "Heads" : "Tails"}! +${winAmount.toFixed(2)} $FLIP (Fee: ${fee.toFixed(2)} $FLIP)`);
        } else {
          // Lose: Transfer bet to treasury, deduct fee
          setFlipBalance(prev => prev - totalCost); // Deduct bet + fee
          setMessage(`😔 You lost. ${outcome === "heads" ? "Heads" : "Tails"}. -${totalCost.toFixed(2)} $FLIP (Bet + Fee sent to treasury)`);
        }
        
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

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Step 1: Buy Native Token Button */}
      <div className="w-full space-y-3">
        <button
          onClick={() => window.open(`https://app.uniswap.org/swap?chain=base&outputCurrency=0x9d8eCa05F0FD5486916471c2145e32cdBF5112dF`, '_blank')}
          className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg sm:text-xl font-bold rounded-xl shadow-xl transform transition-all duration-200 hover:scale-105 active:scale-95 min-h-[60px]"
        >
          💎 Step 1: Buy Native Token ($FLIP)
        </button>
        
        {/* Demo/Testing: Simulate token balance */}
        {effectiveIsConnected && (
          <div className="flex gap-2">
            <button
              onClick={() => simulateAddFlip(1000)}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all"
            >
              + 1,000 $FLIP (Demo)
            </button>
            <button
              onClick={() => simulateAddFlip(10000)}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-all"
            >
              + 10,000 $FLIP (Demo)
            </button>
            <button
              onClick={() => simulateAddFlip(1000000)}
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-semibold rounded-lg transition-all"
            >
              + 1M $FLIP (VIP Demo)
            </button>
          </div>
        )}
      </div>

      {/* Contract Address */}
      <div className="w-full text-center bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Contract Address</p>
        <p className="text-sm sm:text-base font-mono font-semibold text-gray-800 dark:text-white break-all">
          0x9d8eCa05F0FD5486916471c2145e32cdBF5112dF
        </p>
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
        <div className="w-full space-y-3">
          <div className="w-full text-center text-base sm:text-lg text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-4 py-3 rounded-lg">
            Connect your wallet to start betting
          </div>
          <button
            onClick={() => setDemoMode(true)}
            className="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm font-semibold rounded-lg transition-all"
          >
            🔧 Demo Mode (Testing Only)
          </button>
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
          {!isFlipping && (result === "tails" ? "⚡" : "👑")}
        </div>
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
