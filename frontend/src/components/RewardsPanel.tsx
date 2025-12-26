import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { formatEther } from 'viem'

const REWARDS_ABI = [
  {
    inputs: [{ name: "poolId", type: "uint256" }],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "poolIds", type: "uint256[]" }],
    name: "claimAllRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "developer", type: "address" }],
    name: "getPendingRewards",
    outputs: [
      { name: "totalPending", type: "uint256" },
      { name: "poolIds", type: "uint256[]" },
      { name: "amounts", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "developer", type: "address" }],
    name: "getDeveloperStats",
    outputs: [
      { name: "totalEarned", type: "uint256" },
      { name: "totalClaimed", type: "uint256" },
      { name: "pendingClaims", type: "uint256" },
      { name: "poolsParticipated", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "poolId", type: "uint256" }],
    name: "getPoolDetails",
    outputs: [
      { name: "totalAmount", type: "uint256" },
      { name: "distributedAmount", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "isActive", type: "bool" },
      { name: "rewardType", type: "uint8" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "currentPoolId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const

// Reward types: 0=Weekly, 1=Monthly, 2=Special Event, 3=Bounty

export function RewardsPanel() {
  const { address, isConnected } = useAccount()
  const [contractAddress, setContractAddress] = useState<`0x${string}` | undefined>()

  useEffect(() => {
    import('../contracts/deployment.json').then(deployment => {
      if (deployment.stacksRewards) {
        setContractAddress(deployment.stacksRewards as `0x${string}`)
      }
    }).catch(() => console.log('Deployment info not found'))
  }, [])

  // Read pending rewards
  const { data: pendingData, refetch: refetchPending } = useReadContract({
    address: contractAddress,
    abi: REWARDS_ABI,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address }
  })

  // Read developer stats
  const { data: statsData } = useReadContract({
    address: contractAddress,
    abi: REWARDS_ABI,
    functionName: 'getDeveloperStats',
    args: address ? [address] : undefined,
    query: { enabled: !!contractAddress && !!address }
  })

  // Current pool count
  const { data: poolCount } = useReadContract({
    address: contractAddress,
    abi: REWARDS_ABI,
    functionName: 'currentPoolId',
    query: { enabled: !!contractAddress }
  })

  // Write functions
  const { writeContract: claimAll, data: claimHash, isPending: isClaiming } = useWriteContract()
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: claimHash })

  useEffect(() => {
    if (claimHash && !isConfirming) {
      refetchPending()
    }
  }, [claimHash, isConfirming, refetchPending])

  const handleClaimAll = () => {
    if (!contractAddress || !pendingData || pendingData[1].length === 0) return
    claimAll({
      address: contractAddress,
      abi: REWARDS_ABI,
      functionName: 'claimAllRewards',
      args: [pendingData[1]]
    })
  }

  const totalPending = pendingData ? pendingData[0] : BigInt(0)
  const pendingPools = pendingData ? pendingData[1] : []
  const pendingAmounts = pendingData ? pendingData[2] : []

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="text-4xl mb-4">🎁</div>
        <h3 className="text-lg font-semibold text-gray-900">Rewards</h3>
        <p className="text-gray-500 mt-2">Connect your wallet to view rewards</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <h3 className="text-xl font-bold text-white">💰 Your Rewards</h3>
        <p className="text-white/70 text-sm">Earn rewards by ranking high on the leaderboard</p>
      </div>

      <div className="p-6">
        {/* Summary Stats */}
        {statsData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-green-700">
                {formatEther(statsData[0])} ETH
              </div>
              <div className="text-xs text-green-600">Total Earned</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-blue-700">
                {formatEther(statsData[1])} ETH
              </div>
              <div className="text-xs text-blue-600">Claimed</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-orange-700">
                {formatEther(statsData[2])} ETH
              </div>
              <div className="text-xs text-orange-600">Pending</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-purple-700">
                {statsData[3].toString()}
              </div>
              <div className="text-xs text-purple-600">Pools Joined</div>
            </div>
          </div>
        )}

        {/* Pending Claims */}
        {totalPending > 0 && (
          <div className="border border-green-200 bg-green-50 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Claimable Rewards</h4>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {formatEther(totalPending)} ETH
                </p>
                <p className="text-sm text-green-600">
                  From {pendingPools.length} pool{pendingPools.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={handleClaimAll}
                disabled={isClaiming || isConfirming}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isClaiming || isConfirming ? 'Claiming...' : 'Claim All'}
              </button>
            </div>

            {/* Breakdown */}
            <div className="mt-4 space-y-2">
              {pendingPools.map((poolId, i) => (
                <div key={poolId.toString()} className="flex justify-between text-sm text-green-700 bg-white/50 rounded px-3 py-2">
                  <span>Pool #{poolId.toString()}</span>
                  <span className="font-medium">{formatEther(pendingAmounts[i])} ETH</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Rewards State */}
        {totalPending === BigInt(0) && (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🏆</div>
            <h4 className="text-lg font-semibold text-gray-700">No pending rewards</h4>
            <p className="text-gray-500 mt-1">
              Climb the leaderboard to earn rewards from weekly and monthly pools!
            </p>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-medium text-gray-900 mb-2">How Rewards Work</h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• 🥇 1st place gets 30% of the pool</li>
            <li>• 🥈 2nd place gets 20% of the pool</li>
            <li>• 🥉 3rd place gets 15% of the pool</li>
            <li>• Top 10 all receive rewards</li>
            <li>• {poolCount?.toString() || '0'} reward pools created so far</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
