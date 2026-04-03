'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Beer, LogOut, User, Menu, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { useState } from 'react'

interface NavbarProps {
  user: SupabaseUser | null
  userRole: 'superadmin' | 'admin' | 'user' | null
}

export default function Navbar({ user, userRole }: NavbarProps) {
  const isAdmin = userRole === 'admin' || userRole === 'superadmin'
  const isSuperAdmin = userRole === 'superadmin'
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Accueil' },
    { href: '/catalogue', label: 'Catalogue' },
    ...(user ? [{ href: '/add-glass', label: 'Ajouter' }] : []),
    ...(user ? [{ href: `/profil/${user.id}`, label: 'Mon profil' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  return (
    <nav className="sticky top-0 z-50 border-b border-[#D4AF37]/15 bg-[#0f0f0f]/85 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Beer className="text-[#D4AF37] w-6 h-6" />
            <span className="font-bold text-lg text-[#D4AF37] tracking-wide">BadierBeer</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#D4AF37] ${
                  pathname === link.href ? 'text-[#D4AF37]' : 'text-gray-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <span className="text-xs text-gray-600 max-w-[160px] truncate">{user.email}</span>
                {isSuperAdmin && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/30">
                    SuperAdmin
                  </span>
                )}
                {isAdmin && !isSuperAdmin && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
                    Admin
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                <User className="w-4 h-4" />
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-[#D4AF37] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#D4AF37]/10 bg-[#0f0f0f] px-4 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium py-2 transition-colors hover:text-[#D4AF37] ${
                pathname === link.href ? 'text-[#D4AF37]' : 'text-gray-400'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-white/5 pt-3">
            {user ? (
              <button
                onClick={() => { handleSignOut(); setMenuOpen(false) }}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#D4AF37] transition-colors"
              >
                <User className="w-4 h-4" />
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
