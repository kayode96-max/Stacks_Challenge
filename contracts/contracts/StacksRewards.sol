// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title StacksRewards
 * @dev Reward distribution system for top Stacks developers
 * Weekly/monthly rewards based on leaderboard rankings
 */
contract StacksRewards is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct RewardPool {
        uint256 totalAmount;
        uint256 distributedAmount;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        RewardType rewardType;
        mapping(address => uint256) claimed;
        mapping(address => uint256) allocations;
    }

    struct DeveloperReward {
        uint256 totalEarned;
        uint256 totalClaimed;
        uint256 lastClaimTime;
        uint256 poolsParticipated;
    }

    enum RewardType {
        WEEKLY,
        MONTHLY,
        SPECIAL_EVENT,
        BOUNTY
    }

    // Storage
    uint256 public currentPoolId;
    mapping(uint256 => RewardPool) public rewardPools;
    mapping(address => DeveloperReward) public developerRewards;
    
    // Reward distribution percentages for top ranks (basis points, 100 = 1%)
    uint256[] public rankRewardBps = [3000, 2000, 1500, 1000, 500, 300, 200, 200, 150, 150];
    
    // Linked leaderboard contract
    address public leaderboardContract;
    
    // Events
    event PoolCreated(uint256 indexed poolId, uint256 amount, RewardType rewardType, uint256 endTime);
    event RewardAllocated(uint256 indexed poolId, address indexed developer, uint256 amount);
    event RewardClaimed(address indexed developer, uint256 indexed poolId, uint256 amount);
    event PoolFinalized(uint256 indexed poolId, uint256 totalDistributed);
    event LeaderboardContractUpdated(address indexed newContract);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Set the linked leaderboard contract
     */
    function setLeaderboardContract(address _leaderboard) external onlyOwner {
        require(_leaderboard != address(0), "Invalid address");
        leaderboardContract = _leaderboard;
        emit LeaderboardContractUpdated(_leaderboard);
    }

    /**
     * @dev Create a new reward pool
     * @param duration Duration in seconds
     * @param rewardType Type of reward pool
     */
    function createPool(
        uint256 duration,
        RewardType rewardType
    ) external payable onlyOwner returns (uint256) {
        require(msg.value > 0, "Must fund pool");
        require(duration > 0, "Invalid duration");
        
        uint256 poolId = currentPoolId++;
        RewardPool storage pool = rewardPools[poolId];
        
        pool.totalAmount = msg.value;
        pool.startTime = block.timestamp;
        pool.endTime = block.timestamp + duration;
        pool.isActive = true;
        pool.rewardType = rewardType;
        
        emit PoolCreated(poolId, msg.value, rewardType, pool.endTime);
        
        return poolId;
    }

    /**
     * @dev Fund an existing pool
     */
    function fundPool(uint256 poolId) external payable onlyOwner {
        require(rewardPools[poolId].isActive, "Pool not active");
        require(msg.value > 0, "Must send value");
        
        rewardPools[poolId].totalAmount += msg.value;
    }

    /**
     * @dev Allocate rewards to top developers
     * @param poolId Pool to allocate from
     * @param topDevelopers Array of top developer addresses (ranked)
     */
    function allocateRewards(
        uint256 poolId,
        address[] calldata topDevelopers
    ) external onlyOwner {
        RewardPool storage pool = rewardPools[poolId];
        require(pool.isActive, "Pool not active");
        require(block.timestamp >= pool.endTime, "Pool period not ended");
        require(topDevelopers.length > 0, "No developers");
        
        uint256 remainingPool = pool.totalAmount - pool.distributedAmount;
        require(remainingPool > 0, "Pool exhausted");
        
        uint256 totalAllocated = 0;
        uint256 maxRanks = topDevelopers.length > rankRewardBps.length ? rankRewardBps.length : topDevelopers.length;
        
        for (uint256 i = 0; i < maxRanks; i++) {
            address dev = topDevelopers[i];
            if (dev == address(0)) continue;
            
            uint256 reward = (pool.totalAmount * rankRewardBps[i]) / 10000;
            if (reward > remainingPool - totalAllocated) {
                reward = remainingPool - totalAllocated;
            }
            
            pool.allocations[dev] += reward;
            developerRewards[dev].totalEarned += reward;
            developerRewards[dev].poolsParticipated++;
            totalAllocated += reward;
            
            emit RewardAllocated(poolId, dev, reward);
        }
        
        pool.distributedAmount += totalAllocated;
    }

    /**
     * @dev Claim allocated rewards from a pool
     */
    function claimReward(uint256 poolId) external nonReentrant {
        RewardPool storage pool = rewardPools[poolId];
        require(pool.allocations[msg.sender] > 0, "No allocation");
        require(pool.claimed[msg.sender] == 0, "Already claimed");
        
        uint256 amount = pool.allocations[msg.sender];
        pool.claimed[msg.sender] = amount;
        developerRewards[msg.sender].totalClaimed += amount;
        developerRewards[msg.sender].lastClaimTime = block.timestamp;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, poolId, amount);
    }

    /**
     * @dev Claim all pending rewards from multiple pools
     */
    function claimAllRewards(uint256[] calldata poolIds) external nonReentrant {
        uint256 totalToClaim = 0;
        
        for (uint256 i = 0; i < poolIds.length; i++) {
            uint256 poolId = poolIds[i];
            RewardPool storage pool = rewardPools[poolId];
            
            if (pool.allocations[msg.sender] > 0 && pool.claimed[msg.sender] == 0) {
                uint256 amount = pool.allocations[msg.sender];
                pool.claimed[msg.sender] = amount;
                totalToClaim += amount;
                
                emit RewardClaimed(msg.sender, poolId, amount);
            }
        }
        
        require(totalToClaim > 0, "Nothing to claim");
        
        developerRewards[msg.sender].totalClaimed += totalToClaim;
        developerRewards[msg.sender].lastClaimTime = block.timestamp;
        
        (bool success, ) = payable(msg.sender).call{value: totalToClaim}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Finalize a pool and return unclaimed funds
     */
    function finalizePool(uint256 poolId) external onlyOwner {
        RewardPool storage pool = rewardPools[poolId];
        require(pool.isActive, "Pool not active");
        require(block.timestamp >= pool.endTime + 30 days, "Claim period not ended");
        
        pool.isActive = false;
        
        // Calculate unclaimed
        uint256 unclaimed = pool.totalAmount - pool.distributedAmount;
        
        if (unclaimed > 0) {
            (bool success, ) = payable(owner()).call{value: unclaimed}("");
            require(success, "Transfer failed");
        }
        
        emit PoolFinalized(poolId, pool.distributedAmount);
    }

    /**
     * @dev Update rank reward percentages
     */
    function setRankRewardBps(uint256[] calldata newBps) external onlyOwner {
        uint256 total = 0;
        for (uint256 i = 0; i < newBps.length; i++) {
            total += newBps[i];
        }
        require(total <= 10000, "Total exceeds 100%");
        rankRewardBps = newBps;
    }

    /**
     * @dev Get developer's pending rewards across all pools
     */
    function getPendingRewards(address developer) external view returns (
        uint256 totalPending,
        uint256[] memory poolIds,
        uint256[] memory amounts
    ) {
        // First pass: count pools with pending rewards
        uint256 count = 0;
        for (uint256 i = 0; i < currentPoolId; i++) {
            if (rewardPools[i].allocations[developer] > 0 && 
                rewardPools[i].claimed[developer] == 0) {
                count++;
            }
        }
        
        poolIds = new uint256[](count);
        amounts = new uint256[](count);
        
        // Second pass: fill arrays
        uint256 idx = 0;
        for (uint256 i = 0; i < currentPoolId; i++) {
            uint256 allocation = rewardPools[i].allocations[developer];
            if (allocation > 0 && rewardPools[i].claimed[developer] == 0) {
                poolIds[idx] = i;
                amounts[idx] = allocation;
                totalPending += allocation;
                idx++;
            }
        }
    }

    /**
     * @dev Get pool details
     */
    function getPoolDetails(uint256 poolId) external view returns (
        uint256 totalAmount,
        uint256 distributedAmount,
        uint256 startTime,
        uint256 endTime,
        bool isActive,
        RewardType rewardType
    ) {
        RewardPool storage pool = rewardPools[poolId];
        return (
            pool.totalAmount,
            pool.distributedAmount,
            pool.startTime,
            pool.endTime,
            pool.isActive,
            pool.rewardType
        );
    }

    /**
     * @dev Get developer reward stats
     */
    function getDeveloperStats(address developer) external view returns (
        uint256 totalEarned,
        uint256 totalClaimed,
        uint256 pendingClaims,
        uint256 poolsParticipated
    ) {
        DeveloperReward memory dr = developerRewards[developer];
        return (
            dr.totalEarned,
            dr.totalClaimed,
            dr.totalEarned - dr.totalClaimed,
            dr.poolsParticipated
        );
    }

    /**
     * @dev Check allocation for a developer in a pool
     */
    function getAllocation(uint256 poolId, address developer) external view returns (
        uint256 allocated,
        uint256 claimed,
        bool canClaim
    ) {
        RewardPool storage pool = rewardPools[poolId];
        return (
            pool.allocations[developer],
            pool.claimed[developer],
            pool.allocations[developer] > 0 && pool.claimed[developer] == 0
        );
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    receive() external payable {}
}
