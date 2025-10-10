"use client";

import { useEffect, useMemo, useState } from "react";
import { useSwapper } from "@/hooks/useSwapper";
import { useCoinFlip } from "@/hooks/useCoinFlip";

interface QuestStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  action?: string;
  requirement?: number; // in FLIP tokens
}

interface SwapTransaction {
  from: string;
  amount: number; // FLIP amount
  timestamp: number;
  txHash: string;
}

export default function SwappingQuest() {
  const { flipBalance, isConnected, account, transferTokens, getFlipBalance, error: transferError } = useCoinFlip();
  const { swapUSDCToFLIP, isSwapping: isOnchainSwapping, error: swapError, usdcBalance, allowance, refreshUsdcStatus, approveUsdcMax, isApproving } = useSwapper();

  // Quest state
  const [questSteps, setQuestSteps] = useState<QuestStep[]>(
    [
      { id: 1, title: "Connect Your Wallet", description: "Connect your Web3 wallet to get started", icon: "🔗", completed: false },
      { id: 2, title: "Check $FLIP Balance", description: "Ensure you have at least 10,000 $FLIP tokens", icon: "💰", completed: false, requirement: 10000 },
      { id: 3, title: "Perform First Swap", description: "Swap 10,000 $FLIP to complete this quest step", icon: "🔄", completed: false, action: "swap", requirement: 10000 },
      { id: 4, title: "Complete Advanced Swap", description: "Swap 100,000 $FLIP for advanced completion", icon: "⚡", completed: false, action: "swap", requirement: 100000 },
      { id: 5, title: "Quest Master", description: "Swap 1,000,000 $FLIP to become a Quest Master", icon: "👑", completed: false, action: "swap", requirement: 1000000 },
    ]
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [swapHistory, setSwapHistory] = useState<SwapTransaction[]>([]);
  const [totalSwapped, setTotalSwapped] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedStepTitle, setCompletedStepTitle] = useState("");
  const [message, setMessage] = useState<string>("");
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);

  // USDC purchase state (estimation only + external DEX link)
  const [usdAmount, setUsdAmount] = useState<number>(10);
  const [estimatedFlip, setEstimatedFlip] = useState<number | null>(null);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);

  // Addresses
  const DEFAULT_QUEST_ADDRESS = "0x0000000000000000000000000000000000000001"; // fallback
  const FLIP_ADDRESS = process.env.NEXT_PUBLIC_FLIP_TOKEN_ADDRESS || "";
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x833589fCD6eDb6E08f4c7C32D4f71b54bd4f71fE"; // Base USDC

  // Derived
  const progressPct = useMemo(() => {
    const completedCount = questSteps.filter((s) => s.completed).length;
    return (completedCount / questSteps.length) * 100;
  }, [questSteps]);

  // Initial load: history
  useEffect(() => {
    const stored = localStorage.getItem("swapQuestHistory");
    if (stored) {
      const history: SwapTransaction[] = JSON.parse(stored);
      setSwapHistory(history);
      const total = history.reduce((sum, tx) => sum + tx.amount, 0);
      setTotalSwapped(total);
    }
  }, []);

  // Step completion updates
  useEffect(() => {
    const updated = questSteps.map((step) => {
      if (step.id === 1) return { ...step, completed: isConnected };
      if (step.id === 2) return { ...step, completed: isConnected && flipBalance >= (step.requirement || 0) };
      if (step.id === 3) return { ...step, completed: totalSwapped >= 10000 };
      if (step.id === 4) return { ...step, completed: totalSwapped >= 100000 };
      if (step.id === 5) return { ...step, completed: totalSwapped >= 1000000 };
      return step;
    });
    setQuestSteps(updated);
    const firstIncomplete = updated.find((s) => !s.completed);
    setCurrentStep(firstIncomplete ? firstIncomplete.id : 6);
  }, [isConnected, flipBalance, totalSwapped]);

  // USDC -> FLIP estimate via 0x (Base)
  useEffect(() => {
    const fetchEstimate = async () => {
      if (!FLIP_ADDRESS || !usdAmount || usdAmount <= 0) {
        setEstimatedFlip(null);
        return;
      }
      try {
        setIsEstimating(true);
        const sellAmount = Math.floor(usdAmount * 1_000_000); // USDC 6 decimals
        const url = `https://base.api.0x.org/swap/v1/price?sellToken=${USDC_ADDRESS}&buyToken=${FLIP_ADDRESS}&sellAmount=${sellAmount}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Quote failed: ${res.status}`);
        const data = await res.json();
        const flip = Number(BigInt(data.buyAmount)) / 1e18; // assume FLIP 18 decimals
        setEstimatedFlip(flip);
      } catch (e) {
        console.error("USDC->FLIP quote error:", e);
        setEstimatedFlip(null);
      } finally {
        setIsEstimating(false);
      }
    };
    fetchEstimate();
  }, [usdAmount, FLIP_ADDRESS, USDC_ADDRESS]);

  // Refresh USDC status when connected
  useEffect(() => {
    if (isConnected) {
      refreshUsdcStatus();
    }
  }, [isConnected, refreshUsdcStatus]);

  // Perform a tracked FLIP transfer (quest swap)
  const handleSwap = async (amount: number) => {
    if (!isConnected) { setMessage("❌ Please connect your wallet first"); return; }
    if (amount < 10000) { setMessage("❌ Minimum swap amount is 10,000 $FLIP"); return; }
    if (flipBalance < amount) { setMessage(`❌ Insufficient balance. You need ${amount.toLocaleString()} $FLIP`); return; }

    const recipient = recipientAddress || DEFAULT_QUEST_ADDRESS;
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) { setMessage("❌ Invalid recipient address format"); return; }

    try {
      setIsSwapping(true);
      setMessage("⏳ Processing swap transaction...");
      const result = await transferTokens(recipient, amount);
      if (result) {
        const tx: SwapTransaction = { from: account?.address || "", amount, timestamp: Date.now(), txHash: result.transactionHash };
        const updated = [...swapHistory, tx];
        setSwapHistory(updated);
        localStorage.setItem("swapQuestHistory", JSON.stringify(updated));
        const newTotal = totalSwapped + amount;
        setTotalSwapped(newTotal);
        const stepCompleted = questSteps.find((s) => s.requirement && newTotal >= s.requirement && totalSwapped < s.requirement);
        if (stepCompleted) {
          setCompletedStepTitle(stepCompleted.title);
          setShowSuccessModal(true);
          setTimeout(() => setShowSuccessModal(false), 5000);
        }
        setMessage(`✅ Swap successful! ${amount.toLocaleString()} $FLIP swapped`);
        await getFlipBalance();
      } else {
        setMessage("❌ Swap failed. Please try again");
      }
    } catch (err) {
      console.error("Swap error:", err);
      setMessage(transferError || "❌ Swap transaction failed");
    } finally {
      setIsSwapping(false);
    }
  };

  const quickUsd = [10, 20, 100];

  const openBuyWithUSDC = () => {
    const url = `https://matcha.xyz/markets/base/${USDC_ADDRESS}/${FLIP_ADDRESS}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-yellow-800 rounded-xl p-6 text-white border border-amber-900">
        <h2 className="text-3xl font-bold mb-2">🔄 $FLIP Swapping Quest</h2>
        <p className="text-sm opacity-90 mb-4">Complete swapping challenges and master the art of on-chain token swaps</p>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div className="bg-white h-3 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-xs mt-2 opacity-80">Progress: {questSteps.filter((s) => s.completed).length} / {questSteps.length} steps completed</p>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuccessModal(false)} />
          <div className="relative bg-gradient-to-br from-amber-600 to-yellow-700 rounded-2xl p-8 shadow-2xl animate-bounce border-4 border-amber-900">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Quest Step Completed!</h3>
              <p className="text-lg">{completedStepTitle}</p>
              <button onClick={() => setShowSuccessModal(false)} className="mt-4 px-6 py-2 bg-white text-amber-800 rounded-lg font-semibold hover:bg-neutral-100">Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total Swapped</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{totalSwapped.toLocaleString()} $FLIP</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 shadow-md border border-neutral-200 dark:border-neutral-700">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Swap Count</p>
          <p className="text-2xl font-bold text-stone-700 dark:text-stone-400">{swapHistory.length}</p>
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {questSteps.map((step) => (
          <div key={step.id} className={`p-4 rounded-lg border-2 transition-all ${step.completed ? "bg-amber-50 dark:bg-amber-900/20 border-amber-600" : step.id === currentStep ? "bg-stone-50 dark:bg-stone-900/20 border-stone-600 shadow-lg" : "bg-neutral-50 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-600"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-3xl">{step.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-neutral-800 dark:text-white">{step.title}</h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">{step.description}</p>
                  {step.requirement && (<p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">Requirement: {step.requirement.toLocaleString()} $FLIP</p>)}
                </div>
              </div>
              <div>
                {step.completed ? (
                  <div className="bg-amber-700 text-white rounded-full p-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </div>
                ) : step.id === currentStep ? (
                  <div className="bg-stone-700 text-white rounded-full px-3 py-1 text-sm font-semibold">Active</div>
                ) : (
                  <div className="bg-neutral-300 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-400 rounded-full p-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"/></svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Purchase Interface (USDC → $FLIP estimate + link) */}
      {isConnected ? (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg space-y-4 border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-4">💳 Buy $FLIP with USDC</h3>

          {/* Balance */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-300 dark:border-amber-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Your $FLIP Balance</p>
            <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{flipBalance.toLocaleString()} $FLIP</p>
          </div>

          {/* USDC status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Your USDC Balance</p>
              <p className="text-xl font-bold text-neutral-800 dark:text-white">{(Number(usdcBalance) / 1_000_000).toLocaleString()} USDC</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">USDC Allowance → Swapper</p>
              <p className="text-xs font-mono text-neutral-700 dark:text-neutral-300 break-all">{String(allowance)}</p>
            </div>
          </div>

          {/* Quick USDC */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Quick Purchase Amounts (USDC)</label>
            <div className="grid grid-cols-3 gap-2">
              {quickUsd.map((amount) => (
                <button key={amount} onClick={() => setUsdAmount(amount)} className={`py-3 px-4 rounded-lg font-semibold transition-all border-2 ${usdAmount === amount ? "bg-amber-700 text-white shadow-md border-amber-800" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-600 border-neutral-300 dark:border-neutral-600"}`}>
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Custom USDC */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Or Enter Custom Amount (USDC)</label>
            <input type="number" value={usdAmount} min={1} onChange={(e) => setUsdAmount(Number(e.target.value))} placeholder="USDC" className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:border-amber-600 focus:outline-none" />
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">{isEstimating ? "Estimating $FLIP amount..." : estimatedFlip ? `You will receive approximately ${estimatedFlip.toLocaleString()} $FLIP` : "Estimated $FLIP will appear here"}</p>
          </div>

          {/* Recipient (optional) */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2">Recipient Address (Optional)</label>
            <input type="text" value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder="0x... (leave empty for quest default)" className="w-full px-4 py-3 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-800 dark:text-white focus:border-amber-600 focus:outline-none font-mono text-sm" />
          </div>

          {/* On-chain swap via swapper */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={openBuyWithUSDC}
              className="w-full py-4 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-bold rounded-lg shadow-md transform transition-all hover:scale-105 active:scale-95 border border-neutral-300 dark:border-neutral-600"
            >
              🌐 Trade on DEX (Matcha)
            </button>
            <button
              onClick={async () => { await approveUsdcMax(); }}
              disabled={isApproving || !isConnected}
              className="w-full py-4 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-900 dark:text-white font-semibold rounded-lg shadow-sm transform transition-all active:scale-95 border border-neutral-300 dark:border-neutral-600"
            >
              {isApproving ? "Approving..." : "Approve USDC"}
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={async () => {
                setMessage("⏳ Sending on-chain swap...");
                const res = await swapUSDCToFLIP(usdAmount, recipientAddress || undefined, 50);
                if (res) {
                  setMessage(`✅ Swap submitted: ${res.txHash.slice(0, 10)}...`);
                } else {
                  setMessage(swapError || "❌ Swap failed");
                }
              }}
              disabled={isOnchainSwapping || !isConnected || usdAmount <= 0}
              className="w-full py-4 bg-gradient-to-r from-amber-700 to-yellow-800 hover:from-amber-800 hover:to-yellow-900 disabled:bg-neutral-400 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed"
            >
              {isOnchainSwapping ? "⏳ Swapping..." : "⚡ Swap via Swapper"}
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-center ${message.includes("✅") ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200" : message.includes("⏳") ? "bg-stone-100 dark:bg-stone-900/30 text-stone-800 dark:text-stone-200" : "bg-neutral-100 dark:bg-neutral-900/30 text-neutral-800 dark:text-neutral-200"}`}>{message}</div>
          )}
        </div>
      ) : (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 text-center border border-amber-300 dark:border-amber-700">
          <p className="text-amber-800 dark:text-amber-400 font-semibold">🔗 Connect your wallet to start the quest</p>
        </div>
      )}

      {/* History */}
      {swapHistory.length > 0 && (
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 shadow-lg border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-xl font-bold text-neutral-800 dark:text-white mb-4">📜 Swap History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {swapHistory.slice().reverse().map((tx, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <div>
                  <p className="font-semibold text-neutral-800 dark:text-white">{tx.amount.toLocaleString()} $FLIP</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <a href={`https://basescan.org/tx/${tx.txHash}`} target="_blank" rel="noopener noreferrer" className="text-amber-700 dark:text-amber-400 hover:underline text-sm">View TX ↗</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion */}
      {currentStep === 6 && (
        <div className="bg-gradient-to-r from-amber-600 to-yellow-700 rounded-xl p-6 text-center text-white border-4 border-amber-900">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
          <p className="text-lg">You've completed all swapping quest challenges!</p>
          <p className="text-sm mt-2 opacity-90">Total swapped: {totalSwapped.toLocaleString()} $FLIP across {swapHistory.length} transactions</p>
        </div>
      )}

      {/* Info */}
      <div className="bg-stone-50 dark:bg-stone-900/20 rounded-lg p-4 border border-stone-300 dark:border-stone-700">
        <h4 className="font-semibold text-neutral-800 dark:text-white mb-2">ℹ️ About Swapping Quests</h4>
        <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
          <li>• All swaps are recorded on-chain</li>
          <li>• Minimum $FLIP swap tracked for quests: 10,000 $FLIP</li>
          <li>• Progress is saved locally and persists across sessions</li>
          <li>• You can buy $FLIP with USDC using a DEX aggregator</li>
        </ul>
      </div>
    </div>
  );
}
