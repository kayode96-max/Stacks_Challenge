# ⚡ Onchain Activity - Quick Reference

## 3 Simple Steps to Create Onchain Activity

### 1️⃣ Register as Builder (One-Time)
```typescript
const { registerBuilder } = useBuilderTracker()
await registerBuilder()
```
**What happens:** Your profile is created onchain
**Gas cost:** ~60,000 units
**Requirement:** Must do this first

### 2️⃣ Add a User
```typescript
const { addUser } = useBuilderTracker()
await addUser("0x1234567890123456789012345678901234567890")
```
**What happens:** User count increments
**Gas cost:** ~40,000 units
**Requirement:** Must be registered first

### 3️⃣ Collect a Fee
```typescript
import { parseEther } from 'ethers'
const { collectFee } = useBuilderTracker()
const weiAmount = parseEther("0.05").toString()
await collectFee(weiAmount)
```
**What happens:** Fee is recorded onchain
**Gas cost:** ~40,000 units + ETH transfer
**Requirement:** Must be registered first

---

## All Smart Contract Functions

| Function | Input | Returns | Event |
|----------|-------|---------|-------|
| `registerBuilder()` | none | void | BuilderRegistered |
| `addUser(address)` | user address | void | UserAdded, BuilderUpdated |
| `collectFee()` | ETH amount | void | FeeCollected, BuilderUpdated |
| `getBuilderStats(address)` | builder address | (users, fees, timestamp, isActive) | none |
| `getAllBuilders()` | none | address[] | none |

---

## Common Patterns

### Register + Add User + Collect Fee

```typescript
const { registerBuilder, addUser, collectFee } = useBuilderTracker()

try {
  // Register
  await registerBuilder()
  
  // Add user
  await addUser("0x...")
  
  // Collect fee
  await collectFee(parseEther("0.1").toString())
  
  console.log("All done!")
} catch (error) {
  console.error(error)
}
```

### Add Multiple Users

```typescript
const { addUser } = useBuilderTracker()

const users = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
]

for (const user of users) {
  await addUser(user)
  console.log(`Added ${user}`)
}
```

### Listen to Events

```typescript
const { contract } = useBuilderTracker()

contract.on("UserAdded", (builder, user, timestamp) => {
  console.log(`User ${user} added by ${builder}`)
})

contract.on("FeeCollected", (builder, amount, timestamp) => {
  console.log(`${builder} collected ${amount} wei`)
})
```

### Check If User Can Add

```typescript
const { stats } = useBuilderTracker()

if (!stats?.isActive) {
  console.log("Must register first!")
  return
}

// User can add users/collect fees
```

---

## Error Handling

### "Builder not registered"
**Fix:** Call `registerBuilder()` first

### "Invalid address"
**Fix:** Use format `0x` + 40 hex characters

### "Insufficient balance"
**Fix:** Get more test ETH from faucet

### "User already registered"
**Fix:** Each address can only register once

---

## Common Conversions

```typescript
import { parseEther, formatEther } from 'ethers'

// ETH to Wei
const wei = parseEther("0.05")
const weiString = parseEther("0.05").toString()

// Wei to ETH
const eth = formatEther("1000000000000000000") // "1.0"

// Quick reference
0.01 ETH = 10000000000000000 wei
0.1 ETH  = 100000000000000000 wei
1 ETH    = 1000000000000000000 wei
```

---

## View Your Activity

### Browser Console
```javascript
// In frontend, check logs
console.log(stats) // Your current stats
console.log(recentTxs) // Transaction history
```

### Terminal
```bash
# Get your stats via API
curl http://localhost:3001/api/builder/0xYourAddress
```

### Smart Contract
```typescript
// Query directly
const stats = await contract.getBuilderStats("0xYourAddress")
console.log(stats) // [users, fees, timestamp, isActive]
```

---

## Gas Costs

| Action | Gas Units | Testnet Cost (20 Gwei) |
|--------|-----------|----------------------|
| Register | 60,000 | ~0.0012 ETH |
| Add User | 40,000 | ~0.0008 ETH |
| Collect 0.01 ETH | 40,000 | ~0.0008 ETH + 0.01 ETH |

*Mainnet costs will be higher depending on network conditions*

---

## Validation Checklist

Before creating activity:
- [ ] Wallet connected
- [ ] Have test ETH
- [ ] Blockchain running (localhost)
- [ ] Contracts deployed
- [ ] Contract address correct
- [ ] Using valid Ethereum address

---

## Quick Start Commands

```bash
# Start blockchain
cd contracts && npm run node

# Deploy contracts (in new terminal)
cd contracts && npm run deploy:local

# Start app (in another new terminal)
npm run dev

# Open app
# http://localhost:3000
```

---

## File Reference

| File | Purpose |
|------|---------|
| `BuilderTracker.sol` | Smart contract functions |
| `useBuilderTracker.ts` | React hook for transactions |
| `OnchainActivity.tsx` | UI component example |
| `ONCHAIN_ACTIVITY.md` | Full guide |
| `API.md` | Backend endpoints |

---

## Example: Full Flow

```typescript
import { OnchainActivity } from './components/OnchainActivity'

export function MyApp() {
  return <OnchainActivity />
}

// User sees three sections:
// 1. Register as Builder button
// 2. Add User input + button
// 3. Collect Fee input + button

// User clicks "Register Now"
// → Wallet opens
// → User confirms transaction
// → Transaction sent to blockchain
// → Stats update to show "Active"
// → User can now add users & collect fees
```

---

## Smart Contract Events

Every action emits an event:

```solidity
event BuilderRegistered(address indexed builder, uint256 timestamp);
event UserAdded(address indexed builder, address indexed user, uint256 timestamp);
event FeeCollected(address indexed builder, uint256 amount, uint256 timestamp);
event BuilderUpdated(address indexed builder, uint256 totalUsers, uint256 totalFees);
```

Monitor them:
```typescript
contract.on("UserAdded", (builder, user, timestamp) => {
  console.log("User added event fired!")
})
```

---

## Mainnet vs Localhost

| Feature | Localhost | Mainnet |
|---------|-----------|---------|
| Test ETH | Free (10,000) | Buy from exchange |
| Gas cost | Minimal | Real ETH required |
| Permanent | No (resets) | Yes (forever) |
| Visible | Local only | On Etherscan |
| Speed | Instant | 12-20 seconds |

---

**Questions? Check ONCHAIN_ACTIVITY.md for the full guide! ⛓️**
