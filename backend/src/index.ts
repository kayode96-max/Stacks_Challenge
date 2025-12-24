import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { ethers } from 'ethers'
import { Octokit } from '@octokit/rest'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Initialize GitHub API client
const octokit = process.env.GITHUB_TOKEN 
  ? new Octokit({ auth: process.env.GITHUB_TOKEN })
  : new Octokit()

// Contract configuration
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000'
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545'

interface LeaderboardEntry {
  address: string
  users: number
  fees: string
  githubContributions: number
  walletKitUsage: number
  totalScore: number
}

// In-memory storage for GitHub username mappings and wallet connections
// In production, use a database
const githubMappings: Map<string, string> = new Map() // address -> username
const walletConnections: Map<string, number> = new Map() // address -> connection count

// Calculate score based on different metrics
function calculateScore(users: number, fees: string, github: number, walletKit: number): number {
  const feeScore = parseFloat(ethers.formatEther(fees)) * 100
  const userScore = users * 10
  const githubScore = github * 5
  const walletKitScore = walletKit * 15
  
  return Math.round(userScore + feeScore + githubScore + walletKitScore)
}

// Get GitHub contributions for a user
async function getGitHubContributions(username: string): Promise<number> {
  try {
    const { data } = await octokit.search.commits({
      q: `author:${username}`,
      sort: 'author-date',
      order: 'desc',
      per_page: 100
    })
    return data.total_count
  } catch (error) {
    console.error('Error fetching GitHub contributions:', error)
    return 0
  }
}

// Track WalletKit usage
function getWalletKitUsage(address: string): number {
  return walletConnections.get(address.toLowerCase()) || 0
}

function incrementWalletConnection(address: string): void {
  const lowerAddress = address.toLowerCase()
  const current = walletConnections.get(lowerAddress) || 0
  walletConnections.set(lowerAddress, current + 1)
}

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api/leaderboard', async (req: Request, res: Response) => {
  try {
    // Connect to blockchain
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    
    // Load contract ABI
    const contractABI = [
      "function getAllBuilders() external view returns (address[] memory)",
      "function getBuilderStats(address builder) external view returns (uint256 totalUsers, uint256 totalFees, uint256 lastUpdateTime, bool isActive)"
    ]
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider)
    
    // Get all builders
    const builders = await contract.getAllBuilders()
    
    // Fetch stats for each builder
    const leaderboardPromises = builders.map(async (address: string) => {
      const stats = await contract.getBuilderStats(address)
      
      // Get GitHub username from mapping
      const githubUsername = githubMappings.get(address.toLowerCase())
      const githubContributions = githubUsername ? await getGitHubContributions(githubUsername) : 0
      const walletKitUsage = getWalletKitUsage(address)
      
      const entry: LeaderboardEntry = {
        address,
        users: Number(stats.totalUsers),
        fees: stats.totalFees.toString(),
        githubContributions,
        walletKitUsage,
        totalScore: calculateScore(
          Number(stats.totalUsers),
          stats.totalFees.toString(),
          githubContributions,
          walletKitUsage
        )
      }
      
      return entry
    })
    
    const leaderboard = await Promise.all(leaderboardPromises)
    
    // Sort by total score
    leaderboard.sort((a, b) => b.totalScore - a.totalScore)
    
    res.json(leaderboard)
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    res.status(500).json({ error: 'Failed to fetch leaderboard' })
  }
})

app.get('/api/builder/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params
    
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' })
    }
    
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contractABI = [
      "function getBuilderStats(address builder) external view returns (uint256 totalUsers, uint256 totalFees, uint256 lastUpdateTime, bool isActive)"
    ]
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider)
    const stats = await contract.getBuilderStats(address)
    
    res.json({
      address,
      totalUsers: Number(stats.totalUsers),
      totalFees: stats.totalFees.toString(),
      lastUpdateTime: Number(stats.lastUpdateTime),
      isActive: stats.isActive
    })
  } catch (error) {
    console.error('Error fetching builder stats:', error)
    res.status(500).json({ error: 'Failed to fetch builder stats' })
  }
})

// Link GitHub account
app.post('/api/github/link', (req: Request, res: Response) => {
  try {
    const { address, username } = req.body

    if (!address || !username) {
      return res.status(400).json({ error: 'Address and username required' })
    }

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' })
    }

    githubMappings.set(address.toLowerCase(), username)
    res.json({ success: true, address, username })
  } catch (error) {
    console.error('Error linking GitHub:', error)
    res.status(500).json({ error: 'Failed to link GitHub account' })
  }
})

// Get GitHub username for address
app.get('/api/github/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' })
    }

    const username = githubMappings.get(address.toLowerCase())
    
    if (!username) {
      return res.status(404).json({ error: 'No GitHub account linked' })
    }

    res.json({ address, username })
  } catch (error) {
    console.error('Error fetching GitHub username:', error)
    res.status(500).json({ error: 'Failed to fetch GitHub username' })
  }
})

// Track wallet connection
app.post('/api/wallet/connect', (req: Request, res: Response) => {
  try {
    const { address } = req.body

    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' })
    }

    incrementWalletConnection(address)
    const count = getWalletKitUsage(address)
    
    res.json({ success: true, address, connections: count })
  } catch (error) {
    console.error('Error tracking wallet connection:', error)
    res.status(500).json({ error: 'Failed to track connection' })
  }
})

// Get wallet connection count
app.get('/api/wallet/:address', (req: Request, res: Response) => {
  try {
    const { address } = req.params

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid address' })
    }

    const connections = getWalletKitUsage(address)
    res.json({ address, connections })
  } catch (error) {
    console.error('Error fetching wallet stats:', error)
    res.status(500).json({ error: 'Failed to fetch wallet stats' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`)
  console.log(`Contract address: ${CONTRACT_ADDRESS}`)
  console.log(`RPC URL: ${RPC_URL}`)
})
