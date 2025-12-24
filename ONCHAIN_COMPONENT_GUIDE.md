# 🚀 Using the OnchainActivity Component

## What Is It?

The `OnchainActivity` component is a fully-featured UI for creating and monitoring blockchain transactions. It demonstrates best practices for:
- Creating smart contract transactions
- Handling user input and validation
- Showing transaction status
- Maintaining activity history
- Error handling

## Features

✅ **Register as Builder** - One-click profile creation
✅ **Add Users** - Track user adoption
✅ **Collect Fees** - Record ETH transactions
✅ **Real-time Status** - Live feedback on every action
✅ **Activity History** - Recent transactions log
✅ **Error Handling** - Clear error messages
✅ **Input Validation** - Address and amount checking
✅ **Gas Information** - Shows estimated costs

## Integration

### Option 1: Add to Existing Dashboard

Update `frontend/src/components/Dashboard.tsx`:

```typescript
import { OnchainActivity } from './OnchainActivity'

export function Dashboard() {
  const { isConnected } = useAppKitAccount()

  // ... existing code ...

  return (
    <div className="space-y-6">
      {/* Existing Dashboard Content */}
      
      {/* Add the OnchainActivity Component */}
      <OnchainActivity />
      
      {/* More content */}
    </div>
  )
}
```

### Option 2: Create New Page

Create `frontend/src/pages/OnchainActivityPage.tsx`:

```typescript
import { OnchainActivity } from '../components/OnchainActivity'
import { Header } from '../components/Header'

export function OnchainActivityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Onchain Activity</h1>
        <OnchainActivity />
      </main>
    </div>
  )
}
```

## Usage Guide

### Step 1: User Connects Wallet
```
Component checks: isConnected = true
Action: Component becomes enabled
```

### Step 2: Register as Builder
```
Click: "Register Now" button
Status: "⏳ Registering... Confirm in your wallet"
Wallet: Signature request appears
Blockchain: Transaction submitted
Status: "✅ You are now registered as a builder!"
Effect: Stats show "Active" status
```

### Step 3: Add First User
```
Input: 0x1111111111111111111111111111111111111111
Click: "Add User"
Status: "⏳ Adding user... Confirm in your wallet"
Wallet: Signature request appears
Blockchain: Transaction submitted
Status: "✅ User added successfully!"
Effect: User count increments from 0 to 1
```

### Step 4: Collect a Fee
```
Input: 0.05
Click: "Collect Fee"
Status: "⏳ Collecting 0.05 ETH... Confirm in your wallet"
Wallet: Transaction with 0.05 ETH request appears
Blockchain: Transaction submitted with ETH transfer
Status: "✅ Fee of 0.05 ETH collected!"
Effect: Fee total increments
```

## Code Examples

### Example 1: Register and Add User

```typescript
import { OnchainActivity } from './components/OnchainActivity'

export function MyApp() {
  return <OnchainActivity />
}

// User clicks register button
// Component calls registerBuilder()
// Smart contract receives transaction
// Profile created onchain
// Component updates to show "Active" status
```

### Example 2: Programmatic Activity Creation

```typescript
import { useBuilderTracker } from './hooks/useBuilderTracker'
import { parseEther } from 'ethers'

export function BatchActivity() {
  const { registerBuilder, addUser, collectFee } = useBuilderTracker()

  const createBatch = async () => {
    try {
      // Register
      await registerBuilder()
      console.log("Registered")

      // Add 5 users
      const users = [
        "0x1111111111111111111111111111111111111111",
        "0x2222222222222222222222222222222222222222",
        "0x3333333333333333333333333333333333333333",
        "0x4444444444444444444444444444444444444444",
        "0x5555555555555555555555555555555555555555"
      ]
      
      for (const user of users) {
        await addUser(user)
        console.log(`Added ${user}`)
      }

      // Collect fees
      await collectFee(parseEther("0.1").toString())
      console.log("Collected 0.1 ETH")

    } catch (error) {
      console.error("Error:", error)
    }
  }

  return <button onClick={createBatch}>Create Batch Activity</button>
}
```

### Example 3: Monitor Activity

