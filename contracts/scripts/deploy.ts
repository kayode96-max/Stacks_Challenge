import { ethers } from "hardhat";

async function main() {
  console.log("Deploying BuilderTracker contract...");

  const BuilderTracker = await ethers.getContractFactory("BuilderTracker");
  const builderTracker = await BuilderTracker.deploy();

  await builderTracker.waitForDeployment();

  const address = await builderTracker.getAddress();
  console.log(`BuilderTracker deployed to: ${address}`);

  // Save the contract address for frontend use
  const fs = require("fs");
  const path = require("path");
  
  const deploymentInfo = {
    address: address,
    network: "localhost",
    chainId: 1337,
    deployedAt: new Date().toISOString()
  };

  const frontendDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendDir, "deployment.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to frontend/src/contracts/deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
