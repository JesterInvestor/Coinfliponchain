// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

/**
 * @title USDCFlipSwapper
 * @notice Swaps USDC to FLIP via a configured on-chain aggregator (e.g., 0x Exchange Proxy) using provided calldata.
 *         Enforces a minimum FLIP output (slippage protection) and supports an optional fee on output.
 *
 * Security considerations:
 * - This contract executes arbitrary calldata against the configured aggregator address only.
 * - Non-reentrancy guard is applied around the swap.
 * - Approvals are set to the exact sell amount and reset to 0 after the call.
 */
contract USDCFlipSwapper {
    // Minimal Ownable
    error Unauthorized();
    address public owner;
    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }
    // Tokens
    IERC20 public immutable USDC;
    IERC20 public immutable FLIP;

    // Aggregator (e.g., 0x Exchange Proxy)
    address public aggregator;

    // Optional output fee
    address public feeRecipient;
    uint16 public feeBps; // out of 10_000

    // Simple non-reentrancy guard
    bool private _locked;

    // Events
    event AggregatorUpdated(address indexed oldAggregator, address indexed newAggregator);
    event FeeUpdated(address indexed feeRecipient, uint16 feeBps);
    event Swapped(
        address indexed user,
        address indexed recipient,
        uint256 usdcIn,
        uint256 flipOut,
        uint256 feeAmount,
        address indexed aggregator
    );

    modifier nonReentrant() {
        require(!_locked, "Reentrancy");
        _locked = true;
        _;
        _locked = false;
    }

    /**
     * @param _usdc USDC token address
     * @param _flip FLIP token address
     * @param _aggregator On-chain aggregator/router address (e.g., 0x Exchange Proxy)
     * @param _owner Owner to set for Ownable (admin)
     */
    constructor(address _usdc, address _flip, address _aggregator, address _owner) {
        require(_usdc != address(0) && _flip != address(0), "Zero token");
        require(_aggregator != address(0), "Zero aggregator");
        require(_owner != address(0), "Zero owner");

        USDC = IERC20(_usdc);
        FLIP = IERC20(_flip);
        aggregator = _aggregator;
        owner = _owner;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero owner");
        owner = newOwner;
    }

    /**
     * @notice Admin: update aggregator address
     */
    function setAggregator(address _aggregator) external onlyOwner {
        require(_aggregator != address(0), "Zero aggregator");
        address old = aggregator;
        aggregator = _aggregator;
        emit AggregatorUpdated(old, _aggregator);
    }

    /**
     * @notice Admin: set output fee recipient and bps (max 10000)
     */
    function setFee(address _recipient, uint16 _feeBps) external onlyOwner {
        require(_feeBps <= 10_000, "BPS too high");
        feeRecipient = _recipient;
        feeBps = _feeBps;
        emit FeeUpdated(_recipient, _feeBps);
    }

    /**
     * @notice Swap USDC to FLIP using the configured aggregator.
     * @param usdcAmount Amount of USDC to sell (6 decimals)
     * @param minFlipOut Minimum acceptable FLIP output (18 decimals) to protect against slippage
     * @param recipient Recipient of the FLIP output
    * @param swapTarget Must equal the configured aggregator address (e.g., 0x Exchange Proxy "to")
    * @param allowanceTarget Address to approve USDC to (from 0x API quote's allowanceTarget)
    * @param swapCallData Calldata for the aggregator; generated off-chain (e.g., 0x API quote). Must be tailored for this contract as the caller/taker.
     * @return flipSent The amount of FLIP sent to recipient (after fee)
     */
    function swapUSDCForFLIP(
        uint256 usdcAmount,
        uint256 minFlipOut,
        address recipient,
        address swapTarget,
        address allowanceTarget,
        bytes calldata swapCallData
    ) external payable nonReentrant returns (uint256 flipSent) {
        require(usdcAmount > 0, "Zero amount");
        require(recipient != address(0), "Zero recipient");
        require(swapTarget == aggregator, "Bad target");

        // Pull USDC from user
        require(USDC.transferFrom(msg.sender, address(this), usdcAmount), "USDC transferFrom failed");
        
    uint256 flipOut = _executeSwap(usdcAmount, swapTarget, allowanceTarget, swapCallData, msg.value);
        require(flipOut >= minFlipOut, "Insufficient output");

        // Apply optional fee on output
        uint256 feeAmount = 0;
        if (feeRecipient != address(0) && feeBps > 0) {
            feeAmount = (flipOut * feeBps) / 10_000;
            if (feeAmount > 0) {
                require(FLIP.transfer(feeRecipient, feeAmount), "Fee transfer failed");
            }
        }

        // Send remaining FLIP to recipient
        flipSent = flipOut - feeAmount;
        require(FLIP.transfer(recipient, flipSent), "FLIP transfer failed");

        emit Swapped(msg.sender, recipient, usdcAmount, flipSent, feeAmount, swapTarget);
    }

    function _executeSwap(
        uint256 usdcAmount,
        address swapTarget,
        address allowanceTarget,
        bytes calldata swapCallData,
        uint256 msgValue
    ) internal returns (uint256 flipOut) {
        // Approve allowanceTarget to spend exact USDC amount
        require(allowanceTarget != address(0), "Zero allowanceTarget");
        require(USDC.approve(allowanceTarget, 0), "Approve reset failed");
        require(USDC.approve(allowanceTarget, usdcAmount), "Approve failed");

        // Measure FLIP before
        uint256 beforeBal = FLIP.balanceOf(address(this));

        // Execute aggregator call
        (bool ok, bytes memory data) = swapTarget.call{value: msgValue}(swapCallData);
        require(ok, _getRevertMsg(data));

    // Reset approval to 0 as a safety measure
    require(USDC.approve(allowanceTarget, 0), "Approve clear failed");

        // Compute output
        uint256 afterBal = FLIP.balanceOf(address(this));
        flipOut = afterBal - beforeBal;
    }

    /**
     * @notice Rescue arbitrary ERC20 tokens to an address (owner only)
     */
    function rescueTokens(address token, uint256 amount, address to) external onlyOwner {
        require(to != address(0), "Zero to");
        require(IERC20(token).transfer(to, amount), "Rescue failed");
    }

    /**
     * @notice Rescue ETH (owner only)
     */
    function rescueETH(uint256 amount, address payable to) external onlyOwner {
        require(to != address(0), "Zero to");
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "ETH rescue failed");
    }

    // Helper to bubble up revert reasons from low-level calls
    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        if (_returnData.length < 68) return "Aggregator call failed";
        assembly {
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string));
    }

    // Allow receiving ETH (e.g., for aggregator protocols that need native value)
    receive() external payable {}
    fallback() external payable {}
}
