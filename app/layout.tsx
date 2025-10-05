import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Coin Flip On-Chain - Base Network",
  description: "Play coin flip games on-chain with crypto. Built with Next.js, Thirdweb, and Base chain. Connect your wallet and start flipping!",
  openGraph: {
    title: "Coin Flip On-Chain",
    description: "Play coin flip games on-chain with crypto",
    images: ["/og-image.png"],
  },
  other: {
    // Farcaster Frame metadata
    "fc:frame": "vNext",
    "fc:frame:image": "/api/og",
    "fc:frame:button:1": "Flip Coin",
    "fc:frame:post_url": "/api/flip",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
