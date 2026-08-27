import React, { useState } from 'react'
import { Settings, Bell, Globe, X, Check } from 'lucide-react'
import { useHospitalStore } from '../../pages/store/hospitalStore'
import willoLogo from '../../assets/willo_logo1.png'

export const Header: React.FC = () => {
  const { hospitalSettings } = useHospitalStore()
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  // User Preferences State
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'system'>('account')

  return (
    <header className="bg-medical-dark border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-xl bg-white/10 border border-white/10 shadow-xs flex items-center justify-center">
            <img src={willoLogo} alt="WILLO Logo" className="h-8 w-auto object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg tracking-tight text-white">
                WILLO HOSPITAL
              </h1>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1.5">
              <span>{hospitalSettings.name}</span>
              <span className="text-slate-500">•</span>
              <span className="font-mono text-slate-300">{hospitalSettings.code}</span>
            </p>
          </div>
        </div>

        {/* User Account & Settings Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-xs"
            title="Paramètres de compte & préférences"
          >
            <Settings className="w-4 h-4 text-medical-primary animate-spin-slow" />
            <span className="hidden sm:inline">Paramètres & Compte</span>
          </button>
        </div>
      </div>

      {/* Settings & User Preferences Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-medical-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 space-y-0">
            {/* Modal Header */}
            <div className="bg-medical-dark p-4 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-medical-primary" />
                <h3 className="font-bold text-base">Préférences Utilisateur & Compte</h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Subtabs */}
            <div className="flex border-b border-medical-border bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('account')}
                className={`pb-2.5 px-3 border-b-2 transition-all ${activeTab === 'account' ? 'border-medical-primary text-medical-primary font-bold' : 'border-transparent hover:text-slate-900'
                  }`}
              >
                Profil & Compte
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`pb-2.5 px-3 border-b-2 transition-all ${activeTab === 'preferences' ? 'border-medical-primary text-medical-primary font-bold' : 'border-transparent hover:text-slate-900'
                  }`}
              >
                Préférences IHM
              </button>
              <button
                onClick={() => setActiveTab('system')}
                className={`pb-2.5 px-3 border-b-2 transition-all ${activeTab === 'system' ? 'border-medical-primary text-medical-primary font-bold' : 'border-transparent hover:text-slate-900'
                  }`}
              >
                Informations Système
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs">
              {activeTab === 'account' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-medical-border">
                    <div className="w-12 h-12 rounded-xl bg-medical-subtle border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-base">
                      SK
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Dr. Sarah Kouassi</h4>
                      <p className="text-slate-500 text-[11px]">Médecin Référent • Service Médecine Générale</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                        Compte Vérifié & Sécurisé
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Email Professionnel</label>
                    <input
                      type="email"
                      readOnly
                      defaultValue="s.kouassi@willo-hospital.org"
                      className="w-full bg-slate-50 border border-medical-border rounded-xl p-2.5 text-slate-700 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">Identifiant Unique</label>
                    <input
                      type="text"
                      readOnly
                      defaultValue="USER-SK-8840"
                      className="w-full bg-slate-50 border border-medical-border rounded-xl p-2.5 text-slate-700 font-mono"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-medical-border">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-medical-primary" />
                      <div>
                        <span className="font-semibold text-slate-800 block">Langue de l'interface</span>
                        <span className="text-[11px] text-slate-500">Choisir la langue d'affichage</span>
                      </div>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as 'fr' | 'en')}
                      className="bg-white border border-medical-border rounded-lg p-1.5 text-slate-800 font-semibold"
                    >
                      <option value="fr">Français (FR)</option>
                      <option value="en">English (EN)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-medical-border">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-medical-primary" />
                      <div>
                        <span className="font-semibold text-slate-800 block">Notifications Sonores & Alertas</span>
                        <span className="text-[11px] text-slate-500">Activer les rappels et alertes urgences</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                      className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${notificationsEnabled ? 'bg-medical-subtle text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                      {notificationsEnabled ? 'Activées' : 'Désactivées'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'system' && (
                <div className="space-y-3 text-slate-700">
                  <div className="p-3 bg-slate-50 rounded-xl border border-medical-border space-y-1">
                    <p className="font-semibold text-slate-900">WILLO Client Electron v1.0.0</p>
                    <p className="text-[11px] text-slate-500 font-mono">React 19 • TypeScript 5.9 • Tailwind CSS v4</p>
                  </div>
                  <div className="p-3 bg-medical-subtle text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 font-semibold">
                    <Check className="w-4 h-4 text-medical-primary" /> Application à jour
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-medical-border flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white rounded-xl font-semibold shadow-xs transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
