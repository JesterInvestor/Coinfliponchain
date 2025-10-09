"use client";

import { useState } from "react";

interface CreatorSupportProps {
  userAddress?: string;
  onTipCreator?: (creatorAddress: string, amount: number) => Promise<void>;
}

export default function CreatorSupport({ userAddress, onTipCreator }: CreatorSupportProps) {
  const [tipAmount, setTipAmount] = useState<number>(1000);
  const [customCreatorAddress, setCustomCreatorAddress] = useState<string>("");
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [isTipping, setIsTipping] = useState(false);

  const handleTipCreator = async () => {
    const targetAddress = customCreatorAddress;
    
    if (!targetAddress || !tipAmount) {
      alert("Please enter a creator address and tip amount");
      return;
    }

    if (!userAddress) {
      alert("Please connect your wallet first");
      return;
    }

    setIsTipping(true);
    try {
      if (onTipCreator) {
        await onTipCreator(targetAddress, tipAmount);
        alert(`Successfully tipped ${tipAmount} $FLIP to creator!`);
      }
    } catch (error) {
      console.error("Error tipping creator:", error);
      alert("Failed to tip creator. Please try again.");
    } finally {
      setIsTipping(false);
    }
  };

  const generateReferralCode = () => {
    if (!userAddress) return "";
    return userAddress.slice(0, 10).toUpperCase();
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${generateReferralCode()}`;
    navigator.clipboard.writeText(referralLink);
    alert("Referral link copied to clipboard!");
  };

  return (
    <div className="w-full space-y-6">
      {/* Creator Support Header */}
      <div className="bg-gradient-to-r from-stone-700 to-stone-800 rounded-xl p-4 text-white border border-stone-900">
        <h2 className="text-2xl font-bold mb-2">💝 Support Creators</h2>
        <p className="text-sm opacity-90">
          Tip your favorite creators and earn rewards through referrals
        </p>
      </div>

      {/* Custom Creator Address */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-neutral-800 dark:text-white">
          Enter Creator Address
        </label>
        <input
          type="text"
          value={customCreatorAddress}
          onChange={(e) => {
            setCustomCreatorAddress(e.target.value);
          }}
          placeholder="0x..."
          className="w-full p-3 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:border-stone-600 focus:ring-2 focus:ring-stone-500"
        />
      </div>

      {/* Tip Amount */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-neutral-800 dark:text-white">
          Tip Amount ($FLIP)
        </label>
        <div className="flex gap-2">
          {[1000, 5000, 10000, 50000].map((amount) => (
            <button
              key={amount}
              onClick={() => setTipAmount(amount)}
              className={`flex-1 p-3 rounded-lg font-semibold transition-all border-2 ${
                tipAmount === amount
                  ? "bg-stone-700 text-white scale-105 border-stone-800"
                  : "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-900/30 border-neutral-300 dark:border-neutral-600"
              }`}
            >
              {amount.toLocaleString()}
            </button>
          ))}
        </div>
        <input
          type="number"
          value={tipAmount}
          onChange={(e) => setTipAmount(Number(e.target.value))}
          min="100"
          className="w-full p-3 rounded-lg border-2 border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-white focus:border-stone-600 focus:ring-2 focus:ring-stone-500"
        />
      </div>

      {/* Tip Button */}
      <button
        onClick={handleTipCreator}
        disabled={isTipping || !customCreatorAddress}
        className="w-full py-4 bg-gradient-to-r from-stone-700 to-stone-800 hover:from-stone-800 hover:to-stone-900 disabled:from-neutral-400 disabled:to-neutral-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:cursor-not-allowed"
      >
        {isTipping ? "Sending Tip..." : `💝 Tip ${tipAmount.toLocaleString()} $FLIP`}
      </button>

      {/* Referral System */}
      <div className="bg-gradient-to-r from-neutral-100 to-stone-100 dark:from-neutral-900/30 dark:to-stone-900/30 rounded-xl p-4 border border-neutral-300 dark:border-neutral-700">
        <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2">
          🎁 Become a Creator
        </h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          Share your referral link and earn 5% of all bets placed by your referrals!
        </p>
        
        {userAddress && (
          <>
            <button
              onClick={() => setShowReferralCode(!showReferralCode)}
              className="w-full py-3 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-lg mb-2"
            >
              {showReferralCode ? "Hide" : "Show"} My Referral Code
            </button>
            
            {showReferralCode && (
              <div className="space-y-2">
                <div className="bg-white dark:bg-neutral-800 rounded-lg p-3 border border-neutral-300 dark:border-neutral-600">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">Your Referral Code:</p>
                  <p className="font-mono font-bold text-lg text-neutral-800 dark:text-white">
                    {generateReferralCode()}
                  </p>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="w-full py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-white font-semibold rounded-lg border border-neutral-300 dark:border-neutral-600"
                >
                  📋 Copy Referral Link
                </button>
              </div>
            )}
          </>
        )}
        
        {!userAddress && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
            Connect your wallet to get your referral link
          </p>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-xl p-4 border border-neutral-300 dark:border-neutral-700">
        <h3 className="text-lg font-bold text-neutral-800 dark:text-white mb-2">
          How Creator Support Works
        </h3>
        <ul className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <li className="flex items-start gap-2">
            <span>💰</span>
            <span>Tip your favorite creators directly with $FLIP tokens</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🔗</span>
            <span>Share your referral link to become a creator</span>
          </li>
          <li className="flex items-start gap-2">
            <span>🎯</span>
            <span>Earn 5% of all bets placed by users who join through your link</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📈</span>
            <span>Track your earnings and supporter count</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
