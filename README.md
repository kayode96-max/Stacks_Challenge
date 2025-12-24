# 🏆 Builder Challenge App

A production-ready, feature-rich Web3 application for tracking and gamifying builder activity with achievements, real-time stats, and multi-source metrics.

## ✨ Key Features

### 🎮 Gamification & Achievements
- **6 Unique Achievements** - Unlock badges as you progress
- **Progress Tracking** - Visual progress bars for each milestone
- **Leaderboard Rankings** - Compete with other builders
- **Real-time Score Updates** - See your rank change live

### 📊 Multi-Source Tracking
- **Smart Contract Metrics** - Users and fees from your dApp
- **GitHub Integration** - Link your account and track contributions
- **Wallet Connections** - Monitor WalletKit SDK usage
- **Activity Timeline** - See all your recent actions

### 🎨 Modern UI/UX
- **Toast Notifications** - Instant feedback for all actions
- **Smooth Animations** - Polished transitions throughout
- **Mobile-First Design** - Perfect on any device
- **Gradient Backgrounds** - Beautiful, modern interface

### 🔒 Web3 Integration
- **Reown AppKit** - Seamless wallet connection
- **Multi-Wallet Support** - MetaMask, WalletConnect, and more
- **Smart Contract Events** - Real-time blockchain updates
- **Gas Optimization** - Efficient contract interactions

## 🎯 Overview

This application tracks builder activity across:
- **WalletKit SDK / Reown AppKit** usage and connections
- **Smart contract** users acquired and fees collected
- **GitHub contributions** to public repositories

**Scoring Formula:**
```
Total Score = (Users × 10) + (Fees in ETH × 100) + (GitHub Commits × 5) + (Wallet Connections × 15)
```

## 🏗️ Architecture

The project is organized as a monorepo with three main workspaces:

