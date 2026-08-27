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
import { useHospitalStore } from '../store/hospitalStore'

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
  { name: 'Urgences', count: 320, color: '#EF4444' },
  { name: 'Médecine Générale', count: 540, color: '#00C853' },
  { name: 'Cardiologie', count: 210, color: '#0A192F' },
  { name: 'Pédiatrie', count: 380, color: '#10B981' },
  { name: 'Gynécologie', count: 190, color: '#8B5CF6' }
]

const recoveryMortalityData = [
  { name: 'Guéris / Sorties', value: 94.2, color: '#00C853' },
  { name: 'Transferts', value: 4.3, color: '#F59E0B' },
  { name: 'Décès', value: 1.5, color: '#EF4444' }
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
            className="bg-medical-primary hover:bg-medical-hover text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Export PDF
          </button>

          <button
            onClick={handleExportExcel}
            className="bg-medical-subtle text-emerald-800 border border-emerald-200 hover:bg-emerald-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Revenu Mensuel Cumulé</span>
            <DollarSign className="w-4 h-4 text-medical-primary" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">19,800,000 F</p>
          <span className="text-[11px] text-emerald-800 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3 text-medical-primary" /> +13.1% vs mois précédent
          </span>
        </div>

        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Fréquentation Mensuelle</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono">640 Patients</p>
          <span className="text-[11px] text-blue-700 font-semibold">+8.4% de nouvelles admissions</span>
        </div>

        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Taux de Guérison / Sorties</span>
            <HeartPulse className="w-4 h-4 text-medical-primary" />
          </div>
          <p className="text-2xl font-bold text-emerald-800 font-mono">94.2%</p>
          <span className="text-[11px] text-slate-500">Mortalité hospitalière : 1.5%</span>
        </div>

        <div className="bg-medical-cardBg border border-medical-border p-4 rounded-xl space-y-1 shadow-sm">
          <div className="flex justify-between items-center text-slate-500 text-xs font-medium">
            <span>Temps d'Attente Moyen</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700 font-mono">18 min</p>
          <span className="text-[11px] text-emerald-800 font-semibold">-4 min grâce au triage Willo</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Revenue Evolution Curve */}
        <div className="bg-medical-cardBg border border-medical-border rounded-xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-medical-dark text-base">Évolution des Revenus Hospitaliers (F CFA)</h3>
            <p className="text-xs text-slate-500">Progression mensuelle des encaissements globaux</p>
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#0F172A' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#00C853" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#0F172A' }}
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
            <h3 className="font-bold text-medical-dark text-base">Issue des Patients (Guérisons vs Mortalité)</h3>
            <p className="text-xs text-slate-500">Répartition en pourcentage des fins de séjour</p>
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
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '12px', fontSize: '12px', color: '#0F172A' }}
                />
                <Legend formatter={(value) => <span style={{ color: '#334155', fontSize: '11px', fontWeight: 600 }}>{value}</span>} />
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
            <p className="text-xs text-slate-500">Point de vue global sur la santé financière et opérationnelle</p>
          </div>

          <div className="space-y-3 text-xs text-slate-700">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-medical-border">
              <strong className="text-medical-dark block mb-1">Occupation de la Capacité Lits :</strong>
              L'établissement enregistre {hospitalSettings.occupiedBeds} lits occupés sur {hospitalSettings.totalBeds} ({Math.round((hospitalSettings.occupiedBeds / hospitalSettings.totalBeds) * 100)}% de taux d'occupation).
            </div>

            <div className="bg-medical-subtle p-3.5 rounded-xl border border-emerald-200">
              <strong className="text-emerald-900 block mb-1">Rendement Pharmaceutique & Labo :</strong>
              La pharmacie et le laboratoire génèrent 58% du chiffre d'affaires récurrent de l'hôpital.
            </div>

            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
              <strong className="text-amber-800 block mb-1">Recommandations d'Amélioration :</strong>
              Augmenter le stock d'Antibiotiques pour anticiper la hausse de fréquentation du service Pédiatrie.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
