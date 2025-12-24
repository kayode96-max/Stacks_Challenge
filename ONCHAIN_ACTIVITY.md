# 📡 Creating Onchain Activity - Complete Guide

## 🎯 Overview

The Builder Challenge app records activity on the blockchain using the `BuilderTracker` smart contract. This guide shows you how to create and track onchain activity.

---

## 🏗️ What Is Onchain Activity?

Onchain activity = blockchain transactions that permanently record your actions:
- ✅ Registering as a builder
- ✅ Adding users to your project
- ✅ Collecting fees
- ✅ All with timestamps and events

**Benefits:**
- Permanent record (immutable)
- Verifiable on Etherscan
- Tracked in smart contract state
- Emits events for real-time updates

---

## 🔧 How It Works

### Architecture

```
User Action (UI)
      ↓
React Component
      ↓
useBuilderTracker Hook
      ↓
Smart Contract Function
      ↓
Blockchain Transaction
      ↓
Event Emitted
      ↓
Stats Updated
```

---

## 📝 Three Types of Onchain Activity

### 1️⃣ Register as a Builder

**What it does:**
- Creates your builder profile on blockchain
- Sets your initial stats to 0 users, 0 fees
- Stores your address in the contract

**Smart Contract:**
```solidity
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
```

**From Frontend:**
```typescript
await contract.registerBuilder()
```

**What happens on blockchain:**
- Your address is registered
- A `BuilderRegistered` event is emitted
- Your profile is added to the leaderboard
- Gas fee: ~60,000 units

---

### 2️⃣ Add a User

**What it does:**
- Records that someone using your dApp
- Increments your user count
- Emits an event with the user's address

**Smart Contract:**
```solidity
function addUser(address user) external {
    require(builders[msg.sender].isActive, "Builder not registered");
    require(user != address(0), "Invalid user address");
    
    builders[msg.sender].totalUsers++;
    builders[msg.sender].lastUpdateTime = block.timestamp;
    
    emit UserAdded(msg.sender, user, block.timestamp);
    emit BuilderUpdated(msg.sender, builders[msg.sender].totalUsers, builders[msg.sender].totalFees);
}
```

**From Frontend:**
```typescript
await contract.addUser("0x1234567890123456789012345678901234567890")
```

**What happens on blockchain:**
- User count increments by 1
- Last update timestamp changes
- `UserAdded` and `BuilderUpdated` events emitted
- User address is permanently recorded
- Gas fee: ~40,000 units

---

### 3️⃣ Collect a Fee

**What it does:**
- Records ETH fees you collected
- Updates total fees on blockchain
- Transfers ETH to contract (held safely)

**Smart Contract:**
```solidity
function collectFee() external payable {
    require(builders[msg.sender].isActive, "Builder not registered");
    require(msg.value > 0, "Fee must be greater than 0");
    
    builders[msg.sender].totalFees += msg.value;
    builders[msg.sender].lastUpdateTime = block.timestamp;
    
    emit FeeCollected(msg.sender, msg.value, block.timestamp);
    emit BuilderUpdated(msg.sender, builders[msg.sender].totalUsers, builders[msg.sender].totalFees);
}
```

**From Frontend:**
```typescript
import { parseEther } from 'ethers'

const feeInEth = "0.05"  // 0.05 ETH
const weiAmount = parseEther(feeInEth).toString()
await contract.collectFee({ value: weiAmount })
```

**What happens on blockchain:**
- Total fees incremented by amount sent
- Last update timestamp changes
- `FeeCollected` and `BuilderUpdated` events emitted
- ETH is transferred to contract
- Gas fee: ~40,000 + additional for ETH transfer

---

## 📱 Creating Activity from the UI

### In the Dashboard Component

