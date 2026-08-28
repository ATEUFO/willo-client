import React, { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { useHospitalStore } from './pages/store/hospitalStore'
import { LoginPage } from './pages/auth/login'
import { SigninPage } from './pages/auth/signin'
import { AdminPage } from './pages/admin/AdminPage'
import { ReceptionPage } from './pages/reception/ReceptionPage'
import { NursingPage } from './pages/nursing/NursingPage'
import { ConsultationPage } from './pages/consultation/ConsultationPage'
import { LaboratoryPage } from './pages/laboratory/LaboratoryPage'
import { PharmacyPage } from './pages/pharmacy/PharmacyPage'
import { BillingPage } from './pages/billing/BillingPage'
import { ManagementPage } from './pages/management/ManagementPage'
import willoLogo from './assets/willo_logo1.png'

function App(): React.JSX.Element {
  const { isAuthenticated, isLoadingSession, currentRole, checkAuthSession } = useHospitalStore()
  const [authView, setAuthView] = useState<'login' | 'signin'>('login')

  useEffect(() => {
    checkAuthSession()
  }, [])

  if (isLoadingSession) {
    return (
      <div className="h-screen bg-medical-dark flex flex-col items-center justify-center text-white space-y-4 font-sans selection:bg-medical-primary selection:text-white">
        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-xl animate-pulse">
          <img src={willoLogo} alt="WILLO Logo" className="h-14 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-medical-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-300">Initialisation de la base de données SQLite...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    if (authView === 'signin') {
      return <SigninPage onSwitchToLogin={() => setAuthView('login')} />
    }
    return <LoginPage onSwitchToSignin={() => setAuthView('signin')} />
  }

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
        return <ConsultationPage />
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
