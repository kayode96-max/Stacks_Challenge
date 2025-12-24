# 📡 API Documentation

## Base URL
```
http://localhost:3001/api
```

## Endpoints

### Health Check

#### GET `/health`
Check if the API server is running.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-25T10:00:00.000Z"
}
```

---

### Leaderboard

#### GET `/leaderboard`
Get the complete leaderboard with all builders ranked by score.

**Response:**
```json
[
  {
    "address": "0x1234...5678",
    "users": 42,
    "fees": "1500000000000000000",
    "githubContributions": 156,
    "walletKitUsage": 23,
    "totalScore": 1845
  }
]
```

**Scoring Formula:**
```
totalScore = (users × 10) + (fees in ETH × 100) + (githubContributions × 5) + (walletKitUsage × 15)
```

---

### Builder Stats

#### GET `/builder/:address`
Get statistics for a specific builder.

**Parameters:**
- `address` (path) - Ethereum address of the builder

**Response:**
```json
{
  "address": "0x1234...5678",
  "totalUsers": 42,
  "totalFees": "1500000000000000000",
  "lastUpdateTime": 1735128000,
  "isActive": true
}
```

**Error Responses:**
- `400` - Invalid address format
- `500` - Failed to fetch builder stats

---

### GitHub Integration

#### POST `/github/link`
Link a GitHub account to an Ethereum address.

**Request Body:**
```json
{
  "address": "0x1234...5678",
  "username": "octocat"
}
```

**Response:**
```json
{
  "success": true,
  "address": "0x1234...5678",
  "username": "octocat"
}
```

**Error Responses:**
- `400` - Missing address or username
- `400` - Invalid Ethereum address
- `500` - Failed to link GitHub account

---

#### GET `/github/:address`
Get the linked GitHub username for an address.

**Parameters:**
- `address` (path) - Ethereum address

**Response:**
```json
{
  "address": "0x1234...5678",
  "username": "octocat"
}
```

**Error Responses:**
- `400` - Invalid address
- `404` - No GitHub account linked
- `500` - Failed to fetch GitHub username

---

### Wallet Tracking

#### POST `/wallet/connect`
Track a wallet connection event.

**Request Body:**
```json
{
  "address": "0x1234...5678"
}
```

**Response:**
```json
{
  "success": true,
  "address": "0x1234...5678",
  "connections": 15
}
```

**Error Responses:**
- `400` - Invalid address
- `500` - Failed to track connection

---

#### GET `/wallet/:address`
Get the wallet connection count for an address.

**Parameters:**
- `address` (path) - Ethereum address

**Response:**
```json
{
  "address": "0x1234...5678",
  "connections": 15
}
```

**Error Responses:**
- `400` - Invalid address
- `500` - Failed to fetch wallet stats

---

## Smart Contract Integration

The API interacts with the following smart contract functions:

### Read Functions
- `getAllBuilders()` - Returns array of all builder addresses
- `getBuilderStats(address)` - Returns stats for a specific builder
- `getLeaderboard(uint256)` - Returns top N builders

### Write Functions (Called from Frontend)
- `registerBuilder()` - Register as a new builder
- `addUser(address)` - Add a user to your count
- `collectFee()` - Record a fee payment (payable)

---

## Rate Limiting

Currently no rate limiting is implemented. For production:
- Recommended: 100 requests per minute per IP
- Use `express-rate-limit` package
- Implement API key authentication for higher limits

---

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

---

## CORS Configuration

Current CORS settings allow requests from:
- `http://localhost:3000`
- `http://localhost:5173`

For production, update `CORS_ORIGINS` in `.env`:
```bash
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Example Usage

### JavaScript/TypeScript

```typescript
// Get leaderboard
const response = await fetch('http://localhost:3001/api/leaderboard')
const leaderboard = await response.json()

// Link GitHub account
const linkResponse = await fetch('http://localhost:3001/api/github/link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '0x1234...5678',
    username: 'octocat'
  })
})
const result = await linkResponse.json()

// Track wallet connection
await fetch('http://localhost:3001/api/wallet/connect', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: walletAddress })
})
```

### cURL

```bash
# Get leaderboard
curl http://localhost:3001/api/leaderboard

# Link GitHub account
curl -X POST http://localhost:3001/api/github/link \
  -H "Content-Type: application/json" \
  -d '{"address":"0x1234...5678","username":"octocat"}'

# Get builder stats
curl http://localhost:3001/api/builder/0x1234...5678
```

---

## Data Storage

### Current Implementation (Development)
- In-memory storage using JavaScript Map
- Data resets when server restarts
- Suitable for development and testing

### Production Recommendations
- Use PostgreSQL or MongoDB
- Implement data persistence
- Add backup strategies
- Use connection pooling

### Schema Example (PostgreSQL)

```sql
CREATE TABLE github_mappings (
  address VARCHAR(42) PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wallet_connections (
  address VARCHAR(42) PRIMARY KEY,
  connection_count INTEGER DEFAULT 0,
  last_connected_at TIMESTAMP DEFAULT NOW()
);
```

---

## Testing

### Unit Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
# Start local blockchain
cd contracts && npm run node

# Deploy contracts
npm run deploy:local

# Run backend tests
cd ../backend && npm run test:integration
```

### API Testing with Postman

Import this collection:
```json
{
  "info": { "name": "Builder Challenge API" },
  "item": [
    {
      "name": "Get Leaderboard",
      "request": {
        "method": "GET",
        "url": "http://localhost:3001/api/leaderboard"
      }
    }
  ]
}
```

---

## Debugging

Enable debug logging:
```bash
DEBUG=* npm start
```

View detailed logs:
```bash
npm start | npx pino-pretty
```

---

## Version History

### v1.0.0
- Initial release
- Basic leaderboard functionality
- Contract integration

### v2.0.0 (Current)
- GitHub integration
- Wallet connection tracking
- Enhanced scoring system
- Activity timeline support

---

For more information, see the main [README.md](README.md)
