import { useState, useEffect } from 'react'

export interface LeaderboardEntry {
  address: string
  users: number
  fees: string
  githubContributions: number
  totalScore: number
  walletKitUsage: number
}

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/leaderboard')
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard')
      }
      const data = await response.json()
      setLeaderboard(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Error fetching leaderboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
    // Refresh every 60 seconds
    const interval = setInterval(fetchLeaderboard, 60000)
    return () => clearInterval(interval)
  }, [])

  return { leaderboard, loading, error, refetch: fetchLeaderboard }
}
