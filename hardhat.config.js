/**
 * Hardhat ESM config to compile and deploy contracts in ./contracts
 * Keep it minimal and ESM-friendly for Hardhat v3.
 */
import "dotenv/config";
import "@nomicfoundation/hardhat-ethers";

const normalizePk = (pk) => {
  if (!pk) return undefined;
  return pk.startsWith("0x") ? pk : `0x${pk}`;
};

export default {
  solidity: {
    compilers: [
      {
        // Use a modern 0.8.x compiler that supports custom errors (>=0.8.4)
        version: "0.8.20",
        settings: {
          optimizer: { enabled: true, runs: 200 },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
  },
  networks: {
    base: {
      type: "http",
      chainId: 8453,
      url: process.env.BASE_RPC_URL || "http://localhost:8545",
      accounts: normalizePk(process.env.PRIVATE_KEY) ? [normalizePk(process.env.PRIVATE_KEY)] : [],
    },
    // Optional: base-sepolia for testing
    baseSepolia: {
      type: "http",
      chainId: 84532,
      url: process.env.BASE_SEPOLIA_RPC_URL || "http://localhost:8545",
      accounts: normalizePk(process.env.PRIVATE_KEY) ? [normalizePk(process.env.PRIVATE_KEY)] : [],
    },
  },
};
