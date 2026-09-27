import React, { useState, useEffect } from 'react'
import {
  Server,
  Users,
  ShieldCheck,
  Database,
  Sliders,
  AlertTriangle,
  Plus,
  RefreshCw,
  Download,
  Key,
  CheckCircle,
  HardDrive
} from 'lucide-react'
import { useHospitalStore, Role } from '../store/hospitalStore'
import { useTranslation } from 'react-i18next'

export const AdminPage: React.FC = () => {
  const {
    users,
    systemLogs,
    backups,
    hospitalSettings,
    triggerBackup,
    addUser,
    updateUserStatus,
    showNotification
  } = useHospitalStore()

  const { t } = useTranslation('admin')
  const { t: tc } = useTranslation('common')

  const [activeTab, setActiveTab] = useState<'supervision' | 'users' | 'settings' | 'backups'>('supervision')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    role: 'consultation' as Role,
    department: 'Médecine Générale'
  })

  const [logFilter, setLogFilter] = useState<string>('ALL')

  const [systemMetrics, setSystemMetrics] = useState<{
    cpuPercent: number
    ramPercent: number
    usedRamGB: string
    totalRamGB: string
    dbSizeMB: string
    connectedCount: number
    currentSessionUser: string | null
    totalUsers: number
    activeUsers: number
    uptimeSeconds: number
  }>({
    cpuPercent: 12,
    ramPercent: 32,
    usedRamGB: '2.5',
    totalRamGB: '8.0',
    dbSizeMB: '1.2 MB',
    connectedCount: 1,
    currentSessionUser: null,
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'Active').length,
    uptimeSeconds: 0
  })

  useEffect(() => {
    let isMounted = true
    const fetchMetrics = async () => {
      try {
        if (window.api?.system?.getMetrics) {
          const metrics = await window.api.system.getMetrics()
          if (isMounted && metrics) {
            setSystemMetrics(metrics)
          }
        }
      } catch (err) {
        console.error('Erreur de récupération des métriques système:', err)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 2000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserForm.name || !newUserForm.username) return
    addUser({
      name: newUserForm.name,
      username: newUserForm.username,
      role: newUserForm.role,
      department: newUserForm.department,
      status: 'Active'
    })
    setShowAddUserModal(false)
    setNewUserForm({ name: '', username: '', role: 'consultation', department: 'Médecine Générale' })
  }

  const filteredLogs = systemLogs.filter((log) => {
    if (logFilter === 'ALL') return true
    return log.level === logFilter
  })

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <Server className="w-7 h-7 text-medical-primary" />
            {t('title')}
          </h2>
          <p className="text-sm text-slate-500">{t('subtitle')}</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-medical-border shadow-sm">
          {(['supervision', 'users', 'settings', 'backups'] as const).map((tab) => {
            const icons = { supervision: Server, users: Users, settings: Sliders, backups: Database }
            const Icon = icons[tab]
            const labels = {
              supervision: t('tabs.supervision'),
              users: t('tabs.users', { count: users.length }),
              settings: t('tabs.settings'),
              backups: t('tabs.backups')
            }
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'bg-medical-primary text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {labels[tab]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab 1: Supervision Dashboard */}
      {activeTab === 'supervision' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Server Status */}
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-medical-subtle border border-emerald-200 text-emerald-700 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t('supervision.serverStatus')}</p>
                <p className="text-lg font-bold text-emerald-600">{t('supervision.operational')}</p>
                <p className="text-xs text-slate-400">
                  {t('supervision.uptime')}: {systemMetrics.uptimeSeconds > 0 ? `${Math.floor(systemMetrics.uptimeSeconds / 3600)}h ${Math.floor((systemMetrics.uptimeSeconds % 3600) / 60)}m` : '99.98%'}
                </p>
              </div>
            </div>

            {/* Connected Users */}
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t('supervision.connectedUsers')}</p>
                <p className="text-lg font-bold text-slate-800">{systemMetrics.connectedCount} {t('supervision.connected')}</p>
                <p className="text-xs text-slate-400">
                  {systemMetrics.currentSessionUser
                    ? `${t('supervision.session')}: ${systemMetrics.currentSessionUser}`
                    : `${t('supervision.totalAccounts')}: ${users.length} (${users.filter((u) => u.status === 'Active').length} ${t('supervision.active')})`}
                </p>
              </div>
            </div>

            {/* Server Load */}
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t('supervision.serverLoad')}</p>
                <p className="text-lg font-bold text-amber-600">
                  {systemMetrics.cpuPercent}% CPU • {systemMetrics.ramPercent}% RAM
                </p>
                <p className="text-xs text-slate-400">
                  RAM: {systemMetrics.usedRamGB}/{systemMetrics.totalRamGB} GB • BDD: {systemMetrics.dbSizeMB}
                </p>
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-red-50 border border-red-200 text-medical-danger rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t('supervision.alerts')}</p>
                <p className="text-lg font-bold text-medical-danger">{systemLogs.filter((l) => l.level === 'ERROR').length} {t('supervision.errors')}</p>
                <p className="text-xs text-slate-400">{t('supervision.lastScan')}: {t('supervision.today')}</p>
              </div>
            </div>
          </div>

          {/* System Logs Table */}
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-medical-dark text-base">{t('supervision.logsTitle')}</h3>
                <p className="text-xs text-slate-500">{t('supervision.logsSubtitle')}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">{t('supervision.filter')}:</span>
                {['ALL', 'INFO', 'WARNING', 'ERROR'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      logFilter === lvl ? 'bg-medical-dark text-white font-semibold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-medical-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                  <tr>
                    <th className="p-3">{t('supervision.logCols.timestamp')}</th>
                    <th className="p-3">{t('supervision.logCols.level')}</th>
                    <th className="p-3">{t('supervision.logCols.service')}</th>
                    <th className="p-3">{t('supervision.logCols.message')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-medical-border font-mono text-slate-700">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-slate-500">{log.timestamp}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                          log.level === 'ERROR' ? 'bg-red-50 text-medical-danger border border-red-200'
                          : log.level === 'WARNING' ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                        }`}>
                          {log.level}
                        </span>
                      </td>
                      <td className="p-3 text-slate-900 font-bold">{log.service}</td>
                      <td className="p-3 text-slate-700">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Access Management */}
      {activeTab === 'users' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">{t('users.title')}</h3>
              <p className="text-xs text-slate-500">{t('users.subtitle')}</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t('users.createAccount')}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">{t('users.cols.user')}</th>
                  <th className="p-3">{t('users.cols.username')}</th>
                  <th className="p-3">{t('users.cols.role')}</th>
                  <th className="p-3">{t('users.cols.department')}</th>
                  <th className="p-3">{t('users.cols.lastLogin')}</th>
                  <th className="p-3">{t('users.cols.status')}</th>
                  <th className="p-3 text-right">{t('users.cols.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-border text-slate-700">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{usr.name}</td>
                    <td className="p-3 font-mono text-slate-500">@{usr.username}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-100 text-medical-dark border border-slate-200 capitalize">
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700">{usr.department}</td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">{usr.lastLogin}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        usr.status === 'Active'
                          ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}>
                        {usr.status === 'Active' ? t('users.active') : t('users.inactive')}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => showNotification(t('users.resetPwdMsg', { name: usr.name }), { title: t('users.resetPwdTitle'), type: 'info' })}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-amber-700 text-[11px] inline-flex items-center gap-1 border border-slate-200 font-medium"
                        title={t('users.resetPwd')}
                      >
                        <Key className="w-3 h-3" />
                        Reset Pwd
                      </button>
                      <button
                        onClick={() => updateUserStatus(usr.id, usr.status === 'Active' ? 'Inactive' : 'Active')}
                        className={`px-2.5 py-1 rounded-lg text-[11px] inline-flex items-center gap-1 border font-medium ${
                          usr.status === 'Active'
                            ? 'bg-red-50 border-red-200 text-medical-danger hover:bg-red-100'
                            : 'bg-medical-subtle border-emerald-200 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {usr.status === 'Active' ? t('users.deactivate') : t('users.activate')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Global Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-medical-dark text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-medical-primary" />
              {t('settings.generalTitle')}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('settings.facilityName')}</label>
                <input type="text" defaultValue={hospitalSettings.name} className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('settings.facilityCode')}</label>
                  <input type="text" defaultValue={hospitalSettings.code} className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary font-mono" />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('settings.totalBeds')}</label>
                  <input type="number" defaultValue={hospitalSettings.totalBeds} className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary" />
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('settings.address')}</label>
                <input type="text" defaultValue={hospitalSettings.address} className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('settings.phone')}</label>
                  <input type="text" defaultValue={hospitalSettings.phone} className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary" />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('settings.email')}</label>
                  <input type="email" defaultValue={hospitalSettings.email} className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary" />
                </div>
              </div>
              <button
                onClick={() => showNotification(t('settings.saveSuccess'), { title: t('settings.saveTitle'), type: 'success' })}
                className="w-full bg-medical-primary hover:bg-medical-hover text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm"
              >
                {t('settings.saveBtn')}
              </button>
            </div>
          </div>

          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-medical-dark text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-medical-primary" />
              {t('settings.servicesTitle')}
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('settings.activeServices', { count: hospitalSettings.departments.length })}</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-medical-border rounded-xl">
                  {hospitalSettings.departments.map((dept, i) => (
                    <span key={i} className="px-2.5 py-1 bg-white text-slate-700 rounded-lg border border-medical-border font-medium shadow-xs">{dept}</span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('settings.specialties', { count: hospitalSettings.specialties.length })}</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 border border-medical-border rounded-xl">
                  {hospitalSettings.specialties.map((spec, i) => (
                    <span key={i} className="px-2.5 py-1 bg-medical-subtle text-emerald-800 rounded-lg border border-emerald-200 font-medium shadow-xs">{spec}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Backup Console */}
      {activeTab === 'backups' && (
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
            <div>
              <h3 className="font-bold text-medical-dark text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-medical-primary" />
                {t('backups.title')}
              </h3>
              <p className="text-xs text-slate-500">{t('backups.subtitle')}</p>
            </div>
            <button
              onClick={triggerBackup}
              className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              {t('backups.triggerDump')}
            </button>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">{t('backups.history')}</h4>
            <div className="overflow-x-auto rounded-xl border border-medical-border">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                  <tr>
                    <th className="p-3">{t('backups.cols.file')}</th>
                    <th className="p-3">{t('backups.cols.size')}</th>
                    <th className="p-3">{t('backups.cols.type')}</th>
                    <th className="p-3">{t('backups.cols.datetime')}</th>
                    <th className="p-3">{t('backups.cols.status')}</th>
                    <th className="p-3 text-right">{t('backups.cols.action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-medical-border font-mono text-slate-700">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-slate-900 font-bold flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-emerald-600" />
                        {b.filename}
                      </td>
                      <td className="p-3 text-slate-500">{b.size}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">{b.type}</span>
                      </td>
                      <td className="p-3 text-slate-500">{b.timestamp}</td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-medical-subtle text-emerald-800 border border-emerald-200">{b.status}</span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={async () => {
                            try {
                              if (window.api?.backups?.download) {
                                const res = await window.api.backups.download(b.id)
                                if (res && res.success) {
                                  showNotification(t('backups.downloadSuccess', { path: res.filePath }), { title: t('backups.downloadTitle'), type: 'success' })
                                }
                              } else {
                                showNotification(t('backups.downloadSimulated', { filename: b.filename }), { title: t('backups.downloadTitle'), type: 'info' })
                              }
                            } catch (err) {
                              showNotification(t('backups.downloadError', { error: err instanceof Error ? err.message : String(err) }), { title: tc('status.error'), type: 'error' })
                            }
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-emerald-700 rounded-lg text-[11px] inline-flex items-center gap-1 border border-slate-200 font-medium cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          {t('backups.download')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add User */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-medical-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-medical-dark">{t('users.modal.title')}</h3>
            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('users.modal.fullName')}</label>
                <input
                  type="text" required value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder={t('users.modal.fullNamePlaceholder')}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('users.modal.username')}</label>
                <input
                  type="text" required value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  placeholder={t('users.modal.usernamePlaceholder')}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('users.modal.role')}</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary capitalize"
                >
                  {(['consultation','nursing','reception','laboratory','pharmacy','billing','management','admin'] as Role[]).map(r => (
                    <option key={r} value={r}>{t(`users.modal.roles.${r}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('users.modal.department')}</label>
                <input
                  type="text" value={newUserForm.department}
                  onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium">
                  {tc('actions.cancel')}
                </button>
                <button type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm">
                  {tc('actions.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
