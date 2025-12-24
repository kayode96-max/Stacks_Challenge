import { createAppKit } from '@reown/appkit/react'
import { WagmiProvider } from 'wagmi'
import { arbitrum, mainnet, sepolia } from '@reown/appkit/networks'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import type { AppKitNetwork } from '@reown/appkit/networks'

// 1. Get projectId from https://cloud.reown.com
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || 'YOUR_PROJECT_ID'

// 2. Create wagmiConfig
const metadata = {
  name: 'Builder Challenge',
  description: 'Track your Web3 building activity',
  url: 'https://builder-challenge.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const networks: [AppKitNetwork, ...AppKitNetwork[]] = [mainnet, arbitrum, sepolia]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false
})

// 3. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  }
})

// 4. Create query client
export const queryClient = new QueryClient()

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
