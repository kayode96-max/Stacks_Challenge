interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  requirement: number
  achieved: boolean
  progress?: number
}

interface AchievementBadgeProps {
  achievement: Achievement
}

export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const { title, description, icon, achieved, progress = 0, requirement } = achievement

  return (
    <div className={`relative p-4 rounded-xl border-2 transition-all ${
      achieved 
        ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-md' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`text-4xl ${achieved ? 'grayscale-0' : 'grayscale opacity-50'}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${achieved ? 'text-yellow-900' : 'text-gray-700'}`}>
            {title}
          </h4>
          <p className={`text-sm mt-1 ${achieved ? 'text-yellow-700' : 'text-gray-500'}`}>
            {description}
          </p>
          
          {!achieved && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{progress}/{requirement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((progress / requirement) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {achieved && (
        <div className="absolute top-2 right-2">
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}

interface AchievementsProps {
  stats: {
    totalUsers: number
    totalFees: bigint
    githubContributions?: number
    walletKitUsage?: number
  }
}

export function Achievements({ stats }: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: 'first-user',
      title: 'First Steps',
      description: 'Add your first user',
      icon: '👤',
      requirement: 1,
      achieved: stats.totalUsers >= 1,
      progress: stats.totalUsers
    },
    {
      id: 'ten-users',
      title: 'Community Builder',
      description: 'Reach 10 users',
      icon: '👥',
      requirement: 10,
      achieved: stats.totalUsers >= 10,
      progress: stats.totalUsers
    },
    {
      id: 'hundred-users',
      title: 'Mass Adoption',
      description: 'Achieve 100 users',
      icon: '🚀',
      requirement: 100,
      achieved: stats.totalUsers >= 100,
      progress: stats.totalUsers
    },
    {
      id: 'first-fee',
      title: 'First Transaction',
      description: 'Collect your first fee',
      icon: '💰',
      requirement: 1,
      achieved: stats.totalFees > 0,
      progress: stats.totalFees > 0 ? 1 : 0
    },
    {
      id: 'github-contributor',
      title: 'Code Warrior',
      description: 'Make 50 GitHub contributions',
      icon: '💻',
      requirement: 50,
      achieved: (stats.githubContributions || 0) >= 50,
      progress: stats.githubContributions || 0
    },
    {
      id: 'wallet-master',
      title: 'Wallet Master',
      description: 'Track 25 wallet connections',
      icon: '🔐',
      requirement: 25,
      achieved: (stats.walletKitUsage || 0) >= 25,
      progress: stats.walletKitUsage || 0
    }
  ]

  const achievedCount = achievements.filter(a => a.achieved).length

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          <p className="text-sm text-gray-600 mt-1">
            {achievedCount} of {achievements.length} unlocked
          </p>
        </div>
        <div className="text-4xl">🏆</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map(achievement => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  )
}