```typescript
import { useBuilderTracker } from '../hooks/useBuilderTracker'

export function Dashboard() {
  const { contract, stats, loading, registerBuilder, addUser, collectFee } = useBuilderTracker()

  // Register as builder
  const handleRegister = async () => {
    try {
      await registerBuilder()  // Creates onchain activity
      console.log("Registered!")
    } catch (error) {
      console.error("Registration failed", error)
    }
  }

  // Add a user
  const handleAddUser = async (userAddress: string) => {
    try {
      await addUser(userAddress)  // Creates onchain activity
      console.log("User added!")
    } catch (error) {
      console.error("Failed to add user", error)
    }
  }

  // Collect a fee
  const handleCollectFee = async (amountInEth: string) => {
    try {
      const weiAmount = parseEther(amountInEth).toString()
      await collectFee(weiAmount)  // Creates onchain activity
      console.log("Fee collected!")
    } catch (error) {
      console.error("Failed to collect fee", error)
    }
  }

  return (
    <div>
      <button onClick={handleRegister}>Register</button>
      <button onClick={() => handleAddUser("0x...")}>Add User</button>
      <button onClick={() => handleCollectFee("0.05")}>Collect Fee</button>
    </div>
  )
}
```

---

## 🔍 Viewing Your Onchain Activity

### On Etherscan (Production)

1. Go to your contract on Etherscan
2. Click "Events" tab
3. Search for your address
4. See all `BuilderRegistered`, `UserAdded`, `FeeCollected` events

### On Localhost (Development)

```typescript
// Listen to events in real-time
contract.on("BuilderRegistered", (builder, timestamp) => {
  console.log(`Builder ${builder} registered at ${timestamp}`)
})

contract.on("UserAdded", (builder, user, timestamp) => {
  console.log(`User ${user} added by ${builder}`)
})

contract.on("FeeCollected", (builder, amount, timestamp) => {
  console.log(`${builder} collected ${amount} wei`)
})
```

### Via Backend API

```bash
# Get your stats
curl http://localhost:3001/api/builder/0xYourAddress

# Response:
{
  "address": "0xYourAddress",
  "totalUsers": 42,
  "totalFees": "1500000000000000000",
  "lastUpdateTime": 1735128000,
  "isActive": true
}
```

---

## 🎯 Step-by-Step: Create Your First Onchain Activity

### Step 1: Connect Your Wallet
```typescript
// In Header.tsx or use Reown AppKit button
// This sets up your address and signer
```

### Step 2: Register as a Builder
```typescript
const { registerBuilder } = useBuilderTracker()
await registerBuilder()

// Onchain: You're now registered!
// Event emitted: BuilderRegistered
// Gas used: ~60k
```

### Step 3: Add Your First User
```typescript
const { addUser } = useBuilderTracker()
await addUser("0x1111111111111111111111111111111111111111")

// Onchain: User count increments to 1
// Event emitted: UserAdded, BuilderUpdated
// Gas used: ~40k
```

### Step 4: Collect Your First Fee
```typescript
const { collectFee } = useBuilderTracker()
await collectFee(parseEther("0.01").toString())

// Onchain: 0.01 ETH added to your fees
// Event emitted: FeeCollected, BuilderUpdated
// Gas used: ~40k + ETH transfer
```

### Step 5: Check Your Stats
```typescript
const { stats } = useBuilderTracker()
console.log(stats)

// Output:
// {
//   totalUsers: 1,
//   totalFees: "10000000000000000", // 0.01 ETH in wei
//   lastUpdateTime: 1735128000,
//   isActive: true
// }
```

---

## 💰 Gas Costs Explained

### Typical Gas Usage

| Action | Gas Units | ETH Cost (at 20 Gwei) | Notes |
|--------|-----------|----------------------|-------|
| Register Builder | 60,000 | ~0.0012 ETH | Once per address |
| Add User | 40,000 | ~0.0008 ETH | Per user addition |
| Collect Fee | 40,000 | ~0.0008 ETH | Plus ETH transfer |

### Reducing Gas Costs

1. **Batch Operations** - Add multiple users in one transaction
2. **Use Lower Networks** - Polygon, Arbitrum cheaper than mainnet
3. **Off-Peak Times** - Lower gas prices at night/weekends

