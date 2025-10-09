/**
 * Minimal Hardhat CommonJS config to compile the contracts in ./contracts
 */
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.8.0",
      },
    ],
  },
  paths: {
    sources: "./contracts",
  },
};
