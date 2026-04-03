import { createClient } from '@/lib/supabase/server'
import CatalogueClient from '@/components/CatalogueClient'

export const revalidate = 60

export default async function CataloguePage() {
  const supabase = createClient()

  const { data: glasses } = await supabase
    .from('glasses')
    .select('*, manufacturers(name)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const { data: manufacturers } = await supabase
    .from('manufacturers')
    .select('id, name')
    .order('name')

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white mb-2">Catalogue</h1>
        <p className="text-gray-500">
          {glasses?.length ?? 0} verre{(glasses?.length ?? 0) !== 1 ? 's' : ''} validé
          {(glasses?.length ?? 0) !== 1 ? 's' : ''} dans la collection
        </p>
      </div>
      <CatalogueClient glasses={glasses ?? []} manufacturers={manufacturers ?? []} />
    </div>
  )
}
