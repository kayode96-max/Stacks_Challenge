// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StacksLeaderboard
 * @dev Comprehensive ranking system for Stacks developers
 * Tracks multiple metrics and calculates weighted scores
 */
contract StacksLeaderboard is Ownable, ReentrancyGuard {
    
    // Scoring weights (out of 100)
    uint256 public constant WEIGHT_SMART_CONTRACTS = 30;
    uint256 public constant WEIGHT_USERS = 25;
    uint256 public constant WEIGHT_FEES = 20;
    uint256 public constant WEIGHT_GITHUB = 15;
    uint256 public constant WEIGHT_COMMUNITY = 10;

    struct Developer {
        address devAddress;
        string stacksAddress;      // STX address
        string githubUsername;
        uint256 contractsDeployed;
        uint256 totalUsers;
        uint256 feesGenerated;     // in wei
        uint256 githubScore;       // set by oracle/admin
        uint256 communityScore;    // upvotes, contributions
        uint256 totalScore;
        uint256 registeredAt;
        uint256 lastActivityAt;
        bool isVerified;
        Tier currentTier;
    }

    enum Tier {
        NEWCOMER,    // 0-99 points
        BUILDER,     // 100-499 points
        EXPERT,      // 500-999 points
        MASTER,      // 1000-4999 points
        LEGEND       // 5000+ points
    }

    // Storage
    mapping(address => Developer) public developers;
    mapping(string => address) public stacksToEth;  // STX address -> ETH address
    mapping(string => address) public githubToEth;  // GitHub username -> ETH address
    address[] public developerList;
    
    // Leaderboard cache (top 100)
    address[] public topDevelopers;
    uint256 public lastLeaderboardUpdate;
    
    // Events
    event DeveloperRegistered(address indexed dev, string stacksAddress, uint256 timestamp);
    event DeveloperVerified(address indexed dev, uint256 timestamp);
    event ContractDeployed(address indexed dev, address contractAddress, uint256 timestamp);
    event UsersGained(address indexed dev, uint256 newUsers, uint256 total);
    event FeesCollected(address indexed dev, uint256 amount, uint256 total);
    event ScoreUpdated(address indexed dev, uint256 newScore, Tier newTier);
    event CommunityVote(address indexed voter, address indexed dev, bool upvote);
    event GitHubScoreUpdated(address indexed dev, uint256 score);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register as a Stacks developer
     * @param stacksAddress Your STX address (SP...)
     * @param githubUsername Your GitHub username
     */
    function registerDeveloper(
        string calldata stacksAddress,
        string calldata githubUsername
    ) external {
        require(developers[msg.sender].devAddress == address(0), "Already registered");
        require(bytes(stacksAddress).length > 0, "Stacks address required");
        require(stacksToEth[stacksAddress] == address(0), "Stacks address already linked");
        
        developers[msg.sender] = Developer({
            devAddress: msg.sender,
            stacksAddress: stacksAddress,
            githubUsername: githubUsername,
            contractsDeployed: 0,
            totalUsers: 0,
            feesGenerated: 0,
            githubScore: 0,
            communityScore: 0,
            totalScore: 0,
            registeredAt: block.timestamp,
            lastActivityAt: block.timestamp,
            isVerified: false,
            currentTier: Tier.NEWCOMER
        });
        
        developerList.push(msg.sender);
        stacksToEth[stacksAddress] = msg.sender;
        
        if (bytes(githubUsername).length > 0) {
            githubToEth[githubUsername] = msg.sender;
        }
        
        emit DeveloperRegistered(msg.sender, stacksAddress, block.timestamp);
    }

    /**
     * @dev Record a smart contract deployment
     * @param contractAddress Address of the deployed contract
     */
    function recordContractDeployment(address contractAddress) external {
        require(developers[msg.sender].devAddress != address(0), "Not registered");
        require(contractAddress != address(0), "Invalid contract address");
        
        developers[msg.sender].contractsDeployed++;
        developers[msg.sender].lastActivityAt = block.timestamp;
        
        _updateScore(msg.sender);
        
        emit ContractDeployed(msg.sender, contractAddress, block.timestamp);
    }

    /**
     * @dev Record new users for your application
     * @param userCount Number of new users
     */
    function recordUsers(uint256 userCount) external {
        require(developers[msg.sender].devAddress != address(0), "Not registered");
        require(userCount > 0, "Must add at least 1 user");
        
        developers[msg.sender].totalUsers += userCount;
        developers[msg.sender].lastActivityAt = block.timestamp;
        
        _updateScore(msg.sender);
        
        emit UsersGained(msg.sender, userCount, developers[msg.sender].totalUsers);
    }

    /**
     * @dev Record fees generated (pay to record)
     */
    function recordFees() external payable {
        require(developers[msg.sender].devAddress != address(0), "Not registered");
        require(msg.value > 0, "Must send some value");
        
        developers[msg.sender].feesGenerated += msg.value;
        developers[msg.sender].lastActivityAt = block.timestamp;
        
        _updateScore(msg.sender);
        
        emit FeesCollected(msg.sender, msg.value, developers[msg.sender].feesGenerated);
    }

    /**
     * @dev Community can upvote/downvote developers
     * @param dev Address of developer to vote for
     * @param upvote True for upvote, false for downvote
     */
    function communityVote(address dev, bool upvote) external {
        require(developers[dev].devAddress != address(0), "Developer not found");
        require(msg.sender != dev, "Cannot vote for yourself");
        
        if (upvote) {
            developers[dev].communityScore += 1;
        } else if (developers[dev].communityScore > 0) {
            developers[dev].communityScore -= 1;
        }
        
        _updateScore(dev);
        
        emit CommunityVote(msg.sender, dev, upvote);
    }

    /**
     * @dev Update GitHub score (admin only - or oracle in production)
     * @param dev Developer address
     * @param score New GitHub score
     */
    function updateGitHubScore(address dev, uint256 score) external onlyOwner {
        require(developers[dev].devAddress != address(0), "Developer not found");
        
        developers[dev].githubScore = score;
        _updateScore(dev);
        
        emit GitHubScoreUpdated(dev, score);
    }

    /**
     * @dev Verify a developer (admin only)
     * @param dev Developer address to verify
     */
    function verifyDeveloper(address dev) external onlyOwner {
        require(developers[dev].devAddress != address(0), "Developer not found");
        
        developers[dev].isVerified = true;
        emit DeveloperVerified(dev, block.timestamp);
    }

    /**
     * @dev Calculate and update developer score
     */
    function _updateScore(address dev) internal {
        Developer storage d = developers[dev];
        
        // Normalize each metric (scale to 0-1000 base)
        uint256 contractScore = d.contractsDeployed * 100;
        uint256 userScore = d.totalUsers * 10;
        uint256 feeScore = (d.feesGenerated / 1e15); // Per 0.001 ETH
        uint256 ghScore = d.githubScore * 50;
        uint256 commScore = d.communityScore * 20;
        
        // Cap individual scores
        if (contractScore > 10000) contractScore = 10000;
        if (userScore > 10000) userScore = 10000;
        if (feeScore > 10000) feeScore = 10000;
        if (ghScore > 10000) ghScore = 10000;
        if (commScore > 10000) commScore = 10000;
        
        // Calculate weighted total
        uint256 newScore = (
            (contractScore * WEIGHT_SMART_CONTRACTS) +
            (userScore * WEIGHT_USERS) +
            (feeScore * WEIGHT_FEES) +
            (ghScore * WEIGHT_GITHUB) +
            (commScore * WEIGHT_COMMUNITY)
        ) / 100;
        
        // Bonus for verified developers
        if (d.isVerified) {
            newScore = (newScore * 110) / 100; // 10% bonus
        }
        
        d.totalScore = newScore;
        d.currentTier = _calculateTier(newScore);
        
        emit ScoreUpdated(dev, newScore, d.currentTier);
    }

    /**
     * @dev Calculate tier based on score
     */
    function _calculateTier(uint256 score) internal pure returns (Tier) {
        if (score >= 5000) return Tier.LEGEND;
        if (score >= 1000) return Tier.MASTER;
        if (score >= 500) return Tier.EXPERT;
        if (score >= 100) return Tier.BUILDER;
        return Tier.NEWCOMER;
    }

    /**
     * @dev Get full developer profile
     */
    function getDeveloper(address dev) external view returns (
        string memory stacksAddress,
        string memory githubUsername,
        uint256 contractsDeployed,
        uint256 totalUsers,
        uint256 feesGenerated,
        uint256 githubScore,
        uint256 communityScore,
        uint256 totalScore,
        Tier tier,
        bool isVerified
    ) {
        Developer memory d = developers[dev];
        return (
            d.stacksAddress,
            d.githubUsername,
            d.contractsDeployed,
            d.totalUsers,
            d.feesGenerated,
            d.githubScore,
            d.communityScore,
            d.totalScore,
            d.currentTier,
            d.isVerified
        );
    }

    /**
     * @dev Get leaderboard with pagination
     * @param offset Starting index
     * @param limit Number of entries to return
     */
    function getLeaderboard(uint256 offset, uint256 limit) external view returns (
        address[] memory addresses,
        uint256[] memory scores,
        Tier[] memory tiers
    ) {
        uint256 total = developerList.length;
        if (offset >= total) {
            return (new address[](0), new uint256[](0), new Tier[](0));
        }
        
        uint256 end = offset + limit;
        if (end > total) end = total;
        uint256 count = end - offset;
        
        addresses = new address[](count);
        scores = new uint256[](count);
        tiers = new Tier[](count);
        
        // Create temp array for sorting
        address[] memory tempAddrs = new address[](total);
        uint256[] memory tempScores = new uint256[](total);
        
        for (uint256 i = 0; i < total; i++) {
            tempAddrs[i] = developerList[i];
            tempScores[i] = developers[developerList[i]].totalScore;
        }
        
        // Simple bubble sort (for small lists - use off-chain for large lists)
        for (uint256 i = 0; i < total - 1; i++) {
            for (uint256 j = 0; j < total - i - 1; j++) {
                if (tempScores[j] < tempScores[j + 1]) {
                    // Swap scores
                    uint256 tempScore = tempScores[j];
                    tempScores[j] = tempScores[j + 1];
                    tempScores[j + 1] = tempScore;
                    // Swap addresses
                    address tempAddr = tempAddrs[j];
                    tempAddrs[j] = tempAddrs[j + 1];
                    tempAddrs[j + 1] = tempAddr;
                }
            }
        }
        
        // Fill result arrays
        for (uint256 i = 0; i < count; i++) {
            uint256 idx = offset + i;
            addresses[i] = tempAddrs[idx];
            scores[i] = tempScores[idx];
            tiers[i] = developers[tempAddrs[idx]].currentTier;
        }
        
        return (addresses, scores, tiers);
    }

    /**
     * @dev Get developer rank
     * @param dev Address to check
     */
    function getRank(address dev) external view returns (uint256 rank, uint256 totalDevs) {
        require(developers[dev].devAddress != address(0), "Developer not found");
        
        uint256 devScore = developers[dev].totalScore;
        rank = 1;
        
        for (uint256 i = 0; i < developerList.length; i++) {
            if (developers[developerList[i]].totalScore > devScore) {
                rank++;
            }
        }
        
        return (rank, developerList.length);
    }

    /**
     * @dev Get total developer count
     */
    function getDeveloperCount() external view returns (uint256) {
        return developerList.length;
    }

    /**
     * @dev Get tier statistics
     */
    function getTierStats() external view returns (
        uint256 newcomers,
        uint256 builders,
        uint256 experts,
        uint256 masters,
        uint256 legends
    ) {
        for (uint256 i = 0; i < developerList.length; i++) {
            Tier t = developers[developerList[i]].currentTier;
            if (t == Tier.NEWCOMER) newcomers++;
            else if (t == Tier.BUILDER) builders++;
            else if (t == Tier.EXPERT) experts++;
            else if (t == Tier.MASTER) masters++;
            else if (t == Tier.LEGEND) legends++;
        }
    }

    /**
     * @dev Withdraw contract funds (owner only)
     */
    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
