# ⚡ Quick Start - Get Running in 5 Minutes!

## 🎯 Goal
Get the Builder Challenge app running on your local machine as fast as possible.

## ⏱️ Time Required
**5-10 minutes** (first time)  
**2 minutes** (subsequent runs)

---

## 🚀 First Time Setup

### Step 1: Get Your Reown Project ID (2 minutes)

1. Go to [cloud.reown.com](https://cloud.reown.com)
2. Sign up or log in
3. Create a new project
4. Copy your Project ID
5. Keep it handy!

### Step 2: Run Setup Script (3 minutes)

**Windows:**
```bash
setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**What it does:**
- ✅ Installs all dependencies
- ✅ Compiles smart contracts
- ✅ Creates .env files

### Step 3: Add Your Project ID (30 seconds)

Open `frontend/.env` and add your Reown Project ID:

```bash
VITE_REOWN_PROJECT_ID=your_project_id_here
```

### Step 4: Start Everything (1 minute)

**Terminal 1** - Start blockchain:
```bash
cd contracts
npm run node
```

**Terminal 2** - Deploy contracts:
```bash
cd contracts
npm run deploy:local
```

Look for the contract address in the output:
```
BuilderTracker deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

Copy this address and update `backend/.env`:
```bash
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Terminal 3** - Start the app:
```bash
npm run dev
```

### Step 5: Open and Enjoy! (30 seconds)

Open your browser to:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001

---

## 🔄 Running Again Later

Once you've done the setup, starting the app is super fast:

**Terminal 1:**
```bash
cd contracts && npm run node
```

**Terminal 2:**
```bash
npm run dev
```

That's it! ⚡

---

## 🎮 Your First Actions

### 1. Connect Your Wallet (10 seconds)
- Click "Connect Wallet" in the top right
- Choose MetaMask or WalletConnect
- Approve the connection

### 2. Register as a Builder (5 seconds)
- Click "Register Now" on the dashboard
- Confirm the transaction
- You're in!

### 3. Link Your GitHub (30 seconds)
- Find "Link GitHub Account" card
- Enter your GitHub username
- Click "Link GitHub Account"
- Start earning points! 🎯

### 4. Add Your First User (15 seconds)
- In the "Add User" card
- Enter any Ethereum address
- Click "Add User"
- **Achievement Unlocked:** First Steps! 🏆

### 5. Collect a Fee (15 seconds)
- In the "Collect Fee" card
- Enter amount (e.g., 0.01)
- Click "Collect Fee"
- **Achievement Unlocked:** First Transaction! 💰

---

## 💡 Pro Tips

### Add MetaMask Localhost Network

If MetaMask doesn't auto-detect the network:

1. Open MetaMask
2. Click network dropdown
3. Add network manually:
   - **Network Name:** Localhost 8545
   - **RPC URL:** http://127.0.0.1:8545
   - **Chain ID:** 1337
   - **Currency Symbol:** ETH

### Get Test ETH

The local Hardhat node gives you 10,000 ETH automatically! Import one of the test accounts:

```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

⚠️ **Never use these keys for real ETH!**

### Browser Developer Tools

Open DevTools (F12) to see:
- Transaction logs
- Smart contract events
- API calls
- Any errors

---

## ❓ Troubleshooting

### "Cannot connect to contract"
**Fix:** Make sure Terminal 1 is still running the blockchain

### "Transaction failed"
**Fix:** Reset MetaMask account (Settings → Advanced → Reset Account)

### "Port already in use"
**Fix:** Kill the process using that port:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3001 | xargs kill
```

### "Module not found"
**Fix:** Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

---

## 🎯 What's Next?

Once you're running:

1. ✅ Explore the dashboard
2. ✅ Check the leaderboard
3. ✅ Try to unlock all achievements
4. ✅ Read [FEATURES.md](FEATURES.md) for advanced features
5. ✅ Customize and make it your own!
6. ✅ Deploy to production ([DEPLOYMENT.md](DEPLOYMENT.md))

---

## 📚 More Resources

- **Detailed Setup:** [README.md](README.md)
- **All Features:** [FEATURES.md](FEATURES.md)
- **API Docs:** [API.md](API.md)
- **Deploy Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Checklist:** [CHECKLIST.md](CHECKLIST.md)

---

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review [CHECKLIST.md](CHECKLIST.md)
3. Read the full [README.md](README.md)
4. Open an issue on GitHub
5. Check console logs for errors

---

## 🎉 You're All Set!

**Congratulations!** You now have a fully functional Web3 Builder Challenge app running locally.

**Time to start building and climb that leaderboard! 🏗️🚀**

---

**Happy Building!** ⚡
