import { expect } from "chai";
import { ethers } from "hardhat";
import { BuilderTracker } from "../typechain-types";
import { HardhatEthersSigner as SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("BuilderTracker", function () {
  let builderTracker: BuilderTracker;
  let owner: SignerWithAddress;
  let builder1: SignerWithAddress;
  let builder2: SignerWithAddress;
  let user1: SignerWithAddress;

  beforeEach(async function () {
    [owner, builder1, builder2, user1] = await ethers.getSigners();
    
    const BuilderTracker = await ethers.getContractFactory("BuilderTracker");
    builderTracker = await BuilderTracker.deploy();
    await builderTracker.waitForDeployment();
  });

  describe("Builder Registration", function () {
    it("Should register a new builder", async function () {
      await builderTracker.connect(builder1).registerBuilder();
      
      const stats = await builderTracker.getBuilderStats(builder1.address);
      expect(stats.isActive).to.be.true;
      expect(stats.totalUsers).to.equal(0);
      expect(stats.totalFees).to.equal(0);
    });

    it("Should fail to register twice", async function () {
      await builderTracker.connect(builder1).registerBuilder();
      
      await expect(
        builderTracker.connect(builder1).registerBuilder()
      ).to.be.revertedWith("Builder already registered");
    });

    it("Should emit BuilderRegistered event", async function () {
      await expect(builderTracker.connect(builder1).registerBuilder())
        .to.emit(builderTracker, "BuilderRegistered")
        .withArgs(builder1.address, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));
    });
  });

  describe("User Management", function () {
    beforeEach(async function () {
      await builderTracker.connect(builder1).registerBuilder();
    });

    it("Should add a user", async function () {
      await builderTracker.connect(builder1).addUser(user1.address);
      
      const stats = await builderTracker.getBuilderStats(builder1.address);
      expect(stats.totalUsers).to.equal(1);
    });

    it("Should fail to add user if not registered", async function () {
      await expect(
        builderTracker.connect(builder2).addUser(user1.address)
      ).to.be.revertedWith("Builder not registered");
    });

    it("Should emit UserAdded event", async function () {
      await expect(builderTracker.connect(builder1).addUser(user1.address))
        .to.emit(builderTracker, "UserAdded")
        .withArgs(builder1.address, user1.address, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));
    });

    it("Should increment user count correctly", async function () {
      await builderTracker.connect(builder1).addUser(user1.address);
      await builderTracker.connect(builder1).addUser(builder2.address);
      
      const stats = await builderTracker.getBuilderStats(builder1.address);
      expect(stats.totalUsers).to.equal(2);
    });
  });

  describe("Fee Collection", function () {
    beforeEach(async function () {
      await builderTracker.connect(builder1).registerBuilder();
    });

    it("Should collect fees", async function () {
      const feeAmount = ethers.parseEther("0.1");
      await builderTracker.connect(builder1).collectFee({ value: feeAmount });
      
      const stats = await builderTracker.getBuilderStats(builder1.address);
      expect(stats.totalFees).to.equal(feeAmount);
    });

    it("Should fail to collect zero fees", async function () {
      await expect(
        builderTracker.connect(builder1).collectFee({ value: 0 })
      ).to.be.revertedWith("Fee must be greater than 0");
    });

    it("Should accumulate fees correctly", async function () {
      const fee1 = ethers.parseEther("0.1");
      const fee2 = ethers.parseEther("0.2");
      
      await builderTracker.connect(builder1).collectFee({ value: fee1 });
      await builderTracker.connect(builder1).collectFee({ value: fee2 });
      
      const stats = await builderTracker.getBuilderStats(builder1.address);
      expect(stats.totalFees).to.equal(fee1 + fee2);
    });

    it("Should emit FeeCollected event", async function () {
      const feeAmount = ethers.parseEther("0.1");
      
      await expect(builderTracker.connect(builder1).collectFee({ value: feeAmount }))
        .to.emit(builderTracker, "FeeCollected")
        .withArgs(builder1.address, feeAmount, await ethers.provider.getBlock('latest').then(b => b!.timestamp + 1));
    });
  });

  describe("Leaderboard", function () {
    beforeEach(async function () {
      await builderTracker.connect(builder1).registerBuilder();
      await builderTracker.connect(builder2).registerBuilder();
      
      await builderTracker.connect(builder1).addUser(user1.address);
      await builderTracker.connect(builder1).collectFee({ value: ethers.parseEther("0.5") });
      
      await builderTracker.connect(builder2).addUser(user1.address);
      await builderTracker.connect(builder2).addUser(owner.address);
    });

    it("Should return all builders", async function () {
      const builders = await builderTracker.getAllBuilders();
      expect(builders.length).to.equal(2);
      expect(builders).to.include(builder1.address);
      expect(builders).to.include(builder2.address);
    });

    it("Should return leaderboard data", async function () {
      const [addresses, users, fees] = await builderTracker.getLeaderboard(10);
      
      expect(addresses.length).to.equal(2);
      expect(users.length).to.equal(2);
      expect(fees.length).to.equal(2);
    });

    it("Should respect limit parameter", async function () {
      const [addresses] = await builderTracker.getLeaderboard(1);
      expect(addresses.length).to.equal(1);
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to withdraw", async function () {
      await builderTracker.connect(builder1).registerBuilder();
      await builderTracker.connect(builder1).collectFee({ value: ethers.parseEther("1.0") });
      
      const balanceBefore = await ethers.provider.getBalance(owner.address);
      await builderTracker.connect(owner).withdraw();
      const balanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should fail withdraw for non-owner", async function () {
      await expect(
        builderTracker.connect(builder1).withdraw()
      ).to.be.revertedWithCustomError(builderTracker, "OwnableUnauthorizedAccount");
    });

    it("Should get contract balance", async function () {
      await builderTracker.connect(builder1).registerBuilder();
      const feeAmount = ethers.parseEther("1.0");
      await builderTracker.connect(builder1).collectFee({ value: feeAmount });
      
      const balance = await builderTracker.getBalance();
      expect(balance).to.equal(feeAmount);
    });
  });
});
