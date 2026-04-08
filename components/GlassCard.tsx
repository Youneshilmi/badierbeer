import Link from 'next/link'
import { Building2 } from 'lucide-react'
import type { Glass } from '@/lib/types'

interface GlassCardProps {
  glass: Glass
}

export default function GlassCard({ glass }: GlassCardProps) {
  const mainImage = glass.image_urls?.[0]
  const extraCount = (glass.image_urls?.length ?? 0) - 1

  return (
    <Link href={`/catalogue/${glass.id}`} className="group relative rounded-2xl border border-[#D4AF37]/20 bg-white/5 backdrop-blur-sm overflow-hidden hover:border-[#D4AF37]/50 hover:shadow-[0_0_30px_rgba(212,175,55,0.12)] transition-all duration-300 block">
      {/* Image */}
      <div className="aspect-square relative bg-[#111] overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={glass.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl opacity-60">🍺</span>
          </div>
        )}
        {extraCount > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/60 text-gray-300 text-xs px-2 py-0.5 rounded-full">
            +{extraCount} photo{extraCount > 1 ? 's' : ''}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-white text-base leading-tight mb-1.5 line-clamp-1">
          {glass.name}
        </h3>
        {glass.manufacturers && (
          <div className="flex items-center gap-1.5 text-[#D4AF37] text-sm mb-2">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{glass.manufacturers.name}</span>
          </div>
        )}
        {glass.description && (
          <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{glass.description}</p>
        )}
      </div>

      {/* Bottom gold line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </Link>
  )
}
