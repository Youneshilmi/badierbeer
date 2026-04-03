'use client'

import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import GlassCard from './GlassCard'
import type { Glass, Manufacturer } from '@/lib/types'

interface CatalogueClientProps {
  glasses: Glass[]
  manufacturers: Manufacturer[]
}

export default function CatalogueClient({ glasses, manufacturers }: CatalogueClientProps) {
  const [query, setQuery] = useState('')
  const [selectedManufacturer, setSelectedManufacturer] = useState<number | null>(null)

  const filtered = glasses.filter((g) => {
    const matchesQuery =
      !query ||
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      g.manufacturers?.name.toLowerCase().includes(query.toLowerCase()) ||
      g.description?.toLowerCase().includes(query.toLowerCase())
    const matchesManufacturer =
      selectedManufacturer === null || g.manufacturer_id === selectedManufacturer
    return matchesQuery && matchesManufacturer
  })

  const hasFilters = query || selectedManufacturer !== null

  const clearFilters = () => {
    setQuery('')
    setSelectedManufacturer(null)
  }

  return (
    <>
      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un verre, une brasserie…"
            className="input-dark pl-11"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
          <select
            value={selectedManufacturer ?? ''}
            onChange={(e) =>
              setSelectedManufacturer(e.target.value ? parseInt(e.target.value) : null)
            }
            className="pl-10 pr-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors min-w-[200px]"
          >
            <option value="">Toutes les brasseries</option>
            {manufacturers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active filters */}
      {hasFilters && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-gray-500 text-sm">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''}</span>
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-[#D4AF37] hover:text-[#e6c44a] border border-[#D4AF37]/30 rounded-full px-3 py-1 transition-colors"
          >
            <X className="w-3 h-3" />
            Effacer les filtres
          </button>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">Aucun verre trouvé</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-[#D4AF37] text-sm hover:underline">
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((glass) => (
            <GlassCard key={glass.id} glass={glass} />
          ))}
        </div>
      )}
    </>
  )
}
