"use client";

import { useState, useCallback } from "react";
import { parseUnits } from "ethers";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { createThirdwebClient } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your_client_id_here",
});

const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? base : baseSepolia;

export function useSwapper() {
  const account = useActiveAccount();
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<bigint>(BigInt(0));
  const [allowance, setAllowance] = useState<bigint>(BigInt(0));

  const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x833589fcd6edb6e08f4c7c32d4f71b54bd4f71fe").toLowerCase();
  const FLIP_ADDRESS = (process.env.NEXT_PUBLIC_FLIP_TOKEN_ADDRESS || "").toLowerCase();
  const SWAPPER_ADDRESS = (process.env.NEXT_PUBLIC_SWAPPER_ADDRESS || "").toLowerCase();

  const usdc = getContract({ client, chain, address: USDC_ADDRESS });
  const swapper = getContract({ client, chain, address: SWAPPER_ADDRESS });

  const ensureUsdcApproval = async (owner: string, spender: string, amount: bigint) => {
    // Check current allowance
    const current: bigint = (await readContract({
      contract: usdc,
      method: "function allowance(address owner, address spender) view returns (uint256)",
      params: [owner, spender],
    })) as bigint;

    if (current >= amount) return true;

    // Approve spender (swapper) for at least 'amount'
    const tx = prepareContractCall({
      contract: usdc,
      method: "function approve(address spender, uint256 amount) returns (bool)",
      params: [spender, amount],
    });
    await sendTransaction({ account: account!, transaction: tx });
    return true;
  };

  const refreshUsdcStatus = useCallback(async () => {
    if (!account) return;
    try {
      const owner = account.address;
      const [bal, allw] = await Promise.all([
        readContract({
          contract: usdc,
          method: "function balanceOf(address owner) view returns (uint256)",
          params: [owner],
        }) as Promise<bigint>,
        readContract({
          contract: usdc,
          method: "function allowance(address owner, address spender) view returns (uint256)",
          params: [owner, SWAPPER_ADDRESS],
        }) as Promise<bigint>,
      ]);
      setUsdcBalance(bal);
      setAllowance(allw);
    } catch (e) {
      console.error("refreshUsdcStatus error", e);
    }
  }, [account, usdc, SWAPPER_ADDRESS]);

  const approveUsdcMax = async (): Promise<boolean> => {
    if (!account) { setError("Please connect your wallet first"); return false; }
    if (!SWAPPER_ADDRESS) { setError("Missing swapper address"); return false; }
    try {
      setIsApproving(true);
      setError(null);
  const max = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
      const tx = prepareContractCall({
        contract: usdc,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [SWAPPER_ADDRESS as `0x${string}`, max],
      });
      await sendTransaction({ account, transaction: tx });
      await refreshUsdcStatus();
      return true;
    } catch (e) {
      console.error("approveUsdcMax failed", e);
      setError(e instanceof Error ? e.message : "Approve failed");
      return false;
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Perform an on-chain swap USDC -> FLIP via the deployed swapper using a 0x quote.
   * - usdAmount: in units of USDC (e.g., 10 = $10), supports fractional.
   * - recipient: address to receive FLIP (default: user's address)
   * - slippageBps: 0-10000, default 50 (0.5%)
   */
  const swapUSDCToFLIP = async (
    usdAmount: number,
    recipient?: string,
    slippageBps: number = 50
  ): Promise<{ txHash: string } | null> => {
    if (!account) { setError("Please connect your wallet first"); return null; }
    if (!SWAPPER_ADDRESS || !FLIP_ADDRESS) { setError("Missing swapper or token address"); return null; }
    if (!usdAmount || usdAmount <= 0) { setError("Invalid USDC amount"); return null; }

    try {
      setIsSwapping(true);
      setError(null);

      const user = account.address;
      const toRecipient = recipient && /^0x[a-fA-F0-9]{40}$/.test(recipient) ? recipient : user;

      // Compute sellAmount with 6 decimals
      const sellAmount = parseUnits(usdAmount.toString(), 6);

      // Fetch 0x quote on Base
      const params = new URLSearchParams({
        sellToken: USDC_ADDRESS,
        buyToken: FLIP_ADDRESS,
        sellAmount: sellAmount.toString(),
        takerAddress: SWAPPER_ADDRESS,
        intentOnFilling: "true",
        slippagePercentage: (slippageBps / 10000).toString(),
      });
      const res = await fetch(`https://base.api.0x.org/swap/v1/quote?${params.toString()}`);
      if (!res.ok) throw new Error(`0x quote failed: ${res.status}`);
      const quote = await res.json();

  const swapTarget = quote.to as `0x${string}`;
  const swapCallData = quote.data as `0x${string}`;
      const value: bigint = BigInt(quote.value || 0);
      const buyAmount: bigint = BigInt(quote.buyAmount);

      // Compute minOut with our own slippage guard (same bps as request)
      const minFlipOut = (buyAmount * BigInt(10000 - slippageBps)) / BigInt(10000);

      // Ensure USDC approval to the swapper (spender)
      await ensureUsdcApproval(user, SWAPPER_ADDRESS, BigInt(sellAmount.toString()));

      // Execute contract call
      const txCall = prepareContractCall({
        contract: swapper,
        method: "function swapUSDCForFLIP(uint256 usdcAmount, uint256 minFlipOut, address recipient, address swapTarget, bytes swapCallData) payable returns (uint256)",
  params: [BigInt(sellAmount.toString()), minFlipOut, toRecipient as `0x${string}`, swapTarget, swapCallData],
        value,
      });
      const sent = await sendTransaction({ account, transaction: txCall });
  // update balances/allowance after swap
  try { await refreshUsdcStatus(); } catch {}

      return { txHash: sent.transactionHash };
    } catch (e) {
      console.error("Swap failed:", e);
      setError(e instanceof Error ? e.message : "Swap failed");
      return null;
    } finally {
      setIsSwapping(false);
    }
  };

  return {
    swapUSDCToFLIP,
    isSwapping,
    error,
    isApproving,
    usdcBalance,
    allowance,
    refreshUsdcStatus,
    approveUsdcMax,
  };
}
