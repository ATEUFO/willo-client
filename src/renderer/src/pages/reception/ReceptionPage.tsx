import React, { useState } from 'react'
import {
  UserCheck,
  Search,
  UserPlus,
  Calendar,
  Clock,
  ChevronRight,
  Phone,
  Heart
} from 'lucide-react'
import { useHospitalStore } from '../../store/hospitalStore'

export const ReceptionPage: React.FC = () => {
  const {
    patients,
    appointments,
    addPatient,
    updatePatientStatus,
    addAppointment,
    cancelAppointment
  } = useHospitalStore()

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'calendar' | 'patients'>('queue')
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddPatientModal, setShowAddPatientModal] = useState(false)
  const [showAddAppModal, setShowAddAppModal] = useState(false)

  // Patient registration form
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: 30,
    gender: 'M' as 'M' | 'F',
    phone: '',
    address: '',
    bloodType: 'O+',
    emergencyContact: '',
    assignedDoctor: 'Dr. Sarah Kouassi'
  })

  // Appointment form
  const [newApp, setNewApp] = useState({
    patientId: '',
    doctorName: 'Dr. Sarah Kouassi',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    department: 'Médecine Générale',
    type: 'Consultation' as 'Consultation' | 'Suivi' | 'Urgence' | 'Contrôle'
  })

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery)
  )

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatient.name || !newPatient.phone) return
    const created = addPatient(newPatient)
    setShowAddPatientModal(false)
    setNewPatient({
      name: '',
      age: 30,
      gender: 'M',
      phone: '',
      address: '',
      bloodType: 'O+',
      emergencyContact: '',
      assignedDoctor: 'Dr. Sarah Kouassi'
    })
    alert(`Patient ${created.name} enregistré avec le code ${created.patientCode}!`)
  }

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault()
    const selectedPat = patients.find((p) => p.id === newApp.patientId)
    if (!selectedPat) return
    addAppointment({
      patientId: selectedPat.id,
      patientName: selectedPat.name,
      doctorName: newApp.doctorName,
      date: newApp.date,
      time: newApp.time,
      department: newApp.department,
      type: newApp.type
    })
    setShowAddAppModal(false)
    alert(`Rendez-vous confirmé pour ${selectedPat.name}!`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-sky-400" />
            Accueil, Triage & File d'Attente
          </h2>
          <p className="text-sm text-slate-400">
            Rapidité de saisie, prise de rendez-vous et enregistrement des dossiers patients
          </p>
        </div>

        {/* Rapid Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-sky-500 shadow-inner"
            />
          </div>

          <button
            onClick={() => setShowAddPatientModal(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau Patient
          </button>
        </div>
      </div>

      {/* Mode Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
            activeSubTab === 'queue' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          File d'Attente Temps Réel ({patients.filter((p) => p.status !== 'Completed').length})
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
            activeSubTab === 'calendar' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Planning & Rendez-vous ({appointments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('patients')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 ${
            activeSubTab === 'patients' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          Annuaire des Patients ({patients.length})
        </button>
      </div>

      {/* SubTab 1: Queue View */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Patients en Salle d'Attente</p>
                <p className="text-xl font-bold text-slate-100">{patients.filter((p) => p.status === 'Waiting').length} Patients</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Prise de Constantes en Cours</p>
                <p className="text-xl font-bold text-emerald-400">{patients.filter((p) => p.status === 'Vitals Taken').length} Patients</p>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400">En Consultation Médicale</p>
                <p className="text-xl font-bold text-indigo-400">{patients.filter((p) => p.status === 'In Consultation').length} Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-100 text-base">File d'Attente Générale de l'Accueil</h3>

            <div className="grid grid-cols-1 gap-3">
              {filteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex flex-col items-center justify-center text-sky-400">
                      <span className="text-[10px] font-mono text-slate-400">TICKET</span>
                      <span className="font-bold text-xs">{pat.queueNumber}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">{pat.name}</span>
                        <span className="text-xs text-slate-400">({pat.gender}, {pat.age} ans)</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-sky-300">
                          {pat.patientCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {pat.phone}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-500" /> Arrivé à {pat.arrivalTime}</span>
                        <span className="text-indigo-400 font-medium">{pat.assignedDoctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pat.status === 'Waiting'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                          : pat.status === 'Vitals Taken'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : pat.status === 'In Consultation'
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {pat.status === 'Waiting'
                        ? 'En Attente'
                        : pat.status === 'Vitals Taken'
                        ? 'Constantes Prises'
                        : pat.status === 'In Consultation'
                        ? 'En Consultation'
                        : pat.status}
                    </span>

                    {pat.status === 'Waiting' && (
                      <button
                        onClick={() => updatePatientStatus(pat.id, 'Vitals Taken')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1"
                      >
                        Envoyer aux Constantes <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SubTab 2: Calendar & Appointments */}
      {activeSubTab === 'calendar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-semibold text-slate-100 text-base">Planning Interactif des Rendez-Vous</h3>
              <p className="text-xs text-slate-400">Prise, modification et annulation de consultations programmées</p>
            </div>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="bg-sky-600 hover:bg-sky-500 text-white px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Fixer un Rendez-vous
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Médecin</th>
                  <th className="p-3">Département</th>
                  <th className="p-3">Date & Heure</th>
                  <th className="p-3">Motif / Type</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-200">{app.patientName}</td>
                    <td className="p-3 text-indigo-300 font-medium">{app.doctorName}</td>
                    <td className="p-3 text-slate-400">{app.department}</td>
                    <td className="p-3 font-mono text-slate-300">
                      {app.date} à <span className="text-sky-400 font-bold">{app.time}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px]">
                        {app.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'Confirmed'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : app.status === 'Cancelled'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {app.status === 'Confirmed' ? 'Confirmé' : app.status === 'Cancelled' ? 'Annulé' : 'Programmé'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {app.status !== 'Cancelled' && (
                        <button
                          onClick={() => cancelAppointment(app.id)}
                          className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded text-[11px]"
                        >
                          Annuler
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubTab 3: Full Patient Registry */}
      {activeSubTab === 'patients' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-100 text-base">Annuaire des Dossiers Patients</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((p) => (
              <div key={p.id} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-slate-100 text-sm">{p.name}</span>
                  <span className="font-mono text-xs text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {p.patientCode}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong className="text-slate-300">Âge / Sexe:</strong> {p.age} ans ({p.gender}) • <strong className="text-slate-300">Groupe Sanguin:</strong> {p.bloodType}</p>
                  <p><strong className="text-slate-300">Téléphone:</strong> {p.phone}</p>
                  <p><strong className="text-slate-300">Adresse:</strong> {p.address}</p>
                  <p><strong className="text-slate-300">Contact Urgence:</strong> {p.emergencyContact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Patient */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Création Rapide de Dossier Patient</h3>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Nom & Prénom</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="Ex: Ibrahima Faye"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="+221 77 000 00 00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Âge</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Sexe</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'M' | 'F' })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Groupe Sanguin</label>
                  <select
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Adresse Habituelle</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Dakar, Sacré-Cœur"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Contact d'Urgence</label>
                <input
                  type="text"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                  placeholder="Nom et numéro de téléphone du proche"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 font-medium"
                >
                  Enregistrer & Ajouter à la File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Add Appointment */}
      {showAddAppModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Fixer un Rendez-vous Médical</h3>

            <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Patient</label>
                <select
                  required
                  value={newApp.patientId}
                  onChange={(e) => setNewApp({ ...newApp, patientId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                >
                  <option value="">-- Sélectionner un patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newApp.date}
                    onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Heure</label>
                  <input
                    type="time"
                    value={newApp.time}
                    onChange={(e) => setNewApp({ ...newApp, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Médecin Assigné</label>
                <input
                  type="text"
                  value={newApp.doctorName}
                  onChange={(e) => setNewApp({ ...newApp, doctorName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-500 font-medium"
                >
                  Confirmer le Rendez-vous
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
