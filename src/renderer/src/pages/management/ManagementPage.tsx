import React, { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  FileSpreadsheet,
  FileText,
  DollarSign,
  Clock,
  HeartPulse,
  Activity,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { useHospitalStore } from '../store/hospitalStore'

export const ManagementPage: React.FC = () => {
  const {
    users,
    patients,
    invoices,
    consultations,
    appointments,
    inventory,
    hospitalSettings
  } = useHospitalStore()

  // Default to current month (YYYY-MM) dynamically
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    return new Date().toISOString().substring(0, 7)
  })

  // Helper to parse period (YYYY-MM) from invoice/consultation date strings (supports "YYYY-MM-DD" and "DD/MM/YYYY")
  const getPeriodFromDate = (dateStr: string) => {
    if (!dateStr) return ''
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-')
      if (parts[0].length === 4) {
        return `${parts[0]}-${parts[1]}` // YYYY-MM
      }
    }
    if (dateStr.includes('/')) {
      const parts = dateStr.split('/')
      if (parts[2] && parts[2].length >= 4) {
        const year = parts[2].substring(0, 4)
        const month = parts[1].padStart(2, '0')
        return `${year}-${month}` // YYYY-MM
      }
    }
    return ''
  }

  // Get previous period (YYYY-MM) helper
  const getPreviousPeriod = (period: string) => {
    const [year, month] = period.split('-').map(Number)
    let prevYear = year
    let prevMonth = month - 1
    if (prevMonth === 0) {
      prevMonth = 12
      prevYear = year - 1
    }
    return `${prevYear}-${String(prevMonth).padStart(2, '0')}`
  }

  const prevPeriod = useMemo(() => getPreviousPeriod(selectedPeriod), [selectedPeriod])

  // --- Real Database KPI Calculations ---

  // KPI 1: Revenu Mensuel Cumulé
  const currentMonthRevenue = useMemo(() => {
    return invoices
      .filter((inv) => getPeriodFromDate(inv.date) === selectedPeriod && inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.subtotal, 0)
  }, [invoices, selectedPeriod])

  const prevMonthRevenue = useMemo(() => {
    return invoices
      .filter((inv) => getPeriodFromDate(inv.date) === prevPeriod && inv.status === 'Paid')
      .reduce((sum, inv) => sum + inv.subtotal, 0)
  }, [invoices, prevPeriod])

  const revenueEvolutionPercent = useMemo(() => {
    if (prevMonthRevenue === 0) {
      return currentMonthRevenue > 0 ? 100 : 0
    }
    return ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100
  }, [currentMonthRevenue, prevMonthRevenue])

  // KPI 2: Fréquentation Mensuelle
  const currentMonthAttendance = useMemo(() => {
    const monthConsultations = consultations.filter((c) => getPeriodFromDate(c.date) === selectedPeriod).length
    const monthAppointments = appointments.filter((a) => getPeriodFromDate(a.date) === selectedPeriod).length
    return monthConsultations + monthAppointments
  }, [consultations, appointments, selectedPeriod])

  const prevMonthAttendance = useMemo(() => {
    const prevConsultations = consultations.filter((c) => getPeriodFromDate(c.date) === prevPeriod).length
    const prevAppointments = appointments.filter((a) => getPeriodFromDate(a.date) === prevPeriod).length
    return prevConsultations + prevAppointments
  }, [consultations, appointments, prevPeriod])

  const attendanceEvolutionPercent = useMemo(() => {
    if (prevMonthAttendance === 0) {
      return currentMonthAttendance > 0 ? 100 : 0
    }
    return ((currentMonthAttendance - prevMonthAttendance) / prevMonthAttendance) * 100
  }, [currentMonthAttendance, prevMonthAttendance])

  // KPI 3: Taux de Guérison & Issues des Patients (Chart 3 PieChart)
  const recoveryMortalityData = useMemo(() => {
    const total = patients.length
    if (total === 0) {
      return [
        { name: 'Guéris / Sorties', value: 0, color: '#00C853' },
        { name: 'En Traitement', value: 0, color: '#3B82F6' },
        { name: 'En Attente', value: 0, color: '#F59E0B' }
      ]
    }

    const completedCount = patients.filter((p) => p.status === 'Completed').length
    const inProgressCount = patients.filter(
      (p) =>
        p.status === 'In Consultation' ||
        p.status === 'Vitals Taken' ||
        p.status === 'Lab Pending' ||
        p.status === 'Pharmacy Pending'
    ).length
    const waitingCount = patients.filter((p) => p.status === 'Waiting').length

    return [
      { name: 'Guéris / Sorties', value: completedCount, color: '#00C853' },
      { name: 'En Traitement', value: inProgressCount, color: '#3B82F6' },
      { name: 'En Attente', value: waitingCount, color: '#F59E0B' }
    ]
  }, [patients])

  const recoveryRate = useMemo(() => {
    if (patients.length === 0) return '0.0'
    const completedCount = patients.filter((p) => p.status === 'Completed').length
    return ((completedCount / patients.length) * 100).toFixed(1)
  }, [patients])

  // KPI 4: Temps d'Attente Moyen
  const waitingPatients = useMemo(() => {
    return patients.filter((p) => p.status === 'Waiting' || p.status === 'Vitals Taken')
  }, [patients])

  const averageWaitingTime = useMemo(() => {
    if (waitingPatients.length === 0) return 0

    let totalMinutes = 0
    let validCount = 0
    const now = new Date()

    waitingPatients.forEach((p) => {
      if (p.arrivalTime) {
        try {
          const [h, m] = p.arrivalTime.split(':').map(Number)
          if (!isNaN(h) && !isNaN(m)) {
            const arrivalDate = new Date()
            arrivalDate.setHours(h, m, 0, 0)
            const diffMs = now.getTime() - arrivalDate.getTime()
            if (diffMs > 0) {
              totalMinutes += Math.floor(diffMs / 60000)
              validCount++
            }
          }
        } catch {}
      }
    })

    if (validCount > 0) {
      return Math.round(totalMinutes / validCount)
    }

    return waitingPatients.length * 5
  }, [waitingPatients])

  // --- Chart 1: Évolution des Revenus Hospitaliers sur 6 Mois ---
  const monthlyRevenueData = useMemo(() => {
    const getPastMonths = (period: string, count: number) => {
      const list: string[] = []
      const [year, month] = period.split('-').map(Number)
      for (let i = count - 1; i >= 0; i--) {
        let m = month - i
        let y = year
        if (m <= 0) {
          m += 12
          y -= 1
        }
        list.push(`${y}-${String(m).padStart(2, '0')}`)
      }
      return list
    }

    const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
    const formatPeriodToMonthName = (periodCode: string) => {
      const parts = periodCode.split('-')
      const m = parseInt(parts[1])
      return MONTH_NAMES[m - 1]
    }

    const pastPeriods = getPastMonths(selectedPeriod, 6)
    return pastPeriods.map((period) => {
      const periodInvoices = invoices.filter(
        (inv) => getPeriodFromDate(inv.date) === period && inv.status === 'Paid'
      )
      const actualRevenue = periodInvoices.reduce((sum, inv) => sum + inv.subtotal, 0)

      const periodConsultationsCount = consultations.filter(
        (c) => getPeriodFromDate(c.date) === period
      ).length

      return {
        month: formatPeriodToMonthName(period),
        revenue: actualRevenue,
        consultations: periodConsultationsCount
      }
    })
  }, [invoices, consultations, selectedPeriod])

  // --- Chart 2: Fréquentation par Service Médical ---
  const departmentAttendanceData = useMemo(() => {
    const departments =
      hospitalSettings.departments && hospitalSettings.departments.length > 0
        ? hospitalSettings.departments
        : ['Médecine Générale', 'Urgences & Réanimation', 'Cardiologie', 'Pédiatrie & Maternité', 'Laboratoire & Biologie']

    const departmentColors: Record<string, string> = {
      'Urgences & Réanimation': '#EF4444',
      'Médecine Générale': '#00C853',
      'Cardiologie': '#0A192F',
      'Pédiatrie & Maternité': '#10B981',
      'Laboratoire & Biologie': '#8B5CF6',
      'Pharmacie Centale': '#F59E0B',
      'Caisse & Admissions': '#3B82F6'
    }

    return departments.map((dept) => {
      const appCount = appointments.filter((app) => app.department === dept).length
      const consCount = consultations.filter((c) => {
        const doctorUser = users.find((u) => u.name === c.doctorName)
        return doctorUser?.department === dept
      }).length
      const totalCount = appCount + consCount

      return {
        name: dept,
        count: totalCount,
        color: departmentColors[dept] || '#10B981'
      }
    })
  }, [appointments, consultations, users, hospitalSettings.departments])

  // Executive Summary Dynamic Metrics
  const activePatientsCount = useMemo(() => {
    return patients.filter((p) => p.status !== 'Completed').length
  }, [patients])

  const bedOccupancyPercent = useMemo(() => {
    const total = hospitalSettings.totalBeds || 100
    return Math.min(100, Math.round((activePatientsCount / total) * 100))
  }, [activePatientsCount, hospitalSettings.totalBeds])

  const pharmLabRevenueShare = useMemo(() => {
    let totalRev = 0
    let pharmLabRev = 0

    invoices.forEach((inv) => {
      if (inv.status === 'Paid') {
        totalRev += inv.subtotal
        if (Array.isArray(inv.items)) {
          inv.items.forEach((item) => {
            if (item.category === 'Pharmacie' || item.category === 'Laboratoire') {
              pharmLabRev += item.amount
            }
          })
        }
      }
    })

    if (totalRev === 0) return 0
    return Math.round((pharmLabRev / totalRev) * 100)
  }, [invoices])

  const lowStockItems = useMemo(() => {
    return inventory.filter(
      (item) => item.stockQuantity <= item.minQuantity || item.status === 'Low Stock' || item.status === 'Out of Stock'
    )
  }, [inventory])

  // Export PDF & Excel handlers
  const handleExportPDF = () => {
    window.print()
  }

  const handleExportExcel = () => {
    let csvContent = 'data:text/csv;charset=utf-8,'
    csvContent += 'Période;Mois;Revenu (FCFA);Consultations\n'
    monthlyRevenueData.forEach((row) => {
      csvContent += `${selectedPeriod};${row.month};${row.revenue};${row.consultations}\n`
    })

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Rapport_Statistique_${selectedPeriod}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-medical-border pb-4">
        <div>
          <h2 className="text-2xl font-bold text-medical-dark flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-medical-primary" />
            Espace Décisionnel & Direction Hospitalière
          </h2>
          <p className="text-sm text-slate-500">
            Tableaux de bord analytiques, indicateurs de performance et générateur de rapports statistiques
          </p>
        </div>

        {/* Report Generator Controls */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-medical-border flex-wrap shadow-sm">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Calendar className="w-3.5 h-3.5 text-medical-primary" />
            <span>Période :</span>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 text-slate-800 font-mono px-2.5 py-1 rounded-lg border border-medical-border focus:outline-none focus:border-medical-primary"
            />
          </div>

          <button
            onClick={handleExportPDF}
            className="bg-medical-primary hover:bg-medical-hover text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" /> Export PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-medical-subtle text-emerald-800 border border-emerald-200 hover:bg-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Revenue */}
        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Revenu Mensuel Cumulé</span>
            <DollarSign className="w-4 h-4 text-medical-primary" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">
            {currentMonthRevenue.toLocaleString('fr-FR')} F
          </p>
          <span
            className={`text-[11px] flex items-center gap-1 font-semibold ${
              revenueEvolutionPercent >= 0 ? 'text-emerald-800' : 'text-red-800'
            }`}
          >
            <TrendingUp
              className={`w-3 h-3 ${revenueEvolutionPercent >= 0 ? 'text-medical-primary' : 'text-red-500'}`}
            />
            {revenueEvolutionPercent >= 0 ? '+' : ''}
            {revenueEvolutionPercent.toFixed(1)}% vs mois précédent
          </span>
        </div>

        {/* Card 2: Attendance */}
        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Fréquentation Mensuelle</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">{currentMonthAttendance} Patients</p>
          <span
            className={`text-[11px] font-semibold ${
              attendanceEvolutionPercent >= 0 ? 'text-blue-700' : 'text-red-700'
            }`}
          >
            {attendanceEvolutionPercent >= 0 ? '+' : ''}
            {attendanceEvolutionPercent.toFixed(1)}% vs mois précédent
          </span>
        </div>

        {/* Card 3: Recovery Rate */}
        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Taux de Guérison / Sorties</span>
            <HeartPulse className="w-4 h-4 text-medical-primary" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 font-mono">{recoveryRate}%</p>
          <span className="text-[11px] text-slate-500">
            Dossiers clôturés sur {patients.length} patient(s)
          </span>
        </div>

        {/* Card 4: Wait Time */}
        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Temps d'Attente Moyen</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 font-mono">{averageWaitingTime} min</p>
          <span className="text-[11px] font-semibold text-slate-600">
            {waitingPatients.length} patient(s) en attente
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Evolution Curve */}
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-medical-dark text-base">Évolution des Revenus Hospitaliers (F CFA)</h3>
            <p className="text-xs text-slate-500">Progression mensuelle des encaissements réels</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C853" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00C853" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A'
                  }}
                  formatter={(value: any) => [`${Number(value).toLocaleString('fr-FR')} F CFA`, 'Revenu']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00C853"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance per Department BarChart */}
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-medical-dark text-base">Fréquentation par Service Médical</h3>
            <p className="text-xs text-slate-500">Volume de consultations enregistrées par département</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A'
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {departmentAttendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Recovery vs Mortality PieChart */}
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-medical-dark text-base">Issue des Patients (Statut des Dossiers)</h3>
            <p className="text-xs text-slate-500">Répartition réelle des séjours hospitaliers</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={recoveryMortalityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {recoveryMortalityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#0F172A'
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#334155', fontSize: '11px', fontWeight: 600 }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-medical-dark text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-medical-primary" />
              Synthèse Exécutive pour le Conseil d'Administration
            </h3>
            <p className="text-xs text-slate-500">Point de vue global basé sur la base de données réelle</p>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-medical-border">
              <strong className="text-medical-dark block mb-1">Occupation de la Capacité Lits :</strong>
              L'établissement enregistre {activePatientsCount} patient(s) actif(s) sur {hospitalSettings.totalBeds || 100} lits de capacité ({bedOccupancyPercent}% de taux d'occupation).
            </div>

            <div className="bg-medical-subtle p-3.5 rounded-xl border border-emerald-200">
              <strong className="text-emerald-900 block mb-1">Rendement Pharmaceutique & Labo :</strong>
              La pharmacie et le laboratoire génèrent {pharmLabRevenueShare}% du chiffre d'affaires récurrent encaissé.
            </div>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <strong className="text-amber-800 block mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Alertes & Recommandations d'Amélioration :
              </strong>
              {lowStockItems.length > 0 ? (
                <span>
                  Alerte Stock : {lowStockItems.map((item) => item.name).join(', ')} en seuil critique. Réapprovisionnement recommandé.
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Tous les stocks de pharmacie et consommables sont à un niveau optimal.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagementPage

