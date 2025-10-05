// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@thirdweb-dev/contracts/extension/PlatformFee.sol";
import "@thirdweb-dev/contracts/extension/Ownable.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/**
 * @title CoinFlipBetting
 * @dev Enhanced coin flip game contract with betting, treasury, and platform fees
 * @notice This contract integrates with an ERC20 token for betting
 */
contract CoinFlipBetting is PlatformFee, Ownable {
    // ERC20 token used for betting
    IERC20 public flipToken;
    
    // Treasury wallet address
    address public treasury;
    
    // Events
    event BetPlaced(
        address indexed player,
        uint256 indexed betId,
        uint256 amount,
        bool choice,
        uint256 timestamp
    );
    
    event BetResolved(
        address indexed player,
        uint256 indexed betId,
        bool result,
        bool won,
        uint256 payout,
        uint256 platformFee
    );
    
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FlipTokenUpdated(address indexed oldToken, address indexed newToken);
    
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

    // State variables
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
    
    // Minimum bet amount
    uint256 public minBetAmount = 1000 * 10**18; // 1000 tokens

    /**
     * @dev Constructor
     * @param _flipToken Address of the ERC20 token contract
     * @param _treasury Address of the treasury wallet
     * @param _platformFeeRecipient Address to receive platform fees
     * @param _platformFeeBps Platform fee in basis points (e.g., 100 = 1%)
     */
    constructor(
        address _flipToken,
        address _treasury,
        address _platformFeeRecipient,
        uint256 _platformFeeBps
    ) {
        require(_flipToken != address(0), "Invalid token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_platformFeeRecipient != address(0), "Invalid fee recipient");
        
        flipToken = IERC20(_flipToken);
        treasury = _treasury;
        
        _setupOwner(msg.sender);
        _setupPlatformFeeInfo(_platformFeeRecipient, _platformFeeBps);
    }

    /**
     * @dev Place a bet
     * @param _amount Amount to bet
     * @param _choice true for heads, false for tails
     */
    function placeBet(uint256 _amount, bool _choice) external returns (uint256) {
        require(_amount >= minBetAmount, "Bet amount too low");
        require(flipToken.balanceOf(msg.sender) >= _amount, "Insufficient balance");
        
        // Transfer tokens from player to contract
        require(
            flipToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );
        
        uint256 betId = betCounter++;
        
        // Store bet data
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
        
        // Resolve bet immediately
        _resolveBet(betId);
        
        return betId;
    }

    /**
     * @dev Resolve a bet and pay out winnings
     * @param _betId ID of the bet
     */
    function _resolveBet(uint256 _betId) internal {
        Bet storage bet = bets[_betId];
        require(!bet.resolved, "Bet already resolved");
        
        // Generate pseudo-random result
        bool result = _generateRandomResult(_betId);
        bool won = (result == bet.choice);
        
        bet.result = result;
        bet.won = won;
        bet.resolved = true;
        activeBetCount[bet.player]--;
        
        // Update stats
        if (won) {
            playerWins[bet.player]++;
        } else {
            playerLosses[bet.player]++;
        }
        
        // Calculate platform fee and payout
        (address platformFeeRecipient, uint16 platformFeeBps) = getPlatformFeeInfo();
        uint256 platformFeeAmount = (bet.amount * platformFeeBps) / 10000;
        
        bet.platformFee = platformFeeAmount;
        
        if (won) {
            // Player wins: return bet + winnings - platform fee
            // Payout is 2x bet amount minus platform fee
            uint256 totalPayout = (bet.amount * 2) - platformFeeAmount;
            bet.payout = totalPayout;
            totalWon[bet.player] += totalPayout;
            
            // Transfer winnings to player
            require(
                flipToken.transfer(bet.player, totalPayout),
                "Payout transfer failed"
            );
            
            // Transfer platform fee
            if (platformFeeAmount > 0) {
                require(
                    flipToken.transfer(platformFeeRecipient, platformFeeAmount),
                    "Fee transfer failed"
                );
            }
        } else {
            // Player loses: bet amount goes to treasury minus platform fee
            uint256 treasuryAmount = bet.amount - platformFeeAmount;
            
            // Transfer to treasury
            require(
                flipToken.transfer(treasury, treasuryAmount),
                "Treasury transfer failed"
            );
            
            // Transfer platform fee
            if (platformFeeAmount > 0) {
                require(
                    flipToken.transfer(platformFeeRecipient, platformFeeAmount),
                    "Fee transfer failed"
                );
            }
        }
        
        emit BetResolved(
            bet.player,
            _betId,
            result,
            won,
            bet.payout,
            platformFeeAmount
        );
    }

    /**
     * @dev Generate pseudo-random result
     * @param _betId ID of the bet
     * WARNING: This is not secure randomness and should not be used in production
     */
    function _generateRandomResult(uint256 _betId) private view returns (bool) {
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    _betId,
                    betCounter
                )
            )
        );
        return (random % 2 == 0);
    }

    /**
     * @dev Get player's bet history
     * @param _player Address of the player
     */
    function getPlayerBets(address _player) external view returns (uint256[] memory) {
        return playerBets[_player];
    }

    /**
     * @dev Get player's stats
     * @param _player Address of the player
     */
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

    /**
     * @dev Get bet details
     * @param _betId ID of the bet
     */
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
        return (
            bet.player,
            bet.amount,
            bet.choice,
            bet.result,
            bet.won,
            bet.resolved,
            bet.timestamp,
            bet.payout,
            bet.platformFee
        );
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return flipToken.balanceOf(address(this));
    }

    /**
     * @dev Update treasury address (only owner)
     * @param _newTreasury New treasury address
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        address oldTreasury = treasury;
        treasury = _newTreasury;
        emit TreasuryUpdated(oldTreasury, _newTreasury);
    }

    /**
     * @dev Update FLIP token address (only owner)
     * @param _newToken New token address
     */
    function updateFlipToken(address _newToken) external onlyOwner {
        require(_newToken != address(0), "Invalid token address");
        address oldToken = address(flipToken);
        flipToken = IERC20(_newToken);
        emit FlipTokenUpdated(oldToken, _newToken);
    }

    /**
     * @dev Update minimum bet amount (only owner)
     * @param _newMinBet New minimum bet amount
     */
    function updateMinBetAmount(uint256 _newMinBet) external onlyOwner {
        require(_newMinBet > 0, "Invalid min bet amount");
        minBetAmount = _newMinBet;
    }

    /**
     * @dev Returns whether platform fee info can be set
     */
    function _canSetPlatformFeeInfo() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    /**
     * @dev Returns whether owner can be set
     */
    function _canSetOwner() internal view virtual override returns (bool) {
        return msg.sender == owner();
    }

    /**
     * @dev Emergency withdraw (only owner) - for recovery purposes only
     * @param _amount Amount to withdraw
     */
    function emergencyWithdraw(uint256 _amount) external onlyOwner {
        require(_amount <= flipToken.balanceOf(address(this)), "Insufficient balance");
        require(flipToken.transfer(owner(), _amount), "Transfer failed");
    }
}
