// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title CoinFlip
 * @dev Simple on-chain coin flip game contract
 * @notice This is a sample contract for educational purposes
 */
contract CoinFlip {
    // Events
    event CoinFlipped(
        address indexed player,
        bool isHeads,
        uint256 timestamp,
        uint256 flipId
    );
    
    event GameResult(
        address indexed player,
        bool playerChoice,
        bool result,
        bool won,
        uint256 flipId
    );

    // Structs
    struct Flip {
        address player;
        bool choice; // true = heads, false = tails
        bool result;
        bool won;
        uint256 timestamp;
    }

    // State variables
    mapping(uint256 => Flip) public flips;
    mapping(address => uint256[]) public playerFlips;
    uint256 public flipCounter;
    
    // Stats
    mapping(address => uint256) public playerWins;
    mapping(address => uint256) public playerLosses;
    uint256 public totalFlips;

    /**
     * @dev Flip the coin with a choice
     * @param _choice true for heads, false for tails
     */
    function flip(bool _choice) external returns (uint256) {
        uint256 flipId = flipCounter++;
        
        // Generate pseudo-random result
        // Note: This is NOT cryptographically secure and should not be used for real gambling
        bool result = _generateRandomResult(flipId);
        bool won = (result == _choice);
        
        // Store flip data
        flips[flipId] = Flip({
            player: msg.sender,
            choice: _choice,
            result: result,
            won: won,
            timestamp: block.timestamp
        });
        
        playerFlips[msg.sender].push(flipId);
        totalFlips++;
        
        // Update stats
        if (won) {
            playerWins[msg.sender]++;
        } else {
            playerLosses[msg.sender]++;
        }
        
        emit CoinFlipped(msg.sender, result, block.timestamp, flipId);
        emit GameResult(msg.sender, _choice, result, won, flipId);
        
        return flipId;
    }

    /**
     * @dev Get player's flip history
     * @param _player Address of the player
     */
    function getPlayerFlips(address _player) external view returns (uint256[] memory) {
        return playerFlips[_player];
    }

    /**
     * @dev Get player's stats
     * @param _player Address of the player
     */
    function getPlayerStats(address _player) external view returns (
        uint256 wins,
        uint256 losses,
        uint256 total
    ) {
        wins = playerWins[_player];
        losses = playerLosses[_player];
        total = wins + losses;
    }

    /**
     * @dev Get flip details
     * @param _flipId ID of the flip
     */
    function getFlip(uint256 _flipId) external view returns (
        address player,
        bool choice,
        bool result,
        bool won,
        uint256 timestamp
    ) {
        Flip memory f = flips[_flipId];
        return (f.player, f.choice, f.result, f.won, f.timestamp);
    }

    /**
     * @dev Generate pseudo-random result
     * @param _flipId ID of the flip
     * WARNING: This is not secure randomness and should not be used in production
     */
    function _generateRandomResult(uint256 _flipId) private view returns (bool) {
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    msg.sender,
                    _flipId
                )
            )
        );
        return (random % 2 == 0);
    }
}
