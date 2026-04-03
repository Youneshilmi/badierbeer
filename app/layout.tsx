import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BadierBeer – La collection de verres de bière belge',
  description: 'Découvrez et partagez les plus beaux verres des grandes brasseries belges.',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  let userRole: 'superadmin' | 'admin' | 'user' | null = null

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      userRole = profile?.role ?? 'user'
    }
  } catch {
    // Auth unavailable — render unauthenticated
  }

  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.className} bg-[#0f0f0f] text-gray-100 min-h-screen antialiased`}
      >
        <Navbar user={user} userRole={userRole} />
        <main>{children}</main>
      </body>
    </html>
  )
}
