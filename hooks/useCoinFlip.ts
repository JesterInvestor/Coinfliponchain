"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
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

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000";

  // Get contract instance
  const contract = getContract({
    client,
    chain,
    address: contractAddress,
  });

  /**
   * Flip coin on-chain
   * @param choice true for heads, false for tails
   */
  const flipCoinOnChain = async (choice: boolean) => {
    if (!account) {
      setError("Please connect your wallet first");
      return null;
    }

    try {
      setIsFlipping(true);
      setError(null);

      // Prepare the contract call
      const transaction = prepareContractCall({
        contract,
        method: "function flip(bool _choice) returns (uint256)",
        params: [choice],
      });

      // Send the transaction
      const result = await sendTransaction({
        account,
        transaction,
      });

      console.log("Transaction sent:", result.transactionHash);
      
      return result;
    } catch (err) {
      console.error("Error flipping coin:", err);
      setError(err instanceof Error ? err.message : "Failed to flip coin");
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
      // This is a placeholder for reading contract data
      // You would use readContract from Thirdweb SDK here
      console.log("Getting stats for:", playerAddress);
      
      // Example of how to read from contract:
      // const stats = await readContract({
      //   contract,
      //   method: "function getPlayerStats(address) view returns (uint256, uint256, uint256)",
      //   params: [playerAddress],
      // });
      
      return { wins: 0, losses: 0, total: 0 };
    } catch (err) {
      console.error("Error getting player stats:", err);
      return { wins: 0, losses: 0, total: 0 };
    }
  };

  return {
    flipCoinOnChain,
    getPlayerStats,
    isFlipping,
    error,
    isConnected: !!account,
  };
}
