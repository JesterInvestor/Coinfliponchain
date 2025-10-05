// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";

/**
 * @title FlipToken
 * @dev ERC20 token for the CoinFlip betting platform
 */
contract FlipToken is ERC20Base {
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol
    ) ERC20Base(_defaultAdmin, _name, _symbol) {
        // Initial mint can be done by admin using the mintTo function
    }
}
