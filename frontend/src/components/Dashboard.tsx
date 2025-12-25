import { useAppKitAccount } from '@reown/appkit/react'
import { useBuilderTracker } from '../hooks/useBuilderTracker'
import { formatEther, parseEther } from 'ethers'
import { useState } from 'react'

export function Dashboard() {
  const { isConnected } = useAppKitAccount()
  const { stats, loading, registerBuilder, addUser, collectFee } = useBuilderTracker()
  const [userAddress, setUserAddress] = useState('')
  const [feeAmount, setFeeAmount] = useState('')

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
        <p className="text-gray-600 text-sm">Connect your wallet to start tracking your builder activity</p>
      </div>
    )
  }

  if (!stats?.isActive && !loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Register as a Builder</h3>
        <p className="text-gray-600 mb-6 text-sm">Join the Builder Challenge and start tracking your activity</p>
        <button
          onClick={registerBuilder}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
        >
          Register Now
        </button>
      </div>
    )
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userAddress) return
    try {
      await addUser(userAddress)
      setUserAddress('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleCollectFee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feeAmount) return
    try {
      await collectFee(parseEther(feeAmount).toString())
      setFeeAmount('')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Users</div>
          <div className="text-3xl font-bold text-primary">{stats?.totalUsers || 0}</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Fees</div>
          <div className="text-3xl font-bold text-secondary">
            {stats?.totalFees ? parseFloat(formatEther(stats.totalFees)).toFixed(4) : '0.0000'}
          </div>
          <div className="text-xs text-gray-500 mt-1">ETH</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Status</div>
          <div className="text-3xl font-bold text-green-600">Active</div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Add User</h3>
          <form onSubmit={handleAddUser} className="space-y-4">
            <input
              type="text"
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              placeholder="User address (0x...)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={loading || !userAddress}
              className="w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Adding...' : 'Add User'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Collect Fee</h3>
          <form onSubmit={handleCollectFee} className="space-y-4">
            <input
              type="number"
              step="0.0001"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="Amount in ETH"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <button
              type="submit"
              disabled={loading || !feeAmount}
              className="w-full px-4 py-2 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Collect Fee'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
