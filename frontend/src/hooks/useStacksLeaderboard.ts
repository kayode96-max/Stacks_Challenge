import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useState, useEffect } from 'react'
import { parseEther } from 'viem'

// Contract ABI for StacksLeaderboard
const STACKS_LEADERBOARD_ABI = [
  {
    inputs: [{ name: "stacksAddress", type: "string" }, { name: "githubUsername", type: "string" }],
    name: "registerDeveloper",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "contractAddress", type: "address" }],
    name: "recordContractDeployment",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "userCount", type: "uint256" }],
    name: "recordUsers",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "recordFees",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [{ name: "dev", type: "address" }, { name: "upvote", type: "bool" }],
    name: "communityVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "dev", type: "address" }],
    name: "getDeveloper",
    outputs: [
      { name: "stacksAddress", type: "string" },
      { name: "githubUsername", type: "string" },
      { name: "contractsDeployed", type: "uint256" },
      { name: "totalUsers", type: "uint256" },
      { name: "feesGenerated", type: "uint256" },
      { name: "githubScore", type: "uint256" },
      { name: "communityScore", type: "uint256" },
      { name: "totalScore", type: "uint256" },
      { name: "tier", type: "uint8" },
      { name: "isVerified", type: "bool" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "offset", type: "uint256" }, { name: "limit", type: "uint256" }],
    name: "getLeaderboard",
    outputs: [
      { name: "addresses", type: "address[]" },
      { name: "scores", type: "uint256[]" },
      { name: "tiers", type: "uint8[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "dev", type: "address" }],
    name: "getRank",
    outputs: [
      { name: "rank", type: "uint256" },
      { name: "totalDevs", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getDeveloperCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "getTierStats",
    outputs: [
      { name: "newcomers", type: "uint256" },
      { name: "builders", type: "uint256" },
      { name: "experts", type: "uint256" },
      { name: "masters", type: "uint256" },
      { name: "legends", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const

export interface DeveloperProfile {
  stacksAddress: string
  githubUsername: string
  contractsDeployed: bigint
  totalUsers: bigint
  feesGenerated: bigint
  githubScore: bigint
  communityScore: bigint
  totalScore: bigint
  tier: number
  isVerified: boolean
}

export interface LeaderboardEntry {
  address: string
  score: bigint
  tier: number
}

export function useStacksLeaderboard() {
  const { address, isConnected } = useAccount()
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>()

  // Load contract address from deployment
  useEffect(() => {
    import('../contracts/deployment.json').then(deployment => {
      if (deployment.stacksLeaderboard) {
        setContractAddress(deployment.stacksLeaderboard as `0x${string}`)
      }
    }).catch(console.error)
  }, [])

  // Read leaderboard
  const { data: leaderboardData, refetch: refetchLeaderboard, isLoading: isLoadingLeaderboard } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getLeaderboard',
    args: [BigInt(0), BigInt(50)],
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
  const { data: developerCount } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getDeveloperCount',
    query: { enabled: !!contractAddress }
  })

  // Read current user's profile
  const { data: myProfileData, refetch: refetchProfile } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getDeveloper',
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address }
  })

  // Read current user's rank
  const { data: myRankData } = useReadContract({
    address: contractAddress,
    abi: STACKS_LEADERBOARD_ABI,
    functionName: 'getRank',
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address && myProfileData?.[0] !== '' }
  })

  // Write functions
  const { writeContract: doRegister, data: registerHash, isPending: isRegistering } = useWriteContract()
  const { writeContract: doVote, isPending: isVoting } = useWriteContract()
  const { writeContract: doRecordFees, data: recordFeesHash, isPending: isRecordingFees } = useWriteContract()
  const { writeContract: doRecordUsers, isPending: isRecordingUsers } = useWriteContract()
  const { writeContract: doRecordContract, isPending: isRecordingContract } = useWriteContract()

  // Wait for transactions
  const { isLoading: isConfirmingRegister } = useWaitForTransactionReceipt({ hash: registerHash })
  const { isLoading: isConfirmingFees } = useWaitForTransactionReceipt({ hash: recordFeesHash })

  // Parse leaderboard data
  const leaderboard: LeaderboardEntry[] = leaderboardData
    ? leaderboardData[0].map((addr, i) => ({
        address: addr,
        score: leaderboardData[1][i],
        tier: leaderboardData[2][i]
      }))
    : []

  // Parse user profile
  const myProfile: DeveloperProfile | null = myProfileData && myProfileData[0] !== ''
    ? {
        stacksAddress: myProfileData[0],
        githubUsername: myProfileData[1],
        contractsDeployed: myProfileData[2],
        totalUsers: myProfileData[3],
        feesGenerated: myProfileData[4],
        githubScore: myProfileData[5],
        communityScore: myProfileData[6],
        totalScore: myProfileData[7],
        tier: myProfileData[8],
        isVerified: myProfileData[9]
      }
    : null

  const myRank = myRankData ? { rank: myRankData[0], total: myRankData[1] } : null

  // Actions
  const register = (stacksAddress: string, githubUsername: string) => {
    if (!contractAddress) return
    doRegister({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'registerDeveloper',
      args: [stacksAddress, githubUsername]
    })
  }

  const vote = (developer: string, upvote: boolean) => {
    if (!contractAddress) return
    doVote({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'communityVote',
      args: [developer as `0x${string}`, upvote]
    })
  }

  const recordFees = (amountEth: string = '0.01') => {
    if (!contractAddress) return
    doRecordFees({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'recordFees',
      value: parseEther(amountEth)
    })
  }

  const recordUsers = (count: number) => {
    if (!contractAddress) return
    doRecordUsers({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'recordUsers',
      args: [BigInt(count)]
    })
  }

  const recordContractDeployment = (contractAddr: string) => {
    if (!contractAddress) return
    doRecordContract({
      address: contractAddress,
      abi: STACKS_LEADERBOARD_ABI,
      functionName: 'recordContractDeployment',
      args: [contractAddr as `0x${string}`]
    })
  }

  return {
    // State
    isConnected,
    contractAddress,
    leaderboard,
    tierStats: tierStats ? {
      newcomers: tierStats[0],
      builders: tierStats[1],
      experts: tierStats[2],
      masters: tierStats[3],
      legends: tierStats[4]
    } : null,
    developerCount,
    myProfile,
    myRank,
    
    // Loading states
    isLoadingLeaderboard,
    isRegistering: isRegistering || isConfirmingRegister,
    isVoting,
    isRecordingFees: isRecordingFees || isConfirmingFees,
    isRecordingUsers,
    isRecordingContract,
    
    // Actions
    register,
    vote,
    recordFees,
    recordUsers,
    recordContractDeployment,
    refetchLeaderboard,
    refetchProfile
  }
}
