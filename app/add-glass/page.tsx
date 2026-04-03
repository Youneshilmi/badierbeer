import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AddGlassForm from '@/components/AddGlassForm'
import { PlusCircle } from 'lucide-react'

export default async function AddGlassPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: manufacturers } = await supabase
    .from('manufacturers')
    .select('id, name')
    .order('name')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <PlusCircle className="text-[#D4AF37] w-7 h-7" />
          <h1 className="text-4xl font-bold text-white">Ajouter un verre</h1>
        </div>
        <p className="text-gray-500">
          {isAdmin
            ? 'En tant qu\'admin, votre verre sera directement publié.'
            : 'Votre soumission sera examinée avant publication.'}
        </p>
      </div>
      <AddGlassForm manufacturers={manufacturers ?? []} isAdmin={isAdmin} />
    </div>
  )
}
