"use client";

import { useState, useEffect } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  requirement: number;
  unlocked: boolean;
  category: "bets" | "wins" | "volume" | "streak";
}

interface AchievementsProps {
  totalBets: number;
  totalWins: number;
  totalVolume: number;
  currentStreak?: number;
}

export default function Achievements({ totalBets, totalWins, totalVolume, currentStreak = 0 }: AchievementsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([
    // Betting Milestones
    { id: "first_bet", title: "First Flip", description: "Place your first bet", icon: "🎲", requirement: 1, unlocked: false, category: "bets" },
    { id: "bronze_bettor", title: "Bronze Bettor", description: "Place 10 bets", icon: "🥉", requirement: 10, unlocked: false, category: "bets" },
    { id: "silver_bettor", title: "Silver Bettor", description: "Place 50 bets", icon: "🥈", requirement: 50, unlocked: false, category: "bets" },
    { id: "gold_bettor", title: "Gold Bettor", description: "Place 100 bets", icon: "🥇", requirement: 100, unlocked: false, category: "bets" },
    { id: "diamond_bettor", title: "Diamond Bettor", description: "Place 500 bets", icon: "💎", requirement: 500, unlocked: false, category: "bets" },
    
    // Win Achievements
    { id: "first_win", title: "Lucky Beginner", description: "Win your first bet", icon: "🍀", requirement: 1, unlocked: false, category: "wins" },
    { id: "win_streak_3", title: "Triple Win", description: "Win 3 bets in a row", icon: "🔥", requirement: 3, unlocked: false, category: "streak" },
    { id: "win_streak_5", title: "Hot Streak", description: "Win 5 bets in a row", icon: "⚡", requirement: 5, unlocked: false, category: "streak" },
    { id: "win_streak_10", title: "Unstoppable", description: "Win 10 bets in a row", icon: "👑", requirement: 10, unlocked: false, category: "streak" },
    
    // Volume Achievements
    { id: "whale_10k", title: "Small Whale", description: "Bet 10,000 $FLIP total", icon: "🐋", requirement: 10000, unlocked: false, category: "volume" },
    { id: "whale_100k", title: "Big Whale", description: "Bet 100,000 $FLIP total", icon: "🐳", requirement: 100000, unlocked: false, category: "volume" },
    { id: "whale_1m", title: "Mega Whale", description: "Bet 1,000,000 $FLIP total", icon: "🦈", requirement: 1000000, unlocked: false, category: "volume" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newlyUnlockedAchievement, setNewlyUnlockedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      let currentValue = 0;
      
      switch (achievement.category) {
        case "bets":
          currentValue = totalBets;
          break;
        case "wins":
          currentValue = totalWins;
          break;
        case "volume":
          currentValue = totalVolume;
          break;
        case "streak":
          currentValue = currentStreak;
          break;
      }
      
      const shouldUnlock = currentValue >= achievement.requirement;
      
      // Check if this is a new unlock
      if (shouldUnlock && !achievement.unlocked) {
        setNewlyUnlockedAchievement(achievement);
        setShowModal(true);
        setTimeout(() => setShowModal(false), 5000);
      }
      
      return { ...achievement, unlocked: shouldUnlock };
    });
    
    setAchievements(updatedAchievements);
  }, [totalBets, totalWins, totalVolume, currentStreak]);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <div className="w-full space-y-4">
      {/* Achievement Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white">
        <h2 className="text-2xl font-bold mb-2">🏆 Achievements</h2>
        <p className="text-sm opacity-90">
          Unlocked: {unlockedCount} / {totalCount}
        </p>
        <div className="w-full bg-white/20 rounded-full h-2 mt-2">
          <div 
            className="bg-white h-2 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              achievement.unlocked
                ? "bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 border-yellow-400"
                : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 opacity-60"
            }`}
          >
            <div className="text-3xl mb-2 text-center">{achievement.icon}</div>
            <h3 className={`text-sm font-bold text-center mb-1 ${
              achievement.unlocked ? "text-yellow-800 dark:text-yellow-200" : "text-gray-600 dark:text-gray-400"
            }`}>
              {achievement.title}
            </h3>
            <p className="text-xs text-center text-gray-600 dark:text-gray-400">
              {achievement.description}
            </p>
            {achievement.unlocked && (
              <div className="absolute top-2 right-2">
                <span className="text-green-500 text-lg">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Achievement Modal */}
      {showModal && newlyUnlockedAchievement && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-2xl animate-bounce pointer-events-auto max-w-sm mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">{newlyUnlockedAchievement.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">Achievement Unlocked!</h3>
              <p className="text-xl font-semibold text-white">{newlyUnlockedAchievement.title}</p>
              <p className="text-sm text-white/90 mt-2">{newlyUnlockedAchievement.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
