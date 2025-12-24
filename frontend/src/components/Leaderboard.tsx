import { useLeaderboard } from '../hooks/useLeaderboard'
import { formatEther } from 'ethers'

export function Leaderboard() {
  const { leaderboard, loading, error } = useLeaderboard()

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center text-red-600">
          <p>Error loading leaderboard</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-secondary px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        <p className="text-white/80 text-sm mt-1">Top builders this week</p>
      </div>

      <div className="divide-y divide-gray-100">
        {leaderboard.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No builders on the leaderboard yet. Be the first!
          </div>
        ) : (
          leaderboard.map((entry, index) => (
            <div key={entry.address} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </p>
                  
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">Users:</span>
                      <span className="ml-1 font-semibold text-gray-900">{entry.users}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fees:</span>
                      <span className="ml-1 font-semibold text-gray-900">
                        {parseFloat(formatEther(entry.fees)).toFixed(4)} ETH
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">GitHub:</span>
                      <span className="ml-1 font-semibold text-gray-900">{entry.githubContributions}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">WalletKit:</span>
                      <span className="ml-1 font-semibold text-gray-900">{entry.walletKitUsage}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <div className="text-2xl font-bold text-primary">{entry.totalScore}</div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
