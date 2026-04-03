import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminTabs from '@/components/AdminTabs'
import { ShieldCheck } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') redirect('/')

  const { data: rawPendingGlasses } = await supabase
    .from('glasses')
    .select('*, manufacturers(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // Fetch contributor emails separately (glasses.user_id → auth.users, not profiles directly)
  const userIds = Array.from(new Set((rawPendingGlasses ?? []).map((g) => g.user_id).filter(Boolean)))
  const { data: submitterProfiles } = userIds.length
    ? await supabase.from('profiles').select('id, email').in('id', userIds)
    : { data: [] }

  const emailMap = Object.fromEntries((submitterProfiles ?? []).map((p) => [p.id, p.email]))
  const pendingGlasses = (rawPendingGlasses ?? []).map((g) => ({
    ...g,
    profiles: { email: emailMap[g.user_id] ?? null },
  }))

  const { data: manufacturers } = await supabase
    .from('manufacturers')
    .select('id, name')
    .order('name')

  const { count: totalApproved } = await supabase
    .from('glasses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalRejected } = await supabase
    .from('glasses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  // Fetch all profiles (requires admin RLS policies to be applied in Supabase)
  const { data: profilesList } = await supabase
    .from('profiles')
    .select('id, email, role')
    .order('email')

  // Fetch all glasses separately and group by user_id
  const allUserIds = (profilesList ?? []).map((p) => p.id)
  const { data: allUserGlasses } = allUserIds.length
    ? await supabase.from('glasses').select('id, user_id, status').in('user_id', allUserIds)
    : { data: [] }

  const glassesByUser: Record<string, { id: number; status: string }[]> = {}
  for (const g of allUserGlasses ?? []) {
    if (!glassesByUser[g.user_id]) glassesByUser[g.user_id] = []
    glassesByUser[g.user_id].push({ id: g.id, status: g.status })
  }

  const contributors = (profilesList ?? []).map((p) => ({
    ...p,
    glasses: glassesByUser[p.id] ?? [],
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <ShieldCheck className="text-[#D4AF37] w-7 h-7" />
          <h1 className="text-4xl font-bold text-white">Administration</h1>
        </div>
        <p className="text-gray-500">Tableau de bord de modération</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-amber-400">{pendingGlasses?.length ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">En attente</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-green-400">{totalApproved ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Approuvés</p>
        </div>
        <div className="glass-card p-5 text-center">
          <p className="text-3xl font-bold text-red-400">{totalRejected ?? 0}</p>
          <p className="text-gray-500 text-sm mt-1">Rejetés</p>
        </div>
      </div>

      <AdminTabs
        glasses={pendingGlasses ?? []}
        manufacturers={manufacturers ?? []}
        contributors={contributors}
        currentUserId={user.id}
        currentUserRole={profile?.role ?? 'user'}
      />
    </div>
  )
}
