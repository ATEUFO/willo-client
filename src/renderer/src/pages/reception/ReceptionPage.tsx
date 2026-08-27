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
import { useHospitalStore } from '../store/hospitalStore'

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-medical-primary" />
            Accueil, Triage & File d'Attente
          </h2>
          <p className="text-sm text-slate-500">
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
              className="w-full bg-white border border-medical-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary shadow-xs"
            />
          </div>

          <button
            onClick={() => setShowAddPatientModal(true)}
            className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Nouveau Patient
          </button>
        </div>
      </div>

      {/* Mode Sub-tabs */}
      <div className="flex items-center gap-2 border-b border-medical-border pb-2">
        <button
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSubTab === 'queue'
              ? 'bg-medical-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-medical-border'
            }`}
        >
          <Clock className="w-3.5 h-3.5" />
          File d'Attente Temps Réel ({patients.filter((p) => p.status !== 'Completed').length})
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSubTab === 'calendar'
              ? 'bg-medical-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-medical-border'
            }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          Planning & Rendez-vous ({appointments.length})
        </button>
        <button
          onClick={() => setActiveSubTab('patients')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSubTab === 'patients'
              ? 'bg-medical-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-medical-border'
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
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-600 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Patients en Salle d'Attente</p>
                <p className="text-xl font-bold text-amber-600">{patients.filter((p) => p.status === 'Waiting').length} Patients</p>
              </div>
            </div>
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 bg-medical-subtle border border-emerald-200 text-emerald-800 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Prise de Constantes en Cours</p>
                <p className="text-xl font-bold text-emerald-700">{patients.filter((p) => p.status === 'Vitals Taken').length} Patients</p>
              </div>
            </div>
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">En Consultation Médicale</p>
                <p className="text-xl font-bold text-blue-700">{patients.filter((p) => p.status === 'In Consultation').length} Patients</p>
              </div>
            </div>
          </div>

          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-medical-dark text-base">File d'Attente Générale de l'Accueil</h3>

            <div className="grid grid-cols-1 gap-3">
              {filteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  className="bg-white border border-medical-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-medical-subtle border border-emerald-200 flex flex-col items-center justify-center text-emerald-800">
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold">TICKET</span>
                      <span className="font-bold text-xs">{pat.queueNumber}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{pat.name}</span>
                        <span className="text-xs text-slate-500">({pat.gender}, {pat.age} ans)</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {pat.patientCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {pat.phone}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> Arrivé à {pat.arrivalTime}</span>
                        <span className="text-medical-dark font-medium">{pat.assignedDoctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${pat.status === 'Waiting'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : pat.status === 'Vitals Taken'
                            ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                            : pat.status === 'In Consultation'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600'
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
                        className="px-3.5 py-1.5 rounded-xl bg-medical-primary hover:bg-medical-hover text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors"
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
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-bold text-medical-dark text-base">Planning Interactif des Rendez-Vous</h3>
              <p className="text-xs text-slate-500">Prise, modification et annulation de consultations programmées</p>
            </div>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Calendar className="w-4 h-4" />
              Fixer un Rendez-vous
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
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
              <tbody className="divide-y divide-medical-border text-slate-700">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{app.patientName}</td>
                    <td className="p-3 text-medical-dark font-medium">{app.doctorName}</td>
                    <td className="p-3 text-slate-600">{app.department}</td>
                    <td className="p-3 font-mono text-slate-700">
                      {app.date} à <span className="text-medical-primary font-bold">{app.time}</span>
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {app.type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${app.status === 'Confirmed'
                            ? 'bg-medical-subtle text-emerald-800 border border-emerald-200'
                            : app.status === 'Cancelled'
                              ? 'bg-red-50 text-medical-danger border border-red-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                      >
                        {app.status === 'Confirmed' ? 'Confirmé' : app.status === 'Cancelled' ? 'Annulé' : 'Programmé'}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {app.status !== 'Cancelled' && (
                        <button
                          onClick={() => cancelAppointment(app.id)}
                          className="px-2.5 py-1 bg-red-50 border border-red-200 text-medical-danger hover:bg-red-100 rounded-lg text-[11px] font-medium"
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
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-medical-dark text-base">Annuaire des Dossiers Patients</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((p) => (
              <div key={p.id} className="bg-white border border-medical-border rounded-xl p-4 space-y-2 hover:border-slate-300 transition-all shadow-xs">
                <div className="flex items-center justify-between border-b border-medical-border pb-2">
                  <span className="font-bold text-slate-900 text-sm">{p.name}</span>
                  <span className="font-mono text-xs text-emerald-800 bg-medical-subtle px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    {p.patientCode}
                  </span>
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p><strong className="text-slate-700">Âge / Sexe:</strong> {p.age} ans ({p.gender}) • <strong className="text-slate-700">Groupe Sanguin:</strong> {p.bloodType}</p>
                  <p><strong className="text-slate-700">Téléphone:</strong> {p.phone}</p>
                  <p><strong className="text-slate-700">Adresse:</strong> {p.address}</p>
                  <p><strong className="text-slate-700">Contact Urgence:</strong> {p.emergencyContact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add Patient */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-medical-border rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-medical-dark">Création Rapide de Dossier Patient</h3>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nom & Prénom</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder="Ex: Ibrahima Faye"
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder="+221 77 000 00 00"
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Âge</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Sexe</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'M' | 'F' })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  >
                    <option value="M">Masculin (M)</option>
                    <option value="F">Féminin (F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Groupe Sanguin</label>
                  <select
                    value={newPatient.bloodType}
                    onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
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
                <label className="block text-slate-600 font-medium mb-1">Adresse Habituelle</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder="Dakar, Sacré-Cœur"
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Contact d'Urgence</label>
                <input
                  type="text"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                  placeholder="Nom et numéro de téléphone du proche"
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-medical-border rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-medical-dark">Fixer un Rendez-vous Médical</h3>

            <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Patient</label>
                <select
                  required
                  value={newApp.patientId}
                  onChange={(e) => setNewApp({ ...newApp, patientId: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
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
                  <label className="block text-slate-600 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={newApp.date}
                    onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Heure</label>
                  <input
                    type="time"
                    value={newApp.time}
                    onChange={(e) => setNewApp({ ...newApp, time: e.target.value })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Médecin Assigné</label>
                <input
                  type="text"
                  value={newApp.doctorName}
                  onChange={(e) => setNewApp({ ...newApp, doctorName: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm"
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
