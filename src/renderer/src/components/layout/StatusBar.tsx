import React, { useState, useEffect } from 'react'
import {
  Wifi,
  WifiOff,
  Database,
  Globe,
  Clock,
  Hospital,
  ShieldAlert,
  UserCheck,
  Stethoscope,
  Brain,
  TestTube,
  Pill,
  CreditCard,
  BarChart3
} from 'lucide-react'
import { useHospitalStore } from '../../pages/store/hospitalStore'
import { OutboxSyncModal } from '../modals/OutboxSyncModal'

const roleIcons: Record<string, React.ElementType> = {
  admin: ShieldAlert,
  reception: UserCheck,
  nursing: Stethoscope,
  consultation: Stethoscope,
  'ai-diagnostic': Brain,
  laboratory: TestTube,
  pharmacy: Pill,
  billing: CreditCard,
  management: BarChart3
}

const roleLabels: Record<string, string> = {
  admin: 'Admin Système',
  reception: 'Accueil & Triage',
  nursing: 'Soins & Constantes',
  consultation: 'Médecin / Clinique',
  'ai-diagnostic': 'Diagnostic IA',
  laboratory: 'Laboratoire',
  pharmacy: 'Pharmacie',
  billing: 'Caisse & Factures',
  management: 'Direction & Rapports'
}

export const StatusBar: React.FC = () => {
  const { currentRole, isOnline, hospitalSettings, pendingCacheSync, setShowConnectionsModal } =
    useHospitalStore()
  const [timeStr, setTimeStr] = useState<string>('')
  const [showOutboxModal, setShowOutboxModal] = useState<boolean>(false)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      )
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const ModuleIcon = roleIcons[currentRole] || Stethoscope

  return (
    <>
      <footer className="h-7 bg-[#050D1A] border-t border-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-between px-3 select-none z-40 shrink-0 shadow-inner">
        {/* Left section: Compact Icons + Counters (Text visible on hover) */}
        <div className="flex items-center gap-2">
          {/* Remote Server Connection Indicator */}
          <div className="relative group flex items-center">
            <button
              onClick={() => setShowConnectionsModal(true)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer ${
                isOnline
                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                </>
              )}
            </button>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex items-center gap-2">
              <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                {isOnline ? 'Connecté au Serveur' : 'Mode Hors Ligne (Base Locale)'}
              </span>
              <span className="text-slate-400 text-[9px]">(Cliquer pour configurer)</span>
            </div>
          </div>

          <span className="text-slate-800">|</span>

          {/* Local Cache Sync Indicator */}
          <div className="relative group flex items-center">
            <button
              onClick={() => setShowOutboxModal(true)}
              className="flex items-center gap-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 px-2 py-0.5 rounded transition-colors cursor-pointer border border-transparent hover:border-slate-700"
            >
              <Database className="w-3.5 h-3.5 text-medical-primary" />
              {pendingCacheSync > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                  {pendingCacheSync}
                </span>
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              {pendingCacheSync > 0 ? (
                <span className="text-amber-300">Cache Local Sync: {pendingCacheSync} en attente</span>
              ) : (
                <span className="text-emerald-400">Cache Local Sync: À jour</span>
              )}
            </div>
          </div>

          <span className="text-slate-800">|</span>

          {/* Active Module Indicator */}
          <div className="relative group flex items-center">
            <div className="flex items-center gap-1.5 text-slate-400 px-2 py-0.5 rounded hover:bg-slate-800/50 cursor-default">
              <ModuleIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>

            {/* Hover Tooltip */}
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              Module Actif: <span className="text-emerald-400 font-bold">{roleLabels[currentRole] || currentRole}</span>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Hospital Info */}
          <div className="relative group flex items-center">
            <div className="flex items-center gap-1 text-slate-400 px-1.5 py-0.5 rounded hover:bg-slate-800/50 cursor-default">
              <Hospital className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              Établissement: <span className="text-slate-200">{hospitalSettings.name} ({hospitalSettings.code})</span>
            </div>
          </div>

          <span className="text-slate-800">|</span>

          {/* Language / Encoding */}
          <div className="relative group flex items-center">
            <div className="flex items-center gap-1 text-slate-400 px-1.5 py-0.5 rounded hover:bg-slate-800/50 cursor-default">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              Langue & Encodage: <span className="text-slate-200">FR-FR (UTF-8)</span>
            </div>
          </div>

          <span className="text-slate-800">|</span>

          {/* Live Clock */}
          <div className="flex items-center gap-1.5 text-slate-200 font-bold px-1" title="Horloge système temps réel">
            <Clock className="w-3.5 h-3.5 text-medical-primary" />
            <span>{timeStr}</span>
          </div>
        </div>
      </footer>

      {/* Outbox Sync Modal */}
      <OutboxSyncModal isOpen={showOutboxModal} onClose={() => setShowOutboxModal(false)} />
    </>
  )
}
