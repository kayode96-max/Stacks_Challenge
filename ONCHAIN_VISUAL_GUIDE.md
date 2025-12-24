# 🎨 Onchain Activity - Visual Guide

## The Three Core Activities

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILDER CHALLENGE ONCHAIN                     │
└─────────────────────────────────────────────────────────────────┘

    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
    │  REGISTER    │         │  ADD USERS   │         │ COLLECT FEES │
    │   (once)     │         │ (every user) │         │ (every sale) │
    └──────┬───────┘         └──────┬───────┘         └──────┬───────┘
           │                        │                         │
    ┌──────▼──────────┐      ┌──────▼──────────┐      ┌──────▼──────────┐
    │ Create Profile  │      │ Track Adoption  │      │ Record Revenue   │
    │ Go Live         │      │ Increment Count │      │ Add to Total Fee │
    │ Get Started     │      │ Prove Growth    │      │ Show Monetization│
    └──────┬──────────┘      └──────┬──────────┘      └──────┬──────────┘
           │                        │                         │
    ┌──────▼──────────┐      ┌──────▼──────────┐      ┌──────▼──────────┐
    │ ~60k Gas        │      │ ~40k Gas        │      │ ~40k Gas         │
    │ One-time        │      │ Per user        │      │ Per transaction  │
    │ Free on test    │      │ Cheap on test   │      │ + ETH amount     │
    └─────────────────┘      └─────────────────┘      └──────────────────┘
```

---

## Transaction Flow

```
USER INTERFACE
│
├─ Click "Register"
│  ↓
├─ REACT HOOK (useBuilderTracker)
│  ├─ Prepares transaction
│  ├─ Gets signer from wallet
│  ├─ Creates contract call
│  ↓
├─ WALLET (MetaMask / WalletConnect)
│  ├─ Shows transaction details
│  ├─ User reviews & approves
│  ├─ User pays gas fee
│  ↓
├─ BLOCKCHAIN
│  ├─ Receives transaction
│  ├─ Executes smart contract
│  ├─ Updates state
│  ├─ Emits event
│  ├─ Confirms in block
│  ↓
├─ APP UPDATES
│  ├─ Fetches new stats
│  ├─ Shows success message
│  ├─ Displays new user count
│  ├─ Logs activity
│  ↓
└─ BACKEND LISTENING
   ├─ Hears event
   ├─ Logs activity
   ├─ Updates database
   └─ Serves via API
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR BUILDER PROFILE                     │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Address  │  │  Status  │  │  Users   │  │   Fees   │   │
│  │ 0x12345  │  │  ACTIVE  │  │   42     │  │ 1.5 ETH  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
    ┌────────┐         ┌────────┐        ┌────────┐
    │ SMART  │         │ BACKEND│        │ FRONTEND
    │ONTRACT │         │  API   │        │ DISPLAY
    │        │         │        │        │
    │Stored  │         │Tracked │        │Updated
    │Forever │         │Cached  │        │Live
    └────────┘         └────────┘        └────────┘
        ▲                  ▲                  ▲
        │                  │                  │
        └──────────────────┴──────────────────┘
           All Synchronized
```

---

## Component Architecture

```
┌──────────────────────────────────────────────────────┐
│          OnchainActivity Component                    │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ State Management                               │  │
│  │ ├─ Current stats                              │  │
│  │ ├─ Form inputs                                │  │
│  │ ├─ Transaction status                         │  │
│  │ └─ Recent transactions                        │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Register Section                               │  │
│  │ ├─ Show current status                        │  │
│  │ └─ Register button (if not registered)        │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Add User Section                               │  │
│  │ ├─ Input: User address                        │  │
│  │ ├─ Validation                                 │  │
│  │ └─ Add button                                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Collect Fee Section                            │  │
│  │ ├─ Input: Fee amount                          │  │
│  │ ├─ Validation                                 │  │
│  │ └─ Collect button                             │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ┌────────────────────────────────────────────────┐  │
│  │ Status & Activity                              │  │
│  │ ├─ Real-time status messages                  │  │
│  │ └─ Recent transaction history                 │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## Smart Contract State

```
┌─────────────────────────────────────────────────────┐
│           BuilderTracker Smart Contract            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ mapping(address => Builder)  // Main data storage   │
├─────────────────────────────────────────────────────┤
│ Your Address                                         │
│ {                                                    │
│   builderAddress: 0x123...                          │
│   totalUsers: 42           ← Incremented by addUser │
│   totalFees: 1.5 ETH       ← Incremented by fee     │
│   lastUpdateTime: 1735...  ← Updated each action    │
│   isActive: true           ← Set by register        │
│ }                                                    │
└─────────────────────────────────────────────────────┘

Events Emitted:
├─ BuilderRegistered(0x123..., timestamp)
├─ UserAdded(0x123..., 0x456..., timestamp)
├─ FeeCollected(0x123..., 0.1 ETH, timestamp)
└─ BuilderUpdated(0x123..., 42 users, 1.5 ETH)
```

---

## Timeline of One Complete Interaction

```
TIME → 
│
├─ T0: User clicks "Add User"
│      [UI] Form submitted
│
├─ T1: React Hook prepares transaction
│      [PREPARATION] Contract call created
│
├─ T2: Wallet requests approval
│      [WALLET] MetaMask shows transaction
│
├─ T3: User confirms in wallet
│      [USER ACTION] 💬 Click approve
│
├─ T4: Transaction submitted to blockchain
│      [BLOCKCHAIN] Tx hash: 0xabc...
│
├─ T5: Miners/validators process
│      [PROCESSING] In mempool
│
├─ T6: Transaction included in block
│      [INCLUDED] Block #12345
│
├─ T7: Smart contract executes
│      [EXECUTION] User count increments
│      [EVENT] UserAdded emitted
│
├─ T8: React hook receives confirmation
│      [CONFIRMATION] Block confirmed
│
├─ T9: Stats are fetched and displayed
│      [UPDATE] User count shows 43
│
├─ T10: Success message shown
│       [UI] "✅ User added!"
│
└─ T11+: Event is heard by backend
         [BACKEND] Logs and stores
         [API] Available via endpoint
```

