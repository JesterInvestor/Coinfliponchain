// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IThirdwebFlipcoin {
    // Add the methods from the ABI, e.g.:
    function flip() external payable returns (bool);
    function getLastResult(address user) external view returns (bool);
    // ... add more as needed
}

contract Flipcoin {
    address public thirdwebContract = 0x9d8eCa05F0FD5486916471c2145e32cdBF5112dF;
    IThirdwebFlipcoin thirdweb = IThirdwebFlipcoin(thirdwebContract);

    function flip() public payable returns (bool) {
        return thirdweb.flip{value: msg.value}();
    }

    function getLastResult(address user) public view returns (bool) {
        return thirdweb.getLastResult(user);
    }
    // Add other functions that route to the Thirdweb contract as needed.
}