```typescript
import { useEffect } from 'react'
import { useBuilderTracker } from './hooks/useBuilderTracker'

export function ActivityMonitor() {
  const { contract } = useBuilderTracker()

  useEffect(() => {
    if (!contract) return

    // Listen to UserAdded events
    const handleUserAdded = (builder, user, timestamp) => {
      console.log(`New user added: ${user}`)
      console.log(`By builder: ${builder}`)
      console.log(`At: ${new Date(timestamp * 1000).toISOString()}`)
    }

    contract.on("UserAdded", handleUserAdded)

    return () => contract.off("UserAdded", handleUserAdded)
  }, [contract])

  return <div>Listening to UserAdded events...</div>
}
```

## Customization

### Styling

Change button colors:

```typescript
// In OnchainActivity.tsx, line 165
className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 ..."
// Change to:
className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 ..."
```

### Status Messages

Customize feedback messages:

```typescript
// Line 85
setTransactionStatus('⏳ Registering... Confirm in your wallet')
// Change to:
setTransactionStatus('Waiting for wallet approval...')
```

### Activity History Limit

Change how many recent transactions to show:

```typescript
// Line 67
setRecentTxs(prev => [newTx, ...prev].slice(0, 5))
// Change 5 to any number, e.g.:
setRecentTxs(prev => [newTx, ...prev].slice(0, 10))
```

## Error Handling Examples

### Insufficient Balance

```typescript
try {
  await collectFee(parseEther("1000").toString())
} catch (error) {
  if (error.message.includes("insufficient")) {
    console.log("You don't have enough ETH")
  }
}
```

### Invalid Address

```typescript
const validateAddress = (addr: string) => {
  return addr.match(/^0x[a-fA-F0-9]{40}$/)
}

const handleAddUser = (address: string) => {
  if (!validateAddress(address)) {
    setTransactionStatus("Invalid Ethereum address")
    return
  }
  // Proceed...
}
```

### Builder Not Registered

```typescript
try {
  await addUser(userAddress)
} catch (error) {
  if (error.message.includes("not registered")) {
    setTransactionStatus("You must register first!")
    // Show register button
  }
}
```

## Testing the Component

### Test on Localhost

1. Start blockchain: `cd contracts && npm run node`
2. Deploy: `cd contracts && npm run deploy:local`
3. Start app: `npm run dev`
4. Open http://localhost:3000
5. Connect wallet with test ETH
6. Click "Register Now" to start

### Check Transactions

**In Browser Console:**
```javascript
// See registration
console.log("Registration TX: ...", tx)

// See user additions
console.log("User Added TX: ...", tx)

// See fees
console.log("Fee Collected TX: ...", tx)
```

**In Hardhat Terminal:**
```
Built-in call result of sendTransaction: { transactionHash: '0x...' }
```

**Via Backend API:**
```bash
curl http://localhost:3001/api/builder/0xYourAddress
```

## Best Practices

### ✅ Do

- Show loading states while transaction is pending
- Validate user input before submitting
- Display clear success/error messages
- Wait for confirmation before considering transaction final
- Show gas cost estimates
- Clear form after successful submission

### ❌ Don't

- Submit transaction without user approval
- Allow form submission while one is pending
- Hide error messages
- Trust unvalidated addresses
- Forget to handle network errors
- Submit large transactions without warnings

## Production Considerations

Before deploying to mainnet:

1. **Add rate limiting** - Prevent spam
2. **Implement analytics** - Track user actions
3. **Add transaction history** - Store in database
4. **Monitor gas prices** - Warn users of high fees
5. **Implement retry logic** - Handle failed transactions
6. **Add confirmations** - Wait for multiple blocks
7. **Audit contract** - Ensure security
8. **Set up monitoring** - Track failed transactions

## Troubleshooting

### Component Not Rendering

```typescript
// Check if wallet is connected
if (!isConnected) {
  return <div>Please connect wallet</div>
}
```

### Transactions Failing

```typescript
// Check if contract loaded
if (!contract) {
  return <div>Loading contract...</div>
}
```

### Stats Not Updating

```typescript
// Call fetchStats after transaction
await registerBuilder()
await fetchStats()  // Force update
```

### Gas Issues on Localhost

```typescript
// Use Hardhat's unlimited gas option
// In hardhat.config.ts:
const config = {
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true
    }
  }
}
```

## Next Steps

1. ✅ Import component in your page
2. ✅ Test with local transactions
3. ✅ Customize styling to match your app
4. ✅ Add more validation as needed
5. ✅ Deploy to testnet
6. ✅ Get feedback from users
7. ✅ Deploy to mainnet

---

**Now go create some onchain activity! ⛓️✨**
