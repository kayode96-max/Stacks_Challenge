# Quick Start Guide

Follow these steps to get the Builder Challenge app running on your local machine.

## Step 1: Install Dependencies ✓

Already completed! All dependencies have been installed.

## Step 2: Configure Environment Variables

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Create `.env` file from example:
   ```bash
   copy .env.example .env
   ```
   (On Mac/Linux use: `cp .env.example .env`)

3. Get your Reown Project ID:
   - Go to [cloud.reown.com](https://cloud.reown.com)
   - Create a new project (it's free!)
   - Copy your Project ID

4. Edit `frontend/.env` and add your Project ID:
   ```
   VITE_REOWN_PROJECT_ID=your_actual_project_id_here
   ```

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create `.env` file from example:
   ```bash
   copy .env.example .env
   ```

3. The default values will work for local development. You'll update `CONTRACT_ADDRESS` after deployment.

## Step 3: Start Local Blockchain

Open a new terminal and run:

```bash
cd contracts
npm run node
```

**Keep this terminal running!** This is your local blockchain.

You should see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

## Step 4: Deploy Smart Contracts

Open another new terminal and run:

```bash
cd contracts
npm run deploy:local
```

This will:
- Deploy the BuilderTracker contract
- Save the contract address automatically
- Copy the ABI to the frontend

Look for output like:
```
BuilderTracker deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Step 5: Update Backend Configuration

1. Copy the contract address from Step 4
2. Edit `backend/.env`
3. Update the `CONTRACT_ADDRESS` line:
   ```
   CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
   ```

## Step 6: Start the Application

From the root directory, run:

```bash
npm run dev
```

This starts:
- **Frontend** at http://localhost:3000
- **Backend** at http://localhost:3001

## Step 7: Connect Your Wallet

1. Open http://localhost:3000 in your browser
2. Click "Connect Wallet"
3. Select MetaMask (or your preferred wallet)
4. Connect to "Localhost 8545" network
5. Register as a builder!

## Troubleshooting

### "Module not found" errors
Run `npm install` from the root directory

### Contract deployment fails
Make sure the local blockchain is running (Step 3)

### Frontend can't connect to contract
Verify the contract address in `backend/.env` matches the deployed address

### Wallet won't connect
Make sure you're on the Localhost network (Chain ID: 1337)

## What's Next?

- **Register as a builder** to start tracking your activity
- **Add users** to increase your score
- **Collect fees** to earn more points
- Check the **leaderboard** to see your ranking

## Development Tips

- The local blockchain resets when you stop it (Step 3)
- After resetting, you'll need to redeploy (Step 4)
- Hot reload is enabled - changes to code update automatically
- Check the browser console for helpful debugging info

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review contract code in `contracts/contracts/BuilderTracker.sol`
- Inspect frontend components in `frontend/src/components/`
- View API code in `backend/src/index.ts`

Happy building! 🚀
