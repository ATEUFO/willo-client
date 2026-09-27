import React, { useState } from 'react'
import { Settings, Bell, Globe, X, Check, Palette } from 'lucide-react'
import { useHospitalStore } from '../../pages/store/hospitalStore'
import { useLocale } from '../../i18n/useLocale'
import { useTheme } from '../../config/useTheme'
import type { SupportedLang } from '../../i18n/index'

export const SettingsModal: React.FC = () => {
  const { currentUser, setShowSettingsModal } = useHospitalStore()
  const { lang, setLang, languages, langLabel } = useLocale()
  const { themeId, setTheme, themes, currentTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'system'>('account')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const isFr = lang === 'fr'

  const labels = {
    title: isFr ? 'Préférences Utilisateur & Compte' : 'User Preferences & Account',
    tabs: {
      account: isFr ? 'Profil & Compte' : 'Profile & Account',
      preferences: isFr ? 'Préférences IHM & Thèmes' : 'UI & Themes',
      system: isFr ? 'Informations Système' : 'System Info'
    },
    account: {
      notConnected: isFr ? 'Utilisateur Non Connecté' : 'User Not Logged In',
      badge: isFr ? 'Compte Authentifié SQLite' : 'SQLite Authenticated Account',
      role: isFr ? 'Rôle' : 'Role',
      userId: isFr ? 'Identifiant Unique' : 'Unique Username',
      lastLogin: isFr ? 'Dernière Connexion' : 'Last Login',
      now: isFr ? 'Maintenant' : 'Now'
    },
    prefs: {
      language: isFr ? "Langue de l'interface" : 'Interface language',
      languageSub: isFr ? "Choisir la langue d'affichage" : 'Choose the display language',
      themeTitle: isFr ? "Thème Visuel (10 Thèmes Disponibles)" : 'Visual Theme (10 Themes Available)',
      themeSub: isFr ? "Basculer entre couleurs médicales et thèmes neutres (VS Code / Antigravity)" : 'Switch between medical colors and neutral dark/light themes (VS Code / Antigravity)',
      notifications: isFr ? 'Notifications Sonores & Alertes' : 'Sound Notifications & Alerts',
      notificationsSub: isFr ? 'Activer les rappels et alertes urgences' : 'Enable reminders and emergency alerts',
      enabled: isFr ? 'Activées' : 'Enabled',
      disabled: isFr ? 'Désactivées' : 'Disabled'
    },
    system: {
      version: 'WILLO Client Electron v1.0.0',
      stack: 'better-sqlite3 • React 19 • TypeScript 5.9',
      dbActive: isFr ? 'Base de données locale connectée & active' : 'Local database connected & active'
    },
    close: isFr ? 'Fermer' : 'Close'
  }

  const getUserInitials = (name?: string) => {
    if (!name) return 'US'
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-medical-border rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-900 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-medical-dark p-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-medical-primary" />
            <h3 className="font-bold text-base">{labels.title}</h3>
          </div>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-medical-border bg-slate-50 px-4 pt-2 gap-2 text-xs font-semibold text-slate-600 shrink-0">
          {(['account', 'preferences', 'system'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer ${
                activeTab === tab
                  ? 'border-medical-primary text-medical-primary font-bold'
                  : 'border-transparent hover:text-slate-900'
              }`}
            >
              {labels.tabs[tab]}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto flex-1">
          {/* ── Account Tab ── */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-medical-border">
                <div className="w-12 h-12 rounded-xl bg-medical-subtle border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-base">
                  {getUserInitials(currentUser?.name)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {currentUser?.name || labels.account.notConnected}
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    {labels.account.role}:{' '}
                    <span className="font-semibold text-slate-800 capitalize">{currentUser?.role}</span>
                    {currentUser?.department && ` • ${currentUser.department}`}
                  </p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold">
                    {labels.account.badge}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{labels.account.userId}</label>
                <input
                  type="text"
                  readOnly
                  defaultValue={currentUser?.username || 'N/A'}
                  className="w-full bg-slate-50 border border-medical-border rounded-xl p-2.5 text-slate-700 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">{labels.account.lastLogin}</label>
                <input
                  type="text"
                  readOnly
                  defaultValue={currentUser?.lastLogin || labels.account.now}
                  className="w-full bg-slate-50 border border-medical-border rounded-xl p-2.5 text-slate-700 font-mono focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ── Preferences Tab ── */}
          {activeTab === 'preferences' && (
            <div className="space-y-5">
              {/* Language Selector */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-medical-border">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-medical-primary" />
                  <div>
                    <span className="font-semibold text-slate-800 block">{labels.prefs.language}</span>
                    <span className="text-[11px] text-slate-500">{labels.prefs.languageSub}</span>
                  </div>
                </div>
                {/* Segmented language buttons */}
                <div className="flex items-center gap-1 bg-slate-200 rounded-lg p-0.5">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLang(l.code as SupportedLang)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        l.code === lang
                          ? 'bg-white text-medical-primary shadow-sm border border-medical-border'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.code.toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Selector (10 Themes) */}
              <div className="p-4 bg-slate-50 rounded-xl border border-medical-border space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-medical-primary" />
                  <div>
                    <span className="font-semibold text-slate-800 block">{labels.prefs.themeTitle}</span>
                    <span className="text-[11px] text-slate-500">{labels.prefs.themeSub}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {themes.map((t) => {
                    const isSelected = t.id === themeId
                    return (
                      <div
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-white border-medical-primary ring-2 ring-medical-primary/20 shadow-xs'
                            : 'bg-white/60 border-slate-200 hover:border-slate-400 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Theme Color Preview Swatch */}
                          <div className="flex items-center -space-x-1 shrink-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs inline-block z-10"
                              style={{ backgroundColor: t.preview.primary }}
                              title="Couleur Principale"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs inline-block z-0"
                              style={{ backgroundColor: t.preview.dark }}
                              title="Sidebar / Barre"
                            />
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs inline-block -z-10"
                              style={{ backgroundColor: t.preview.bg }}
                              title="Arrière Plan"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[11px] text-slate-900 truncate">
                              {isFr ? t.nameFr : t.nameEn}
                            </p>
                            <span className="text-[10px] text-slate-500 font-medium capitalize">
                              {t.type === 'dark' ? (isFr ? 'Sombre' : 'Dark') : (isFr ? 'Clair' : 'Light')} • {t.category}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-medical-primary text-white flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-medical-border">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-medical-primary" />
                  <div>
                    <span className="font-semibold text-slate-800 block">{labels.prefs.notifications}</span>
                    <span className="text-[11px] text-slate-500">{labels.prefs.notificationsSub}</span>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
                    notificationsEnabled
                      ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {notificationsEnabled ? labels.prefs.enabled : labels.prefs.disabled}
                </button>
              </div>
            </div>
          )}

          {/* ── System Tab ── */}
          {activeTab === 'system' && (
            <div className="space-y-3 text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-medical-border space-y-1">
                <p className="font-semibold text-slate-900">{labels.system.version}</p>
                <p className="text-[11px] text-slate-500 font-mono">{labels.system.stack}</p>
              </div>
              <div className="p-3 bg-medical-subtle text-emerald-900 rounded-xl border border-emerald-200 flex items-center gap-2 font-semibold">
                <Check className="w-4 h-4 text-medical-primary" />
                {labels.system.dbActive}
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-medical-border text-[10px] font-mono text-slate-500 space-y-1">
                <p><span className="font-bold text-slate-700">{isFr ? 'Thème actif' : 'Active theme'}:</span> {isFr ? currentTheme.nameFr : currentTheme.nameEn}</p>
                <p><span className="font-bold text-slate-700">{isFr ? 'Langue active' : 'Active language'}:</span> {langLabel}</p>
                <p><span className="font-bold text-slate-700">Electron:</span> v39 • Node v22 • Chromium</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-medical-border flex justify-end shrink-0">
          <button
            onClick={() => setShowSettingsModal(false)}
            className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
          >
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  )
}
