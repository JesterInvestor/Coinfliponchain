"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { createThirdwebClient } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your_client_id_here",
});

const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? base : baseSepolia;

/**
 * Custom hook for interacting with the CoinFlip smart contract
 */
export function useCoinFlip() {
  const account = useActiveAccount();
  const [isFlipping, setIsFlipping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flipBalance, setFlipBalance] = useState<number>(0);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";
  const tokenAddress = process.env.NEXT_PUBLIC_FLIP_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

  // Get contract instance
  const contract = getContract({
    client,
    chain,
    address: contractAddress,
  });

  // Get token contract instance
  const tokenContract = getContract({
    client,
    chain,
    address: tokenAddress,
  });

  /**
   * Get FLIP token balance
   */
  const getFlipBalance = async () => {
    if (!account) {
      return 0;
    }

    try {
      const balance = await readContract({
        contract: tokenContract,
        method: "function balanceOf(address) view returns (uint256)",
        params: [account.address],
      });

      // Convert from wei to token units (assuming 18 decimals)
      const balanceInTokens = Number(balance) / 10**18;
      setFlipBalance(balanceInTokens);
      return balanceInTokens;
    } catch (err) {
      console.error("Error getting FLIP balance:", err);
      return 0;
    }
  };

  /**
   * Get token supply
   */
  const getTokenSupply = async () => {
    try {
      const supply = await readContract({
        contract: tokenContract,
        method: "function totalSupply() view returns (uint256)",
        params: [],
      });

      return Number(supply) / 10**18;
    } catch (err) {
      console.error("Error getting token supply:", err);
      return 0;
    }
  };

  /**
   * Approve token spending
   */
  const approveTokens = async (amount: number) => {
    if (!account) {
      setError("Please connect your wallet first");
      return null;
    }

    try {
      const amountInWei = BigInt(Math.floor(amount * 10**18));
      
      const transaction = prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [contractAddress, amountInWei],
      });

      const result = await sendTransaction({
        account,
        transaction,
      });

      return result;
    } catch (err) {
      console.error("Error approving tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to approve tokens");
      return null;
    }
  };

  /**
   * Place a bet
   * @param amount Amount to bet
   * @param choice true for heads, false for tails
   */
  const placeBet = async (amount: number, choice: boolean) => {
    if (!account) {
      setError("Please connect your wallet first");
      return null;
    }

    try {
      setIsFlipping(true);
      setError(null);

      const amountInWei = BigInt(Math.floor(amount * 10**18));

      // First approve tokens
      await approveTokens(amount);

      // Prepare the contract call
      const transaction = prepareContractCall({
        contract,
        method: "function placeBet(uint256 _amount, bool _choice) returns (uint256)",
        params: [amountInWei, choice],
      });

      // Send the transaction
      const result = await sendTransaction({
        account,
        transaction,
      });

      console.log("Transaction sent:", result.transactionHash);
      
      // Update balance after bet
      await getFlipBalance();
      
      return result;
    } catch (err) {
      console.error("Error placing bet:", err);
      setError(err instanceof Error ? err.message : "Failed to place bet");
      return null;
    } finally {
      setIsFlipping(false);
    }
  };

  /**
   * Get player statistics from the contract
   */
  const getPlayerStats = async (playerAddress: string) => {
    try {
      const stats = await readContract({
        contract,
        method: "function getPlayerStats(address) view returns (uint256, uint256, uint256, uint256, uint256, uint256)",
        params: [playerAddress],
      });
      
      return {
        wins: Number(stats[0]),
        losses: Number(stats[1]),
        total: Number(stats[2]),
        wagered: Number(stats[3]) / 10**18,
        won: Number(stats[4]) / 10**18,
        activeBets: Number(stats[5]),
      };
    } catch (err) {
      console.error("Error getting player stats:", err);
      return { wins: 0, losses: 0, total: 0, wagered: 0, won: 0, activeBets: 0 };
    }
  };

  /**
   * Get platform fee info
   */
  const getPlatformFeeInfo = async () => {
    try {
      const feeInfo = await readContract({
        contract,
        method: "function getPlatformFeeInfo() view returns (address, uint16)",
        params: [],
      });
      
      return {
        recipient: feeInfo[0],
        bps: Number(feeInfo[1]),
      };
    } catch (err) {
      console.error("Error getting platform fee info:", err);
      return { recipient: "", bps: 0 };
    }
  };

  // Load balance on mount and account change
  useEffect(() => {
    if (account) {
      getFlipBalance();
    }
  }, [account]);

  return {
    placeBet,
    getPlayerStats,
    getFlipBalance,
    getTokenSupply,
    getPlatformFeeInfo,
    approveTokens,
    flipBalance,
    isFlipping,
    error,
    isConnected: !!account,
    account,
  };
}
