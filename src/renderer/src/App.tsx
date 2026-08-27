import React from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { useHospitalStore } from './store/hospitalStore'
import { AdminPage } from './pages/admin/AdminPage'
import { ReceptionPage } from './pages/reception/ReceptionPage'
import { NursingPage } from './pages/nursing/NursingPage'
import { ConsultationPage } from './pages/consultation/ConsultationPage'
import { LaboratoryPage } from './pages/laboratory/LaboratoryPage'
import { PharmacyPage } from './pages/pharmacy/PharmacyPage'
import { BillingPage } from './pages/billing/BillingPage'
import { ManagementPage } from './pages/management/ManagementPage'

function App(): React.JSX.Element {
  const { currentRole } = useHospitalStore()

  const renderActiveModule = () => {
    switch (currentRole) {
      case 'admin':
        return <AdminPage />
      case 'reception':
        return <ReceptionPage />
      case 'nursing':
        return <NursingPage />
      case 'consultation':
        return <ConsultationPage />
      case 'laboratory':
        return <LaboratoryPage />
      case 'pharmacy':
        return <PharmacyPage />
      case 'billing':
        return <BillingPage />
      case 'management':
        return <ManagementPage />
      default:
        return <AdminPage />
    }
  }

  return (
    <div className="h-screen bg-medical-lightBg text-slate-900 flex flex-col font-sans selection:bg-medical-primary selection:text-white overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-6">{renderActiveModule()}</main>
      </div>
      <StatusBar />
    </div>
  )
}

export default App
