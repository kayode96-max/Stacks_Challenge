import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract, Eip1193Provider } from 'ethers'
import { useState, useEffect } from 'react'
import BuilderTrackerABI from '../contracts/BuilderTracker.json'
import deploymentInfo from '../contracts/deployment.json'

export interface BuilderStats {
  totalUsers: number
  totalFees: string
  lastUpdateTime: number
  isActive: boolean
}

export function useBuilderTracker() {
  const { address, isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')
  const [contract, setContract] = useState<Contract | null>(null)
  const [stats, setStats] = useState<BuilderStats | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isConnected && walletProvider) {
      const provider = new BrowserProvider(walletProvider as Eip1193Provider)
      provider.getSigner().then(signer => {
        const contractInstance = new Contract(
          deploymentInfo.address,
          BuilderTrackerABI.abi,
          signer
        )
        setContract(contractInstance)
      })
    }
  }, [isConnected, walletProvider])

  const registerBuilder = async () => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.registerBuilder()
      const receipt = await tx.wait()
      await fetchStats()
      return receipt
    } catch (error) {
      console.error('Error registering builder:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const addUser = async (userAddress: string) => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.addUser(userAddress)
      const receipt = await tx.wait()
      await fetchStats()
      return receipt
    } catch (error) {
      console.error('Error adding user:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const collectFee = async (amount: string) => {
    if (!contract) return
    setLoading(true)
    try {
      const tx = await contract.collectFee({ value: amount })
      const receipt = await tx.wait()
      await fetchStats()
      return receipt
    } catch (error) {
      console.error('Error collecting fee:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!contract || !address) return
    setLoading(true)
    try {
      const result = await contract.getBuilderStats(address)
      setStats({
        totalUsers: Number(result[0]),
        totalFees: result[1].toString(),
        lastUpdateTime: Number(result[2]),
        isActive: result[3]
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contract && address) {
      fetchStats()
    }
  }, [contract, address])

  return {
    contract,
    stats,
    loading,
    registerBuilder,
    addUser,
    collectFee,
    fetchStats
  }
}
