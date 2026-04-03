'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, User, Loader2, Beer, ShieldOff, Crown, ExternalLink } from 'lucide-react'
import { promoteToAdmin, demoteFromAdmin } from '@/app/actions'

interface ContributorGlass {
  id: number
  status: string
}

interface Contributor {
  id: string
  email: string | null
  role: string
  glasses: ContributorGlass[]
}

interface ContributorsPanelProps {
  contributors: Contributor[]
  currentUserId: string
  currentUserRole: string
}

export default function ContributorsPanel({ contributors, currentUserId, currentUserRole }: ContributorsPanelProps) {
  const [items, setItems] = useState(contributors)
  const [actioning, setActioning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isSuperAdmin = currentUserRole === 'superadmin'

  const handlePromote = async (userId: string) => {
    setActioning(userId)
    setError(null)
    try {
      await promoteToAdmin(userId)
      setItems((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, role: 'admin' } : c))
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setActioning(null)
    }
  }

  const handleDemote = async (userId: string) => {
    setActioning(userId)
    setError(null)
    try {
      await demoteFromAdmin(userId)
      setItems((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, role: 'user' } : c))
      )
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setActioning(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 glass-card">
        <div className="text-6xl mb-4">👥</div>
        <h3 className="text-xl font-semibold text-white mb-2">Aucun contributeur</h3>
        <p className="text-gray-500">Aucun utilisateur inscrit pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">
        {items.length} utilisateur{items.length !== 1 ? 's' : ''} inscrits
      </p>

      {items.map((contributor) => {
        const totalGlasses = contributor.glasses.length
        const approved = contributor.glasses.filter((g) => g.status === 'approved').length
        const pending = contributor.glasses.filter((g) => g.status === 'pending').length
        const isContributorSuperAdmin = contributor.role === 'superadmin'
        const isContributorAdmin = contributor.role === 'admin'
        const isActioning = actioning === contributor.id
        const isSelf = contributor.id === currentUserId

        return (
          <div
            key={contributor.id}
            className="glass-card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {/* Avatar + email */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {isContributorSuperAdmin ? (
                  <Crown className="w-5 h-5 text-purple-400" />
                ) : isContributorAdmin ? (
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                ) : (
                  <User className="w-5 h-5 text-gray-500" />
                )}
              </div>
              <div className="min-w-0">
                <Link
                  href={`/profil/${contributor.id}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-[#D4AF37] transition-colors truncate group/link"
                >
                  <span className="truncate">{contributor.email ?? 'Email inconnu'}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                  {isSelf && (
                    <span className="ml-1 text-xs text-[#D4AF37]">(vous)</span>
                  )}
                </Link>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isContributorSuperAdmin
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                        : isContributorAdmin
                        ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25'
                        : 'bg-white/5 text-gray-500 border border-white/10'
                    }`}
                  >
                    {isContributorSuperAdmin ? 'SuperAdmin' : isContributorAdmin ? 'Admin' : 'Utilisateur'}
                  </span>
                </div>
              </div>
            </div>

            {/* Contribution stats */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Beer className="w-4 h-4" />
                <span className="text-white font-medium">{totalGlasses}</span>
                <span>soumission{totalGlasses !== 1 ? 's' : ''}</span>
              </div>
              {totalGlasses > 0 && (
                <div className="flex gap-2 text-xs">
                  {approved > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      {approved} approuvé{approved !== 1 ? 's' : ''}
                    </span>
                  )}
                  {pending > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {pending} en attente
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0">
              {/* Promote: visible for admin+superadmin on plain users */}
              {!isContributorAdmin && !isContributorSuperAdmin && !isSelf && (
                <button
                  onClick={() => handlePromote(contributor.id)}
                  disabled={!!actioning}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl hover:bg-[#D4AF37]/20 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {isActioning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                  Promouvoir admin
                </button>
              )}
              {/* Demote: visible for superadmin only on admins */}
              {isSuperAdmin && isContributorAdmin && !isSelf && (
                <button
                  onClick={() => handleDemote(contributor.id)}
                  disabled={!!actioning}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {isActioning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShieldOff className="w-4 h-4" />
                  )}
                  Retirer admin
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
