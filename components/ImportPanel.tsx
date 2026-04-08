'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, CheckCircle, XCircle, Download, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RowResult {
  row: number
  status: 'ok' | 'error'
  name: string
  message?: string
}

interface ImportResult {
  total: number
  imported: number
  errors: number
  results: RowResult[]
}

const TEMPLATE_CSV = `name,description,manufacturer,image_url
Verre Chimay Bleue,Verre trappiste à pied court,Brasserie de Chimay,https://example.com/chimay.jpg
Verre Duvel,Verre tulipe iconique,Duvel Moortgat,
Verre Leffe Blonde,Verre abbaye classique,AB InBev,`

export default function ImportPanel() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFile = (f: File) => {
    if (!f.name.endsWith('.csv')) {
      setError('Le fichier doit être au format .csv')
      return
    }
    setFile(f)
    setResult(null)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleImport = async () => {
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Erreur inconnue')
      } else {
        setResult(data)
        router.refresh()
      }
    } catch {
      setError('Erreur réseau lors de l\'import')
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE_CSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_badierbeer.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const reset = () => {
    setFile(null)
    setResult(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Importez plusieurs verres en une seule fois via un fichier CSV.{' '}
            <span className="text-[#D4AF37]">Maximum 500 lignes.</span>
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 text-sm text-[#D4AF37] border border-[#D4AF37]/30 rounded-xl hover:bg-[#D4AF37]/10 transition-colors shrink-0 ml-4"
        >
          <Download className="w-4 h-4" />
          Télécharger le modèle
        </button>
      </div>

      {/* CSV format info */}
      <div className="glass-card p-4 text-xs text-gray-400 space-y-1">
        <p className="text-gray-300 font-medium mb-2">Format attendu :</p>
        <code className="block text-[#D4AF37]/80">name, description, manufacturer, image_url</code>
        <p><span className="text-white">name</span> — obligatoire</p>
        <p><span className="text-white">manufacturer</span> — obligatoire (créé automatiquement si inconnu)</p>
        <p><span className="text-white">description</span> — facultatif</p>
        <p><span className="text-white">image_url</span> — facultatif (URL publique vers une image)</p>
      </div>

      {/* Drop zone */}
      {!result && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragging
              ? 'border-[#D4AF37] bg-[#D4AF37]/5'
              : file
              ? 'border-green-500/50 bg-green-500/5'
              : 'border-white/10 hover:border-white/25 hover:bg-white/[0.02]'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />

          {file ? (
            <div className="flex flex-col items-center gap-3">
              <FileText className="w-10 h-10 text-green-400" />
              <div>
                <p className="text-white font-medium">{file.name}</p>
                <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} Ko</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); reset() }}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" /> Retirer
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-10 h-10 text-gray-600" />
              <div>
                <p className="text-gray-300">Glissez votre fichier CSV ici</p>
                <p className="text-gray-600 text-sm mt-1">ou cliquez pour sélectionner</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm">
          <XCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Import button */}
      {file && !result && (
        <button
          onClick={handleImport}
          disabled={loading}
          className="w-full btn-gold py-3 flex items-center justify-center gap-2 text-sm font-medium"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Import en cours…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Lancer l&apos;import
            </>
          )}
        </button>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-white">{result.total}</p>
              <p className="text-gray-500 text-xs mt-1">Lignes lues</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{result.imported}</p>
              <p className="text-gray-500 text-xs mt-1">Importés</p>
            </div>
            <div className="glass-card p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{result.errors}</p>
              <p className="text-gray-500 text-xs mt-1">Erreurs</p>
            </div>
          </div>

          {/* Row details */}
          <div className="glass-card overflow-hidden">
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {result.results.map((r) => (
                <div key={r.row} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  {r.status === 'ok' ? (
                    <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span className="text-gray-500 text-xs w-12 shrink-0">Ligne {r.row}</span>
                  <span className={`flex-1 truncate ${r.status === 'ok' ? 'text-white' : 'text-gray-400'}`}>
                    {r.name}
                  </span>
                  {r.message && (
                    <span className="text-red-400/70 text-xs truncate max-w-[200px]">{r.message}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={reset}
            className="w-full py-2.5 text-sm text-gray-400 border border-white/10 rounded-xl hover:text-white hover:border-white/25 transition-colors"
          >
            Nouvel import
          </button>
        </div>
      )}
    </div>
  )
}
