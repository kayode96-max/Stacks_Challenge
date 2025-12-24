# Builder Challenge App

A scalable, mobile-first Web3 application for tracking Builder Challenge leaderboard activity across multiple metrics.

## 🎯 Overview

This application tracks builder activity across:
- **WalletKit SDK / Reown AppKit** usage in your apps
- **Smart contract** users and fees generated
- **GitHub contributions** to public repositories

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
# Edit .env and add your Reown Project ID
```

**Backend (.env in backend/):**
```bash
cd backend
cp .env.example .env
# Edit .env with contract address, RPC URL, and GitHub token
```

### 3. Start Local Blockchain

```bash
cd contracts
npm run node
```

This starts a local Hardhat node. Keep this terminal running.

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

### Smart Contract Tracking
- Register as a builder on-chain
- Track user acquisitions
- Record fees collected
- View real-time statistics

### Leaderboard System
- Daily updated rankings
- Multi-metric scoring:
  - Users: 10 points each
  - Fees: 100 points per ETH
  - GitHub commits: 5 points each
  - WalletKit usage: 15 points each

### Mobile-First Design
- Responsive layout optimized for mobile
- Progressive Web App ready
- Tailwind CSS for modern UI

### Wallet Integration
- Reown AppKit (WalletKit SDK) integration
- Support for multiple networks (Mainnet, Arbitrum, Sepolia)
- One-click wallet connection

## 🛠️ Development

### Project Structure

**Frontend:**
```
frontend/src/
├── components/        # React components
│   ├── Header.tsx
│   ├── Dashboard.tsx
│   └── Leaderboard.tsx
├── hooks/            # Custom React hooks
│   ├── useBuilderTracker.ts
│   └── useLeaderboard.ts
├── config/           # Configuration files
│   └── web3.tsx
├── contracts/        # Contract ABIs and deployment info
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
- Leaderboard data

Events emitted:
- `BuilderRegistered(address, timestamp)`
- `UserAdded(address builder, address user, timestamp)`
- `FeeCollected(address builder, amount, timestamp)`
- `BuilderUpdated(address, totalUsers, totalFees)`

### API Endpoints

**Backend API:**
- `GET /api/health` - Health check
- `GET /api/leaderboard` - Get sorted leaderboard
- `GET /api/builder/:address` - Get specific builder stats

## 🔐 Security Considerations

- Never commit `.env` files
- Keep private keys secure
- Use environment variables for sensitive data
- Audit smart contracts before mainnet deployment
- Implement rate limiting in production

## 🚢 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Deploy the `dist/` folder

### Smart Contract Deployment

1. Configure network in `contracts/hardhat.config.ts`
2. Add private key to environment
3. Deploy:
   ```bash
   cd contracts
   npm run deploy
   ```

### Backend Deployment (Railway/Render)

1. Set environment variables
2. Deploy from `backend/` directory
3. Update frontend API URLs

## 📊 Scoring Algorithm

Total Score = (Users × 10) + (Fees in ETH × 100) + (GitHub Commits × 5) + (WalletKit Usage × 15)

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
