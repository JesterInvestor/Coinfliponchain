// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/extension/Ownable.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title USDCFlipSwapperV2
 * @notice Swaps USDC to FLIP via a configured on-chain aggregator (e.g., 0x Exchange Proxy) using provided calldata.
 *         Uses a distinct allowanceTarget for ERC20 approvals when required by the aggregator (e.g., 0x quotes).
 */
contract USDCFlipSwapperV2 is Ownable {
    IERC20 public immutable USDC;
    IERC20 public immutable FLIP;

    // Aggregator execution target and allowance target (may differ for some aggregators like 0x)
    address public aggregator;
    address public allowanceTarget;

    // Optional output fee
    address public feeRecipient;
    uint16 public feeBps; // out of 10_000

    bool private _locked;

    event AggregatorUpdated(address indexed oldAggregator, address indexed newAggregator);
    event AllowanceTargetUpdated(address indexed oldTarget, address indexed newTarget);
    event FeeUpdated(address indexed feeRecipient, uint16 feeBps);
    event Swapped(address indexed user, address indexed recipient, uint256 usdcIn, uint256 flipOut, uint256 feeAmount, address indexed aggregator);

    modifier nonReentrant() {
        require(!_locked, "Reentrancy");
        _locked = true;
        _;
        _locked = false;
    }

    constructor(address _usdc, address _flip, address _aggregator, address _allowanceTarget, address _owner) {
        require(_usdc != address(0) && _flip != address(0), "Zero token");
        require(_aggregator != address(0), "Zero aggregator");
        require(_allowanceTarget != address(0), "Zero allowance target");
        require(_owner != address(0), "Zero owner");
        USDC = IERC20(_usdc);
        FLIP = IERC20(_flip);
        aggregator = _aggregator;
        allowanceTarget = _allowanceTarget;
        _setupOwner(_owner);
    }

    // Required by thirdweb Ownable extension
    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    function setAggregator(address _aggregator) external onlyOwner {
        require(_aggregator != address(0), "Zero aggregator");
        address old = aggregator;
        aggregator = _aggregator;
        emit AggregatorUpdated(old, _aggregator);
    }

    function setAllowanceTarget(address _allowanceTarget) external onlyOwner {
        require(_allowanceTarget != address(0), "Zero allowance target");
        address old = allowanceTarget;
        allowanceTarget = _allowanceTarget;
        emit AllowanceTargetUpdated(old, _allowanceTarget);
    }

    function setFee(address _recipient, uint16 _feeBps) external onlyOwner {
        require(_feeBps <= 10_000, "BPS too high");
        feeRecipient = _recipient;
        feeBps = _feeBps;
        emit FeeUpdated(_recipient, _feeBps);
    }

    function swapUSDCForFLIP(
        uint256 usdcAmount,
        uint256 minFlipOut,
        address recipient,
        address swapTarget,
        bytes calldata swapCallData
    ) external payable nonReentrant returns (uint256 flipSent) {
        require(usdcAmount > 0, "Zero amount");
        require(recipient != address(0), "Zero recipient");
        require(swapTarget == aggregator, "Bad target");

        // Pull USDC
        require(USDC.transferFrom(msg.sender, address(this), usdcAmount), "USDC transferFrom failed");

        uint256 flipOut = _executeSwap(usdcAmount, swapTarget, swapCallData, msg.value);
        require(flipOut >= minFlipOut, "Insufficient output");

        uint256 feeAmount = 0;
        if (feeRecipient != address(0) && feeBps > 0) {
            feeAmount = (flipOut * feeBps) / 10_000;
            if (feeAmount > 0) {
                require(FLIP.transfer(feeRecipient, feeAmount), "Fee transfer failed");
            }
        }

        flipSent = flipOut - feeAmount;
        require(FLIP.transfer(recipient, flipSent), "FLIP transfer failed");

        emit Swapped(msg.sender, recipient, usdcAmount, flipSent, feeAmount, swapTarget);
    }

    function _executeSwap(
        uint256 usdcAmount,
        address swapTarget,
        bytes calldata swapCallData,
        uint256 msgValue
    ) internal returns (uint256 flipOut) {
        // Approve allowanceTarget for USDC spending
        require(USDC.approve(allowanceTarget, 0), "Approve reset failed");
        require(USDC.approve(allowanceTarget, usdcAmount), "Approve failed");

        uint256 beforeBal = FLIP.balanceOf(address(this));
        (bool ok, bytes memory data) = swapTarget.call{value: msgValue}(swapCallData);
        require(ok, _getRevertMsg(data));
        // Clear approval
        require(USDC.approve(allowanceTarget, 0), "Approve clear failed");

        uint256 afterBal = FLIP.balanceOf(address(this));
        flipOut = afterBal - beforeBal;
    }

    function rescueTokens(address token, uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Zero to");
        require(IERC20(token).transfer(to, amount), "Rescue failed");
    }

    function rescueETH(uint256 amount, address payable to) external onlyOwner {
        require(to != address(0), "Zero to");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH rescue failed");
    }

    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        if (_returnData.length < 68) return "Aggregator call failed";
        assembly {
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string));
    }

    receive() external payable {}
    fallback() external payable {}
}
