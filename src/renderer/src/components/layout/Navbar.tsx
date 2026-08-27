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
  Wifi,
  WifiOff,
  Database,
  Hospital
} from 'lucide-react'
import { useHospitalStore, Role } from '../../store/hospitalStore'

interface RoleConfig {
  id: Role
  label: string
  icon: React.ElementType
  color: string
}

const roles: RoleConfig[] = [
  { id: 'admin', label: 'Admin Système', icon: ShieldAlert, color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' },
  { id: 'reception', label: 'Accueil & Triage', icon: UserCheck, color: 'text-sky-400 bg-sky-500/10 border-sky-500/30' },
  { id: 'nursing', label: 'Soins & Constantes', icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  { id: 'consultation', label: 'Médecin / Clinique', icon: Stethoscope, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30' },
  { id: 'laboratory', label: 'Laboratoire', icon: TestTube, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' },
  { id: 'pharmacy', label: 'Pharmacie', icon: Pill, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
  { id: 'billing', label: 'Caisse & Factures', icon: CreditCard, color: 'text-teal-400 bg-teal-500/10 border-teal-500/30' },
  { id: 'management', label: 'Direction & Rapports', icon: BarChart3, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' },
]

export const Navbar: React.FC = () => {
  const { currentRole, setRole, isOnline, toggleOnline, hospitalSettings } = useHospitalStore()

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-50 shadow-md">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between flex-wrap gap-3">
        {/* Brand & Hospital Info */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Hospital className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                WILLO HOSPITAL
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-blue-500/10 border border-blue-500/30 text-blue-400">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{hospitalSettings.name}</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-slate-400">{hospitalSettings.code}</span>
            </p>
          </div>
        </div>

        {/* Sync & Cache Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOnline}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
            }`}
            title="Cliquer pour basculer l'état du serveur distant"
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5 animate-pulse" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'Serveur Distant Connecté' : 'Mode Hors Ligne (Cache Actif)'}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Cache Local Sync</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>
      </div>

      {/* Role Navigation Bar */}
      <div className="bg-slate-950/80 border-t border-slate-800/60 px-4 overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-1.5">
          {roles.map((r) => {
            const Icon = r.icon
            const isActive = currentRole === r.id
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap border ${
                  isActive
                    ? r.color
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{r.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
