import { useState } from 'react'
import { Header } from './components/Header'
import { Dashboard } from './components/Dashboard'
import { Leaderboard } from './components/Leaderboard'
import { StacksRankings } from './components/StacksRankings'
import { Web3Provider } from './config/web3'
import { useToast, ToastContainer } from './components/Toast'

type Tab = 'dashboard' | 'rankings'

function App() {
  const { toasts } = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('rankings')

  return (
    <Web3Provider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Header />
        <ToastContainer toasts={toasts} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-md mb-8 max-w-md">
            <button
              onClick={() => setActiveTab('rankings')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'rankings'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🏆 Stacks Rankings
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard
            </button>
          </div>

          {activeTab === 'rankings' ? (
            <StacksRankings />
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Builder Challenge</h2>
                <p className="text-gray-600">
                  Track your activity across WalletKit SDK usage, smart contract metrics, and GitHub contributions
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Dashboard />
                </div>
                
                <div className="lg:col-span-1">
                  <Leaderboard />
                </div>
              </div>

              {/* Info Cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">WalletKit SDK</h3>
                  <p className="text-gray-600 text-sm">Integrate Reown AppKit into your dApps and track wallet connections</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Smart Contracts</h3>
                  <p className="text-gray-600 text-sm">Deploy contracts and track users and fees generated</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">GitHub Activity</h3>
                  <p className="text-gray-600 text-sm">Contribute to public repositories and earn points</p>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </Web3Provider>
  )
}

export default App
