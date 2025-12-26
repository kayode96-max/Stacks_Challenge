import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Deploying Stacks Builder Challenge contracts...\n");

  const fs = require("fs");
  const path = require("path");
  const frontendDir = path.join(__dirname, "../../frontend/src/contracts");
  
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  // 1. Deploy BuilderTracker
  console.log("📦 Deploying BuilderTracker...");
  const BuilderTracker = await ethers.getContractFactory("BuilderTracker");
  const builderTracker = await BuilderTracker.deploy();
  await builderTracker.waitForDeployment();
  const builderTrackerAddress = await builderTracker.getAddress();
  console.log(`   ✅ BuilderTracker: ${builderTrackerAddress}`);

  // 2. Deploy StacksLeaderboard
  console.log("📦 Deploying StacksLeaderboard...");
  const StacksLeaderboard = await ethers.getContractFactory("StacksLeaderboard");
  const stacksLeaderboard = await StacksLeaderboard.deploy();
  await stacksLeaderboard.waitForDeployment();
  const stacksLeaderboardAddress = await stacksLeaderboard.getAddress();
  console.log(`   ✅ StacksLeaderboard: ${stacksLeaderboardAddress}`);

  // 3. Deploy BuilderAchievements
  console.log("📦 Deploying BuilderAchievements...");
  const BuilderAchievements = await ethers.getContractFactory("BuilderAchievements");
  const builderAchievements = await BuilderAchievements.deploy();
  await builderAchievements.waitForDeployment();
  const builderAchievementsAddress = await builderAchievements.getAddress();
  console.log(`   ✅ BuilderAchievements: ${builderAchievementsAddress}`);

  // 4. Deploy StacksRewards
  console.log("📦 Deploying StacksRewards...");
  const StacksRewards = await ethers.getContractFactory("StacksRewards");
  const stacksRewards = await StacksRewards.deploy();
  await stacksRewards.waitForDeployment();
  const stacksRewardsAddress = await stacksRewards.getAddress();
  console.log(`   ✅ StacksRewards: ${stacksRewardsAddress}`);

  // 5. Deploy DeveloperRegistry
  console.log("📦 Deploying DeveloperRegistry...");
  const DeveloperRegistry = await ethers.getContractFactory("DeveloperRegistry");
  const developerRegistry = await DeveloperRegistry.deploy();
  await developerRegistry.waitForDeployment();
  const developerRegistryAddress = await developerRegistry.getAddress();
  console.log(`   ✅ DeveloperRegistry: ${developerRegistryAddress}`);

  // Link contracts
  console.log("\n🔗 Linking contracts...");
  
  // Set StacksLeaderboard as authorized granter for achievements
  await builderAchievements.setAuthorizedGranter(stacksLeaderboardAddress, true);
  console.log("   ✅ StacksLeaderboard authorized for BuilderAchievements");
  
  // Set leaderboard contract in rewards
  await stacksRewards.setLeaderboardContract(stacksLeaderboardAddress);
  console.log("   ✅ StacksLeaderboard linked to StacksRewards");

  // Save deployment info
  const deploymentInfo = {
    builderTracker: builderTrackerAddress,
    stacksLeaderboard: stacksLeaderboardAddress,
    builderAchievements: builderAchievementsAddress,
    stacksRewards: stacksRewardsAddress,
    developerRegistry: developerRegistryAddress,
    network: "localhost",
    chainId: 1337,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync(
    path.join(frontendDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n📄 Deployment info saved to frontend/src/contracts/deployment.json");
  console.log("\n🎉 All contracts deployed successfully!\n");
  
  console.log("Contract Addresses:");
  console.log("==================");
  console.log(`BuilderTracker:      ${builderTrackerAddress}`);
  console.log(`StacksLeaderboard:   ${stacksLeaderboardAddress}`);
  console.log(`BuilderAchievements: ${builderAchievementsAddress}`);
  console.log(`StacksRewards:       ${stacksRewardsAddress}`);
  console.log(`DeveloperRegistry:   ${developerRegistryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
