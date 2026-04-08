import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

function cleanManufacturerName(name: string): string {
  return name
    .replace(/\bbrasseries?\s+(de\s+la\s+|de\s+|du\s+|des\s+|d['']\s*)?/gi, '')
    .replace(/\bbrasseries?\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  if (lines.length < 2) return []

  const headers = parseCSVLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/['"]/g, '').trim()
  )

  return lines.slice(1)
    .filter((line) => line.trim() !== '')
    .map((line) => {
      const values = parseCSVLine(line)
      const row: Record<string, string> = {}
      headers.forEach((h, i) => {
        row[h] = (values[i] ?? '').replace(/^"|"$/g, '').trim()
      })
      return row
    })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Le fichier est vide ou mal formaté' }, { status: 400 })
  }

  if (rows.length > 500) {
    return NextResponse.json({ error: 'Maximum 500 lignes par import' }, { status: 400 })
  }

  const adminSupabase = createAdminClient()
  const manufacturerCache: Record<string, number> = {}

  type RowResult = { row: number; status: 'ok' | 'error'; name: string; message?: string }
  const results: RowResult[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const rowNum = i + 2

    const name = row['name']?.trim()
    const manufacturer = row['manufacturer'] ? cleanManufacturerName(row['manufacturer']) : ''
    const description = row['description']?.trim() || null
    const imageUrl = row['image_url']?.trim() || ''

    if (!name) {
      results.push({ row: rowNum, status: 'error', name: '—', message: 'Colonne "name" manquante ou vide' })
      continue
    }

    if (!manufacturer) {
      results.push({ row: rowNum, status: 'error', name, message: 'Colonne "manufacturer" manquante ou vide' })
      continue
    }

    // Find or create manufacturer (with cache)
    let manufacturerId: number
    const cacheKey = manufacturer.toLowerCase()

    if (manufacturerCache[cacheKey] !== undefined) {
      manufacturerId = manufacturerCache[cacheKey]
    } else {
      const { data: existing } = await adminSupabase
        .from('manufacturers')
        .select('id')
        .ilike('name', manufacturer)
        .maybeSingle()

      if (existing) {
        manufacturerId = existing.id
      } else {
        const { data: created, error: mErr } = await adminSupabase
          .from('manufacturers')
          .insert({ name: manufacturer })
          .select('id')
          .single()

        if (mErr || !created) {
          results.push({ row: rowNum, status: 'error', name, message: `Erreur création brasserie: ${mErr?.message}` })
          continue
        }
        manufacturerId = created.id
      }

      manufacturerCache[cacheKey] = manufacturerId
    }

    const imageUrls = imageUrl ? [imageUrl] : []

    const { error: gErr } = await adminSupabase.from('glasses').insert({
      name,
      description,
      manufacturer_id: manufacturerId,
      image_urls: imageUrls,
      user_id: user.id,
      status: 'approved',
    })

    if (gErr) {
      results.push({ row: rowNum, status: 'error', name, message: gErr.message })
    } else {
      results.push({ row: rowNum, status: 'ok', name })
    }
  }

  revalidatePath('/catalogue')
  revalidatePath('/')

  return NextResponse.json({
    total: rows.length,
    imported: results.filter((r) => r.status === 'ok').length,
    errors: results.filter((r) => r.status === 'error').length,
    results,
  })
}
