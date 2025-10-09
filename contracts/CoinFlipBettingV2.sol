// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@thirdweb-dev/contracts/extension/PlatformFee.sol";
import "@thirdweb-dev/contracts/extension/Ownable.sol";

interface IERC20V2 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title CoinFlipBettingV2
 * @dev Adds a once-per-day bet limit with a configurable daily reset offset (default ~12 AM Eastern)
 * Retains the same public interface as V1 for compatibility.
 */
contract CoinFlipBettingV2 is PlatformFee, Ownable {
    // ERC20 token used for betting
    IERC20V2 public flipToken;

    // Treasury wallet address
    address public treasury;

    // Daily bet gating
    bool public dailyLimitEnabled = true;
    // Offset in seconds applied before computing day index; default 5 hours (approx 12:00 AM EST)
    uint256 public dailyResetOffsetSeconds = 5 hours;
    mapping(address => uint256) public lastBetDayIndex;

    // Events
    event BetPlaced(address indexed player, uint256 indexed betId, uint256 amount, bool choice, uint256 timestamp);
    event BetResolved(address indexed player, uint256 indexed betId, bool result, bool won, uint256 payout, uint256 platformFee);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FlipTokenUpdated(address indexed oldToken, address indexed newToken);
    event DailyLimitUpdated(bool enabled, uint256 resetOffsetSeconds);

    // Structs
    struct Bet {
        address player;
        uint256 amount;
        bool choice; // true = heads, false = tails
        bool result;
        bool won;
        bool resolved;
        uint256 timestamp;
        uint256 payout;
        uint256 platformFee;
    }

    // State
    mapping(uint256 => Bet) public bets;
    mapping(address => uint256[]) public playerBets;
    mapping(address => uint256) public activeBetCount;
    uint256 public betCounter;

    // Stats
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerLosses;
    mapping(address => uint256) public totalWagered;
    mapping(address => uint256) public totalWon;
    uint256 public totalBets;
    uint256 public totalVolume;

    // Minimum bet amount (1,000 tokens by default)
    uint256 public minBetAmount = 1000 * 10**18;

    constructor(
        address _flipToken,
        address _treasury,
        address _platformFeeRecipient,
        uint256 _platformFeeBps
    ) {
        require(_flipToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_platformFeeRecipient != address(0), "Invalid fee recipient");

        flipToken = IERC20V2(_flipToken);
        treasury = _treasury;

        _setupOwner(msg.sender);
        _setupPlatformFeeInfo(_platformFeeRecipient, _platformFeeBps);
    }

    function currentDayIndex() public view returns (uint256) {
        unchecked {
            return (block.timestamp - dailyResetOffsetSeconds) / 1 days;
        }
    }

    /**
     * @dev Place a bet; if daily limit is enabled, only one bet per user per day window.
     */
    function placeBet(uint256 _amount, bool _choice) external returns (uint256) {
        require(_amount >= minBetAmount, "Bet amount too low");
        require(flipToken.balanceOf(msg.sender) >= _amount, "Insufficient balance");

        if (dailyLimitEnabled) {
            uint256 dayIdx = currentDayIndex();
            require(lastBetDayIndex[msg.sender] < dayIdx, "Daily limit reached");
            // Mark today's bet immediately to prevent re-entry attempts
            lastBetDayIndex[msg.sender] = dayIdx;
        }

        require(flipToken.transferFrom(msg.sender, address(this), _amount), "Transfer failed");

        uint256 betId = betCounter++;
        bets[betId] = Bet({
            player: msg.sender,
            amount: _amount,
            choice: _choice,
            result: false,
            won: false,
            resolved: false,
            timestamp: block.timestamp,
            payout: 0,
            platformFee: 0
        });

        playerBets[msg.sender].push(betId);
        activeBetCount[msg.sender]++;
        totalBets++;
        totalVolume += _amount;
        totalWagered[msg.sender] += _amount;

        emit BetPlaced(msg.sender, betId, _amount, _choice, block.timestamp);

        _resolveBet(betId);
        return betId;
    }

    function _resolveBet(uint256 _betId) internal {
        Bet storage bet = bets[_betId];
        require(!bet.resolved, "Bet already resolved");

        bool result = _generateRandomResult(_betId);
        bool won = (result == bet.choice);

        bet.result = result;
        bet.won = won;
        bet.resolved = true;
        activeBetCount[bet.player]--;

        if (won) {
            playerWins[bet.player]++;
        } else {
            playerLosses[bet.player]++;
        }

        (address platformFeeRecipient, uint16 platformFeeBps) = getPlatformFeeInfo();
        uint256 platformFeeAmount = (bet.amount * platformFeeBps) / 10000;
        bet.platformFee = platformFeeAmount;

        if (won) {
            uint256 totalPayout = (bet.amount * 2) - platformFeeAmount;
            bet.payout = totalPayout;
            totalWon[bet.player] += totalPayout;
            require(flipToken.transfer(bet.player, totalPayout), "Payout transfer failed");
            if (platformFeeAmount > 0) {
                require(flipToken.transfer(platformFeeRecipient, platformFeeAmount), "Fee transfer failed");
            }
        } else {
            uint256 treasuryAmount = bet.amount - platformFeeAmount;
            require(flipToken.transfer(treasury, treasuryAmount), "Treasury transfer failed");
            if (platformFeeAmount > 0) {
                require(flipToken.transfer(platformFeeRecipient, platformFeeAmount), "Fee transfer failed");
            }
        }

        emit BetResolved(bet.player, _betId, result, won, bet.payout, platformFeeAmount);
    }

    function _generateRandomResult(uint256 _betId) private view returns (bool) {
        uint256 random = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender, _betId, betCounter)));
        return (random % 2 == 0);
    }

    // Views
    function getPlayerBets(address _player) external view returns (uint256[] memory) { return playerBets[_player]; }

    function getPlayerStats(address _player) external view returns (
        uint256 wins,
        uint256 losses,
        uint256 total,
        uint256 wagered,
        uint256 won,
        uint256 activeBets
    ) {
        wins = playerWins[_player];
        losses = playerLosses[_player];
        total = wins + losses;
        wagered = totalWagered[_player];
        won = totalWon[_player];
        activeBets = activeBetCount[_player];
    }

    function getBet(uint256 _betId) external view returns (
        address player,
        uint256 amount,
        bool choice,
        bool result,
        bool won,
        bool resolved,
        uint256 timestamp,
        uint256 payout,
        uint256 platformFee
    ) {
        Bet memory bet = bets[_betId];
        return (bet.player, bet.amount, bet.choice, bet.result, bet.won, bet.resolved, bet.timestamp, bet.payout, bet.platformFee);
    }

    function getContractBalance() external view returns (uint256) { return flipToken.balanceOf(address(this)); }

    // Admin
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    function updateFlipToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "Invalid token address");
        address oldToken = address(flipToken);
        flipToken = IERC20V2(_newToken);
        emit FlipTokenUpdated(oldToken, _newToken);
    }

    function updateMinBetAmount(uint256 _newMinBet) external onlyOwner {
        require(_newMinBet > 0, "Invalid min bet amount");
        minBetAmount = _newMinBet;
    }

    function setDailyLimit(bool enabled, uint256 resetOffsetSeconds) external onlyOwner {
        dailyLimitEnabled = enabled;
        dailyResetOffsetSeconds = resetOffsetSeconds;
        emit DailyLimitUpdated(enabled, resetOffsetSeconds);
    }

    function _canSetPlatformFeeInfo() internal view virtual override returns (bool) { return msg.sender == owner(); }
    function _canSetOwner() internal view virtual override returns (bool) { return msg.sender == owner(); }

    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(_amount <= flipToken.balanceOf(address(this)), "Insufficient balance");
        require(flipToken.transfer(owner(), _amount), "Transfer failed");
    }
}
