'use client'

import { useState } from 'react'
import { ClipboardList, Users, Upload } from 'lucide-react'
import AdminPanel from '@/components/AdminPanel'
import ContributorsPanel from '@/components/ContributorsPanel'
import ImportPanel from '@/components/ImportPanel'
import type { Glass, Manufacturer } from '@/lib/types'

interface ContributorGlass {
  id: number
  status: string
}

interface Contributor {
  id: string
  email: string | null
  role: string
  glasses: ContributorGlass[]
}

interface AdminTabsProps {
  glasses: Glass[]
  manufacturers: Manufacturer[]
  contributors: Contributor[]
  currentUserId: string
  currentUserRole: string
}

const tabs = [
  { id: 'moderation', label: 'Modération', icon: ClipboardList },
  { id: 'contributors', label: 'Contributeurs', icon: Users },
  { id: 'import', label: 'Import CSV', icon: Upload },
]

export default function AdminTabs({
  glasses,
  manufacturers,
  contributors,
  currentUserId,
  currentUserRole,
}: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<'moderation' | 'contributors' | 'import'>('moderation')

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 mb-8 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'moderation' | 'contributors' | 'import')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/25'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'moderation' && glasses.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/25">
                  {glasses.length}
                </span>
              )}
              {tab.id === 'contributors' && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-white/10 text-gray-400">
                  {contributors.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Panels */}
      {activeTab === 'moderation' && (
        <AdminPanel glasses={glasses} manufacturers={manufacturers} />
      )}
      {activeTab === 'contributors' && (
        <ContributorsPanel contributors={contributors} currentUserId={currentUserId} currentUserRole={currentUserRole} />
      )}
      {activeTab === 'import' && (
        <ImportPanel />
      )}
    </div>
  )
}