---

## Gas Cost Visualization

```
Gas Used Per Action (Localhost = Free, Mainnet = Pay ETH)

Register as Builder:
████████████████████████░░░░░░░░░░░ 60,000 gas (~0.0012 ETH @ 20 Gwei)

Add User:
██████████████░░░░░░░░░░░░░░░░░░░░░░ 40,000 gas (~0.0008 ETH @ 20 Gwei)

Collect Fee:
██████████████░░░░░░░░░░░░░░░░░░░░░░ 40,000 gas + ETH amount
```

---

## State Changes Diagram

```
BEFORE REGISTER:
┌─────────────────────┐
│ Address: 0x123...   │
│ Status: ❌ INACTIVE │
│ Users: 0            │
│ Fees: 0 ETH         │
└─────────────────────┘

        ↓ registerBuilder()

AFTER REGISTER:
┌─────────────────────┐
│ Address: 0x123...   │
│ Status: ✅ ACTIVE   │
│ Users: 0            │
│ Fees: 0 ETH         │
└─────────────────────┘

        ↓ addUser(0x456...)
        ↓ addUser(0x789...)

AFTER 2 USERS:
┌─────────────────────┐
│ Address: 0x123...   │
│ Status: ✅ ACTIVE   │
│ Users: 2            │
│ Fees: 0 ETH         │
└─────────────────────┘

        ↓ collectFee(0.1 ETH)
        ↓ collectFee(0.05 ETH)

FINAL STATE:
┌─────────────────────┐
│ Address: 0x123...   │
│ Status: ✅ ACTIVE   │
│ Users: 2            │
│ Fees: 0.15 ETH      │
└─────────────────────┘
```

---

## Information Flow Across the Stack

```
                        FRONTEND
                    ┌─────────────┐
                    │   Browser   │
                    │ ┌─────────┐ │
                    │ │OnChain  │ │
                    │ │Activity │ │
                    │ └────┬────┘ │
                    └──────┼──────┘
                           │
                        WALLET
                    ┌─────────────┐
                    │  MetaMask   │
                    │   Signs TX  │
                    └──────┬──────┘
                           │
                      BLOCKCHAIN
                    ┌─────────────┐
                    │  Ethereum   │
                    │   Execute   │
                    │   Emit Event│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
       SMART          BACKEND API        FRONTEND
      CONTRACT        LISTENING          LISTENING
        ├─            ├─                   ├─
        │ Stores      │ Hears event        │ Fetches
        │ Data        │ Logs activity      │ Updated
        │ Forever     │ Caches result      │ Stats
        └─            └─                   └─
```

---

## Error Handling Flow

```
User Action
    │
    ▼
Input Validation ──No──┐
    │ Yes              │
    ▼                  ▼
Send TX         Show Error
    │                  │
    ▼                  ▼
Wallet Check ──Error──┐
    │ OK               │
    ▼                  ▼
Process TX      Show Error
    │                  │
    ▼                  ▼
Confirm ────Error────┐
    │ Success         │
    ▼                 ▼
Update UI      Retry / Help
    │                 │
    ▼                 ▼
Success         Error Resolved
```

---

## Feature Matrix

```
                Register  Add User  Collect Fee
┌───────────────┬─────────┬─────────┬──────────┐
│ Gas Cost      │ 60k     │ 40k     │ 40k      │
│ Frequency     │ Once    │ Many    │ Many     │
│ Input         │ None    │ Address │ Amount   │
│ Updates       │ Status  │ Count   │ Total    │
│ Event Type    │ Register│ UserAdd │ FeeCol   │
│ Requirement   │ None    │ Regist. │ Regist.  │
│ Visibility    │ Profile │ Growth  │ Revenue  │
└───────────────┴─────────┴─────────┴──────────┘
```

---

## Integration Points

```
┌──────────────────────────────────────────────────────┐
│            YOUR APPLICATION                          │
├──────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │ User Interaction Layer                       │   │
│  │ (Buttons, Forms, Displays)                   │   │
│  └────────────────┬─────────────────────────────┘   │
│                   │                                  │
│  ┌────────────────▼─────────────────────────────┐   │
│  │ useBuilderTracker Hook                       │   │
│  │ (Transaction Management)                     │   │
│  └────────────────┬─────────────────────────────┘   │
│                   │                                  │
│  ┌────────────────▼─────────────────────────────┐   │
│  │ Ethers.js Library                            │   │
│  │ (Contract Interaction)                       │   │
│  └────────────────┬─────────────────────────────┘   │
│                   │                                  │
│  ┌────────────────▼─────────────────────────────┐   │
│  │ Wallet Provider                              │   │
│  │ (Signing & Sending)                          │   │
│  └────────────────┬─────────────────────────────┘   │
└────────────────────┼─────────────────────────────────┘
                     │
            ┌────────▼────────┐
            │   BLOCKCHAIN    │
            │ (Ethereum Node) │
            └─────────────────┘
```

---

**Visual learning helps! These diagrams show how everything connects.** 📊✨

For detailed explanations, see ONCHAIN_ACTIVITY.md
