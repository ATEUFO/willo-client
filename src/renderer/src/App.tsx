import React from 'react'
import { Navbar } from './components/layout/Navbar'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      <Navbar />
      <main className="flex-1 pb-10">{renderActiveModule()}</main>
    </div>
  )
}

export default App
