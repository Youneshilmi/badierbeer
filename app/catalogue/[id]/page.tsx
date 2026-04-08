import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Building2, User, Calendar, ShieldCheck, Crown } from 'lucide-react'
import GlassGallery from '@/components/GlassGallery'

export const dynamic = 'force-dynamic'

export default async function GlassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const glassId = parseInt(id)
  if (isNaN(glassId)) notFound()

  const supabase = await createClient()
  const adminSupabase = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'
  }

  const { data: glass } = await adminSupabase
    .from('glasses')
    .select('*, manufacturers(name), profiles(email, role)')
    .eq('id', glassId)
    .single()

  if (!glass) notFound()
  if (glass.status !== 'approved' && !isAdmin) notFound()

  const contributor = glass.profiles as { email: string | null; role: string } | null
  const addedAt = new Date(glass.created_at).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const roleLabel =
    contributor?.role === 'superadmin'
      ? 'Super Admin'
      : contributor?.role === 'admin'
      ? 'Admin'
      : null

  const RoleIcon =
    contributor?.role === 'superadmin'
      ? Crown
      : contributor?.role === 'admin'
      ? ShieldCheck
      : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Back */}
      <Link
        href="/catalogue"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-[#D4AF37] text-sm mb-8 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Retour au catalogue
      </Link>

      {/* Status badge (admin only) */}
      {isAdmin && glass.status !== 'approved' && (
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border
          border-amber-500/30 bg-amber-500/10 text-amber-400">
          {glass.status === 'pending' ? 'En attente de validation' : 'Rejeté'}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left — Gallery */}
        <GlassGallery images={glass.image_urls ?? []} name={glass.name} />

        {/* Right — Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-3">{glass.name}</h1>

            {glass.manufacturers && (
              <div className="flex items-center gap-2 text-[#D4AF37]">
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="text-base">{glass.manufacturers.name}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {glass.description ? (
            <div>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Description
              </h2>
              <p className="text-gray-300 leading-relaxed">{glass.description}</p>
            </div>
          ) : (
            <p className="text-gray-600 italic text-sm">Aucune description disponible.</p>
          )}

          {/* Divider */}
          <div className="h-px bg-white/5" />

          {/* Meta */}
          <div className="space-y-3">
            {contributor?.email && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Ajouté par</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-gray-300">{contributor.email}</p>
                    {roleLabel && RoleIcon && (
                      <span className="flex items-center gap-1 text-xs text-[#D4AF37]">
                        <RoleIcon className="w-3 h-3" />
                        {roleLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-xs text-gray-600">Date d&apos;ajout</p>
                <p className="text-sm text-gray-300">{addedAt}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
