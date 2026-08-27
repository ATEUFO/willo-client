import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Database, Globe, Clock, Hospital } from 'lucide-react'
import { useHospitalStore } from '../../pages/store/hospitalStore'

export const StatusBar: React.FC = () => {
  const { currentRole, isOnline, toggleOnline, hospitalSettings } = useHospitalStore()
  const [timeStr, setTimeStr] = useState<string>('')

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      setTimeStr(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [])

  const roleLabels: Record<string, string> = {
    admin: 'Admin Système',
    reception: 'Accueil & Triage',
    nursing: 'Soins & Constantes',
    consultation: 'Médecin / Clinique',
    laboratory: 'Laboratoire',
    pharmacy: 'Pharmacie',
    billing: 'Caisse & Factures',
    management: 'Direction & Rapports'
  }

  return (
    <footer className="h-7 bg-[#050D1A] border-t border-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-between px-3 select-none z-50 shrink-0 shadow-inner">
      {/* Left section */}
      <div className="flex items-center gap-3">
        {/* Remote Server Connection Toggle */}
        <button
          onClick={toggleOnline}
          className={`flex items-center gap-1.5 px-2 py-0.5 rounded transition-all cursor-pointer ${isOnline
              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30'
            }`}
          title="Cliquer pour basculer le statut du serveur distant"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="font-semibold text-emerald-400">Serveur Distant Connecté</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-400" />
              <span className="font-semibold text-amber-300">Mode Hors Ligne (Cache Actif)</span>
            </>
          )}
        </button>

        <span className="text-slate-700">|</span>

        {/* Local Cache Sync */}
        <div
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-default"
          title="Base de données SQLite / Dexie localement synchronisée"
        >
          <Database className="w-3 h-3 text-medical-primary" />
          <span>Cache Local Sync</span>
          <span className="w-1.5 h-1.5 rounded-full bg-medical-primary animate-ping" />
        </div>

        <span className="text-slate-700">|</span>

        {/* Active Module Indicator */}
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="text-slate-500">Module:</span>
          <span className="font-semibold text-emerald-400">{roleLabels[currentRole] || currentRole}</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Hospital Info */}
        <div className="flex items-center gap-1 text-slate-400" title={hospitalSettings.name}>
          <Hospital className="w-3 h-3 text-slate-400" />
          <span>{hospitalSettings.code}</span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Language & Encoding */}
        <div className="flex items-center gap-1.5 text-slate-400" title="Langue d'affichage & Encodage">
          <Globe className="w-3 h-3 text-slate-400" />
          <span>FR-FR</span>
          <span className="text-slate-600">UTF-8</span>
        </div>

        <span className="text-slate-700">|</span>

        {/* Live Clock */}
        <div className="flex items-center gap-1.5 text-slate-200 font-bold" title="Horloge temps réel">
          <Clock className="w-3 h-3 text-medical-primary" />
          <span>{timeStr}</span>
        </div>
      </div>
    </footer>
  )
}
