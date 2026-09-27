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
import { useLocale } from '../../i18n/useLocale'

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

export const StatusBar: React.FC = () => {
  const { currentRole, isOnline, hospitalSettings, pendingCacheSync, setShowConnectionsModal } =
    useHospitalStore()
  const [timeStr, setTimeStr] = useState<string>('')
  const [showOutboxModal, setShowOutboxModal] = useState<boolean>(false)
  const { langLabel, toggle, languages, lang, localeInfo } = useLocale()

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const locale = lang === 'fr' ? 'fr-FR' : 'en-US'
      setTimeStr(now.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateClock()
    const timer = setInterval(updateClock, 1000)
    return () => clearInterval(timer)
  }, [lang])

  const ModuleIcon = roleIcons[currentRole] || Stethoscope

  const roleLabels: Record<string, string> = {
    admin: lang === 'fr' ? 'Admin Système' : 'System Admin',
    reception: lang === 'fr' ? 'Accueil & Triage' : 'Reception & Triage',
    nursing: lang === 'fr' ? 'Soins & Constantes' : 'Nursing & Vitals',
    consultation: lang === 'fr' ? 'Médecin / Clinique' : 'Doctor / Clinic',
    'ai-diagnostic': lang === 'fr' ? 'Diagnostic IA' : 'AI Diagnostic',
    laboratory: lang === 'fr' ? 'Laboratoire' : 'Laboratory',
    pharmacy: lang === 'fr' ? 'Pharmacie' : 'Pharmacy',
    billing: lang === 'fr' ? 'Caisse & Factures' : 'Billing & Invoices',
    management: lang === 'fr' ? 'Direction & Rapports' : 'Management & Reports'
  }

  return (
    <>
      <footer className="h-7 bg-[#050D1A] border-t border-slate-800 text-slate-300 text-[11px] font-mono flex items-center justify-between px-3 select-none z-40 shrink-0 shadow-inner">
        {/* Left section */}
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
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 flex items-center gap-2">
              <span className={isOnline ? 'text-emerald-400 font-bold' : 'text-amber-300 font-bold'}>
                {isOnline
                  ? (lang === 'fr' ? 'Connecté au Serveur' : 'Connected to Server')
                  : (lang === 'fr' ? 'Mode Hors Ligne (Base Locale)' : 'Offline Mode (Local DB)')}
              </span>
              <span className="text-slate-400 text-[9px]">
                {lang === 'fr' ? '(Cliquer pour configurer)' : '(Click to configure)'}
              </span>
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
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              {pendingCacheSync > 0 ? (
                <span className="text-amber-300">
                  {lang === 'fr' ? `Cache Local Sync: ${pendingCacheSync} en attente` : `Local Cache Sync: ${pendingCacheSync} pending`}
                </span>
              ) : (
                <span className="text-emerald-400">
                  {lang === 'fr' ? 'Cache Local Sync: À jour' : 'Local Cache Sync: Up to date'}
                </span>
              )}
            </div>
          </div>

          <span className="text-slate-800">|</span>

          {/* Active Module Indicator */}
          <div className="relative group flex items-center">
            <div className="flex items-center gap-1.5 text-slate-400 px-2 py-0.5 rounded hover:bg-slate-800/50 cursor-default">
              <ModuleIcon className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1 bg-[#071325] text-white text-[10px] font-semibold rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50">
              {lang === 'fr' ? 'Module Actif' : 'Active Module'}:{' '}
              <span className="text-emerald-400 font-bold">{roleLabels[currentRole] || currentRole}</span>
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
              {lang === 'fr' ? 'Établissement' : 'Facility'}:{' '}
              <span className="text-slate-200">{hospitalSettings.name} ({hospitalSettings.code})</span>
            </div>
          </div>

          <span className="text-slate-800">|</span>

          {/* ── Language Toggle Button ── */}
          <div className="relative group flex items-center">
            <button
              onClick={toggle}
              title={lang === 'fr' ? 'Changer la langue → English' : 'Change language → Français'}
              className="flex items-center gap-1 px-2 py-0.5 rounded border border-slate-700/60 bg-slate-800/60 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-slate-300 hover:text-emerald-300 transition-all cursor-pointer"
            >
              <Globe className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              <span className="text-[10px] font-bold tracking-wider">{langLabel}</span>
            </button>

            {/* Tooltip showing language options */}
            <div className="absolute bottom-full right-0 mb-2 bg-[#071325] border border-slate-700/80 rounded-xl shadow-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-50 min-w-[120px]">
              {languages.map((l) => (
                <div
                  key={l.code}
                  className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-semibold whitespace-nowrap ${
                    l.code === lang ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                  {l.code === lang && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-auto" />}
                </div>
              ))}
              <div className="px-3 py-1 border-t border-slate-800 text-[9px] text-slate-600 font-mono">
                {localeInfo?.charset ?? 'utf-8'} • {localeInfo?.direction ?? 'ltr'}
              </div>
            </div>
          </div>

          <span className="text-slate-800">|</span>

          {/* Live Clock */}
          <div
            className="flex items-center gap-1.5 text-slate-200 font-bold px-1"
            title={lang === 'fr' ? 'Horloge système temps réel' : 'Real-time system clock'}
          >
            <Clock className="w-3.5 h-3.5 text-medical-primary" />
            <span>{timeStr}</span>
          </div>
        </div>
      </footer>

      <OutboxSyncModal isOpen={showOutboxModal} onClose={() => setShowOutboxModal(false)} />
    </>
  )
}
