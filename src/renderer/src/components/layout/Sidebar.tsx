import React from 'react'
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Activity,
  TestTube,
  Pill,
  CreditCard,
  BarChart3
} from 'lucide-react'
import { useHospitalStore, Role } from '../../pages/store/hospitalStore'
import { hasModuleAccess } from '../../config/permissions'

interface RoleConfig {
  id: Role
  label: string
  icon: React.ElementType
}

const allRoles: RoleConfig[] = [
  { id: 'admin', label: 'Admin Système', icon: ShieldAlert },
  { id: 'reception', label: 'Accueil & Triage', icon: UserCheck },
  { id: 'nursing', label: 'Soins & Constantes', icon: Activity },
  { id: 'consultation', label: 'Médecin / Clinique', icon: Stethoscope },
  { id: 'laboratory', label: 'Laboratoire', icon: TestTube },
  { id: 'pharmacy', label: 'Pharmacie', icon: Pill },
  { id: 'billing', label: 'Caisse & Factures', icon: CreditCard },
  { id: 'management', label: 'Direction & Rapports', icon: BarChart3 }
]

export const Sidebar: React.FC = () => {
  const { currentRole, currentUser, setRole } = useHospitalStore()

  const userRole = currentUser?.role || currentRole

  const visibleRoles = allRoles.filter((r) => hasModuleAccess(userRole, r.id))

  return (
    <aside className="w-16 bg-medical-dark border-r border-slate-800 flex flex-col items-center py-4 space-y-3 shrink-0 z-40 shadow-lg">
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {visibleRoles.map((r) => {
          const Icon = r.icon
          const isActive = currentRole === r.id
          return (
            <div key={r.id} className="relative group flex items-center justify-center w-full">
              <button
                onClick={() => setRole(r.id)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${isActive
                    ? 'bg-medical-primary text-white shadow-md shadow-emerald-500/30 font-bold scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`}
                aria-label={r.label}
              >
                <Icon className="w-5 h-5" />
              </button>

              {/* Hover Floating Tooltip */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#071325] text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 flex items-center gap-2">
                <span>{r.label}</span>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-medical-primary shadow-xs" />
                )}
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
