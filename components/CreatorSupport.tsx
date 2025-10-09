"use client";

import { useState } from "react";

interface Creator {
  address: string;
  name: string;
  avatar: string;
  totalSupport: number;
  supporters: number;
}

interface CreatorSupportProps {
  userAddress?: string;
  onTipCreator?: (creatorAddress: string, amount: number) => Promise<void>;
}

export default function CreatorSupport({ userAddress, onTipCreator }: CreatorSupportProps) {
  const [selectedCreator, setSelectedCreator] = useState<string>("");
  const [tipAmount, setTipAmount] = useState<number>(1000);
  const [customCreatorAddress, setCustomCreatorAddress] = useState<string>("");
  const [showReferralCode, setShowReferralCode] = useState(false);
  const [isTipping, setIsTipping] = useState(false);

  // Featured creators (could be loaded from API/contract)
  const featuredCreators: Creator[] = [
    {
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
      name: "CryptoKing",
      avatar: "👑",
      totalSupport: 50000,
      supporters: 42
    },
    {
      address: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
      name: "FlipMaster",
      avatar: "🎲",
      totalSupport: 35000,
      supporters: 28
    },
    {
      address: "0xdD2FD4581271e230360230F9337D5c0430Bf44C0",
      name: "LuckyWhale",
      avatar: "🐋",
      totalSupport: 75000,
      supporters: 61
    }
  ];

  const handleTipCreator = async () => {
    const targetAddress = selectedCreator || customCreatorAddress;
    
    if (!targetAddress || !tipAmount) {
      alert("Please select a creator and enter a tip amount");
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
      <div className="bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl p-4 text-white">
        <h2 className="text-2xl font-bold mb-2">💝 Support Creators</h2>
        <p className="text-sm opacity-90">
          Tip your favorite creators and earn rewards through referrals
        </p>
      </div>

      {/* Featured Creators */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Featured Creators</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {featuredCreators.map((creator) => (
            <button
              key={creator.address}
              onClick={() => setSelectedCreator(creator.address)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedCreator === creator.address
                  ? "bg-pink-100 dark:bg-pink-900/30 border-pink-500 scale-105"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-pink-300"
              }`}
            >
              <div className="text-4xl mb-2">{creator.avatar}</div>
              <h4 className="font-bold text-gray-800 dark:text-white">{creator.name}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                {creator.address.slice(0, 10)}...
              </p>
              <div className="mt-2 text-sm">
                <p className="text-pink-600 dark:text-pink-400 font-semibold">
                  {creator.totalSupport.toLocaleString()} $FLIP
                </p>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {creator.supporters} supporters
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Creator Address */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800 dark:text-white">
          Or Enter Creator Address
        </label>
        <input
          type="text"
          value={customCreatorAddress}
          onChange={(e) => {
            setCustomCreatorAddress(e.target.value);
            setSelectedCreator("");
          }}
          placeholder="0x..."
          className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Tip Amount */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-800 dark:text-white">
          Tip Amount ($FLIP)
        </label>
        <div className="flex gap-2">
          {[1000, 5000, 10000, 50000].map((amount) => (
            <button
              key={amount}
              onClick={() => setTipAmount(amount)}
              className={`flex-1 p-3 rounded-lg font-semibold transition-all ${
                tipAmount === amount
                  ? "bg-pink-600 text-white scale-105"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-pink-100 dark:hover:bg-pink-900/30"
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
          className="w-full p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-pink-500 focus:ring-2 focus:ring-pink-500"
        />
      </div>

      {/* Tip Button */}
      <button
        onClick={handleTipCreator}
        disabled={isTipping || (!selectedCreator && !customCreatorAddress)}
        className="w-full py-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg transition-all disabled:cursor-not-allowed"
      >
        {isTipping ? "Sending Tip..." : `💝 Tip ${tipAmount.toLocaleString()} $FLIP`}
      </button>

      {/* Referral System */}
      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
          🎁 Become a Creator
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Share your referral link and earn 5% of all bets placed by your referrals!
        </p>
        
        {userAddress && (
          <>
            <button
              onClick={() => setShowReferralCode(!showReferralCode)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg mb-2"
            >
              {showReferralCode ? "Hide" : "Show"} My Referral Code
            </button>
            
            {showReferralCode && (
              <div className="space-y-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Referral Code:</p>
                  <p className="font-mono font-bold text-lg text-gray-800 dark:text-white">
                    {generateReferralCode()}
                  </p>
                </div>
                <button
                  onClick={copyReferralLink}
                  className="w-full py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold rounded-lg"
                >
                  📋 Copy Referral Link
                </button>
              </div>
            )}
          </>
        )}
        
        {!userAddress && (
          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
            Connect your wallet to get your referral link
          </p>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
          How Creator Support Works
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
