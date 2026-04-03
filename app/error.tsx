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
    console.error('[GlobalError]', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-gray-100 px-4">
      <h2 className="text-2xl font-bold text-red-400 mb-2">Une erreur est survenue</h2>
      {error.digest && (
        <p className="text-gray-500 text-sm mb-6">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-6 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/20 transition-colors"
      >
        Réessayer
      </button>
    </div>
  )
}
