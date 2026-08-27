import React, { useState } from 'react'
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
  Activity
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
import { useHospitalStore } from '../../store/hospitalStore'

// Chart Data Mock
const monthlyRevenueData = [
  { month: 'Jan', revenue: 12500000, consultations: 420 },
  { month: 'Fév', revenue: 14200000, consultations: 480 },
  { month: 'Mar', revenue: 13800000, consultations: 460 },
  { month: 'Avr', revenue: 16100000, consultations: 530 },
  { month: 'Mai', revenue: 17500000, consultations: 590 },
  { month: 'Juin', revenue: 19800000, consultations: 640 },
  { month: 'Juil', revenue: 18400000, consultations: 610 },
  { month: 'Août', revenue: 21000000, consultations: 710 }
]

const departmentAttendanceData = [
  { name: 'Urgences', count: 320, color: '#f43f5e' },
  { name: 'Médecine Générale', count: 540, color: '#38bdf8' },
  { name: 'Cardiologie', count: 210, color: '#818cf8' },
  { name: 'Pédiatrie', count: 380, color: '#34d399' },
  { name: 'Gynécologie', count: 190, color: '#c084fc' }
]

const recoveryMortalityData = [
  { name: 'Guéris / Sorties', value: 94.2, color: '#10b981' },
  { name: 'Transferts', value: 4.3, color: '#f59e0b' },
  { name: 'Décès', value: 1.5, color: '#ef4444' }
]

export const ManagementPage: React.FC = () => {
  const { hospitalSettings } = useHospitalStore()

  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-06')

  const handleExportPDF = () => {
    alert(`Génération du rapport exécutif PDF pour la période ${selectedPeriod} en cours...`)
  }

  const handleExportExcel = () => {
    alert(`Exportation des données statistiques brutes en fichier Excel (.xlsx) terminée!`)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            Espace Décisionnel & Direction Hospitalière
          </h2>
          <p className="text-sm text-slate-400">
            Tableaux de bord analytiques, indicateurs de performance et générateur de rapports statistiques
          </p>
        </div>

        {/* Report Generator Controls */}
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <span>Période:</span>
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-950 text-slate-100 font-mono px-2.5 py-1 rounded-lg border border-slate-700 focus:outline-none"
            />
          </div>

          <button
            onClick={handleExportPDF}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <FileText className="w-3.5 h-3.5" /> Export PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Revenu Mensuel Cumulé</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">19,800,000 F</p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> +13.1% vs mois précédent
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Fréquentation Mensuelle</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 font-mono">640 Patients</p>
          <span className="text-[11px] text-sky-400 font-semibold">+8.4% de nouvelles admissions</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Taux de Guérison / Sorties</span>
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">94.2%</p>
          <span className="text-[11px] text-slate-500">Mortalité hospitalière: 1.5%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Temps d'Attente Moyen</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 font-mono">18 min</p>
          <span className="text-[11px] text-emerald-400 font-semibold">-4 min grâce au triage Willo</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Evolution Curve */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Évolution des Revenus Hospitaliers (F CFA)</h3>
            <p className="text-xs text-slate-400">Progression mensuelle des encaissements globaux</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Attendance per Department BarChart */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Fréquentation par Service Médical</h3>
            <p className="text-xs text-slate-400">Volume de consultations enregistrées par département</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentAttendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
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
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base">Issue des Patients (Guérisons vs Mortalité)</h3>
            <p className="text-xs text-slate-400">Répartition en pourcentage des fins de séjour</p>
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
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#cbd5e1', fontSize: '11px' }}>{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Synthèse Exécutive pour le Conseil d'Administration
            </h3>
            <p className="text-xs text-slate-400">Point de vue global sur la santé financière et opérationnelle</p>
          </div>

          <div className="space-y-3 text-xs text-slate-300">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-cyan-400 block mb-1">Occupation de la Capacité Lit:</strong>
              L'établissement enregistre {hospitalSettings.occupiedBeds} lits occupés sur {hospitalSettings.totalBeds} ({Math.round((hospitalSettings.occupiedBeds/hospitalSettings.totalBeds)*100)}% de taux d'occupation).
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">Rendement Pharmaceutique & Labo:</strong>
              La pharmacie et le laboratoire génèrent 58% du chiffre d'affaires récurrent de l'hôpital.
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <strong className="text-amber-400 block mb-1">Recommandations d'Amélioration:</strong>
              Augmenter le stock d'Antibiotiques pour anticiper la hausse de fréquentation du service Pédiatrie.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