```
Stacks/
├── frontend/          # React + TypeScript + Vite
├── contracts/         # Solidity smart contracts + Hardhat
├── backend/           # Node.js + Express API
└── package.json       # Root workspace configuration
```

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **MetaMask** or compatible Web3 wallet
- **Reown AppKit Project ID** (get from [cloud.reown.com](https://cloud.reown.com))
- **GitHub Personal Access Token** (optional, for contribution tracking)

## 🚀 Quick Start

### Automated Setup (Recommended)

**Windows:**
```bash
setup.bat
```

**macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

The setup script will:
- Install all dependencies
- Compile smart contracts
- Create environment files
- Guide you through configuration

### Manual Setup

### 1. Install Dependencies

```bash
npm install
```

This will install dependencies for all workspaces (frontend, contracts, backend).

### 2. Configure Environment Variables

**Frontend (.env in frontend/):**
```bash
cd frontend
cp .env.example .env
# Edit .env and add your Reown Project ID from https://cloud.reown.com
```

**Backend (.env in backend/):**
```bash
cd backend
cp .env.example .env
# Edit .env with contract address, RPC URL, and GitHub token (optional)
```

### 3. Start Local Blockchain

```bash
cd contracts
npm run node
```

This starts a local Hardhat node at `http://127.0.0.1:8545`. Keep this terminal running.

### 4. Deploy Smart Contracts

In a new terminal:

```bash
cd contracts
npm run deploy:local
```

The deployment script will:
- Deploy the `BuilderTracker` contract
- Save the contract address to `frontend/src/contracts/deployment.json`
- Copy the ABI to the frontend
- Display the deployed contract address

### 5. Update Backend Configuration

Copy the deployed contract address from the output and update `backend/.env`:

```
CONTRACT_ADDRESS=<deployed_contract_address>
```

### 6. Start the Application

From the root directory:

```bash
npm run dev
```

This starts both the frontend (port 3000) and backend (port 3001) concurrently.

## 📱 Features

### 🎮 Gamification
- **Achievements System** - 6 unique badges to unlock
- **Progress Tracking** - Visual progress bars for each achievement
- **Activity Timeline** - See your recent actions and history
- **Toast Notifications** - Real-time feedback for every action

### 🔗 Integrations
- **GitHub Linking** - Connect your GitHub account to track contributions
- **Smart Contract Tracking** - Register as a builder, track users and fees
- **Wallet Connection Tracking** - Monitor WalletKit SDK usage
- **Real-time Leaderboard** - Live rankings with multi-metric scoring

### 📊 Scoring System
Multi-metric scoring algorithm:
- **Users:** 10 points each
- **Fees:** 100 points per ETH
- **GitHub Commits:** 5 points each
- **Wallet Connections:** 15 points each

### 🎨 UI/UX Features
- **Mobile-First Design** - Optimized for all screen sizes
- **Gradient Backgrounds** - Modern, beautiful interface
- **Smooth Animations** - Polished transitions throughout
- **Error Handling** - Clear messages and recovery paths
- **Loading States** - Visual feedback for async operations

### 🔐 Wallet Integration
- **Reown AppKit** (formerly WalletConnect) integration
- **Multi-Wallet Support** - MetaMask, WalletConnect, Coinbase Wallet
- **Multi-Network** - Mainnet, Arbitrum, Sepolia, and custom networks
- **One-Click Connection** - Streamlined wallet connection flow

## 🛠️ Development

### Project Structure

**Frontend:**
```
frontend/src/
├── components/           # React components
│   ├── Header.tsx       # Navigation & wallet connection
│   ├── Dashboard.tsx    # Builder activity dashboard
│   ├── Leaderboard.tsx  # Rankings display
│   ├── GitHubLink.tsx   # GitHub integration
│   ├── Achievements.tsx # Achievement badges
│   ├── ActivityTimeline.tsx # Recent activity feed
│   ├── Toast.tsx        # Notification system
│   └── StatsGrid.tsx    # Statistics cards
├── hooks/               # Custom React hooks
│   ├── useBuilderTracker.ts
│   └── useLeaderboard.ts
├── config/              # Configuration
│   └── web3.tsx        # Web3 provider setup
├── contracts/           # Contract ABIs and deployment
├── App.tsx
└── main.tsx
```

**Smart Contracts:**
```
contracts/
├── contracts/
│   └── BuilderTracker.sol
├── scripts/
│   └── deploy.ts
└── hardhat.config.ts
```

**Backend:**
```
backend/src/
└── index.ts         # Express API server
```

### Available Scripts

**Root level:**
- `npm run dev` - Start frontend and backend
- `npm run build` - Build all workspaces
- `npm run test` - Run tests in all workspaces

**Frontend:**
- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Contracts:**
- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run deploy` - Deploy to configured network
- `npm run deploy:local` - Deploy to localhost
- `npm run node` - Start local Hardhat node

**Backend:**
- `npm run dev` - Start development server with watch mode
- `npm run build` - Compile TypeScript
- `npm start` - Run production build

## 🔧 Configuration

### Smart Contract

The `BuilderTracker` contract tracks:
- Builder registration
- User additions
- Fee collection
## 🔧 Configuration

### Smart Contract

The `BuilderTracker` contract tracks:
- Builder registration
- User additions
- Fee collection
- Leaderboard data

Events emitted:
- `BuilderRegistered(address, timestamp)`
- `UserAdded(address builder, address user, timestamp)`
- `FeeCollected(address builder, amount, timestamp)`
- `BuilderUpdated(address, totalUsers, totalFees)`

### API Endpoints

**Backend API:**
- `GET /api/health` - Health check
- `GET /api/leaderboard` - Get complete leaderboard with rankings
- `GET /api/builder/:address` - Get specific builder statistics
- `POST /api/github/link` - Link GitHub account to address
- `GET /api/github/:address` - Get linked GitHub username
- `POST /api/wallet/connect` - Track wallet connection event
- `GET /api/wallet/:address` - Get wallet connection count

See [API.md](API.md) for detailed API documentation.

## 🔐 Security Considerations

- Never commit `.env` files or private keys
- Keep private keys secure using hardware wallets in production
- Use environment variables for all sensitive data
- Implement rate limiting on API endpoints in production
- Audit smart contracts before mainnet deployment
- Enable HTTPS/SSL for all production deployments
- Use a Web Application Firewall (WAF) for the backend

## 🚢 Deployment

## 🚢 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions.

### Quick Deployment Options

**Frontend:**
- ✅ Vercel (recommended for Next.js/React)
- ✅ Netlify (great for static sites)
- ✅ IPFS (fully decentralized hosting)

**Backend:**
- ✅ Railway (easiest setup)
- ✅ Render (great free tier)
- ✅ Heroku (established platform)

**Smart Contracts:**
- ✅ Ethereum Mainnet
- ✅ Polygon (lower fees)
- ✅ Arbitrum (L2 solution)
- ✅ Any EVM-compatible chain

## 📊 Scoring Algorithm

```
Total Score = (Users × 10) + (Fees in ETH × 100) + (GitHub Commits × 5) + (Wallet Connections × 15)
```

**Example:**
- 42 users = 420 points
- 1.5 ETH fees = 150 points
- 156 GitHub commits = 780 points
- 23 wallet connections = 345 points
- **Total: 1,695 points**

## 📚 Documentation

- **[FEATURES.md](FEATURES.md)** - Detailed feature documentation
- **[API.md](API.md)** - Complete API reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[QUICKSTART.md](QUICKSTART.md)** - Step-by-step setup guide
- **[CHECKLIST.md](CHECKLIST.md)** - Setup verification checklist

## 🎯 Use Cases

### For Builders
- Track dApp user adoption
- Monitor fee generation
- Showcase GitHub activity
- Compete on the leaderboard

### For Hackathons
- Demonstrate Web3 integration
- Show multi-source data tracking
- Prove technical skills
- Build a portfolio piece

### For Learning
- Learn smart contract development
- Practice React + TypeScript
- Understand Web3 integration
- Study full-stack architecture

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions
- Add more achievement types
- Implement data visualization charts
- Create weekly/monthly leaderboard archives
- Add NFT badges for achievements
- Integrate more data sources
- Improve mobile UX
- Add internationalization (i18n)
- Create admin dashboard

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to contract"**
- Ensure local blockchain is running (`npm run node` in contracts/)
- Check that contracts are deployed (`npm run deploy:local`)
- Verify CONTRACT_ADDRESS in backend/.env

**"Wallet won't connect"**
- Add Localhost network to MetaMask (Chain ID: 1337)
- Check that Reown Project ID is set in frontend/.env
- Clear browser cache and reconnect

**"Module not found" errors**
- Run `npm install` from root directory
- Delete node_modules and reinstall
- Check Node.js version (requires 18+)

**Backend not starting**
- Verify PORT is not in use (default: 3001)
- Check backend/.env configuration
- Review console logs for specific errors

See [QUICKSTART.md](QUICKSTART.md) for more troubleshooting tips.

## 📝 License

MIT License - feel free to use this project for learning, hackathons, or commercial purposes.

## 🌟 Acknowledgments

- **Reown (WalletConnect)** - For excellent wallet integration SDK
- **Hardhat** - For robust smart contract development tools
- **Vite** - For blazing fast frontend build tooling
- **Tailwind CSS** - For utility-first styling
- **ethers.js** - For Ethereum interaction library

## 📧 Support

Need help? Here's how to get support:

1. Check the documentation files in this repo
2. Review common issues in [QUICKSTART.md](QUICKSTART.md)
3. Open an issue on GitHub
4. Review the code - it's well-commented!

## 🚀 What's Next?

Ready to build? Here's your path:

1. ✅ Complete the Quick Start setup
2. ✅ Deploy your first contract
3. ✅ Link your GitHub account
4. ✅ Unlock your first achievement
5. ✅ Make it to the top of the leaderboard!
6. 🎯 Deploy to production
7. 🎯 Add your own features
8. 🎯 Share with the community

---

**Built with ❤️ for the Builder Challenge**

*Happy Building! 🏗️*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Resources

- [Reown AppKit Documentation](https://docs.reown.com)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [ethers.js](https://docs.ethers.org)

## 💡 Tips

- Use testnet tokens for development
- Monitor gas costs for contract interactions
- Implement caching for GitHub API calls
- Consider using The Graph for contract indexing at scale
- Add error boundaries in React components

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review smart contract comments

---

Built with ❤️ for the Builder Challenge
