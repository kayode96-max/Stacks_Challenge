import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther, parseEther } from 'viem'

// Contract ABI for StacksLeaderboard
const STACKS_LEADERBOARD_ABI = [
  {
    "inputs": [{"internalType": "string", "name": "stacksAddress", "type": "string"}, {"internalType": "string", "name": "githubUsername", "type": "string"}],
    "name": "registerDeveloper",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "contractAddress", "type": "address"}],
    "name": "recordContractDeployment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "userCount", "type": "uint256"}],
    "name": "recordUsers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "recordFees",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "dev", "type": "address"}, {"internalType": "bool", "name": "upvote", "type": "bool"}],
    "name": "communityVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "dev", "type": "address"}],
    "name": "getDeveloper",
    "outputs": [
      {"internalType": "string", "name": "stacksAddress", "type": "string"},
      {"internalType": "string", "name": "githubUsername", "type": "string"},
      {"internalType": "uint256", "name": "contractsDeployed", "type": "uint256"},
      {"internalType": "uint256", "name": "totalUsers", "type": "uint256"},
      {"internalType": "uint256", "name": "feesGenerated", "type": "uint256"},
      {"internalType": "uint256", "name": "githubScore", "type": "uint256"},
      {"internalType": "uint256", "name": "communityScore", "type": "uint256"},
      {"internalType": "uint256", "name": "totalScore", "type": "uint256"},
      {"internalType": "uint8", "name": "tier", "type": "uint8"},
      {"internalType": "bool", "name": "isVerified", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "offset", "type": "uint256"}, {"internalType": "uint256", "name": "limit", "type": "uint256"}],
    "name": "getLeaderboard",
    "outputs": [
      {"internalType": "address[]", "name": "addresses", "type": "address[]"},
      {"internalType": "uint256[]", "name": "scores", "type": "uint256[]"},
      {"internalType": "uint8[]", "name": "tiers", "type": "uint8[]"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "dev", "type": "address"}],
    "name": "getRank",
    "outputs": [
      {"internalType": "uint256", "name": "rank", "type": "uint256"},
      {"internalType": "uint256", "name": "totalDevs", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getDeveloperCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTierStats",
    "outputs": [
      {"internalType": "uint256", "name": "newcomers", "type": "uint256"},
      {"internalType": "uint256", "name": "builders", "type": "uint256"},
      {"internalType": "uint256", "name": "experts", "type": "uint256"},
      {"internalType": "uint256", "name": "masters", "type": "uint256"},
      {"internalType": "uint256", "name": "legends", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const TIER_NAMES = ['Newcomer', 'Builder', 'Expert', 'Master', 'Legend']
const TIER_COLORS = [
  'bg-gray-100 text-gray-600',
  'bg-blue-100 text-blue-600',
  'bg-purple-100 text-purple-600',
  'bg-orange-100 text-orange-600',
  'bg-yellow-100 text-yellow-600'
]
const TIER_ICONS = ['🌱', '🔨', '⚡', '🏆', '👑']

interface LeaderboardEntry {
  address: string
  score: bigint
  tier: number
  stacksAddress?: string
  githubUsername?: string
  contractsDeployed?: bigint
  totalUsers?: bigint
  feesGenerated?: bigint
  isVerified?: boolean
}

export function StacksRankings() {
  const { address, isConnected } = useAccount()
  const [showRegister, setShowRegister] = useState(false)
  const [stacksAddr, setStacksAddr] = useState('')
  const [githubUser, setGithubUser] = useState('')
  
  // Get contract address from deployment
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>()
  
  useEffect(() => {
    import('../contracts/deployment.json').then(deployment => {
      if (deployment.stacksLeaderboard) {
        setContractAddress(deployment.stacksLeaderboard as `0x${string}`)
      }
    }).catch(() => {
      console.log('Deployment info not found')
    })
  }, [])

  // Read leaderboard
  const { data: leaderboardData, refetch: refetchLeaderboard } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getLeaderboard',
    args: [BigInt(0), BigInt(20)],
    query: { enabled: !!contractAddress }
  })

  // Read tier stats
  const { data: tierStats } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getTierStats',
    query: { enabled: !!contractAddress }
  })

  // Read developer count
  const { data: devCount } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getDeveloperCount',
    query: { enabled: !!contractAddress }
  })

  // Read current user's profile
  const { data: myProfile } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getDeveloper',
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address }
  })

  // Read current user's rank
  const { data: myRank } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getRank',
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address && myProfile?.[0] !== '' }
  })

  // Write functions
  const { writeContract: register, data: registerHash, isPending: isRegistering } = useWriteContract()
  const { writeContract: vote, isPending: isVoting } = useWriteContract()
  const { writeContract: recordFees, isPending: isRecordingFees } = useWriteContract()

  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: registerHash })

  useEffect(() => {
    if (registerHash && !isConfirming) {
      refetchLeaderboard()
      setShowRegister(false)
    }
  }, [registerHash, isConfirming, refetchLeaderboard])

  const handleRegister = () => {
    if (!contractAddress || !stacksAddr) return
    register({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'registerDeveloper',
      args: [stacksAddr, githubUser]
    })
  }

  const handleVote = (dev: string, upvote: boolean) => {
    if (!contractAddress) return
    vote({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'communityVote',
      args: [dev as `0x${string}`, upvote]
    })
  }

  const handleRecordFees = () => {
    if (!contractAddress) return
    recordFees({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'recordFees',
      value: parseEther('0.01')
    })
  }

  // Parse leaderboard data
  const leaderboard: LeaderboardEntry[] = leaderboardData 
    ? leaderboardData[0].map((addr, i) => ({
        address: addr,
        score: leaderboardData[1][i],
        tier: leaderboardData[2][i]
      }))
    : []

  const isRegistered = myProfile && myProfile[0] !== ''

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">🏆 Stacks Developer Rankings</h2>
            <p className="text-white/80 mt-1">Compete, build, and rise through the tiers!</p>
          </div>
          {isConnected && !isRegistered && (
            <button
              onClick={() => setShowRegister(true)}
              className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            >
              Join the Challenge
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-white/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{devCount?.toString() || '0'}</div>
            <div className="text-xs text-white/70">Total Developers</div>
          </div>
          {tierStats && (
            <>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{tierStats[4].toString()}</div>
                <div className="text-xs text-white/70">👑 Legends</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{tierStats[3].toString()}</div>
                <div className="text-xs text-white/70">🏆 Masters</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{tierStats[2].toString()}</div>
                <div className="text-xs text-white/70">⚡ Experts</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{tierStats[1].toString()}</div>
                <div className="text-xs text-white/70">🔨 Builders</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Current User Card */}
      {isConnected && isRegistered && myProfile && (
        <div className="bg-white rounded-xl shadow-md p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${TIER_COLORS[myProfile[8]]}`}>
                {TIER_ICONS[myProfile[8]]}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold">Your Profile</span>
                  {myProfile[9] && (
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">✓ Verified</span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{myProfile[0] || 'No STX address'}</p>
                {myProfile[1] && (
                  <a 
                    href={`https://github.com/${myProfile[1]}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-purple-600 hover:underline"
                  >
                    @{myProfile[1]}
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-600">{myProfile[7].toString()}</div>
              <div className="text-sm text-gray-500">Total Score</div>
              {myRank && (
                <div className="text-sm text-gray-600 mt-1">
                  Rank #{myRank[0].toString()} of {myRank[1].toString()}
                </div>
              )}
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{myProfile[2].toString()}</div>
              <div className="text-xs text-gray-500">Contracts</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{myProfile[3].toString()}</div>
              <div className="text-xs text-gray-500">Users</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{formatEther(myProfile[4])} ETH</div>
              <div className="text-xs text-gray-500">Fees</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{myProfile[5].toString()}</div>
              <div className="text-xs text-gray-500">GitHub Score</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-gray-900">{myProfile[6].toString()}</div>
              <div className="text-xs text-gray-500">Community</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleRecordFees}
              disabled={isRecordingFees}
              className="flex-1 bg-purple-100 text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-200 transition-colors disabled:opacity-50"
            >
              {isRecordingFees ? 'Recording...' : '💰 Record Fees (0.01 ETH)'}
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
          <h3 className="text-xl font-bold text-white">Top Stacks Developers</h3>
          <p className="text-white/70 text-sm">Ranked by total score across all metrics</p>
        </div>

        <div className="divide-y divide-gray-100">
          {leaderboard.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h4 className="text-lg font-semibold text-gray-700">No developers yet!</h4>
              <p className="text-gray-500 mt-1">Be the first to join the Stacks Builder Challenge</p>
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div 
                key={entry.address} 
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  entry.address.toLowerCase() === address?.toLowerCase() ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Rank */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    index === 0 ? 'bg-yellow-100 text-yellow-600 ring-2 ring-yellow-400' :
                    index === 1 ? 'bg-gray-200 text-gray-600 ring-2 ring-gray-400' :
                    index === 2 ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-400' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>

                  {/* Tier Badge */}
                  <div className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium ${TIER_COLORS[entry.tier]}`}>
                    {TIER_ICONS[entry.tier]} {TIER_NAMES[entry.tier]}
                  </div>

                  {/* Address */}
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-gray-900">
                      {entry.address.slice(0, 8)}...{entry.address.slice(-6)}
                    </p>
                    {entry.address.toLowerCase() === address?.toLowerCase() && (
                      <span className="text-xs text-purple-600 font-medium">← You</span>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-purple-600">{entry.score.toString()}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>

                  {/* Vote Buttons */}
                  {isConnected && entry.address.toLowerCase() !== address?.toLowerCase() && (
                    <div className="flex-shrink-0 flex space-x-1">
                      <button
                        onClick={() => handleVote(entry.address, true)}
                        disabled={isVoting}
                        className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition-colors disabled:opacity-50"
                        title="Upvote"
                      >
                        👍
                      </button>
                      <button
                        onClick={() => handleVote(entry.address, false)}
                        disabled={isVoting}
                        className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                        title="Downvote"
                      >
                        👎
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Registration Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Join the Stacks Builder Challenge</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stacks Address (SP...)
                </label>
                <input
                  type="text"
                  value={stacksAddr}
                  onChange={(e) => setStacksAddr(e.target.value)}
                  placeholder="SP1ABC..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GitHub Username (optional)
                </label>
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value)}
                  placeholder="your-github-username"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRegister(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={isRegistering || isConfirming || !stacksAddr}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isRegistering || isConfirming ? 'Registering...' : 'Register'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tier Legend */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Tier System</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {TIER_NAMES.map((tier, i) => (
            <div key={tier} className={`rounded-lg p-4 text-center ${TIER_COLORS[i]}`}>
              <div className="text-3xl mb-2">{TIER_ICONS[i]}</div>
              <div className="font-semibold">{tier}</div>
              <div className="text-xs mt-1 opacity-75">
                {i === 0 && '0-99 pts'}
                {i === 1 && '100-499 pts'}
                {i === 2 && '500-999 pts'}
                {i === 3 && '1000-4999 pts'}
                {i === 4 && '5000+ pts'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
