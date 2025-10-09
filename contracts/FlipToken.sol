// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/base/ERC20Base.sol";

/**
 * @title FlipToken
 * @dev ERC20 token for the CoinFlip betting platform
 * @notice This token is used for placing bets on the platform
 */
contract FlipToken is ERC20Base {
    /**
     * @dev Constructor
     * @param _defaultAdmin Address of the admin (can mint tokens)
     * @param _name Token name
     * @param _symbol Token symbol
     */
    constructor(
        address _defaultAdmin,
        string memory _name,
        string memory _symbol
    ) ERC20Base(_defaultAdmin, _name, _symbol) {
        // ERC20Base handles initialization
        // Default decimals is 18
    }

    /**
     * @dev Mint tokens to a specific address
     * @param _to Address to receive tokens
     * @param _amount Amount of tokens to mint (in wei, i.e., with 18 decimals)
     * @notice Only callable by accounts with MINTER_ROLE (admin by default)
     */
    function mintTo(address _to, uint256 _amount) public virtual override {
        require(_to != address(0), "Cannot mint to zero address");
        require(_amount > 0, "Amount must be greater than 0");
        super.mintTo(_to, _amount);
    }
}
