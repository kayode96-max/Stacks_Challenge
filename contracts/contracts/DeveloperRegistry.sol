// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title DeveloperRegistry
 * @dev Central registry for Stacks developers with verification and reputation
 */
contract DeveloperRegistry is AccessControl, ReentrancyGuard {
    
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");

    struct DeveloperProfile {
        // Identity
        address ethAddress;
        string stacksAddress;
        string githubUsername;
        string displayName;
        string bio;
        string avatarUrl;
        
        // Status
        bool isRegistered;
        bool isVerified;
        VerificationLevel verificationLevel;
        
        // Timestamps
        uint256 registeredAt;
        uint256 verifiedAt;
        uint256 lastActiveAt;
        
        // Stats (updated by oracles)
        uint256 reputationScore;
        uint256 totalContractsDeployed;
        uint256 totalTransactions;
        uint256 totalVolumeWei;
        
        // Social
        uint256 followers;
        uint256 following;
    }

    enum VerificationLevel {
        NONE,
        BASIC,      // Email verified
        GITHUB,     // GitHub verified
        KYC,        // Full KYC
        TRUSTED     // Trusted developer status
    }

    // Storage
    mapping(address => DeveloperProfile) public profiles;
    mapping(string => address) public stacksAddressToEth;
    mapping(string => address) public githubToEth;
    mapping(string => address) public displayNameToEth;
    
    address[] public allDevelopers;
    
    // Social graph
    mapping(address => mapping(address => bool)) public isFollowing;
    mapping(address => address[]) public followersList;
    mapping(address => address[]) public followingList;
    
    // Reputation components
    mapping(address => mapping(string => uint256)) public reputationComponents;
    
    // Events
    event DeveloperRegistered(address indexed dev, string stacksAddress, uint256 timestamp);
    event ProfileUpdated(address indexed dev, string field, uint256 timestamp);
    event DeveloperVerified(address indexed dev, VerificationLevel level, uint256 timestamp);
    event ReputationUpdated(address indexed dev, uint256 newScore, string component);
    event FollowChanged(address indexed follower, address indexed followed, bool isFollowing);
    event StatsUpdated(address indexed dev, uint256 contracts, uint256 txs, uint256 volume);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        _grantRole(ORACLE_ROLE, msg.sender);
    }

    /**
     * @dev Register as a Stacks developer
     */
    function register(
        string calldata stacksAddress,
        string calldata githubUsername,
        string calldata displayName,
        string calldata bio
    ) external {
        require(!profiles[msg.sender].isRegistered, "Already registered");
        require(bytes(stacksAddress).length > 0, "Stacks address required");
        require(stacksAddressToEth[stacksAddress] == address(0), "Stacks address taken");
        
        if (bytes(displayName).length > 0) {
            require(displayNameToEth[displayName] == address(0), "Display name taken");
            displayNameToEth[displayName] = msg.sender;
        }
        
        profiles[msg.sender] = DeveloperProfile({
            ethAddress: msg.sender,
            stacksAddress: stacksAddress,
            githubUsername: githubUsername,
            displayName: displayName,
            bio: bio,
            avatarUrl: "",
            isRegistered: true,
            isVerified: false,
            verificationLevel: VerificationLevel.NONE,
            registeredAt: block.timestamp,
            verifiedAt: 0,
            lastActiveAt: block.timestamp,
            reputationScore: 0,
            totalContractsDeployed: 0,
            totalTransactions: 0,
            totalVolumeWei: 0,
            followers: 0,
            following: 0
        });
        
        stacksAddressToEth[stacksAddress] = msg.sender;
        if (bytes(githubUsername).length > 0) {
            githubToEth[githubUsername] = msg.sender;
        }
        
        allDevelopers.push(msg.sender);
        
        emit DeveloperRegistered(msg.sender, stacksAddress, block.timestamp);
    }

    /**
     * @dev Update profile fields
     */
    function updateProfile(
        string calldata displayName,
        string calldata bio,
        string calldata avatarUrl
    ) external {
        require(profiles[msg.sender].isRegistered, "Not registered");
        
        DeveloperProfile storage profile = profiles[msg.sender];
        
        // Update display name if changed
        if (keccak256(bytes(displayName)) != keccak256(bytes(profile.displayName))) {
            if (bytes(profile.displayName).length > 0) {
                delete displayNameToEth[profile.displayName];
            }
            if (bytes(displayName).length > 0) {
                require(displayNameToEth[displayName] == address(0), "Display name taken");
                displayNameToEth[displayName] = msg.sender;
            }
            profile.displayName = displayName;
        }
        
        profile.bio = bio;
        profile.avatarUrl = avatarUrl;
        profile.lastActiveAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender, "profile", block.timestamp);
    }

    /**
     * @dev Link/update GitHub username
     */
    function linkGitHub(string calldata githubUsername) external {
        require(profiles[msg.sender].isRegistered, "Not registered");
        require(githubToEth[githubUsername] == address(0), "GitHub already linked");
        
        DeveloperProfile storage profile = profiles[msg.sender];
        
        // Remove old mapping
        if (bytes(profile.githubUsername).length > 0) {
            delete githubToEth[profile.githubUsername];
        }
        
        profile.githubUsername = githubUsername;
        githubToEth[githubUsername] = msg.sender;
        profile.lastActiveAt = block.timestamp;
        
        emit ProfileUpdated(msg.sender, "github", block.timestamp);
    }

    /**
     * @dev Verify a developer (verifier role)
     */
    function verifyDeveloper(
        address dev,
        VerificationLevel level
    ) external onlyRole(VERIFIER_ROLE) {
        require(profiles[dev].isRegistered, "Not registered");
        require(level > profiles[dev].verificationLevel, "Cannot downgrade");
        
        profiles[dev].isVerified = true;
        profiles[dev].verificationLevel = level;
        profiles[dev].verifiedAt = block.timestamp;
        
        // Reputation boost for verification
        uint256 boost = uint256(level) * 50;
        reputationComponents[dev]["verification"] = boost;
        _recalculateReputation(dev);
        
        emit DeveloperVerified(dev, level, block.timestamp);
    }

    /**
     * @dev Update developer stats (oracle role)
     */
    function updateStats(
        address dev,
        uint256 contractsDeployed,
        uint256 transactions,
        uint256 volumeWei
    ) external onlyRole(ORACLE_ROLE) {
        require(profiles[dev].isRegistered, "Not registered");
        
        DeveloperProfile storage profile = profiles[dev];
        profile.totalContractsDeployed = contractsDeployed;
        profile.totalTransactions = transactions;
        profile.totalVolumeWei = volumeWei;
        profile.lastActiveAt = block.timestamp;
        
        // Update reputation components
        reputationComponents[dev]["contracts"] = contractsDeployed * 10;
        reputationComponents[dev]["transactions"] = transactions / 10;
        reputationComponents[dev]["volume"] = volumeWei / 1e18; // Per ETH
        
        _recalculateReputation(dev);
        
        emit StatsUpdated(dev, contractsDeployed, transactions, volumeWei);
    }

    /**
     * @dev Set reputation component (oracle role)
     */
    function setReputationComponent(
        address dev,
        string calldata component,
        uint256 value
    ) external onlyRole(ORACLE_ROLE) {
        require(profiles[dev].isRegistered, "Not registered");
        
        reputationComponents[dev][component] = value;
        _recalculateReputation(dev);
        
        emit ReputationUpdated(dev, profiles[dev].reputationScore, component);
    }

    /**
     * @dev Follow a developer
     */
    function follow(address dev) external {
        require(profiles[msg.sender].isRegistered, "Caller not registered");
        require(profiles[dev].isRegistered, "Target not registered");
        require(msg.sender != dev, "Cannot follow yourself");
        require(!isFollowing[msg.sender][dev], "Already following");
        
        isFollowing[msg.sender][dev] = true;
        followersList[dev].push(msg.sender);
        followingList[msg.sender].push(dev);
        
        profiles[dev].followers++;
        profiles[msg.sender].following++;
        
        // Update social reputation
        reputationComponents[dev]["social"] = profiles[dev].followers * 2;
        _recalculateReputation(dev);
        
        emit FollowChanged(msg.sender, dev, true);
    }

    /**
     * @dev Unfollow a developer
     */
    function unfollow(address dev) external {
        require(isFollowing[msg.sender][dev], "Not following");
        
        isFollowing[msg.sender][dev] = false;
        profiles[dev].followers--;
        profiles[msg.sender].following--;
        
        // Update social reputation
        reputationComponents[dev]["social"] = profiles[dev].followers * 2;
        _recalculateReputation(dev);
        
        emit FollowChanged(msg.sender, dev, false);
    }

    /**
     * @dev Record activity (for activity tracking)
     */
    function recordActivity() external {
        require(profiles[msg.sender].isRegistered, "Not registered");
        profiles[msg.sender].lastActiveAt = block.timestamp;
    }

    /**
     * @dev Recalculate total reputation score
     */
    function _recalculateReputation(address dev) internal {
        uint256 total = 0;
        total += reputationComponents[dev]["verification"];
        total += reputationComponents[dev]["contracts"];
        total += reputationComponents[dev]["transactions"];
        total += reputationComponents[dev]["volume"];
        total += reputationComponents[dev]["social"];
        total += reputationComponents[dev]["github"];
        total += reputationComponents[dev]["achievements"];
        
        profiles[dev].reputationScore = total;
    }

    // View functions
    
    function getProfile(address dev) external view returns (DeveloperProfile memory) {
        return profiles[dev];
    }

    function isRegistered(address dev) external view returns (bool) {
        return profiles[dev].isRegistered;
    }

    function getDeveloperCount() external view returns (uint256) {
        return allDevelopers.length;
    }

    function getDeveloperByIndex(uint256 index) external view returns (address) {
        require(index < allDevelopers.length, "Index out of bounds");
        return allDevelopers[index];
    }

    function getTopByReputation(uint256 limit) external view returns (
        address[] memory devs,
        uint256[] memory scores
    ) {
        uint256 count = allDevelopers.length < limit ? allDevelopers.length : limit;
        devs = new address[](count);
        scores = new uint256[](count);
        
        // Copy and sort (simple implementation)
        address[] memory sorted = new address[](allDevelopers.length);
        for (uint256 i = 0; i < allDevelopers.length; i++) {
            sorted[i] = allDevelopers[i];
        }
        
        // Bubble sort by reputation
        for (uint256 i = 0; i < sorted.length - 1; i++) {
            for (uint256 j = 0; j < sorted.length - i - 1; j++) {
                if (profiles[sorted[j]].reputationScore < profiles[sorted[j + 1]].reputationScore) {
                    address temp = sorted[j];
                    sorted[j] = sorted[j + 1];
                    sorted[j + 1] = temp;
                }
            }
        }
        
        for (uint256 i = 0; i < count; i++) {
            devs[i] = sorted[i];
            scores[i] = profiles[sorted[i]].reputationScore;
        }
    }

    function getFollowers(address dev) external view returns (address[] memory) {
        return followersList[dev];
    }

    function getFollowing(address dev) external view returns (address[] memory) {
        return followingList[dev];
    }

    function lookupByStacksAddress(string calldata stx) external view returns (address) {
        return stacksAddressToEth[stx];
    }

    function lookupByGitHub(string calldata github) external view returns (address) {
        return githubToEth[github];
    }
}
