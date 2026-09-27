import React, { useState, useMemo, useEffect } from 'react'
import {
  Activity,
  Heart,
  Thermometer,
  Weight,
  Syringe,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Stethoscope,
  Brain,
  Plus,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Phone
} from 'lucide-react'
import { useHospitalStore, Patient, ConsultationRecord } from '../store/hospitalStore'
import { useTranslation } from 'react-i18next'
import { VitalsFormModal } from './components/VitalsFormModal'
import { ConsultationFormModal } from './components/ConsultationFormModal'
import { ConsultationDetailsModal } from './components/ConsultationDetailsModal'

export const MedicalPage: React.FC = () => {
  const { t } = useTranslation('medical')
  const {
    patients,
    vitals,
    consultations,
    labRequests,
    addVitals,
    addConsultation,
    currentUser,
    setRole
  } = useHospitalStore()

  // Layout & Filter States
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('list')
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Collapsed doctor sections
  const [collapsedDoctors, setCollapsedDoctors] = useState<Record<string, boolean>>({})

  // Modal States
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [viewingConsultation, setViewingConsultation] = useState<ConsultationRecord | null>(null)

  // Get active selected patient
  const activePatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || null
  }, [patients, selectedPatientId])

  // Select first patient automatically on load if none selected
  useEffect(() => {
    if (!selectedPatientId && patients.length > 0) {
      setSelectedPatientId(patients[0].id)
    }
  }, [patients, selectedPatientId])

  // List of all unique assigned doctors in patients list + logged in user if doctor
  const doctorList = useMemo(() => {
    const docs = new Set<string>()
    patients.forEach((p) => {
      if (p.assignedDoctor && p.assignedDoctor.trim() !== '' && p.assignedDoctor !== 'Non assigné') {
        docs.add(p.assignedDoctor)
      }
    })
    if (currentUser?.role === 'consultation' && currentUser.name) {
      docs.add(currentUser.name)
    }
    return Array.from(docs)
  }, [patients, currentUser])

  // Filter patients by search query and doctor filter
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patientCode.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (selectedDoctorFilter !== 'all') {
        const doc = p.assignedDoctor && p.assignedDoctor.trim() !== '' ? p.assignedDoctor : t('directory.noDoctor')
        return doc === selectedDoctorFilter
      }

      return true
    })
  }, [patients, searchQuery, selectedDoctorFilter, t])

  // Group filtered patients by their assigned doctor
  const groupedPatients = useMemo(() => {
    const groups: Record<string, Patient[]> = {}
    filteredPatients.forEach((p) => {
      const doc = p.assignedDoctor && p.assignedDoctor.trim() !== '' ? p.assignedDoctor : t('directory.noDoctor')
      if (!groups[doc]) {
        groups[doc] = []
      }
      groups[doc].push(p)
    })
    return groups
  }, [filteredPatients, t])

  // Toggle doctor collapse
  const toggleDoctorCollapse = (docName: string) => {
    setCollapsedDoctors((prev) => ({
      ...prev,
      [docName]: !prev[docName]
    }))
  }

  // Active patient data
  const activePatientVitals = useMemo(() => {
    if (!activePatient) return []
    return vitals
      .filter((v) => v.patientId === activePatient.id)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [vitals, activePatient])

  const latestVitals = activePatientVitals[0] || null

  const activePatientConsultations = useMemo(() => {
    if (!activePatient) return []
    return consultations
      .filter((c) => c.patientId === activePatient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [consultations, activePatient])

  const activePatientLabs = useMemo(() => {
    if (!activePatient) return []
    return labRequests.filter((l) => l.patientId === activePatient.id)
  }, [labRequests, activePatient])

  // Status Badge styling helper
  const getStatusBadge = (status: Patient['status']) => {
    const configs: Record<Patient['status'], { bg: string; text: string; label: string }> = {
      Waiting: { bg: 'bg-amber-50 border-amber-200 text-amber-800', text: 'text-amber-600', label: t('statuses.waiting') },
      'Vitals Taken': { bg: 'bg-blue-50 border-blue-200 text-blue-800', text: 'text-blue-600', label: t('statuses.vitalsTaken') },
      'In Consultation': { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', text: 'text-emerald-600', label: t('statuses.inConsultation') },
      'Lab Pending': { bg: 'bg-purple-50 border-purple-200 text-purple-800', text: 'text-purple-600', label: t('statuses.labPending') },
      'Pharmacy Pending': { bg: 'bg-pink-50 border-pink-200 text-pink-800', text: 'text-pink-600', label: t('statuses.pharmacyPending') },
      Completed: { bg: 'bg-slate-100 border-slate-300 text-slate-700', text: 'text-slate-500', label: t('statuses.completed') }
    }
    const conf = configs[status] || { bg: 'bg-slate-50 border-slate-200 text-slate-800', text: 'text-slate-600', label: status }
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${conf.bg}`}>
        {conf.label}
      </span>
    )
  }

  return (
    <div className="flex h-[calc(100vh-4.25rem)] overflow-hidden bg-medical-lightBg font-sans select-none">
      {/* LEFT PANEL: Grouped Patient Directory */}
      <div className="w-96 border-r border-medical-border bg-white flex flex-col h-full shrink-0 shadow-xs">
        {/* Directory Controls */}
        <div className="p-4 border-b border-medical-border space-y-3 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-4 h-4 text-medical-primary" />
              {t('directory.title')}
            </h2>
            <div className="flex items-center bg-white rounded-lg border border-medical-border p-0.5 shadow-xs">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${layoutMode === 'grid'
                    ? 'bg-medical-primary text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                title={t('directory.gridTooltip')}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${layoutMode === 'list'
                    ? 'bg-medical-primary text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-600'
                  }`}
                title={t('directory.listTooltip')}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('directory.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-medical-border rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-medical-primary focus:ring-1 focus:ring-medical-primary transition-all shadow-2xs"
            />
          </div>

          {/* Doctor Filter Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium whitespace-nowrap">{t('directory.filterDoctorLabel')}</span>
            <select
              value={selectedDoctorFilter}
              onChange={(e) => setSelectedDoctorFilter(e.target.value)}
              className="flex-1 bg-white border border-medical-border rounded-lg p-1.5 text-slate-700 focus:outline-none focus:border-medical-primary text-[11px] font-semibold"
            >
              <option value="all">{t('directory.allDoctors')}</option>
              {doctorList.map((doc) => (
                <option key={doc} value={doc}>
                  {doc}
                </option>
              ))}
              <option value={t('directory.noDoctor')}>{t('directory.noDoctor')}</option>
            </select>
          </div>
        </div>

        {/* Directory List grouped by Doctor */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Object.keys(groupedPatients).length > 0 ? (
            Object.entries(groupedPatients).map(([docName, docPatients]) => {
              const isCollapsed = collapsedDoctors[docName] || false
              return (
                <div key={docName} className="space-y-2">
                  {/* Doctor Group Header */}
                  <div
                    onClick={() => toggleDoctorCollapse(docName)}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <Stethoscope className="w-3.5 h-3.5 text-medical-primary" />
                      <span className="text-[11px] font-bold text-slate-700 truncate max-w-[200px]">
                        {docName}
                      </span>
                      <span className="bg-medical-primary text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        {docPatients.length}
                      </span>
                    </div>
                    {isCollapsed ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>

                  {/* Patients under Doctor */}
                  {!isCollapsed && (
                    <div
                      className={
                        layoutMode === 'grid'
                          ? 'grid grid-cols-2 gap-2'
                          : 'space-y-1.5'
                      }
                    >
                      {docPatients.map((p) => {
                        const isActive = p.id === selectedPatientId
                        return (
                          <div
                            key={p.id}
                            onClick={() => setSelectedPatientId(p.id)}
                            className={`rounded-xl border p-2.5 cursor-pointer text-left transition-all ${isActive
                                ? 'bg-medical-subtle border-emerald-300 shadow-xs'
                                : 'bg-white border-medical-border hover:border-slate-300 hover:bg-slate-50/50'
                              }`}
                          >
                            <h4 className="font-bold text-xs text-slate-800 truncate" title={p.name}>
                              {p.name}
                            </h4>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {p.gender === 'M' ? t('directory.male') : t('directory.female')}, {t('directory.yearsOld', { age: p.age })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })
          ) : (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <User className="w-8 h-8 mx-auto stroke-1" />
              <p className="text-xs">{t('directory.noPatients')}</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: Patient Electronic Health Record */}
      <div className="flex-1 overflow-y-auto bg-medical-lightBg flex flex-col h-full">
        {activePatient ? (
          <div className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
            {/* EHR Header / Patient Info Strip */}
            <div className="bg-medical-cardBg rounded-2xl border border-medical-border p-5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-medical-primary via-emerald-400 to-medical-primary" />

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-medical-subtle border border-emerald-200 text-medical-primary font-bold text-lg flex items-center justify-center shadow-2xs">
                  {activePatient.gender}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-slate-900">{activePatient.name}</h1>
                    {getStatusBadge(activePatient.status)}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                    <span>
                      Code: <strong className="text-slate-800 font-mono">{activePatient.patientCode}</strong>
                    </span>
                    <span>•</span>
                    <span>{t('directory.yearsOld', { age: activePatient.age })}</span>
                    <span>•</span>
                    <span><strong className="text-emerald-700 font-semibold">{t('ehr.bloodType', { type: activePatient.bloodType })}</strong></span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {activePatient.phone}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 justify-end">
                <button
                  onClick={() => setRole('ai-diagnostic')}
                  className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-emerald-200" />
                  {t('ehr.aiBtn')}
                </button>
                <button
                  onClick={() => setIsVitalsModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 hover:text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-medical-primary" />
                  {t('ehr.vitalsBtn')}
                </button>
                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="px-3.5 py-2 bg-medical-primary hover:bg-medical-hover text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  {t('ehr.newConsultationBtn')}
                </button>
              </div>
            </div>

            {/* SECTION 1: Personal Parameters & Vitals */}
            <div className="bg-medical-cardBg rounded-2xl border border-medical-border p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-medical-border pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-medical-primary" />
                  {t('vitalsSection.title')}
                </h3>
                {latestVitals && (
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {t('vitalsSection.lastRecorded', { time: latestVitals.timestamp })}
                  </span>
                )}
              </div>

              {latestVitals ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                    {/* Tension */}
                    <div
                      className={`p-3.5 rounded-xl border flex flex-col justify-between ${latestVitals.systolic > 140 || latestVitals.diastolic > 90 || latestVitals.systolic < 90
                          ? 'bg-red-50/70 border-red-200 text-red-900 shadow-2xs'
                          : 'bg-slate-50 border-medical-border'
                        }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-medical-danger" /> {t('vitalsSection.tension')}
                      </span>
                      <div className="mt-2.5">
                        <span className="text-base font-bold font-mono">
                          {latestVitals.systolic}/{latestVitals.diastolic}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">mmHg (120/80 ref)</span>
                      </div>
                    </div>

                    {/* Température */}
                    <div
                      className={`p-3.5 rounded-xl border flex flex-col justify-between ${latestVitals.temperature > 38.0 || latestVitals.temperature < 35.5
                          ? 'bg-amber-50/70 border-amber-200 text-amber-900 shadow-2xs'
                          : 'bg-slate-50 border-medical-border'
                        }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-amber-500" /> {t('vitalsSection.temp')}
                      </span>
                      <div className="mt-2.5">
                        <span className="text-base font-bold font-mono">
                          {latestVitals.temperature}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">°C (36.5 - 37.5 ref)</span>
                      </div>
                    </div>

                    {/* Pouls */}
                    <div
                      className={`p-3.5 rounded-xl border flex flex-col justify-between ${latestVitals.pulse > 100 || latestVitals.pulse < 55
                          ? 'bg-red-50/70 border-red-200 text-red-900 shadow-2xs'
                          : 'bg-slate-50 border-medical-border'
                        }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-medical-primary" /> {t('vitalsSection.pulse')}
                      </span>
                      <div className="mt-2.5">
                        <span className="text-base font-bold font-mono">
                          {latestVitals.pulse}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">BPM (60 - 100 ref)</span>
                      </div>
                    </div>

                    {/* Saturation SpO2 */}
                    <div
                      className={`p-3.5 rounded-xl border flex flex-col justify-between ${latestVitals.spO2 < 95
                          ? 'bg-red-50/70 border-red-200 text-red-900 shadow-2xs'
                          : 'bg-slate-50 border-medical-border'
                        }`}
                    >
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-cyan-600" /> {t('vitalsSection.spO2')}
                      </span>
                      <div className="mt-2.5">
                        <span className="text-base font-bold font-mono">
                          {latestVitals.spO2}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">SpO2 (&gt;95% ref)</span>
                      </div>
                    </div>

                    {/* Poids */}
                    <div className="p-3.5 rounded-xl border border-medical-border bg-slate-50 flex flex-col justify-between">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Weight className="w-3.5 h-3.5 text-blue-500" /> {t('vitalsSection.weight')}
                      </span>
                      <div className="mt-2.5">
                        <span className="text-base font-bold font-mono">
                          {latestVitals.weight}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">kg</span>
                      </div>
                    </div>
                  </div>

                  {/* Nurse Notes box */}
                  {latestVitals.nurseNotes && (
                    <div className="bg-slate-50 border border-medical-border p-3.5 rounded-xl text-xs space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        {t('vitalsSection.nurseNotes')}
                      </span>
                      <p className="text-slate-700 italic font-medium leading-relaxed">
                        "{latestVitals.nurseNotes}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                  <Activity className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                  <p className="text-xs text-slate-500 font-semibold">
                    {t('vitalsSection.noVitalsRecorded')}
                  </p>
                  <button
                    onClick={() => setIsVitalsModalOpen(true)}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-all shadow-3xs cursor-pointer"
                  >
                    {t('vitalsSection.addVitalsBtn')}
                  </button>
                </div>
              )}
            </div>

            {/* SECTION 2: Medical File & Labs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dossier Médical - General Info */}
              <div className="bg-medical-cardBg rounded-2xl border border-medical-border p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-medical-border pb-3">
                  <FileText className="w-4 h-4 text-medical-primary" />
                  {t('historySection.title')}
                </h3>

                <div className="space-y-3.5">
                  {/* Allergies Card */}
                  <div className="p-3 bg-red-50/50 border border-red-200/70 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-medical-danger uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> {t('historySection.allergiesTitle')}
                    </span>
                    <p className="text-xs text-slate-700 font-bold pl-5">
                      {activePatient.emergencyContact?.toLowerCase().includes('allergie')
                        ? activePatient.emergencyContact
                        : t('historySection.allergiesDefault')}
                    </p>
                  </div>

                  {/* Medical History */}
                  <div className="p-3 bg-slate-50 border border-medical-border rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      {t('historySection.historyTitle')}
                    </span>
                    <ul className="text-xs text-slate-700 list-disc pl-4 space-y-1 font-medium">
                      <li>{t('historySection.htn')}</li>
                      <li>{t('historySection.cardio')}</li>
                      <li>{t('historySection.address', { address: activePatient.address || 'Non spécifiée' })}</li>
                      <li>{t('historySection.contact', { contact: activePatient.emergencyContact || 'Non spécifié' })}</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Lab Request Summary */}
              <div className="bg-medical-cardBg rounded-2xl border border-medical-border p-5 space-y-4 shadow-xs">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-medical-border pb-3">
                  <Syringe className="w-4 h-4 text-medical-primary" />
                  {t('labsSection.title', { count: activePatientLabs.length })}
                </h3>

                <div className="space-y-2 overflow-y-auto max-h-[170px] pr-1">
                  {activePatientLabs.length > 0 ? (
                    activePatientLabs.map((lab) => (
                      <div
                        key={lab.id}
                        className="p-3 bg-slate-50 border border-medical-border rounded-xl flex items-center justify-between text-xs transition-colors hover:bg-slate-100/50"
                      >
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 block">
                            {lab.testName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {lab.category} • {lab.dateRequested}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${lab.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                        >
                          {lab.status === 'Completed' ? t('labsSection.validated') : t('labsSection.pending')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {t('labsSection.noLabs')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Consultation History Table */}
            <div className="bg-medical-cardBg rounded-2xl border border-medical-border p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-medical-border pb-3">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-medical-primary" />
                  {t('consultationsSection.title')}
                </h3>
                <button
                  onClick={() => setIsConsultationModalOpen(true)}
                  className="px-2.5 py-1 bg-medical-subtle border border-emerald-200 hover:bg-emerald-200/50 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> {t('consultationsSection.newBtn')}
                </button>
              </div>

              {activePatientConsultations.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-medical-border">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-mono border-b border-medical-border">
                      <tr>
                        <th className="p-3">{t('consultationsSection.columns.date')}</th>
                        <th className="p-3">{t('consultationsSection.columns.doctor')}</th>
                        <th className="p-3">{t('consultationsSection.columns.chiefComplaint')}</th>
                        <th className="p-3">{t('consultationsSection.columns.diagnosis')}</th>
                        <th className="p-3 text-right">{t('consultationsSection.columns.details')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-medical-border text-slate-700 font-medium">
                      {activePatientConsultations.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/50 transition-colors animate-fade-in">
                          <td className="p-3 font-mono text-slate-500 whitespace-nowrap">
                            {c.date}
                          </td>
                          <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                            {c.doctorName}
                          </td>
                          <td className="p-3 max-w-xs truncate" title={c.chiefComplaint}>
                            {c.chiefComplaint}
                          </td>
                          <td className="p-3">
                            <div className="flex flex-wrap gap-1">
                              {c.diagnoses && c.diagnoses.map((diag, index) => (
                                <span
                                  key={index}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] text-slate-700 font-medium"
                                >
                                  {diag.split(' - ')[0]}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => setViewingConsultation(c)}
                              className="px-2 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 hover:text-slate-800 text-[11px] font-bold rounded-lg flex items-center gap-1 transition-all cursor-pointer ml-auto"
                            >
                              <FileText className="w-3.5 h-3.5 text-medical-primary" />
                              {t('consultationsSection.detailsBtn')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                  <Stethoscope className="w-8 h-8 text-slate-400 mx-auto stroke-1" />
                  <p className="text-xs text-slate-500 font-semibold">
                    {t('consultationsSection.noConsultations')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
            <Brain className="w-16 h-16 text-slate-300 animate-pulse stroke-1" />
            <div>
              <h2 className="text-base font-bold text-slate-700">{t('ehr.noPatientSelectedTitle')}</h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                {t('ehr.noPatientSelectedSub')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: ADD VITALS (PRENDRE CONSTANTES) */}
      {isVitalsModalOpen && activePatient && (
        <VitalsFormModal
          patient={activePatient}
          onClose={() => setIsVitalsModalOpen(false)}
          onSave={(vitalsData) => {
            addVitals({
              patientId: activePatient.id,
              patientName: activePatient.name,
              ...vitalsData
            })
            setIsVitalsModalOpen(false)
          }}
        />
      )}

      {/* MODAL 2: ADD CONSULTATION */}
      {isConsultationModalOpen && activePatient && (
        <ConsultationFormModal
          patient={activePatient}
          doctorName={currentUser?.name || activePatient?.assignedDoctor || 'Médecin de garde'}
          onClose={() => setIsConsultationModalOpen(false)}
          onSave={(consultData) => {
            addConsultation({
              patientId: activePatient.id,
              patientName: activePatient.name,
              ...consultData
            })
            setIsConsultationModalOpen(false)
          }}
        />
      )}

      {/* MODAL 3: VIEW CONSULTATION DETAILS */}
      {viewingConsultation && (
        <ConsultationDetailsModal
          consultation={viewingConsultation}
          onClose={() => setViewingConsultation(null)}
        />
      )}
    </div>
  )
}
