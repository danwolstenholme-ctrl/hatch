'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { 
  Zap, 
  Globe, 
  Layers,
  FolderPlus,
  Sparkles,
  Filter
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'build' | 'deploy' | 'section' | 'project_created'
  title: string
  description: string
  timestamp: string
  projectId?: string
  projectName?: string
}

const typeIcons: Record<ActivityItem['type'], React.ReactNode> = {
  build: <Zap className="w-3.5 h-3.5" />,
  deploy: <Globe className="w-3.5 h-3.5" />,
  section: <Layers className="w-3.5 h-3.5" />,
  project_created: <FolderPlus className="w-3.5 h-3.5" />,
}

const typeColors: Record<ActivityItem['type'], string> = {
  build: 'text-blue-400 bg-blue-500/10',
  deploy: 'text-emerald-400 bg-emerald-500/10',
  section: 'text-violet-400 bg-violet-500/10',
  project_created: 'text-amber-400 bg-amber-500/10',
}

type FilterType = 'all' | ActivityItem['type']

export default function DashboardActivityPage() {
  const { isLoaded } = useUser()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  useEffect(() => {
    if (!isLoaded) return
    
    fetch('/api/activity')
      .then(res => res.ok ? res.json() : { activities: [] })
      .then(data => setActivities(data.activities || []))
      .catch(() => setActivities([]))
      .finally(() => setLoading(false))
  }, [isLoaded])

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(a => a.type === filter)

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-xs text-zinc-600">Loading activity...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-medium text-white">Activity</h1>
          <p className="text-xs text-zinc-500 mt-1">Your recent actions and events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-3.5 h-3.5 text-zinc-600" />
        <div className="flex gap-1">
          {(['all', 'build', 'deploy', 'section', 'project_created'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-2 py-1 text-[10px] rounded transition-colors ${
                filter === type
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {type === 'all' ? 'All' : type === 'project_created' ? 'Projects' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className="border border-zinc-800/50 rounded-lg p-8 text-center">
          <Sparkles className="w-6 h-6 text-zinc-700 mx-auto mb-3" />
          <p className="text-sm text-zinc-500">No activity yet</p>
          <p className="text-xs text-zinc-600 mt-1">Start building to see your activity here</p>
        </div>
      ) : (
        <div className="border border-zinc-800/50 rounded-lg overflow-hidden divide-y divide-zinc-800/30">
          {filteredActivities.map((activity) => (
            <div key={activity.id} className="p-3 bg-zinc-900/30 flex items-start gap-3">
              {/* Icon */}
              <div className={`p-1.5 rounded ${typeColors[activity.type]}`}>
                {typeIcons[activity.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-zinc-200">{activity.title}</p>
                  {activity.projectId && (
                    <Link
                      href={`/builder?project=${activity.projectId}`}
                      className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors truncate max-w-[120px]"
                    >
                      {activity.projectName}
                    </Link>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600">{activity.description}</p>
              </div>

              {/* Timestamp */}
              <span className="text-[10px] text-zinc-700 shrink-0">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      <p className="text-[10px] text-zinc-700 text-center">
        Showing last 30 activities
      </p>
    </div>
  )
}
