# Builder Challenge Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Initial Setup

- [x] Dependencies installed (`npm install`)
- [x] Smart contracts compiled
- [x] Project structure created
- [x] Documentation created

## 📋 Configuration Needed

### Frontend Setup
- [ ] Copy `frontend/.env.example` to `frontend/.env`
- [ ] Add Reown Project ID to `frontend/.env`
  - Get it from: https://cloud.reown.com

### Backend Setup  
- [ ] Copy `backend/.env.example` to `backend/.env`
- [ ] (Will update contract address after deployment)

## 🚀 Running the App

### First Time Setup
- [ ] Terminal 1: Start local blockchain
  ```bash
  cd contracts
  npm run node
  ```
  
- [ ] Terminal 2: Deploy smart contracts
  ```bash
  cd contracts
  npm run deploy:local
  ```
  
- [ ] Update `backend/.env` with deployed contract address

### Every Time You Run
- [ ] Make sure local blockchain is running (Terminal 1)
- [ ] Terminal 3: Start the app
  ```bash
  npm run dev
  ```

## 🔍 Verification

- [ ] Frontend loads at http://localhost:3000
- [ ] Backend running at http://localhost:3001
- [ ] Can connect wallet
- [ ] Can register as builder
- [ ] Can add users
- [ ] Can collect fees
- [ ] Leaderboard displays

## 🎯 Success Criteria

You'll know everything is working when:
1. ✅ No errors in the terminal
2. ✅ Frontend opens in browser
3. ✅ Wallet connects successfully
4. ✅ You can register as a builder
5. ✅ Your stats appear on the dashboard

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| "Cannot connect to contract" | Make sure local blockchain is running |
| "Deployment failed" | Check that Hardhat node is running on port 8545 |
| "Module not found" | Run `npm install` from root directory |
| Wallet won't connect | Add Localhost network (Chain ID: 1337) to MetaMask |

## 📚 Next Steps

Once everything is working:
- [ ] Read the [README.md](README.md) for detailed info
- [ ] Explore the smart contract code
- [ ] Customize the frontend UI
- [ ] Add more features!

---

**Need help?** Check [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.
