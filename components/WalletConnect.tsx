"use client";

import { ConnectButton } from "thirdweb/react";
import { createThirdwebClient } from "thirdweb";
import { base, baseSepolia } from "thirdweb/chains";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "your_client_id_here",
});

// Only allow external wallets (no embedded wallets)
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
  createWallet("io.zerion.wallet"),
];

export default function WalletConnect() {
  const chain = process.env.NEXT_PUBLIC_CHAIN_ID === "8453" ? base : baseSepolia;

  return (
    <div className="flex items-center justify-center w-full">
      <ConnectButton
        client={client}
        chain={chain}
        wallets={wallets}
        connectButton={{
          label: "Connect Wallet",
          className: "!bg-gradient-to-r !from-amber-700 !to-yellow-800 !text-white !px-8 !py-4 !rounded-lg !font-bold !text-lg !shadow-lg hover:!from-amber-800 hover:!to-yellow-900 !transition-all !min-h-[56px]",
        }}
        detailsButton={{
          className: "!bg-white dark:!bg-neutral-800 !text-neutral-800 dark:!text-white !px-6 !py-3 !rounded-lg !font-semibold !text-base !shadow-lg hover:!bg-neutral-50 dark:hover:!bg-neutral-700 !transition-all !min-h-[56px] !border !border-neutral-300 dark:!border-neutral-600",
          // Not setting displayBalanceToken ensures native token (ETH) balance is shown
        }}
        detailsModal={{
          // Configure the modal shown when connected wallet button is clicked
          // Displays wallet details, balance, and transaction options
        }}
        connectModal={{
          size: "wide",
          title: "Connect Your Wallet",
          showThirdwebBranding: false,
          welcomeScreen: {
            title: "Connect to Coin Flip Betting",
            subtitle: "Choose your wallet to get started",
          },
        }}
      />
    </div>
  );
}
