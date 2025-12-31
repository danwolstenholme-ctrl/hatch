'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Box, ArrowRight, Trash2, ExternalLink, Calendar, Clock } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { formatDistanceToNow } from 'date-fns'

export default function ProjectsPage() {
  const { projects, createProject, deleteProject, switchProject } = useProjects()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = () => {
    setIsCreating(true)
    const success = createProject()
    if (!success) {
      // Handle paywall or error
      setIsCreating(false)
    }
    // createProject redirects automatically if successful
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      // We need to switch to the project to delete it in the current hook implementation
      // This is a limitation of the hook, but for now we can just warn the user
      // Ideally we'd have a deleteProjectById method
      alert('Please open the project to delete it from the settings menu.')
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-zinc-400">Manage your digital entities.</p>
        </div>
        <button
          onClick={handleCreate}
          disabled={isCreating}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
          <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
            <Box className="w-8 h-8 text-zinc-600" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
          <p className="text-zinc-400 mb-6 max-w-md text-center">
            Initialize your first digital entity to begin building.
          </p>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Initialize Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/builder?project=${project.id}`}
              className="group relative block p-6 bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 rounded-xl transition-all hover:bg-zinc-900 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Box className="w-5 h-5 text-emerald-500" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${
                    project.status === 'published' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}>
                    {project.status || 'draft'}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                {project.name || 'Untitled Project'}
              </h3>
              <p className="text-sm text-zinc-400 mb-6 line-clamp-2">
                {project.description || 'No description provided.'}
              </p>

              <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {project.updatedAt 
                      ? formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })
                      : 'Just now'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500/0 group-hover:text-emerald-500 transition-colors transform translate-x-2 group-hover:translate-x-0">
                  <span className="font-medium">Open Builder</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
