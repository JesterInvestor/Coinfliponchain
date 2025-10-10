"use client";

import { useState, useEffect } from "react";
import { parseUnits, formatUnits } from "ethers";
import { useActiveAccount, useReadContract } from "thirdweb/react";
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

  // Helpers to read contract state
  const readMinBetAmount = async (): Promise<bigint> => {
    try {
      const v = await readContract({
        contract,
        method: "function minBetAmount() view returns (uint256)",
        params: [],
      });
      return v as bigint;
    } catch {
      // fallback to 1000 * 1e18 when unreadable
      return BigInt(1000) * BigInt(10) ** BigInt(18);
    }
  };

  const readDailyLimitEnabled = async (): Promise<boolean> => {
    try {
      const v = await readContract({
        contract,
        method: "function dailyLimitEnabled() view returns (bool)",
        params: [],
      });
      return Boolean(v);
    } catch {
      return false;
    }
  };

  const readCurrentDayIndex = async (): Promise<bigint> => {
    try {
      const v = await readContract({
        contract,
        method: "function currentDayIndex() view returns (uint256)",
        params: [],
      });
      return v as bigint;
    } catch {
      return BigInt(0);
    }
  };

  const readLastBetDayIndex = async (addr: string): Promise<bigint> => {
    try {
      const v = await readContract({
        contract,
        method: "function lastBetDayIndex(address) view returns (uint256)",
        params: [addr],
      });
      return v as bigint;
    } catch {
      return BigInt(0);
    }
  };

  const parseRpcError = (err: any): string => {
    const m = (err?.reason || err?.shortMessage || err?.message || "").toString();
    if (/user rejected/i.test(m)) return "User rejected the transaction";
    if (/insufficient funds/i.test(m)) return "Insufficient ETH for gas on Base";
    if (/Daily limit/i.test(m)) return "Daily limit reached. Try again after reset.";
    if (/Bet amount too low/i.test(m)) return "Bet amount too low";
    if (/Insufficient balance/i.test(m)) return "Insufficient $FLIP balance";
    return m || "Transaction failed";
  };

  const preflightBet = async (amountInWei: bigint): Promise<string | null> => {
    if (!account) return "Please connect your wallet first";
    try {
      const [minBet, dailyEnabled, dayIdx, lastIdx] = await Promise.all([
        readMinBetAmount(),
        readDailyLimitEnabled(),
        readCurrentDayIndex(),
        readLastBetDayIndex(account.address),
      ]);
      if (amountInWei < minBet) return `Minimum bet is ${Number(minBet) / 1e18} $FLIP`;
      if (dailyEnabled && lastIdx >= dayIdx) return "Daily limit reached. Try again after reset.";
      // quick balance check
      const bal = await readContract({
        contract: tokenContract,
        method: "function balanceOf(address) view returns (uint256)",
        params: [account.address],
      });
      if ((bal as bigint) < amountInWei) return "Insufficient $FLIP balance";
      return null;
    } catch (e) {
      // don't block on preflight errors
      return null;
    }
  };

  /**
   * Use the useReadContract hook to read balance from contract
   * This hook automatically updates when the contract changes
   */
  const { data: balanceData, isPending: isBalancePending } = useReadContract(
    account
      ? {
          contract: tokenContract,
          method: "function balanceOf(address owner) view returns (uint256 result)",
          params: [account.address],
        }
      : {
          contract: tokenContract,
          method: "function balanceOf(address owner) view returns (uint256 result)",
          params: ["0x0000000000000000000000000000000000000000"],
          queryOptions: { enabled: false },
        }
  );

  // Update flipBalance state when balanceData changes
  useEffect(() => {
    if (balanceData && account) {
      const balanceInTokens = Number(formatUnits(balanceData as bigint, 18));
      setFlipBalance(balanceInTokens);
    }
  }, [balanceData, account]);

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
  const balanceInTokens = Number(formatUnits(balance as bigint, 18));
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

  return Number(formatUnits(supply as bigint, 18));
    } catch (err) {
      console.error("Error getting token supply:", err);
      return 0;
    }
  };

  // --- Bet status helpers ---
  const readDailyResetOffsetSeconds = async (): Promise<bigint> => {
    try {
      const v = await readContract({
        contract,
        method: "function dailyResetOffsetSeconds() view returns (uint256)",
        params: [],
      });
      return v as bigint;
    } catch {
      // default 5 hours as in contract default
      return BigInt(5 * 60 * 60);
    }
  };

  const getBetStatus = async () => {
    try {
      const [minBetWei, dailyEnabled, offset, dayIdx] = await Promise.all([
        readMinBetAmount(),
        readDailyLimitEnabled(),
        readDailyResetOffsetSeconds(),
        readCurrentDayIndex(),
      ]);
      const now = Math.floor(Date.now() / 1000);
      const off = Number(offset);
      const currentIdx = Math.floor((now - off) / 86400);
      const nextResetAt = (currentIdx + 1) * 86400 + off;
      const minBetTokens = Number(minBetWei) / 1e18;
      const chainLabel = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? "Base" : "Base Sepolia";
      return {
        chainLabel,
        contractAddress,
        minBetTokens,
        dailyLimitEnabled: Boolean(dailyEnabled),
        nextResetAt,
        currentDayIndex: Number(dayIdx),
      };
    } catch (e) {
      const chainLabel = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? "Base" : "Base Sepolia";
      return {
        chainLabel,
        contractAddress,
        minBetTokens: 1000,
        dailyLimitEnabled: false,
        nextResetAt: Math.floor(Date.now() / 1000) + 3600,
        currentDayIndex: 0,
      };
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
      // throttle if recent user-rejected approval
      const key = `approvalRejectAt:${account.address}`;
      const last = Number(typeof window !== "undefined" ? window.localStorage.getItem(key) : "0") || 0;
      const now = Date.now();
      const THROTTLE_MS = 20_000;
      if (last && now - last < THROTTLE_MS) {
        const remaining = Math.ceil((THROTTLE_MS - (now - last)) / 1000);
        setError(`Recent approval was rejected. Please try again in ${remaining}s`);
        return null;
      }

  const amountInWei = parseUnits(amount.toString(), 18);
      
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
      const msg = err instanceof Error ? err.message : String(err);
      if (/user rejected|request rejected|denied/i.test(msg)) {
        try { if (typeof window !== "undefined" && account) window.localStorage.setItem(`approvalRejectAt:${account.address}`, String(Date.now())); } catch {}
        setError("User rejected the approval");
      } else {
        setError("Failed to approve tokens");
      }
      return null;
    }
  };

  /**
   * Transfer tokens to another address
   * Requires user to have at least 1000 $FLIP
   */
  const transferTokens = async (to: string, amount: number) => {
    if (!account) {
      setError("Please connect your wallet first");
      return null;
    }

    try {
      // Check if user has at least 1000 $FLIP
      const balance = await getFlipBalance();
      if (balance < 1000) {
        setError("You need at least 1000 $FLIP to transfer tokens");
        return null;
      }

  const amountInWei = parseUnits(amount.toString(), 18);
      
      const transaction = prepareContractCall({
        contract: tokenContract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [to, amountInWei],
      });

      const result = await sendTransaction({
        account,
        transaction,
      });

      // Update balance after transfer
      await getFlipBalance();

      return result;
    } catch (err) {
      console.error("Error transferring tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to transfer tokens");
      return null;
    }
  };

  /**
   * Transfer tokens from one address to another
   * Requires user to have at least 1000 $FLIP
   */
  const transferFromTokens = async (from: string, to: string, amount: number) => {
    if (!account) {
      setError("Please connect your wallet first");
      return null;
    }

    try {
      // Check if user has at least 1000 $FLIP
      const balance = await getFlipBalance();
      if (balance < 1000) {
        setError("You need at least 1000 $FLIP to transfer tokens");
        return null;
      }

  const amountInWei = parseUnits(amount.toString(), 18);
      
      const transaction = prepareContractCall({
        contract: tokenContract,
        method: "function transferFrom(address from, address to, uint256 amount) returns (bool)",
        params: [from, to, amountInWei],
      });

      const result = await sendTransaction({
        account,
        transaction,
      });

      // Update balance after transfer
      await getFlipBalance();

      return result;
    } catch (err) {
      console.error("Error transferring tokens:", err);
      setError(err instanceof Error ? err.message : "Failed to transfer tokens");
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

      // Preflight checks to surface clearer errors
      const preErr = await preflightBet(amountInWei);
      if (preErr) {
        setError(preErr);
        return null;
      }

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
      setError(parseRpcError(err));
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
    getBetStatus,
    getPlatformFeeInfo,
    approveTokens,
    transferTokens,
    transferFromTokens,
    flipBalance,
    isFlipping,
    error,
    isConnected: !!account,
    account,
    balanceData,
    isBalancePending,
  };
}
