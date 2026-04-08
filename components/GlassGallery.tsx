'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react'

interface GlassGalleryProps {
  images: string[]
  name: string
}

export default function GlassGallery({ images, name }: GlassGalleryProps) {
  const [selected, setSelected] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-[#1a1a1a] border border-white/10 flex flex-col items-center justify-center gap-3">
        <ImageOff className="w-12 h-12 text-gray-700" />
        <p className="text-gray-600 text-sm">Aucune photo disponible</p>
      </div>
    )
  }

  const prev = () => setSelected((i) => (i - 1 + images.length) % images.length)
  const next = () => setSelected((i) => (i + 1) % images.length)

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#111] border border-white/10 group">
        <img
          src={images[selected]}
          alt={`${name} — photo ${selected + 1}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === selected ? 'bg-[#D4AF37] w-4' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                i === selected
                  ? 'border-[#D4AF37]'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img src={url} alt={`vignette ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
