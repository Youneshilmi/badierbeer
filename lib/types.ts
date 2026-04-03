export type Role = 'superadmin' | 'admin' | 'user'
export type GlassStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  email: string
  role: Role
}

export interface Manufacturer {
  id: number
  name: string
}

export interface Glass {
  id: number
  created_at: string
  name: string
  description: string
  image_urls: string[]
  manufacturer_id: number
  user_id: string
  status: GlassStatus
  manufacturers?: Manufacturer
  profiles?: { email: string | null }
}
