'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[GlobalError] message:', error.message)
    console.error('[GlobalError] digest:', error.digest)
    console.error('[GlobalError] stack:', error.stack)
  }, [error])

  return (
    <html lang="fr">
      <body style={{ background: '#0f0f0f', color: '#f3f4f6', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0 }}>
        <h2 style={{ color: '#f87171', marginBottom: '0.5rem' }}>Une erreur est survenue</h2>
        {error.digest && (
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Digest: {error.digest}</p>
        )}
        <button
          onClick={reset}
          style={{ padding: '0.5rem 1.5rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '0.75rem', cursor: 'pointer' }}
        >
          Réessayer
        </button>
      </body>
    </html>
  )
}
