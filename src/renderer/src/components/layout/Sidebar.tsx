import React from 'react'
import {
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Activity,
  TestTube,
  Pill,
  CreditCard,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react'
import { useHospitalStore, Role } from '../../pages/store/hospitalStore'
import { hasModuleAccess, ROLE_CONFIGS } from '../../config/permissions'

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
  const { currentRole, currentUser, setRole, setShowSettingsModal, logout } = useHospitalStore()

  const userRole = currentUser?.role || currentRole

  const visibleRoles = allRoles.filter((r) => hasModuleAccess(userRole, r.id))

  const getUserInitials = (name?: string) => {
    if (!name) return 'US'
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <aside className="w-16 bg-medical-dark border-r border-slate-800 flex flex-col justify-between items-center py-4 shrink-0 z-40 shadow-lg h-full">
      {/* Top portion - Navigation Roles */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {visibleRoles.map((r) => {
          const Icon = r.icon
          const isActive = currentRole === r.id
          return (
            <div key={r.id} className="relative group flex items-center justify-center w-full">
              <button
                onClick={() => setRole(r.id)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${isActive
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

      {/* Bottom portion - Settings, User & Logout */}
      <div className="flex flex-col items-center gap-4 w-full px-2 border-t border-slate-800 pt-4">
        {/* User initials / Profile */}
        {currentUser && (
          <div className="relative group flex items-center justify-center w-full">
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-10 h-10 rounded-xl bg-slate-800/85 hover:bg-slate-700/85 border border-slate-700/80 text-emerald-400 hover:text-emerald-300 font-bold flex items-center justify-center text-xs transition-all cursor-pointer"
            >
              {getUserInitials(currentUser.name)}
            </button>
            
            {/* User Profile Tooltip */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-[#071325] text-white rounded-xl shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-left">
              <p className="text-xs font-bold text-white">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-400 font-medium">
                {ROLE_CONFIGS[currentUser.role]?.label || currentUser.role}
              </p>
            </div>
          </div>
        )}

        {/* Settings button */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
            aria-label="Paramètres"
          >
            <Settings className="w-5 h-5 text-medical-primary" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#071325] text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
            Préférences
          </div>
        </div>

        {/* Logout button */}
        <div className="relative group flex items-center justify-center w-full">
          <button
            onClick={() => logout()}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 hover:border-rose-900/30 border border-transparent transition-all cursor-pointer"
            aria-label="Déconnexion"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#071325] text-white text-xs font-semibold rounded-xl shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
            Déconnexion
          </div>
        </div>
      </div>
    </aside>
  )
}
