import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ShieldCheck, Crown, User, Beer, Clock, CheckCircle, XCircle } from 'lucide-react'
import GlassCard from '@/components/GlassCard'

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const isSelf = currentUser?.id === id

  let isAdmin = false
  if (currentUser && !isSelf) {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', currentUser.id)
      .single()
    isAdmin = currentProfile?.role === 'admin' || currentProfile?.role === 'superadmin'
  }

  const canSeeAll = isSelf || isAdmin

  let query = supabase
    .from('glasses')
    .select('*, manufacturers(name)')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  if (!canSeeAll) {
    query = query.eq('status', 'approved') as typeof query
  }

  const { data: glasses } = await query

  const allGlasses = glasses ?? []
  const approved = allGlasses.filter((g) => g.status === 'approved')
  const pending = allGlasses.filter((g) => g.status === 'pending')
  const rejected = allGlasses.filter((g) => g.status === 'rejected')

  const roleConfig = {
    superadmin: { label: 'SuperAdmin', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/30' },
    admin: { label: 'Admin', icon: ShieldCheck, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/15 border-[#D4AF37]/30' },
    user: { label: 'Contributeur', icon: User, color: 'text-gray-400', bg: 'bg-white/5 border-white/10' },
  }
  const role = roleConfig[profile.role as keyof typeof roleConfig] ?? roleConfig.user
  const RoleIcon = role.icon

  const initials = profile.email?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="glass-card p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-full bg-[#D4AF37]/10 border-2 border-[#D4AF37]/30 flex items-center justify-center shrink-0">
          <span className="text-3xl font-bold text-[#D4AF37]">{initials}</span>
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-white mb-1">{profile.email}</h1>
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${role.bg} ${role.color}`}>
              <RoleIcon className="w-3.5 h-3.5" />
              {role.label}
            </span>
            {isSelf && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
                Votre profil
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center sm:justify-start gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{allGlasses.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {canSeeAll ? 'Soumission' : 'Contribution'}{allGlasses.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{approved.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Approuvé{approved.length !== 1 ? 's' : ''}</p>
            </div>
            {canSeeAll && (
              <>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-400">{pending.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">En attente</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{rejected.length}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Rejeté{rejected.length !== 1 ? 's' : ''}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Approved collection */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h2 className="text-xl font-semibold text-white">Collection</h2>
          <span className="text-sm text-gray-500">({approved.length} verre{approved.length !== 1 ? 's' : ''})</span>
        </div>
        {approved.length === 0 ? (
          <div className="glass-card py-16 text-center">
            <Beer className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">Aucun verre approuvé pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {approved.map((glass) => (
              <GlassCard key={glass.id} glass={glass} />
            ))}
          </div>
        )}
      </section>

      {/* Pending — self/admin only */}
      {canSeeAll && pending.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">En attente de validation</h2>
            <span className="text-sm text-gray-500">({pending.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 opacity-70">
            {pending.map((glass) => (
              <GlassCard key={glass.id} glass={glass} />
            ))}
          </div>
        </section>
      )}

      {/* Rejected — self/admin only */}
      {canSeeAll && rejected.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-5">
            <XCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-xl font-semibold text-white">Rejetés</h2>
            <span className="text-sm text-gray-500">({rejected.length})</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 opacity-50">
            {rejected.map((glass) => (
              <GlassCard key={glass.id} glass={glass} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