---

## 🔐 Security & Best Practices

### What's Protected
✅ Only registered builders can add users
✅ Only registered builders can collect fees
✅ Only valid addresses accepted
✅ Contract owner can withdraw fees

### Important Rules
- ⚠️ Can only register once per address
- ⚠️ User address must be valid (not 0x0)
- ⚠️ Fee must be > 0
- ⚠️ All actions permanent (recorded forever)

### Best Practices

**1. Handle Errors**
```typescript
try {
  await addUser(userAddress)
} catch (error) {
  if (error.message.includes("not registered")) {
    console.log("You must register first!")
  }
}
```

**2. Wait for Confirmation**
```typescript
const tx = await contract.addUser(userAddress)
const receipt = await tx.wait()  // Wait for block confirmation
console.log("Confirmed in block:", receipt.blockNumber)
```

**3. Show User Feedback**
```typescript
setLoading(true)
try {
  await addUser(userAddress)
  showToast("User added successfully!", "success")
  setUserAddress("")  // Clear form
} catch (error) {
  showToast(error.message, "error")
} finally {
  setLoading(false)
}
```

---

## 🧩 Advanced: Custom Onchain Actions

Want to add more onchain activity? Here's how:

### Step 1: Add Smart Contract Function

```solidity
function logMilestone(string memory message) external {
    require(builders[msg.sender].isActive, "Not registered");
    
    // Your logic here
    
    emit MilestoneLogged(msg.sender, message, block.timestamp);
}
```

### Step 2: Update Hook

```typescript
const logMilestone = async (message: string) => {
  if (!contract) return
  const tx = await contract.logMilestone(message)
  await tx.wait()
  await fetchStats()
}
```

### Step 3: Use in Component

```typescript
const { logMilestone } = useBuilderTracker()
await logMilestone("Shipped v1.0")
```

---

## 🌍 Deploy to Production

### Mainnet Steps

1. Deploy contract to Ethereum mainnet
2. Update contract address in frontend
3. Users connect real wallet with real ETH
4. All activity recorded permanently on mainnet
5. View on Etherscan forever!

### Testnet (Before Mainnet)

```bash
# Deploy to Sepolia testnet
cd contracts
npx hardhat run scripts/deploy.ts --network sepolia

# Get free testnet ETH from:
# - https://sepoliafaucet.com
# - https://www.infura.io/faucet
```

---

## 📊 Tracking Your Activity

### View All Your Transactions

```typescript
const fetchAllActivity = async () => {
  const events = await contract.queryFilter(
    contract.filters.UserAdded(address)  // Filter by your address
  )
  
  events.forEach(event => {
    console.log(`Added user: ${event.args.user} at ${event.args.timestamp}`)
  })
}
```

### Monitor in Real-Time

```typescript
useEffect(() => {
  if (!contract) return
  
  const unsubscribe = contract.on(
    contract.filters.UserAdded(address),
    (builder, user, timestamp) => {
      console.log(`You added user ${user}!`)
      // Refresh stats, show notification, etc.
    }
  )
  
  return () => unsubscribe()
}, [contract, address])
```

---

## ✅ Verification Checklist

Before you start creating onchain activity:

- [ ] Wallet connected (see address in top right)
- [ ] Local blockchain running (`npm run node`)
- [ ] Contracts deployed (`npm run deploy:local`)
- [ ] Frontend .env configured
- [ ] Backend .env configured
- [ ] You have test ETH (Hardhat gives you 10,000!)

---

## 🚀 Get Started Now!

1. Open the app at http://localhost:3000
2. Connect your wallet
3. Click "Register Now"
4. Add a user
5. Collect a fee
6. **You've created onchain activity!** 🎉

See your events:
- Dashboard stats update in real-time
- Check browser console for logs
- View in Hardhat terminal
- Query via backend API

---

**Happy building on the blockchain! ⛓️✨**
