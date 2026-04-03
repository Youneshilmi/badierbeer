'use client'

import { useState } from 'react'
import { Check, X, Loader2, Building2, Calendar, Pencil, ChevronDown, ChevronUp, Mail } from 'lucide-react'
import { updateGlassStatus, updateGlass } from '@/app/actions'
import type { Glass, Manufacturer } from '@/lib/types'
import { useRouter } from 'next/navigation'

interface AdminPanelProps {
  glasses: Glass[]
  manufacturers: Manufacturer[]
}

export default function AdminPanel({ glasses, manufacturers }: AdminPanelProps) {
  const [items, setItems] = useState(glasses)
  const [processing, setProcessing] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editManufacturerId, setEditManufacturerId] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const router = useRouter()

  const openEdit = (glass: Glass) => {
    setEditingId(glass.id)
    setEditName(glass.name)
    setEditDescription(glass.description ?? '')
    setEditManufacturerId(String(glass.manufacturer_id))
  }

  const closeEdit = () => setEditingId(null)

  const handleSaveEdit = async (id: number) => {
    setSavingEdit(true)
    try {
      await updateGlass(id, {
        name: editName.trim(),
        description: editDescription.trim(),
        manufacturer_id: parseInt(editManufacturerId),
      })
      setItems((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                name: editName.trim(),
                description: editDescription.trim(),
                manufacturer_id: parseInt(editManufacturerId),
                manufacturers: manufacturers.find((m) => m.id === parseInt(editManufacturerId)),
              }
            : g
        )
      )
      closeEdit()
    } catch (err) {
      console.error(err)
    } finally {
      setSavingEdit(false)
    }
  }

  const handleStatus = async (id: number, status: 'approved' | 'rejected') => {
    setProcessing(id)
    try {
      await updateGlassStatus(id, status)
      setItems((prev) => prev.filter((g) => g.id !== id))
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setProcessing(null)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-24 glass-card">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-semibold text-white mb-2">File d&apos;attente vide</h3>
        <p className="text-gray-500">Aucun verre en attente de validation.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-6">
        {items.length} verre{items.length !== 1 ? 's' : ''} en attente — cliquez sur{' '}
        <span className="text-[#D4AF37]">Éditer</span> pour modifier avant d&apos;approuver.
      </p>

      {items.map((glass) => {
        const isEditing = editingId === glass.id
        const isProcessing = processing === glass.id

        return (
          <div
            key={glass.id}
            className="glass-card overflow-hidden transition-all duration-200"
          >
            {/* Main row */}
            <div className="p-6 flex flex-col md:flex-row gap-6">
              {/* Thumbnails */}
              <div className="flex gap-2 shrink-0">
                {glass.image_urls?.slice(0, 3).map((url, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-xl overflow-hidden bg-white/5 relative border border-white/10"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
                {(!glass.image_urls || glass.image_urls.length === 0) && (
                  <div className="w-20 h-20 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl">
                    🍺
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{glass.name}</h3>
                {glass.manufacturers && (
                  <div className="flex items-center gap-1.5 text-[#D4AF37] text-sm mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    {glass.manufacturers.name}
                  </div>
                )}
                {glass.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{glass.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-gray-700 text-xs">
                    <Calendar className="w-3 h-3" />
                    {new Date(glass.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                  {glass.profiles?.email && (
                    <div className="flex items-center gap-1 text-xs text-blue-400/70">
                      <Mail className="w-3 h-3" />
                      {glass.profiles.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col gap-2 items-start md:items-end shrink-0">
                <button
                  onClick={() => handleStatus(glass.id, 'approved')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-green-500/15 text-green-400 border border-green-500/25 rounded-xl hover:bg-green-500/25 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approuver
                </button>
                <button
                  onClick={() => handleStatus(glass.id, 'rejected')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2 bg-red-500/15 text-red-400 border border-red-500/25 rounded-xl hover:bg-red-500/25 transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Rejeter
                </button>
                <button
                  onClick={() => (isEditing ? closeEdit() : openEdit(glass))}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl hover:bg-[#D4AF37]/20 transition-colors text-sm font-medium"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Éditer
                  {isEditing ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Inline edit panel */}
            {isEditing && (
              <div className="border-t border-[#D4AF37]/10 bg-white/[0.02] p-6 space-y-4">
                <h4 className="text-sm font-medium text-[#D4AF37] mb-4">Modifier les informations</h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Nom du verre</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-dark text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Brasserie</label>
                    <select
                      value={editManufacturerId}
                      onChange={(e) => setEditManufacturerId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                    >
                      {manufacturers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Description</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={3}
                    className="input-dark text-sm resize-none"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    onClick={closeEdit}
                    className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/10 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={() => handleSaveEdit(glass.id)}
                    disabled={savingEdit || !editName.trim()}
                    className="btn-gold px-5 py-2 text-sm flex items-center gap-2"
                  >
                    {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
