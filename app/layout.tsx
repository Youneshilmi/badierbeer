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
    console.log('[Layout] step 1: createClient')
    const supabase = await createClient()
    console.log('[Layout] step 2: getUser')
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
    if (authError) console.error('[Layout] getUser error:', authError.message)
    user = authUser
    console.log('[Layout] step 3: user =', user ? 'authenticated' : 'null')

    if (user) {
      console.log('[Layout] step 4: fetch profile')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      if (profileError) console.error('[Layout] profile error:', profileError.message)
      userRole = profile?.role ?? 'user'
      console.log('[Layout] step 5: userRole =', userRole)
    }
  } catch (err) {
    console.error('[Layout] CAUGHT EXCEPTION:', err)
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
