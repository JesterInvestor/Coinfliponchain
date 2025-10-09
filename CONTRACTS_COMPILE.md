Compiling Solidity contracts (Hardhat)
====================================

This project uses Hardhat to compile the Solidity contracts located in `contracts/`.

Quick commands
--------------

- Install project dependencies (use legacy peer deps if you hit peer conflicts):

```powershell
npm install --legacy-peer-deps
```

- Compile contracts using the npm script added to `package.json`:

```powershell
npm run compile:contracts
# or directly
npx hardhat compile
```

Notes and reasoning
-------------------
- Hardhat v3 prefers ESM projects. The repository currently uses an ESM-capable Hardhat config (`hardhat.config.js`) and may set `"type": "module"` in `package.json` to allow ESM-style config loading. If you prefer a CommonJS setup, see the project maintainer for a migration plan (downgrading Hardhat or using a `.cjs` config).
- The `compile:contracts` script runs `npx hardhat compile` and will download the required Solidity compiler versions automatically.
- Compilation outputs are written to the `artifacts/` (build artifacts and ABIs) and `cache/` directories at the repository root.

If you want me to change the project to CommonJS-only (remove `type: module`), I can do that but it requires careful dependency/version changes (Hardhat v2 vs v3). Let me know if you'd prefer that.
