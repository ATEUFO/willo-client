import React, { useState } from 'react'
import { Settings, Bell, Globe, X, Check } from 'lucide-react'
import { useHospitalStore } from '../../pages/store/hospitalStore'

export const SettingsModal: React.FC = () => {
  const { currentUser, setShowSettingsModal } = useHospitalStore()
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'system'>('account')
  const [language, setLanguage] = useState<'fr' | 'en'>('fr')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const getUserInitials = (name?: string) => {
    if (!name) return 'US'
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-medical-border rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden text-slate-900 space-y-0">
        {/* Modal Header */}
        <div className="bg-medical-dark p-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-medical-primary" />
            <h3 className="font-bold text-base">Préférences Utilisateur & Compte</h3>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Subtabs */}
        <div className="flex border-b border-medical-border bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('account')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'account' ? 'border-medical-primary text-medical-primary font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Profil & Compte
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'preferences' ? 'border-medical-primary text-medical-primary font-bold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Préférences IHM
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
              activeTab === 'system' ? 'border-medical-primary text-medical-primary font-bold' : 'border-transparent hover:text-slate-900'
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
                  {getUserInitials(currentUser?.name)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{currentUser?.name || 'Utilisateur Non Connecté'}</h4>
                  <p className="text-slate-500 text-[11px]">Rôle: <span className="font-semibold text-slate-800 capitalize">{currentUser?.role}</span> • {currentUser?.department}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                    Compte Authentifié SQLite
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Identifiant Unique</label>
                <input
                  type="text"
                  readOnly
                  defaultValue={currentUser?.username || 'N/A'}
                  className="w-full bg-slate-50 border border-medical-border rounded-xl p-2.5 text-slate-700 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Dernière Connexion</label>
                <input
                  type="text"
                  readOnly
                  defaultValue={currentUser?.lastLogin || 'Maintenant'}
                  className="w-full bg-slate-50 border border-medical-border rounded-xl p-2.5 text-slate-700 font-mono focus:outline-none"
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
                  className="bg-white border border-medical-border rounded-lg p-1.5 text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="fr">Français (FR)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-medical-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-medical-primary" />
                  <div>
                    <span className="font-semibold text-slate-800 block">Notifications Sonores & Alertes</span>
                    <span className="text-[11px] text-slate-500">Activer les rappels et alertes urgences</span>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                    notificationsEnabled ? 'bg-medical-subtle text-emerald-800 border border-emerald-200' : 'bg-slate-200 text-slate-600'
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
                <p className="text-[11px] text-slate-500 font-mono">better-sqlite3 • React 19 • TypeScript 5.9</p>
              </div>
              <div className="p-3 bg-medical-subtle text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-medical-primary" /> Base de données locale connectée & active
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-medical-border flex justify-end">
          <button
            onClick={() => setShowSettingsModal(false)}
            className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
