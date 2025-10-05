/**
 * Example component demonstrating the use of useReadContract hook
 * This shows how to use the thirdweb/react useReadContract hook
 * to read contract state that automatically updates
 */

import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { createThirdwebClient } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your_client_id_here",
});

const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? base : baseSepolia;
const tokenAddress = process.env.NEXT_PUBLIC_FLIP_TOKEN_ADDRESS || "0x0000000000000000000000000000000000000000";

// Get token contract instance
const contract = getContract({
  client,
  chain,
  address: tokenAddress,
});

export default function Component({ owner }: { owner: string }) {
  const { data, isPending } = useReadContract({
    contract,
    method: "function balanceOf(address owner) view returns (uint256 result)",
    params: [owner],
  });

  if (isPending) {
    return <div>Loading balance...</div>;
  }

  if (data) {
    const balanceInTokens = Number(data) / 10**18;
    return (
      <div>
        <p>Balance (wei): {data.toString()}</p>
        <p>Balance (tokens): {balanceInTokens.toFixed(2)} FLIP</p>
      </div>
    );
  }

  return <div>No balance data</div>;
}
