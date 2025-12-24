#!/bin/bash

# Builder Challenge App - Setup Script for Unix/Linux/Mac
# This script sets up the complete development environment

set -e

echo "🚀 Builder Challenge App - Automated Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node --version) found"

# Check npm installation
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo -e "${GREEN}✓${NC} npm $(npm --version) found"
echo ""

# Install root dependencies
echo -e "${BLUE}📦 Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓${NC} Root dependencies installed"
echo ""

# Install contracts dependencies
echo -e "${BLUE}📦 Installing contracts dependencies...${NC}"
cd contracts
npm install
echo -e "${GREEN}✓${NC} Contracts dependencies installed"
echo ""

# Compile smart contracts
echo -e "${BLUE}🔨 Compiling smart contracts...${NC}"
npm run compile
echo -e "${GREEN}✓${NC} Smart contracts compiled"
cd ..
echo ""

# Install frontend dependencies
echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
cd frontend
npm install

# Setup frontend .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️  Creating frontend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Frontend .env created - ${YELLOW}Please add your Reown Project ID!${NC}"
else
    echo -e "${GREEN}✓${NC} Frontend .env already exists"
fi

cd ..
echo ""

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
cd backend
npm install

# Setup backend .env file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚙️  Creating backend .env file...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Backend .env created"
else
    echo -e "${GREEN}✓${NC} Backend .env already exists"
fi

cd ..
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Setup completed successfully!${NC}"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Add your Reown Project ID to frontend/.env"
echo "   Get it from: https://cloud.reown.com"
echo ""
echo "2. Start the local blockchain:"
echo -e "   ${BLUE}cd contracts && npm run node${NC}"
echo ""
echo "3. In a new terminal, deploy the contracts:"
echo -e "   ${BLUE}cd contracts && npm run deploy:local${NC}"
echo ""
echo "4. Update backend/.env with the deployed contract address"
echo ""
echo "5. Start the app:"
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "📚 See QUICKSTART.md for detailed instructions"
echo ""
