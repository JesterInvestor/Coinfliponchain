// ESM deploy script for Hardhat v3
import "dotenv/config";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ethers } from "ethers";

// Constructor args for CoinFlipBetting
// FLIP token (ERC20), Treasury, Platform fee recipient, Platform fee bps
const {
  FLIP_TOKEN_ADDRESS,
  FLIP_TOKEN_ADDRESS_SEPOLIA,
  TREASURY_ADDRESS,
  TREASURY_ADDRESS_SEPOLIA,
  PLATFORM_FEE_RECIPIENT,
  PLATFORM_FEE_RECIPIENT_SEPOLIA,
  PLATFORM_FEE_BPS,
  PLATFORM_FEE_BPS_SEPOLIA,
} = process.env;

function requireEnv(name, value) {
  if (!value || value.trim() === "") {
    throw new Error(`Missing required env var ${name}`);
  }
  return value.trim();
}

async function main() {
  const targetNetwork = process.env.HARDHAT_NETWORK || "base";
  const flip = targetNetwork === "baseSepolia"
    ? requireEnv("FLIP_TOKEN_ADDRESS_SEPOLIA", FLIP_TOKEN_ADDRESS_SEPOLIA || FLIP_TOKEN_ADDRESS)
    : requireEnv("FLIP_TOKEN_ADDRESS", FLIP_TOKEN_ADDRESS);
  // Detect target network from Hardhat and choose the correct RPC env var
  const rpcKey = targetNetwork === "baseSepolia" ? "BASE_SEPOLIA_RPC_URL" : "BASE_RPC_URL";
  // Provider and signer from env
  const rpcUrl = requireEnv(rpcKey, process.env[rpcKey]);
  const pk = requireEnv("PRIVATE_KEY", process.env.PRIVATE_KEY);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(pk.startsWith("0x") ? pk : `0x${pk}`, provider);

  const treasuryRaw = targetNetwork === "baseSepolia" ? (TREASURY_ADDRESS_SEPOLIA || TREASURY_ADDRESS) : TREASURY_ADDRESS;
  const feeRecipRaw = targetNetwork === "baseSepolia" ? (PLATFORM_FEE_RECIPIENT_SEPOLIA || PLATFORM_FEE_RECIPIENT) : PLATFORM_FEE_RECIPIENT;
  const bpsRaw = targetNetwork === "baseSepolia" ? (PLATFORM_FEE_BPS_SEPOLIA || PLATFORM_FEE_BPS) : PLATFORM_FEE_BPS;

  const treasury = (treasuryRaw && treasuryRaw.trim() !== "") ? treasuryRaw.trim() : wallet.address;
  const defaultFeeRecipient = treasury || wallet.address;
  const feeRecipient = (feeRecipRaw && feeRecipRaw.trim() !== "") ? feeRecipRaw.trim() : defaultFeeRecipient;
  const feeBps = BigInt(requireEnv("PLATFORM_FEE_BPS", bpsRaw));

  console.log("Deploying CoinFlipBetting with:");
  console.log("  Network:", targetNetwork);
  console.log("  FLIP_TOKEN_ADDRESS:", flip);
  console.log("  TREASURY_ADDRESS:", treasury);
  console.log("  PLATFORM_FEE_RECIPIENT:", feeRecipient);
  console.log("  PLATFORM_FEE_BPS:", feeBps.toString());

  console.log("Deployer:", wallet.address);

  // Load artifact ABI/bytecode
  const artifactPath = join(process.cwd(), "artifacts", "contracts", "CoinFlipBetting.sol", "CoinFlipBetting.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy(flip, treasury, feeRecipient, feeBps);
  console.log("Transaction hash:", contract.deploymentTransaction().hash);
  const deployed = await contract.waitForDeployment();

  const address = await deployed.getAddress();
  console.log("CoinFlipBetting deployed at:", address);

  // Helpful output for Next.js env
  console.log("\nAdd these to your .env.local (Next.js):\n");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log(`NEXT_PUBLIC_FLIP_TOKEN_ADDRESS=${flip}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
