import { ethers } from "ethers";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Usage: node ./scripts/deploy_swapper.mjs --network base|baseSepolia
// Env required:
//  - PRIVATE_KEY
//  - RPC_URL_BASE or RPC_URL_BASE_SEPOLIA
//  - FLIP_TOKEN_ADDRESS
//  - USDC_ADDRESS (default Base USDC if unset)
//  - AGGREGATOR_ADDRESS (e.g., 0x Exchange Proxy on Base: 0xDef1C0ded9bec7F1a1670819833240f027b25EfF)

function getEnvVar(name, fallback = undefined) {
  return process.env[name] ?? fallback;
}

function getNetworkConfig() {
  const args = process.argv.slice(2);
  const isBase = args.includes("--network") && args.includes("base");
  const isBaseSepolia = args.includes("--network") && args.includes("baseSepolia");
  if (!isBase && !isBaseSepolia) {
    throw new Error("Please run with --network base or --network baseSepolia");
  }
  return {
    name: isBase ? "base" : "baseSepolia",
    rpc: isBase
      ? (getEnvVar("BASE_RPC_URL") || getEnvVar("RPC_URL_BASE"))
      : (getEnvVar("BASE_SEPOLIA_RPC_URL") || getEnvVar("RPC_URL_BASE_SEPOLIA")),
    chainId: isBase ? 8453 : 84532,
  };
}

function loadArtifact() {
  const artifactPath = path.resolve(
    process.cwd(),
    "artifacts/contracts/USDCFlipSwapperV2.sol/USDCFlipSwapperV2.json"
  );
  if (!fs.existsSync(artifactPath)) {
    throw new Error("Build artifact for USDCFlipSwapperV2 not found. Run compile first.");
  }
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact;
}

async function main() {
  const { name, rpc, chainId } = getNetworkConfig();
  if (!rpc) throw new Error(`Missing RPC URL for ${name}`);

  const pk = getEnvVar("PRIVATE_KEY");
  if (!pk) throw new Error("Missing PRIVATE_KEY env var");

  // Normalize addresses to lowercase to avoid EIP-55 checksum mismatch during ABI encoding
  const USDC = (getEnvVar("USDC_ADDRESS", "0x833589fcd6edb6e08f4c7c32d4f71b54bd4f71fe")).toLowerCase();
  const FLIP = (getEnvVar("FLIP_TOKEN_ADDRESS") || "").toLowerCase();
  const AGG = (getEnvVar("AGGREGATOR_ADDRESS", "0xdef1c0ded9bec7f1a1670819833240f027b25eff")).toLowerCase();
  const ALLOWANCE_TARGET = ((getEnvVar("ALLOWANCE_TARGET_ADDRESS") || AGG)).toLowerCase(); // 0x may return a distinct allowanceTarget
  let OWNER = (getEnvVar("SWAPPER_OWNER") || getEnvVar("DEPLOYER_ADDRESS") || "").toLowerCase();

  if (!FLIP) throw new Error("Missing FLIP_TOKEN_ADDRESS");

  const provider = new ethers.JsonRpcProvider(rpc, { chainId, name });
  const wallet = new ethers.Wallet(pk, provider);

  const artifact = loadArtifact();
  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

  if (!OWNER) {
    OWNER = (await wallet.getAddress()).toLowerCase();
  }

  console.log(`Deploying USDCFlipSwapperV2 to ${name}...`);
  console.log({ USDC, FLIP, AGG, ALLOWANCE_TARGET, OWNER });

  const contract = await factory.deploy(USDC, FLIP, AGG, ALLOWANCE_TARGET, OWNER);
  const receipt = await contract.waitForDeployment();
  const addr = await contract.getAddress();

  console.log(`USDCFlipSwapperV2 deployed at: ${addr}`);
  console.log(`Transaction hash: ${(await receipt.deploymentTransaction())?.hash}`);
  console.log("Env hints:");
  console.log(`NEXT_PUBLIC_SWAPPER_ADDRESS=${addr}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
