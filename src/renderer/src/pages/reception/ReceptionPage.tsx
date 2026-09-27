import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation('reception')
  const { t: tc } = useTranslation('common')
  const {
    patients,
    appointments,
    users,
    addPatient,
    updatePatientStatus,
    addAppointment,
    cancelAppointment,
    showNotification
  } = useHospitalStore()


  const doctorList = React.useMemo(() => {
    return (users || []).filter((u) => u.role === 'consultation')
  }, [users])

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
    assignedDoctor: ''
  })

  // Appointment form
  const [newApp, setNewApp] = useState({
    patientId: '',
    doctorName: '',
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

  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatient.name || !newPatient.phone) return
    const created = await addPatient(newPatient)
    setShowAddPatientModal(false)
    setNewPatient({
      name: '',
      age: 30,
      gender: 'M',
      phone: '',
      address: '',
      bloodType: 'O+',
      emergencyContact: '',
      assignedDoctor: ''
    })
    showNotification(`Patient ${created.name} enregistré avec le code ${created.patientCode}!`, {
      title: t('register.title'),
      type: 'success'
    })
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
    showNotification(`Rendez-vous confirmé pour ${selectedPat.name}!`, {
      title: t('appointments.title'),
      type: 'success'
    })
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Waiting':
        return t('queue.statuses.waiting')
      case 'Vitals Taken':
        return t('queue.statuses.vitalsTaken')
      case 'In Consultation':
        return t('queue.statuses.inConsultation')
      case 'Lab Pending':
        return t('queue.statuses.labPending')
      case 'Pharmacy Pending':
        return t('queue.statuses.pharmacyPending')
      case 'Completed':
        return t('queue.statuses.completed')
      default:
        return status
    }
  }

  const getAppStatusLabel = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return t('appointments.statuses.confirmed')
      case 'Cancelled':
        return t('appointments.statuses.cancelled')
      case 'Scheduled':
      default:
        return t('appointments.statuses.scheduled')
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-medical-primary" />
            {t('headerTitle')}
          </h2>
          <p className="text-sm text-slate-500">
            {t('headerSub')}
          </p>
        </div>

        {/* Rapid Search Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-medical-border rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary shadow-xs"
            />
          </div>

          <button
            onClick={() => setShowAddPatientModal(true)}
            className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            {t('newPatient')}
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
          {t('tabs.queue', { count: patients.filter((p) => p.status !== 'Completed').length })}
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSubTab === 'calendar'
              ? 'bg-medical-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-medical-border'
            }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          {t('tabs.calendar', { count: appointments.length })}
        </button>
        <button
          onClick={() => setActiveSubTab('patients')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${activeSubTab === 'patients'
              ? 'bg-medical-primary text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 bg-white border border-medical-border'
            }`}
        >
          <Search className="w-3.5 h-3.5" />
          {t('tabs.registry', { count: patients.length })}
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
                <p className="text-xs text-slate-500 font-medium">{t('queue.cards.waiting')}</p>
                <p className="text-xl font-bold text-amber-600">{t('queue.cards.count', { count: patients.filter((p) => p.status === 'Waiting').length })}</p>
              </div>
            </div>
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 bg-medical-subtle border border-emerald-200 text-emerald-800 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t('queue.cards.vitals')}</p>
                <p className="text-xl font-bold text-emerald-700">{t('queue.cards.count', { count: patients.filter((p) => p.status === 'Vitals Taken').length })}</p>
              </div>
            </div>
            <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl flex items-center gap-3 shadow-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-600 rounded-xl">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">{t('queue.cards.consultation')}</p>
                <p className="text-xl font-bold text-blue-700">{t('queue.cards.count', { count: patients.filter((p) => p.status === 'In Consultation').length })}</p>
              </div>
            </div>
          </div>

          <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
            <h3 className="font-bold text-medical-dark text-base">{t('queue.title')}</h3>

            <div className="grid grid-cols-1 gap-3">
              {filteredPatients.map((pat) => (
                <div
                  key={pat.id}
                  className="bg-white border border-medical-border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-slate-300 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-medical-subtle border border-emerald-200 flex flex-col items-center justify-center text-emerald-800">
                      <span className="text-[10px] font-mono text-emerald-700 font-semibold">{t('queue.ticket')}</span>
                      <span className="font-bold text-xs">{pat.queueNumber}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{pat.name}</span>
                        <span className="text-xs text-slate-500">({pat.gender === 'M' ? tc('patient.male') : tc('patient.female')}, {pat.age} {t('registry.years')})</span>
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                          {pat.patientCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {pat.phone}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-slate-400" /> {t('queue.arrivedAt', { time: pat.arrivalTime })}</span>
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
                      {getStatusLabel(pat.status)}
                    </span>

                    {pat.status === 'Waiting' && (
                      <button
                        onClick={() => updatePatientStatus(pat.id, 'Vitals Taken')}
                        className="px-3.5 py-1.5 rounded-xl bg-medical-primary hover:bg-medical-hover text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        {t('queue.sendToVitals')} <ChevronRight className="w-3.5 h-3.5" />
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
              <h3 className="font-bold text-medical-dark text-base">{t('appointments.title')}</h3>
              <p className="text-xs text-slate-500">{t('appointments.sub')}</p>
            </div>

            <button
              onClick={() => setShowAddAppModal(true)}
              className="bg-medical-primary hover:bg-medical-hover text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              {t('appointments.book')}
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-medical-border">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                <tr>
                  <th className="p-3">{t('appointments.columns.patient')}</th>
                  <th className="p-3">{t('appointments.columns.doctor')}</th>
                  <th className="p-3">{t('appointments.columns.department')}</th>
                  <th className="p-3">{t('appointments.columns.dateTime')}</th>
                  <th className="p-3">{t('appointments.columns.type')}</th>
                  <th className="p-3">{t('appointments.columns.status')}</th>
                  <th className="p-3 text-right">{t('appointments.columns.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-medical-border text-slate-700">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">{app.patientName}</td>
                    <td className="p-3 text-medical-dark font-medium">{app.doctorName}</td>
                    <td className="p-3 text-slate-600">{app.department}</td>
                    <td className="p-3 font-mono text-slate-700">
                      {app.date} {tc('time.date') === 'Date' ? 'at' : 'à'} <span className="text-medical-primary font-bold">{app.time}</span>
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
                        {getAppStatusLabel(app.status)}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {app.status !== 'Cancelled' && (
                        <button
                          onClick={() => cancelAppointment(app.id)}
                          className="px-2.5 py-1 bg-red-50 border border-red-200 text-medical-danger hover:bg-red-100 rounded-lg text-[11px] font-medium cursor-pointer"
                        >
                          {tc('actions.cancel')}
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
          <h3 className="font-bold text-medical-dark text-base">{t('registry.title')}</h3>

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
                  <p><strong className="text-slate-700">{t('registry.ageGender')}:</strong> {p.age} {t('registry.years')} ({p.gender === 'M' ? tc('patient.male') : tc('patient.female')}) • <strong className="text-slate-700">{tc('patient.bloodType')}:</strong> {p.bloodType}</p>
                  <p><strong className="text-slate-700">{tc('patient.phone')}:</strong> {p.phone}</p>
                  <p><strong className="text-slate-700">{tc('patient.address')}:</strong> {p.address}</p>
                  <p><strong className="text-slate-700">{t('register.emergencyContact')}:</strong> {p.emergencyContact}</p>
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
            <h3 className="text-lg font-bold text-medical-dark">{t('modal.createTitle')}</h3>

            <form onSubmit={handleRegisterPatient} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('register.fullName')}</label>
                  <input
                    type="text"
                    required
                    value={newPatient.name}
                    onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                    placeholder={t('modal.namePlaceholder')}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('register.phone')}</label>
                  <input
                    type="text"
                    required
                    value={newPatient.phone}
                    onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                    placeholder={t('modal.phonePlaceholder')}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('register.age')}</label>
                  <input
                    type="number"
                    value={newPatient.age}
                    onChange={(e) => setNewPatient({ ...newPatient, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('register.gender')}</label>
                  <select
                    value={newPatient.gender}
                    onChange={(e) => setNewPatient({ ...newPatient, gender: e.target.value as 'M' | 'F' })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  >
                    <option value="M">{t('register.male')}</option>
                    <option value="F">{t('register.female')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{t('register.bloodType')}</label>
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
                <label className="block text-slate-600 font-medium mb-1">{t('register.address')}</label>
                <input
                  type="text"
                  value={newPatient.address}
                  onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                  placeholder={t('modal.addressPlaceholder')}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('register.emergencyContact')}</label>
                <input
                  type="text"
                  value={newPatient.emergencyContact}
                  onChange={(e) => setNewPatient({ ...newPatient, emergencyContact: e.target.value })}
                  placeholder={t('modal.emergencyPlaceholder')}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('register.assignedDoctor')}</label>
                <select
                  value={newPatient.assignedDoctor}
                  onChange={(e) => setNewPatient({ ...newPatient, assignedDoctor: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                >
                  <option value="">{t('modal.noDoctor')}</option>
                  {doctorList.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} {doc.department ? `(${doc.department})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddPatientModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  {tc('actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm cursor-pointer"
                >
                  {t('modal.submitAdd')}
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
            <h3 className="text-lg font-bold text-medical-dark">{t('appointments.modalTitle')}</h3>

            <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('appointments.columns.patient')}</label>
                <select
                  required
                  value={newApp.patientId}
                  onChange={(e) => setNewApp({ ...newApp, patientId: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                >
                  <option value="">{t('appointments.selectPatient')}</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.patientCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">{t('appointments.columns.doctor')}</label>
                <select
                  value={newApp.doctorName}
                  onChange={(e) => setNewApp({ ...newApp, doctorName: e.target.value })}
                  className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                >
                  <option value="">{t('appointments.selectDoctor')}</option>
                  {doctorList.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} {doc.department ? `(${doc.department})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{tc('time.date')}</label>
                  <input
                    type="date"
                    value={newApp.date}
                    onChange={(e) => setNewApp({ ...newApp, date: e.target.value })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">{tc('time.time')}</label>
                  <input
                    type="time"
                    value={newApp.time}
                    onChange={(e) => setNewApp({ ...newApp, time: e.target.value })}
                    className="w-full bg-white border border-medical-border rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-medical-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddAppModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 font-medium cursor-pointer"
                >
                  {tc('actions.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-medical-primary hover:bg-medical-hover text-white font-semibold shadow-sm cursor-pointer"
                >
                  {t('appointments.confirmBook')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
