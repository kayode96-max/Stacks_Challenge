// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BuilderAchievements
 * @dev NFT achievements for Stacks developers
 * Milestones unlock unique achievement NFTs
 */
contract BuilderAchievements is ERC721, ERC721URIStorage, Ownable {
    
    uint256 private _nextTokenId;

    enum AchievementType {
        FIRST_CONTRACT,      // Deploy first contract
        TEN_CONTRACTS,       // Deploy 10 contracts
        HUNDRED_USERS,       // Get 100 users
        THOUSAND_USERS,      // Get 1000 users
        FEE_COLLECTOR,       // Collect 0.1 ETH in fees
        FEE_MASTER,          // Collect 1 ETH in fees
        GITHUB_CONTRIBUTOR,  // Link GitHub with 10+ commits
        GITHUB_LEGEND,       // 100+ commits
        COMMUNITY_FAVORITE,  // Get 50 upvotes
        VERIFIED_BUILDER,    // Get verified
        TIER_BUILDER,        // Reach Builder tier
        TIER_EXPERT,         // Reach Expert tier
        TIER_MASTER,         // Reach Master tier
        TIER_LEGEND,         // Reach Legend tier
        EARLY_ADOPTER,       // Register in first week
        STREAK_7_DAYS,       // Active 7 days in a row
        STREAK_30_DAYS       // Active 30 days in a row
    }

    struct Achievement {
        AchievementType achievementType;
        uint256 unlockedAt;
        string metadata;
    }

    // Developer achievements tracking
    mapping(address => mapping(AchievementType => bool)) public hasAchievement;
    mapping(address => uint256[]) public developerTokens;
    mapping(uint256 => Achievement) public tokenAchievement;
    
    // Achievement metadata URIs
    mapping(AchievementType => string) public achievementURIs;
    
    // Activity tracking for streaks
    mapping(address => uint256) public lastActivityDay;
    mapping(address => uint256) public currentStreak;
    
    // Authorized contracts that can grant achievements
    mapping(address => bool) public authorizedGranters;
    
    // Registration timestamp for early adopter
    uint256 public launchTimestamp;

    // Events
    event AchievementUnlocked(
        address indexed developer,
        AchievementType indexed achievement,
        uint256 tokenId,
        uint256 timestamp
    );
    event GranterAuthorized(address indexed granter, bool authorized);

    constructor() ERC721("Stacks Builder Achievement", "STACKSACH") Ownable(msg.sender) {
        launchTimestamp = block.timestamp;
        _setDefaultURIs();
    }

    /**
     * @dev Set default achievement URIs
     */
    function _setDefaultURIs() internal {
        achievementURIs[AchievementType.FIRST_CONTRACT] = "ipfs://achievement/first-contract";
        achievementURIs[AchievementType.TEN_CONTRACTS] = "ipfs://achievement/ten-contracts";
        achievementURIs[AchievementType.HUNDRED_USERS] = "ipfs://achievement/hundred-users";
        achievementURIs[AchievementType.THOUSAND_USERS] = "ipfs://achievement/thousand-users";
        achievementURIs[AchievementType.FEE_COLLECTOR] = "ipfs://achievement/fee-collector";
        achievementURIs[AchievementType.FEE_MASTER] = "ipfs://achievement/fee-master";
        achievementURIs[AchievementType.GITHUB_CONTRIBUTOR] = "ipfs://achievement/github-contributor";
        achievementURIs[AchievementType.GITHUB_LEGEND] = "ipfs://achievement/github-legend";
        achievementURIs[AchievementType.COMMUNITY_FAVORITE] = "ipfs://achievement/community-favorite";
        achievementURIs[AchievementType.VERIFIED_BUILDER] = "ipfs://achievement/verified-builder";
        achievementURIs[AchievementType.TIER_BUILDER] = "ipfs://achievement/tier-builder";
        achievementURIs[AchievementType.TIER_EXPERT] = "ipfs://achievement/tier-expert";
        achievementURIs[AchievementType.TIER_MASTER] = "ipfs://achievement/tier-master";
        achievementURIs[AchievementType.TIER_LEGEND] = "ipfs://achievement/tier-legend";
        achievementURIs[AchievementType.EARLY_ADOPTER] = "ipfs://achievement/early-adopter";
        achievementURIs[AchievementType.STREAK_7_DAYS] = "ipfs://achievement/streak-7";
        achievementURIs[AchievementType.STREAK_30_DAYS] = "ipfs://achievement/streak-30";
    }

    /**
     * @dev Authorize a contract to grant achievements
     */
    function setAuthorizedGranter(address granter, bool authorized) external onlyOwner {
        authorizedGranters[granter] = authorized;
        emit GranterAuthorized(granter, authorized);
    }

    /**
     * @dev Grant an achievement to a developer
     */
    function grantAchievement(
        address developer,
        AchievementType achievement
    ) external returns (uint256) {
        require(
            msg.sender == owner() || authorizedGranters[msg.sender],
            "Not authorized"
        );
        require(!hasAchievement[developer][achievement], "Already has achievement");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(developer, tokenId);
        _setTokenURI(tokenId, achievementURIs[achievement]);
        
        hasAchievement[developer][achievement] = true;
        developerTokens[developer].push(tokenId);
        
        tokenAchievement[tokenId] = Achievement({
            achievementType: achievement,
            unlockedAt: block.timestamp,
            metadata: achievementURIs[achievement]
        });
        
        emit AchievementUnlocked(developer, achievement, tokenId, block.timestamp);
        
        return tokenId;
    }

    /**
     * @dev Self-claim early adopter achievement (within 7 days of launch)
     */
    function claimEarlyAdopter() external returns (uint256) {
        require(
            block.timestamp <= launchTimestamp + 7 days,
            "Early adopter period ended"
        );
        require(!hasAchievement[msg.sender][AchievementType.EARLY_ADOPTER], "Already claimed");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, achievementURIs[AchievementType.EARLY_ADOPTER]);
        
        hasAchievement[msg.sender][AchievementType.EARLY_ADOPTER] = true;
        developerTokens[msg.sender].push(tokenId);
        
        tokenAchievement[tokenId] = Achievement({
            achievementType: AchievementType.EARLY_ADOPTER,
            unlockedAt: block.timestamp,
            metadata: achievementURIs[AchievementType.EARLY_ADOPTER]
        });
        
        emit AchievementUnlocked(
            msg.sender,
            AchievementType.EARLY_ADOPTER,
            tokenId,
            block.timestamp
        );
        
        return tokenId;
    }

    /**
     * @dev Record daily activity for streak tracking
     */
    function recordActivity(address developer) external {
        require(
            msg.sender == owner() || authorizedGranters[msg.sender],
            "Not authorized"
        );
        
        uint256 today = block.timestamp / 1 days;
        uint256 lastDay = lastActivityDay[developer];
        
        if (today == lastDay) {
            // Already recorded today
            return;
        }
        
        if (today == lastDay + 1) {
            // Consecutive day
            currentStreak[developer]++;
        } else {
            // Streak broken
            currentStreak[developer] = 1;
        }
        
        lastActivityDay[developer] = today;
        
        // Check for streak achievements
        if (currentStreak[developer] >= 7 && !hasAchievement[developer][AchievementType.STREAK_7_DAYS]) {
            _grantStreakAchievement(developer, AchievementType.STREAK_7_DAYS);
        }
        if (currentStreak[developer] >= 30 && !hasAchievement[developer][AchievementType.STREAK_30_DAYS]) {
            _grantStreakAchievement(developer, AchievementType.STREAK_30_DAYS);
        }
    }

    function _grantStreakAchievement(address developer, AchievementType achievement) internal {
        uint256 tokenId = _nextTokenId++;
        _safeMint(developer, tokenId);
        _setTokenURI(tokenId, achievementURIs[achievement]);
        
        hasAchievement[developer][achievement] = true;
        developerTokens[developer].push(tokenId);
        
        tokenAchievement[tokenId] = Achievement({
            achievementType: achievement,
            unlockedAt: block.timestamp,
            metadata: achievementURIs[achievement]
        });
        
        emit AchievementUnlocked(developer, achievement, tokenId, block.timestamp);
    }

    /**
     * @dev Update achievement URI
     */
    function setAchievementURI(AchievementType achievement, string calldata uri) external onlyOwner {
        achievementURIs[achievement] = uri;
    }

    /**
     * @dev Get all achievements for a developer
     */
    function getDeveloperAchievements(address developer) external view returns (
        uint256[] memory tokenIds,
        AchievementType[] memory types,
        uint256[] memory unlockedTimes
    ) {
        uint256[] memory tokens = developerTokens[developer];
        tokenIds = tokens;
        types = new AchievementType[](tokens.length);
        unlockedTimes = new uint256[](tokens.length);
        
        for (uint256 i = 0; i < tokens.length; i++) {
            types[i] = tokenAchievement[tokens[i]].achievementType;
            unlockedTimes[i] = tokenAchievement[tokens[i]].unlockedAt;
        }
    }

    /**
     * @dev Get achievement count for developer
     */
    function getAchievementCount(address developer) external view returns (uint256) {
        return developerTokens[developer].length;
    }

    /**
     * @dev Check if developer has specific achievement
     */
    function checkAchievement(address developer, AchievementType achievement) external view returns (bool) {
        return hasAchievement[developer][achievement];
    }

    /**
     * @dev Get current streak for developer
     */
    function getStreak(address developer) external view returns (uint256) {
        uint256 today = block.timestamp / 1 days;
        if (lastActivityDay[developer] < today - 1) {
            return 0; // Streak broken
        }
        return currentStreak[developer];
    }

    // Override required functions
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
