import { useAppKit, useAppKitAccount } from '@reown/appkit/react'

export function Header() {
  const { open } = useAppKit()
  const { address, isConnected } = useAppKitAccount()

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">BC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Builder Challenge</h1>
              <p className="text-xs text-gray-500">Track Your Web3 Journey</p>
            </div>
          </div>

          <button
            onClick={() => open()}
            className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
          >
            {isConnected ? `${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Connect Wallet'}
          </button>
        </div>
      </div>
    </header>
  )
}
