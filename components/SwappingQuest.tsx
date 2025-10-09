"use client";

import { useState, useEffect } from "react";
import { useCoinFlip } from "@/hooks/useCoinFlip";

interface QuestStep {
  id: number;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  action?: string;
  requirement?: number;
}

interface SwapTransaction {
  from: string;
  amount: number;
  timestamp: number;
  txHash: string;
}

export default function SwappingQuest() {
  const {
    flipBalance,
    isConnected,
    account,
    transferTokens,
    getFlipBalance,
    error: transferError,
  } = useCoinFlip();

  const [questSteps, setQuestSteps] = useState<QuestStep[]>([
    {
      id: 1,
      title: "Connect Your Wallet",
      description: "Connect your Web3 wallet to get started",
      icon: "🔗",
      completed: false,
    },
    {
      id: 2,
      title: "Check $FLIP Balance",
      description: "Ensure you have at least 1,000 $FLIP tokens",
      icon: "💰",
      completed: false,
      requirement: 1000,
    },
    {
      id: 3,
      title: "Perform First Swap",
      description: "Swap 1,000 $FLIP to complete this quest step",
      icon: "🔄",
      completed: false,
      action: "swap",
      requirement: 1000,
    },
    {
      id: 4,
      title: "Complete Advanced Swap",
      description: "Swap 5,000 $FLIP for advanced completion",
      icon: "⚡",
      completed: false,
      action: "swap",
      requirement: 5000,
    },
    {
      id: 5,
      title: "Quest Master",
      description: "Swap 10,000 $FLIP to become a Quest Master",
      icon: "👑",
      completed: false,
      action: "swap",
      requirement: 10000,
    },
  ]);

  const [currentStep, setCurrentStep] = useState(1);
  const [swapAmount, setSwapAmount] = useState<number>(1000);
  const [recipientAddress, setRecipientAddress] = useState<string>("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [swapHistory, setSwapHistory] = useState<SwapTransaction[]>([]);
  const [totalSwapped, setTotalSwapped] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [completedStepTitle, setCompletedStepTitle] = useState("");

  // Default recipient address for quest (treasury/demo address)
  const DEFAULT_QUEST_ADDRESS = "0x0000000000000000000000000000000000000001";

  // Update quest steps based on current state
  useEffect(() => {
    const updatedSteps = questSteps.map((step) => {
      switch (step.id) {
        case 1:
          return { ...step, completed: isConnected };
        case 2:
          return {
            ...step,
            completed: isConnected && flipBalance >= (step.requirement || 0),
          };
        case 3:
          return { ...step, completed: totalSwapped >= 1000 };
        case 4:
          return { ...step, completed: totalSwapped >= 5000 };
        case 5:
          return { ...step, completed: totalSwapped >= 10000 };
        default:
          return step;
      }
    });

    setQuestSteps(updatedSteps);

    // Find current step (first incomplete step)
    const firstIncomplete = updatedSteps.find((step) => !step.completed);
    if (firstIncomplete) {
      setCurrentStep(firstIncomplete.id);
    } else {
      setCurrentStep(6); // All completed
    }
  }, [isConnected, flipBalance, totalSwapped]);

  // Load swap history from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("swapQuestHistory");
    if (stored) {
      const history = JSON.parse(stored);
      setSwapHistory(history);
      const total = history.reduce(
        (sum: number, tx: SwapTransaction) => sum + tx.amount,
        0
      );
      setTotalSwapped(total);
    }
  }, []);

  const handleSwap = async (amount: number) => {
    if (!isConnected) {
      setMessage("❌ Please connect your wallet first");
      return;
    }

    if (flipBalance < amount) {
      setMessage(`❌ Insufficient balance. You need ${amount.toLocaleString()} $FLIP`);
      return;
    }

    if (amount < 1000) {
      setMessage("❌ Minimum swap amount is 1,000 $FLIP");
      return;
    }

    const recipient = recipientAddress || DEFAULT_QUEST_ADDRESS;

    // Validate recipient address
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) {
      setMessage("❌ Invalid recipient address format");
      return;
    }

    try {
      setIsSwapping(true);
      setMessage("⏳ Processing swap transaction...");

      const result = await transferTokens(recipient, amount);

      if (result) {
        const newTransaction: SwapTransaction = {
          from: account?.address || "",
          amount,
          timestamp: Date.now(),
          txHash: result.transactionHash,
        };

        const updatedHistory = [...swapHistory, newTransaction];
        setSwapHistory(updatedHistory);
        localStorage.setItem("swapQuestHistory", JSON.stringify(updatedHistory));

        const newTotal = totalSwapped + amount;
        setTotalSwapped(newTotal);

        // Check if any step was just completed
        const stepCompleted = questSteps.find(
          (step) =>
            step.requirement &&
            newTotal >= step.requirement &&
            totalSwapped < step.requirement
        );

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

  const getProgressPercentage = () => {
    const completedCount = questSteps.filter((s) => s.completed).length;
    return (completedCount / questSteps.length) * 100;
  };

  const quickSwapAmounts = [1000, 5000, 10000];

  return (
    <div className="w-full space-y-6">
      {/* Quest Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">🔄 $FLIP Swapping Quest</h2>
        <p className="text-sm opacity-90 mb-4">
          Complete swapping challenges and master the art of on-chain token swaps
        </p>
        <div className="w-full bg-white/20 rounded-full h-3">
          <div
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <p className="text-xs mt-2 opacity-80">
          Progress: {questSteps.filter((s) => s.completed).length} / {questSteps.length} steps completed
        </p>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSuccessModal(false)} />
          <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-8 shadow-2xl animate-bounce">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">Quest Step Completed!</h3>
              <p className="text-lg">{completedStepTitle}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="mt-4 px-6 py-2 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quest Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Swapped</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalSwapped.toLocaleString()} $FLIP
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Swap Count</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {swapHistory.length}
          </p>
        </div>
      </div>

      {/* Quest Steps */}
      <div className="space-y-3">
        {questSteps.map((step) => (
          <div
            key={step.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              step.completed
                ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                : step.id === currentStep
                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-lg"
                : "bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="text-3xl">{step.icon}</div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                  {step.requirement && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Requirement: {step.requirement.toLocaleString()} $FLIP
                    </p>
                  )}
                </div>
              </div>
              <div>
                {step.completed ? (
                  <div className="bg-green-500 text-white rounded-full p-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                ) : step.id === currentStep ? (
                  <div className="bg-blue-500 text-white rounded-full px-3 py-1 text-sm font-semibold">
                    Active
                  </div>
                ) : (
                  <div className="bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-full p-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Swap Interface */}
      {isConnected ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            🔄 Perform Swap
          </h3>

          {/* Current Balance */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Your Balance</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {flipBalance.toLocaleString()} $FLIP
            </p>
          </div>

          {/* Quick Swap Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Quick Swap Amounts
            </label>
            <div className="grid grid-cols-3 gap-2">
              {quickSwapAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSwapAmount(amount)}
                  className={`py-3 px-4 rounded-lg font-semibold transition-all ${
                    swapAmount === amount
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {amount.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Or Enter Custom Amount
            </label>
            <input
              type="number"
              value={swapAmount}
              onChange={(e) => setSwapAmount(Number(e.target.value))}
              placeholder="Enter amount"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none"
              min="1000"
            />
          </div>

          {/* Recipient Address (Optional) */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Recipient Address (Optional)
            </label>
            <input
              type="text"
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              placeholder="0x... (leave empty for quest default)"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-blue-500 focus:outline-none font-mono text-sm"
            />
          </div>

          {/* Swap Button */}
          <button
            onClick={() => handleSwap(swapAmount)}
            disabled={isSwapping || swapAmount < 1000 || swapAmount > flipBalance}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isSwapping ? "⏳ Swapping..." : `🔄 Swap ${swapAmount.toLocaleString()} $FLIP`}
          </button>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg text-center ${
                message.includes("✅")
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                  : message.includes("⏳")
                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                  : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-6 text-center">
          <p className="text-orange-600 dark:text-orange-400 font-semibold">
            🔗 Connect your wallet to start the quest
          </p>
        </div>
      )}

      {/* Swap History */}
      {swapHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
            📜 Swap History
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {swapHistory
              .slice()
              .reverse()
              .map((tx, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {tx.amount.toLocaleString()} $FLIP
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <a
                    href={`https://basescan.org/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                  >
                    View TX ↗
                  </a>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Quest Completion Message */}
      {currentStep === 6 && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl p-6 text-center text-white">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
          <p className="text-lg">
            You've completed all swapping quest challenges!
          </p>
          <p className="text-sm mt-2 opacity-90">
            Total swapped: {totalSwapped.toLocaleString()} $FLIP across {swapHistory.length} transactions
          </p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <h4 className="font-semibold text-gray-800 dark:text-white mb-2">ℹ️ About Swapping Quests</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• All swaps are executed on-chain and recorded on the blockchain</li>
          <li>• Minimum swap amount: 1,000 $FLIP</li>
          <li>• Each swap is verified and permanently stored</li>
          <li>• Progress is saved locally and persists across sessions</li>
          <li>• Only $FLIP token pairs are supported in this quest</li>
        </ul>
      </div>
    </div>
  );
}
