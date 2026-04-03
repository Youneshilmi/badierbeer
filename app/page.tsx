import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Beer, ChevronRight, Star, Users, Shield } from 'lucide-react'

export default async function HomePage() {
  const supabase = createClient()

  const { count: approvedCount } = await supabase
    .from('glasses')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: manufacturerCount } = await supabase
    .from('manufacturers')
    .select('*', { count: 'exact', head: true })

  const { data: latestGlasses } = await supabase
    .from('glasses')
    .select('id, name, image_urls, manufacturers(name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(3)

  return (
    <div className="relative">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[92vh] text-center px-4 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#D4AF37]/5 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-900/10 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/5 text-[#D4AF37] text-sm font-medium mb-6">
            <Beer className="w-4 h-4" />
            <span>Collection de verres belges</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="bg-gradient-to-b from-white via-gray-200 to-gray-500 bg-clip-text text-transparent">
              L&apos;Art du Verre
            </span>
            <br />
            <span className="text-[#D4AF37]">de Bière</span>
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Découvrez et partagez les verres iconiques des grandes brasseries belges.
            Une collection curatée par des passionnés pour les passionnés.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/catalogue"
              className="btn-gold inline-flex items-center gap-2 text-base px-8 py-4"
            >
              Explorer la collection
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link
              href="/add-glass"
              className="btn-outline-gold inline-flex items-center gap-2 text-base px-8 py-4"
            >
              Contribuer
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#D4AF37]/10 bg-white/[0.02] py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-[#D4AF37]">{approvedCount ?? 0}</p>
            <p className="text-gray-500 text-sm mt-1">Verres dans la collection</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-[#D4AF37]">{manufacturerCount ?? 0}</p>
            <p className="text-gray-500 text-sm mt-1">Brasseries référencées</p>
          </div>
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center justify-center gap-1 text-4xl font-bold text-[#D4AF37]">
              <Star className="w-8 h-8 fill-[#D4AF37]" />
              100%
            </div>
            <p className="text-gray-500 text-sm mt-1">Verres validés par experts</p>
          </div>
        </div>
      </section>

      {/* Latest glasses preview */}
      {latestGlasses && latestGlasses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white">Derniers ajouts</h2>
              <p className="text-gray-500 mt-1">Les verres récemment validés</p>
            </div>
            <Link
              href="/catalogue"
              className="text-[#D4AF37] text-sm hover:underline flex items-center gap-1"
            >
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {latestGlasses.map((glass) => (
              <div
                key={glass.id}
                className="glass-card overflow-hidden group hover:shadow-[0_0_40px_rgba(212,175,55,0.1)] transition-all duration-300"
              >
                <div className="aspect-square bg-white/5 relative overflow-hidden">
                  {glass.image_urls?.[0] ? (
                    <img
                      src={glass.image_urls[0]}
                      alt={glass.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🍺
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white">{glass.name}</h3>
                  {(glass.manufacturers as { name: string } | null)?.name && (
                    <p className="text-[#D4AF37] text-sm mt-0.5">
                      {(glass.manufacturers as { name: string }).name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent pointer-events-none" />
          <div className="relative">
            <Shield className="w-12 h-12 text-[#D4AF37] mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-3">
              Rejoignez la communauté
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Soumettez vos verres de bière pour les faire valider et intégrer la collection officielle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/add-glass" className="btn-gold inline-flex items-center gap-2">
                <Users className="w-4 h-4" />
                Soumettre un verre
              </Link>
              <Link href="/catalogue" className="btn-outline-gold">
                Parcourir la collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
