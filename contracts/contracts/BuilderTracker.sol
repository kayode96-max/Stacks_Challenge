// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BuilderTracker
 * @dev Tracks builder activity including users and fees for the Builder Challenge
 */
contract BuilderTracker is Ownable {
    struct Builder {
        address builderAddress;
        uint256 totalUsers;
        uint256 totalFees;
        uint256 lastUpdateTime;
        bool isActive;
    }

    // Mapping from builder address to their stats
    mapping(address => Builder) public builders;
    
    // Array to keep track of all builders
    address[] public builderAddresses;
    
    // Events
    event BuilderRegistered(address indexed builder, uint256 timestamp);
    event UserAdded(address indexed builder, address indexed user, uint256 timestamp);
    event FeeCollected(address indexed builder, uint256 amount, uint256 timestamp);
    event BuilderUpdated(address indexed builder, uint256 totalUsers, uint256 totalFees);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new builder
     */
    function registerBuilder() external {
        require(!builders[msg.sender].isActive, "Builder already registered");
        
        builders[msg.sender] = Builder({
            builderAddress: msg.sender,
            totalUsers: 0,
            totalFees: 0,
            lastUpdateTime: block.timestamp,
            isActive: true
        });
        
        builderAddresses.push(msg.sender);
        emit BuilderRegistered(msg.sender, block.timestamp);
    }

    /**
     * @dev Record a new user for a builder
     * @param user Address of the new user
     */
    function addUser(address user) external {
        require(builders[msg.sender].isActive, "Builder not registered");
        require(user != address(0), "Invalid user address");
        
        builders[msg.sender].totalUsers++;
        builders[msg.sender].lastUpdateTime = block.timestamp;
        
        emit UserAdded(msg.sender, user, block.timestamp);
        emit BuilderUpdated(msg.sender, builders[msg.sender].totalUsers, builders[msg.sender].totalFees);
    }

    /**
     * @dev Record fees collected by a builder
     */
    function collectFee() external payable {
        require(builders[msg.sender].isActive, "Builder not registered");
        require(msg.value > 0, "Fee must be greater than 0");
        
        builders[msg.sender].totalFees += msg.value;
        builders[msg.sender].lastUpdateTime = block.timestamp;
        
        emit FeeCollected(msg.sender, msg.value, block.timestamp);
        emit BuilderUpdated(msg.sender, builders[msg.sender].totalUsers, builders[msg.sender].totalFees);
    }

    /**
     * @dev Get builder stats
     * @param builder Address of the builder
     */
    function getBuilderStats(address builder) external view returns (
        uint256 totalUsers,
        uint256 totalFees,
        uint256 lastUpdateTime,
        bool isActive
    ) {
        Builder memory b = builders[builder];
        return (b.totalUsers, b.totalFees, b.lastUpdateTime, b.isActive);
    }

    /**
     * @dev Get all registered builders
     */
    function getAllBuilders() external view returns (address[] memory) {
        return builderAddresses;
    }

    /**
     * @dev Get leaderboard data (top builders by combined score)
     * @param limit Maximum number of builders to return
     */
    function getLeaderboard(uint256 limit) external view returns (
        address[] memory addresses,
        uint256[] memory users,
        uint256[] memory fees
    ) {
        uint256 count = builderAddresses.length;
        if (limit < count) {
            count = limit;
        }

        addresses = new address[](count);
        users = new uint256[](count);
        fees = new uint256[](count);

        // Simple implementation - in production, consider off-chain sorting
        for (uint256 i = 0; i < count && i < builderAddresses.length; i++) {
            address builderAddr = builderAddresses[i];
            addresses[i] = builderAddr;
            users[i] = builders[builderAddr].totalUsers;
            fees[i] = builders[builderAddr].totalFees;
        }

        return (addresses, users, fees);
    }

    /**
     * @dev Withdraw collected fees (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Get contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
