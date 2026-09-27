import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Brain,
  TestTube,
  Pill,
  CreditCard,
  BarChart3
} from 'lucide-react'
import { useHospitalStore, Role } from '../../pages/store/hospitalStore'
import { hasModuleAccess } from '../../config/permissions'

interface RoleConfig {
  id: Role
  icon: React.ElementType
}

const allRoles: RoleConfig[] = [
  { id: 'admin', icon: ShieldAlert },
  { id: 'reception', icon: UserCheck },
  { id: 'consultation', icon: Stethoscope },
  { id: 'ai-diagnostic', icon: Brain },
  { id: 'laboratory', icon: TestTube },
  { id: 'pharmacy', icon: Pill },
  { id: 'billing', icon: CreditCard },
  { id: 'management', icon: BarChart3 }
]

export const Sidebar: React.FC = () => {
  const { t } = useTranslation('common')
  const { currentRole, currentUser, setRole } = useHospitalStore()

  const userRole = currentUser?.role || currentRole

  const visibleRoles = allRoles.filter((r) => hasModuleAccess(userRole, r.id))

  return (
    <aside className="w-16 bg-medical-dark border-r border-slate-800 flex flex-col items-center py-4 shrink-0 z-40 shadow-lg h-full">
      {/* Top portion - Navigation Roles */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {visibleRoles.map((r) => {
          const Icon = r.icon
          const isActive = currentRole === r.id
          const label = t(`roles.${r.id}`)
          return (
            <div key={r.id} className="relative group flex items-center justify-center w-full">
              <button
                onClick={() => setRole(r.id)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-medical-primary text-white shadow-md shadow-emerald-500/30 font-bold scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </button>

              {/* Hover Floating Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#071325] text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 flex items-center gap-2">
                <span>{label}</span>
                {isActive && <span className="w-2 h-2 rounded-full bg-medical-primary shadow-xs" />}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}

