'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitGlass(data: {
  name: string
  description: string
  manufacturer_id: number
  image_urls: string[]
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const status = (profile?.role === 'admin' || profile?.role === 'superadmin') ? 'approved' : 'pending'

  const { error } = await supabase.from('glasses').insert({
    name: data.name,
    description: data.description,
    manufacturer_id: data.manufacturer_id,
    image_urls: data.image_urls,
    user_id: user.id,
    status,
  })

  if (error) throw new Error(error.message)

  revalidatePath('/catalogue')
  revalidatePath('/admin')

  return { status }
}

export async function updateGlassStatus(id: number, status: 'approved' | 'rejected') {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') throw new Error('Accès refusé')

  const { error } = await supabase
    .from('glasses')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/catalogue')
  revalidatePath('/')
}

export async function updateGlass(
  id: number,
  updates: {
    name?: string
    description?: string
    manufacturer_id?: number
  }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') throw new Error('Accès refusé')

  const { error } = await supabase.from('glasses').update(updates).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
  revalidatePath('/catalogue')
}

export async function promoteToAdmin(userId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'superadmin') throw new Error('Accès refusé')
  if (userId === user.id) throw new Error('Vous ne pouvez pas modifier votre propre rôle')

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}

export async function demoteFromAdmin(userId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Non authentifié')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'superadmin') throw new Error('Seul le SuperAdmin peut retirer le rôle admin')
  if (userId === user.id) throw new Error('Vous ne pouvez pas modifier votre propre rôle')

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', userId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin')
}
