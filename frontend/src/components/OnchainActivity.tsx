import { useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { useBuilderTracker } from '../hooks/useBuilderTracker'
import { parseEther } from 'ethers'

/**
 * OnchainActivity Component
 * 
 * Demonstrates how to create and track onchain activity through:
 * - Builder registration
 * - User additions
 * - Fee collection
 * 
 * Each action creates a blockchain transaction that's permanently recorded.
 */
export function OnchainActivity() {
  const { address, isConnected } = useAppKitAccount()
  const { contract, stats, loading, registerBuilder, addUser, collectFee } = useBuilderTracker()
  
  // Form states
  const [userToAdd, setUserToAdd] = useState('')
  const [feeAmount, setFeeAmount] = useState('')
  const [transactionStatus, setTransactionStatus] = useState<string>('')
  const [recentTxs, setRecentTxs] = useState<Array<{
    type: string
    status: 'pending' | 'success' | 'error'
    message: string
    timestamp: Date
  }>>([])

  // Helper to add transaction to history
  const addTransaction = (type: string, status: 'pending' | 'success' | 'error', message: string) => {
    const newTx = { type, status, message, timestamp: new Date() }
    setRecentTxs(prev => [newTx, ...prev].slice(0, 5))
  }

  // 1️⃣ REGISTER AS BUILDER
  const handleRegister = async () => {
    if (!contract) {
      setTransactionStatus('Contract not loaded')
      return
    }

    try {
      addTransaction('Register', 'pending', 'Registering as builder...')
      setTransactionStatus('⏳ Registering... Confirm in your wallet')

      await registerBuilder()
      
      addTransaction('Register', 'success', 'Registered successfully!')
      setTransactionStatus('✅ You are now registered as a builder!')
      
      // Transaction details
      console.log('Registration TX:', {
        from: address,
        action: 'registerBuilder',
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed'
      addTransaction('Register', 'error', errorMsg)
      setTransactionStatus(`❌ Error: ${errorMsg}`)
      console.error('Registration error:', error)
    }
  }

  // 2️⃣ ADD A USER
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contract) {
      setTransactionStatus('Contract not loaded')
      return
    }

    if (!userToAdd.trim()) {
      setTransactionStatus('Please enter a user address')
      return
    }

    // Validate Ethereum address
    if (!userToAdd.match(/^0x[a-fA-F0-9]{40}$/)) {
      setTransactionStatus('Invalid Ethereum address format')
      return
    }

    try {
      addTransaction('Add User', 'pending', `Adding user ${userToAdd.slice(0, 6)}...`)
      setTransactionStatus(`⏳ Adding user... Confirm in your wallet`)

      await addUser(userToAdd)
      
      addTransaction('Add User', 'success', `User added: ${userToAdd.slice(0, 6)}...`)
      setTransactionStatus('✅ User added successfully!')
      
      // Log activity
      console.log('User Added TX:', {
        builder: address,
        user: userToAdd,
        action: 'addUser',
        timestamp: new Date().toISOString()
      })

      // Clear form
      setUserToAdd('')

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to add user'
      addTransaction('Add User', 'error', errorMsg)
      setTransactionStatus(`❌ Error: ${errorMsg}`)
      console.error('Add user error:', error)
    }
  }

  // 3️⃣ COLLECT A FEE
  const handleCollectFee = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contract) {
      setTransactionStatus('Contract not loaded')
      return
    }

    if (!feeAmount || parseFloat(feeAmount) <= 0) {
      setTransactionStatus('Please enter a valid fee amount')
      return
    }

    try {
      addTransaction('Collect Fee', 'pending', `Collecting ${feeAmount} ETH...`)
      setTransactionStatus(`⏳ Collecting ${feeAmount} ETH... Confirm in your wallet`)

      const weiAmount = parseEther(feeAmount).toString()
      await collectFee(weiAmount)
      
      addTransaction('Collect Fee', 'success', `Collected ${feeAmount} ETH`)
      setTransactionStatus(`✅ Fee of ${feeAmount} ETH collected!`)
      
      // Log activity
      console.log('Fee Collected TX:', {
        builder: address,
        amount: feeAmount,
        wei: weiAmount,
        action: 'collectFee',
        timestamp: new Date().toISOString()
      })

      // Clear form
      setFeeAmount('')

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to collect fee'
      addTransaction('Collect Fee', 'error', errorMsg)
      setTransactionStatus(`❌ Error: ${errorMsg}`)
      console.error('Collect fee error:', error)
    }
  }

  if (!isConnected) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <p className="text-gray-600">Connect your wallet to create onchain activity</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {transactionStatus && (
        <div className={`p-4 rounded-xl ${
          transactionStatus.includes('✅') ? 'bg-green-50 text-green-900' :
          transactionStatus.includes('❌') ? 'bg-red-50 text-red-900' :
          'bg-blue-50 text-blue-900'
        }`}>
          {transactionStatus}
        </div>
      )}

      {/* Current Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Current Stats</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-2xl font-bold text-blue-600">{stats?.isActive ? '✅ Active' : '❌ Inactive'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Users</p>
            <p className="text-2xl font-bold text-purple-600">{stats?.totalUsers || 0}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Fees</p>
            <p className="text-2xl font-bold text-green-600">
              {stats?.totalFees ? (parseFloat(stats.totalFees) / 1e18).toFixed(4) : '0'} ETH
            </p>
          </div>
        </div>
      </div>

      {/* Action 1: Register */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">1️⃣ Register as Builder</h3>
        <p className="text-sm text-gray-600 mb-4">
          Creates your builder profile onchain. This is required before adding users or collecting fees.
        </p>
        <button
          onClick={handleRegister}
          disabled={loading || stats?.isActive}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? 'Processing...' : stats?.isActive ? '✅ Already Registered' : 'Register Now'}
        </button>
        <p className="text-xs text-gray-500 mt-3">Gas cost: ~60,000 units</p>
      </div>

      {/* Action 2: Add User */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">2️⃣ Add a User</h3>
        <p className="text-sm text-gray-600 mb-4">
          Record that someone is using your dApp. Each addition increments your user count onchain.
        </p>
        <form onSubmit={handleAddUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Address (0x...)
            </label>
            <input
              type="text"
              value={userToAdd}
              onChange={(e) => setUserToAdd(e.target.value)}
              placeholder="0x1234567890123456789012345678901234567890"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!stats?.isActive || loading}
            />
          </div>
          <button
            type="submit"
            disabled={!stats?.isActive || loading || !userToAdd}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Processing...' : 'Add User'}
          </button>
          <p className="text-xs text-gray-500">Gas cost: ~40,000 units</p>
        </form>
      </div>

      {/* Action 3: Collect Fee */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">3️⃣ Collect a Fee</h3>
        <p className="text-sm text-gray-600 mb-4">
          Record ETH fees you collected. The amount is stored onchain and contributes to your score.
        </p>
        <form onSubmit={handleCollectFee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fee Amount (ETH)
            </label>
            <input
              type="number"
              step="0.0001"
              value={feeAmount}
              onChange={(e) => setFeeAmount(e.target.value)}
              placeholder="0.05"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              disabled={!stats?.isActive || loading}
            />
          </div>
          <button
            type="submit"
            disabled={!stats?.isActive || loading || !feeAmount}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
          >
            {loading ? 'Processing...' : 'Collect Fee'}
          </button>
          <p className="text-xs text-gray-500">Gas cost: ~40,000 units + ETH transfer</p>
        </form>
      </div>

      {/* Recent Transactions */}
      {recentTxs.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Recent Onchain Activity</h3>
          <div className="space-y-3">
            {recentTxs.map((tx, index) => (
              <div key={index} className={`p-3 rounded-lg flex items-center justify-between ${
                tx.status === 'success' ? 'bg-green-50' :
                tx.status === 'error' ? 'bg-red-50' :
                'bg-blue-50'
              }`}>
                <div>
                  <p className="font-medium text-gray-900">{tx.type}</p>
                  <p className="text-sm text-gray-600">{tx.message}</p>
                  <p className="text-xs text-gray-500">{tx.timestamp.toLocaleTimeString()}</p>
                </div>
                <div className="text-2xl">
                  {tx.status === 'success' ? '✅' :
                   tx.status === 'error' ? '❌' :
                   '⏳'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h4 className="font-semibold text-yellow-900 mb-2">📝 Key Points</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>✅ All actions are recorded permanently on the blockchain</li>
          <li>✅ Can view your transactions on Etherscan (production) or Hardhat (localhost)</li>
          <li>✅ Each action emits an event that the backend can listen to</li>
          <li>✅ Your stats update in real-time as you create activity</li>
          <li>✅ All data is verifiable and tamper-proof</li>
        </ul>
      </div>
    </div>
  )
}
