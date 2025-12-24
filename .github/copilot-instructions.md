# Builder Challenge App - Copilot Instructions

## Project Overview
Mobile-first Web3 application for the Builder Challenge leaderboard tracking:
- WalletKit SDK / Reown AppKit usage
- Smart contract users and fees
- GitHub contributions

## Tech Stack
- Frontend: React + TypeScript + Vite
- Smart Contracts: Solidity + Hardhat
- Wallet: WalletKit SDK / Reown AppKit
- Backend: Node.js + Express

## Project Status
- [x] copilot-instructions.md created
- [x] Project structure scaffolded
- [x] Smart contracts implemented
- [x] Frontend with wallet integration built
- [x] Leaderboard system implemented
- [x] Project compiled successfully
- [x] Documentation complete

## Next Steps
1. Copy `frontend/.env.example` to `frontend/.env` and add your Reown Project ID
2. Copy `backend/.env.example` to `backend/.env`
3. Start local blockchain: `cd contracts && npm run node`
4. Deploy contracts: `cd contracts && npm run deploy:local`
5. Update backend `.env` with deployed contract address
6. Run the app: `npm run dev` (from root)
