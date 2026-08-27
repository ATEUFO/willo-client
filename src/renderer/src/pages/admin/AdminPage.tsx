import React, { useState } from 'react'
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
import { useHospitalStore, Role } from '../../store/hospitalStore'

export const AdminPage: React.FC = () => {
  const {
    users,
    systemLogs,
    backups,
    hospitalSettings,
    triggerBackup,
    addUser,
    updateUserStatus
  } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'supervision' | 'users' | 'settings' | 'backups'>('supervision')
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    username: '',
    role: 'consultation' as Role,
    department: 'Médecine Générale'
  })

  const [logFilter, setLogFilter] = useState<string>('ALL')

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-7 h-7 text-rose-400" />
            Espace Administrateur Système
          </h2>
          <p className="text-sm text-slate-400">
            Supervision technique, gestion des accès utilisateur, paramètres globaux et sauvegardes
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('supervision')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'supervision' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Supervision
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'users' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Gestion Accès ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'settings' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Paramètres Globaux
          </button>
          <button
            onClick={() => setActiveTab('backups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'backups' ? 'bg-rose-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Sauvegardes
          </button>
        </div>
      </div>

      {/* Tab 1: Supervision Dashboard */}
      {activeTab === 'supervision' && (
        <div className="space-y-6">
          {/* Status Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">État du Serveur</p>
                <p className="text-lg font-bold text-emerald-400">Opérationnel</p>
                <p className="text-xs text-slate-500">Uptime: 99.98% (14 jours)</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Utilisateurs Connectés</p>
                <p className="text-lg font-bold text-slate-100">{users.filter((u) => u.status === 'Active').length} Actifs</p>
                <p className="text-xs text-slate-500">Total comptes: {users.length}</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Charge Serveur / BDD</p>
                <p className="text-lg font-bold text-amber-400">24% CPU • 38% RAM</p>
                <p className="text-xs text-slate-500">Stockage cache: 1.2 GB</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Alertes / Logs Erreurs</p>
                <p className="text-lg font-bold text-rose-400">{systemLogs.filter((l) => l.level === 'ERROR').length} Erreurs</p>
                <p className="text-xs text-slate-500">Dernier scan: Aujourd'hui</p>
              </div>
            </div>
          </div>

          {/* System Logs Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-slate-100 text-base">Journal de Supervision Système (Logs)</h3>
                <p className="text-xs text-slate-400">Événements techniques, authentifications et erreurs en temps réel</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Filtrer:</span>
                {['ALL', 'INFO', 'WARNING', 'ERROR'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setLogFilter(lvl)}
                    className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                      logFilter === lvl
                        ? 'bg-slate-700 text-white border border-slate-600'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3">Horodatage</th>
                    <th className="p-3">Niveau</th>
                    <th className="p-3">Module / Service</th>
                    <th className="p-3">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-slate-400">{log.timestamp}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.level === 'ERROR'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : log.level === 'WARNING'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {log.level}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300 font-bold">{log.service}</td>
                      <td className="p-3 text-slate-200">{log.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: User Access Management (CRUD Data Table) */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Gestion des Accès & Rôles Utilisateurs</h3>
              <p className="text-xs text-slate-400">Créer des comptes, réinitialiser les accès et assigner les privilèges</p>
            </div>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              Créer un Compte
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono">
                <tr>
                  <th className="p-3">Utilisateur</th>
                  <th className="p-3">Identifiant</th>
                  <th className="p-3">Rôle Assigné</th>
                  <th className="p-3">Service / Département</th>
                  <th className="p-3">Dernière Connexion</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-200">{usr.name}</td>
                    <td className="p-3 font-mono text-slate-400">@{usr.username}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-rose-300 border border-rose-500/20 capitalize">
                        {usr.role}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{usr.department}</td>
                    <td className="p-3 text-slate-400 font-mono text-[11px]">{usr.lastLogin}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          usr.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {usr.status === 'Active' ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => alert(`Mot de passe réinitialisé pour ${usr.name}`)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 text-[11px] inline-flex items-center gap-1 border border-slate-700"
                        title="Réinitialiser le mot de passe"
                      >
                        <Key className="w-3 h-3" />
                        Reset Pwd
                      </button>
                      <button
                        onClick={() => updateUserStatus(usr.id, usr.status === 'Active' ? 'Inactive' : 'Active')}
                        className={`px-2 py-1 rounded text-[11px] inline-flex items-center gap-1 border ${
                          usr.status === 'Active'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        }`}
                      >
                        {usr.status === 'Active' ? 'Désactiver' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Global Hospital Settings */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-rose-400" />
              Informations Générales de l'Hôpital
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nom de l'Établissement</label>
                <input
                  type="text"
                  defaultValue={hospitalSettings.name}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Code Établissement</label>
                  <input
                    type="text"
                    defaultValue={hospitalSettings.code}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Capacité Totale de Lits</label>
                  <input
                    type="number"
                    defaultValue={hospitalSettings.totalBeds}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adresse Physiques</label>
                <input
                  type="text"
                  defaultValue={hospitalSettings.address}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Téléphone</label>
                  <input
                    type="text"
                    defaultValue={hospitalSettings.phone}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email de contact</label>
                  <input
                    type="email"
                    defaultValue={hospitalSettings.email}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <button
                onClick={() => alert('Paramètres sauvegardés avec succès!')}
                className="w-full bg-rose-600 hover:bg-rose-500 text-white font-medium py-2 rounded-lg transition-all"
              >
                Enregistrer les Modifications
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              Services & Spécialités Médicales
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Services Actifs ({hospitalSettings.departments.length})</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  {hospitalSettings.departments.map((dept, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-md border border-slate-700 font-medium">
                      {dept}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Spécialités Disponibles ({hospitalSettings.specialties.length})</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  {hospitalSettings.specialties.map((spec, i) => (
                    <span key={i} className="px-2.5 py-1 bg-slate-800 text-indigo-300 rounded-md border border-indigo-500/20 font-medium">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Backup Console */}
      {activeTab === 'backups' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-rose-400" />
                Console de Sauvegarde & Restauration
              </h3>
              <p className="text-xs text-slate-400">
                Déclencher un dump complet de la base de données PostgreSQL / MySQL et consulter l'historique
              </p>
            </div>

            <button
              onClick={triggerBackup}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
            >
              <RefreshCw className="w-4 h-4" />
              Déclencher un Dump de BDD
            </button>
          </div>

          {/* Backup History */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Historique des Sauvegardes</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3">Fichier Dump</th>
                    <th className="p-3">Taille</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Date / Heure</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {backups.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/40">
                      <td className="p-3 text-slate-200 font-bold flex items-center gap-2">
                        <HardDrive className="w-4 h-4 text-blue-400" />
                        {b.filename}
                      </td>
                      <td className="p-3 text-slate-400">{b.size}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                          {b.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{b.timestamp}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => alert(`Téléchargement de ${b.filename} démarré.`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded text-[11px] inline-flex items-center gap-1 border border-slate-700"
                        >
                          <Download className="w-3 h-3" />
                          Télécharger
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
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Créer un nouveau compte utilisateur</h3>

            <form onSubmit={handleAddUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nom & Prénom</label>
                <input
                  type="text"
                  required
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  placeholder="Ex: Dr. Moussa Camara"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Identifiant (Username)</label>
                <input
                  type="text"
                  required
                  value={newUserForm.username}
                  onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                  placeholder="Ex: mcamara"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Rôle Système</label>
                <select
                  value={newUserForm.role}
                  onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as Role })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500 capitalize"
                >
                  <option value="consultation">Médecin / Clinique</option>
                  <option value="nursing">Infirmier(ère)</option>
                  <option value="reception">Réceptionniste</option>
                  <option value="laboratory">Laborantin</option>
                  <option value="pharmacy">Pharmacien</option>
                  <option value="billing">Caissier</option>
                  <option value="management">Directeur</option>
                  <option value="admin">Admin Système</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Département</label>
                <input
                  type="text"
                  value={newUserForm.department}
                  onChange={(e) => setNewUserForm({ ...newUserForm, department: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500 font-medium"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
