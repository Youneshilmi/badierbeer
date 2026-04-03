'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Camera } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { submitGlass } from '@/app/actions'
import type { Manufacturer } from '@/lib/types'

interface AddGlassFormProps {
  manufacturers: Manufacturer[]
  isAdmin: boolean
}

export default function AddGlassForm({ manufacturers, isAdmin }: AddGlassFormProps) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [manufacturerId, setManufacturerId] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submittedStatus, setSubmittedStatus] = useState<'approved' | 'pending' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? [])
    const oversized = selected.filter((f) => f.size > 5 * 1024 * 1024)

    if (oversized.length > 0) {
      setError(`${oversized.length} fichier(s) dépassent la limite de 5 Mo.`)
      return
    }
    setError(null)

    const newFiles = [...files, ...selected].slice(0, 5)
    setFiles(newFiles)

    newFiles.forEach((f, i) => {
      if (previews[i]) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        setPreviews((prev) => {
          const next = [...prev]
          next[i] = ev.target!.result as string
          return next
        })
      }
      reader.readAsDataURL(f)
    })
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const imageUrls: string[] = []

      for (const file of files) {
        const ext = file.name.split('.').pop() ?? 'jpg'
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('glass-photos')
          .upload(path, file, { cacheControl: '3600', upsert: false })

        if (uploadError) throw new Error(`Upload échoué: ${uploadError.message}`)

        const {
          data: { publicUrl },
        } = supabase.storage.from('glass-photos').getPublicUrl(path)

        imageUrls.push(publicUrl)
      }

      const result = await submitGlass({
        name: name.trim(),
        description: description.trim(),
        manufacturer_id: parseInt(manufacturerId),
        image_urls: imageUrls,
      })

      setSubmittedStatus(result.status as 'approved' | 'pending')
      setSuccess(true)

      setTimeout(() => {
        router.push(result.status === 'approved' ? '/catalogue' : '/')
      }, 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="glass-card p-12 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          {submittedStatus === 'approved' ? 'Verre publié !' : 'Soumission envoyée !'}
        </h2>
        <p className="text-gray-400">
          {submittedStatus === 'approved'
            ? 'Votre verre est maintenant visible dans le catalogue.'
            : 'Votre verre sera examiné et publié après validation.'}
        </p>
        <p className="text-gray-600 text-sm mt-4">Redirection en cours…</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6">
      {/* Admin badge */}
      {isAdmin && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-sm">
          <span className="font-medium">Mode admin</span>
          <span className="text-gray-500">– publication immédiate</span>
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Nom du verre <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Ex: Verre Duvel Original 33cl"
          className="input-dark"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Décrivez ce verre, son histoire, ses spécificités…"
          className="input-dark resize-none"
        />
      </div>

      {/* Manufacturer */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Brasserie <span className="text-red-400">*</span>
        </label>
        <select
          value={manufacturerId}
          onChange={(e) => setManufacturerId(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
        >
          <option value="">Sélectionner une brasserie…</option>
          {manufacturers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Image upload */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Photos{' '}
          <span className="text-gray-500 font-normal">
            (max 5, 5 Mo chacune – {files.length}/5)
          </span>
        </label>

        {files.length < 5 && (
          <div className="grid grid-cols-2 gap-3">
            {/* Import from gallery */}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#D4AF37]/25 rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-colors bg-white/[0.02] hover:bg-white/5">
              <Upload className="w-6 h-6 text-[#D4AF37]/40 mb-2" />
              <span className="text-sm text-gray-500">Galerie</span>
              <span className="text-xs text-gray-700 mt-0.5">Importer une photo</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {/* Direct camera capture */}
            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-[#D4AF37]/25 rounded-xl cursor-pointer hover:border-[#D4AF37]/50 transition-colors bg-white/[0.02] hover:bg-white/5">
              <Camera className="w-6 h-6 text-[#D4AF37]/40 mb-2" />
              <span className="text-sm text-gray-500">Appareil photo</span>
              <span className="text-xs text-gray-700 mt-0.5">Prendre une photo</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        )}

        {previews.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mt-3">
            {previews.map((src, i) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden border border-white/10 bg-white/5"
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm rounded-full p-0.5 hover:bg-red-500/80 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !name.trim() || !manufacturerId}
        className="btn-gold w-full py-4 flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Envoi en cours…
          </>
        ) : isAdmin ? (
          'Publier le verre'
        ) : (
          'Soumettre pour validation'
        )}
      </button>
    </form>
  )
}
