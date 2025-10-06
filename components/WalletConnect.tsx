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
          className: "!bg-blue-600 !text-white !px-8 !py-4 !rounded-lg !font-bold !text-lg !shadow-lg hover:!bg-blue-700 !transition-all !min-h-[56px]",
        }}
        detailsButton={{
          className: "!bg-white dark:!bg-gray-800 !text-gray-800 dark:!text-white !px-6 !py-3 !rounded-lg !font-semibold !text-base !shadow-lg hover:!bg-gray-50 dark:hover:!bg-gray-700 !transition-all !min-h-[56px]",
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
