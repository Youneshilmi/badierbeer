import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginButtons from '@/components/LoginButtons'
import { Beer } from 'lucide-react'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) redirect('/')

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#D4AF37]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="glass-card p-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <Beer className="text-[#D4AF37] w-8 h-8" />
              <span className="text-2xl font-bold text-[#D4AF37]">BadierBeer</span>
            </Link>
            <h1 className="text-2xl font-bold text-white">Connexion</h1>
            <p className="text-gray-500 text-sm mt-2">
              Rejoignez la communauté pour contribuer à la collection
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              Erreur d&apos;authentification. Veuillez réessayer.
            </div>
          )}

          <LoginButtons />

          <p className="text-center text-gray-600 text-xs mt-6">
            En vous connectant, vous acceptez de contribuer de manière respectueuse à la collection.
          </p>
        </div>
      </div>
    </div>
  )
}
