# 🚀 Deployment Guide

## Deploying to Production

### Prerequisites
- Ethereum wallet with ETH for gas fees
- Alchemy, Infura, or similar RPC provider
- Domain name (optional)
- Reown Project ID

## Step 1: Deploy Smart Contract

### To Ethereum Mainnet

1. Update `hardhat.config.ts`:
```typescript
networks: {
  mainnet: {
    url: process.env.MAINNET_RPC_URL,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

2. Deploy:
```bash
cd contracts
npx hardhat run scripts/deploy.ts --network mainnet
```

### To Polygon, Arbitrum, or Other Networks

Update the network configuration in `hardhat.config.ts` with the appropriate RPC URL and deploy.

## Step 2: Backend Deployment

### Deploy to Heroku

1. Create a Heroku app:
```bash
heroku create builder-challenge-api
```

2. Set environment variables:
```bash
heroku config:set CONTRACT_ADDRESS=0x...
heroku config:set RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
heroku config:set GITHUB_TOKEN=ghp_...
```

3. Deploy:
```bash
git subtree push --prefix backend heroku main
```

### Deploy to Railway

1. Connect your GitHub repository
2. Select the `backend` directory
3. Set environment variables in Railway dashboard
4. Deploy automatically on push

### Deploy to Render

1. Create a new Web Service
2. Set root directory to `backend`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables

## Step 3: Frontend Deployment

### Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Set environment variables in Vercel dashboard:
- `VITE_REOWN_PROJECT_ID`
- `VITE_API_URL`
- `VITE_CONTRACT_ADDRESS`
- `VITE_RPC_URL`

### Deploy to Netlify

1. Build the app:
```bash
cd frontend
npm run build
```

2. Deploy the `dist` folder to Netlify

3. Set environment variables in Netlify dashboard

### Deploy to IPFS (Decentralized)

1. Build the app:
```bash
cd frontend
npm run build
```

2. Upload to IPFS:
```bash
npx ipfs-deploy dist
```

## Step 4: Database Setup (Optional)

### PostgreSQL on Heroku

1. Add Heroku Postgres:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

2. Update backend to use PostgreSQL instead of in-memory storage

### MongoDB Atlas

1. Create a MongoDB Atlas cluster
2. Get connection string
3. Update backend to use MongoDB

## Step 5: Domain & DNS

1. Purchase domain from Namecheap, GoDaddy, etc.
2. Point DNS to your hosting provider
3. Enable HTTPS/SSL

## Environment Variables Summary

### Frontend (.env)
```bash
VITE_REOWN_PROJECT_ID=your_project_id
VITE_API_URL=https://api.yourdomain.com
VITE_CONTRACT_ADDRESS=0x...
VITE_CHAIN_ID=1
VITE_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
```

### Backend (.env)
```bash
PORT=3001
CONTRACT_ADDRESS=0x...
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
GITHUB_TOKEN=ghp_...
DATABASE_URL=postgresql://... (optional)
CORS_ORIGINS=https://yourdomain.com
```

## Security Checklist

- [ ] Never commit private keys or secrets
- [ ] Use environment variables for all sensitive data
- [ ] Enable CORS only for your domain
- [ ] Implement rate limiting on API endpoints
- [ ] Use HTTPS everywhere
- [ ] Audit smart contracts before mainnet deployment
- [ ] Set up monitoring and alerts
- [ ] Create backup of private keys
- [ ] Use a hardware wallet for contract ownership
- [ ] Enable 2FA on all services

## Cost Estimates

### Free Tier (Development)
- Frontend: Vercel/Netlify free tier
- Backend: Railway/Render free tier
- Database: MongoDB Atlas free tier
- RPC: Alchemy free tier
- **Total: $0/month**

### Production Tier
- Frontend: Vercel Pro $20/month
- Backend: Railway Pro $5/month
- Database: MongoDB Atlas $9/month
- RPC: Alchemy Growth $49/month
- Domain: $12/year
- **Total: ~$85/month**

## Monitoring & Analytics

### Set Up Monitoring

1. **Sentry** for error tracking
```bash
npm install @sentry/react @sentry/node
```

2. **Google Analytics** for usage tracking

3. **Etherscan** for contract monitoring

### Health Checks

Add health check endpoints:
```typescript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: Date.now(),
    contract: CONTRACT_ADDRESS
  })
})
```

## Maintenance

### Regular Tasks
- Monitor gas prices before transactions
- Update dependencies monthly
- Backup database weekly
- Review error logs daily
- Check API rate limits

### Scaling
- Use Redis for caching
- Implement CDN for static assets
- Add load balancer for backend
- Use database read replicas

## Support

If you encounter issues during deployment:
1. Check the logs (Vercel, Railway, etc.)
2. Verify environment variables
3. Test API endpoints manually
4. Check network connectivity
5. Review smart contract on Etherscan

---

Good luck with your deployment! 🚀
