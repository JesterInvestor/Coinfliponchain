"use client";

import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your_client_id_here",
});

export default function WalletConnect() {
  const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? base : baseSepolia;

  return (
    <div className="flex items-center justify-end">
      <ConnectButton
        client={client}
        chain={chain}
        connectButton={{
          label: "Connect Wallet",
          className: "!bg-blue-600 !text-white !px-6 !py-3 !rounded-lg !font-semibold !shadow-lg hover:!bg-blue-700 !transition-all",
        }}
        connectModal={{
          size: "compact",
          title: "Connect to Coin Flip",
          showThirdwebBranding: false,
        }}
      />
    </div>
  );
}
