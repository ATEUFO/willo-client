import React, { useEffect, useState } from 'react'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { StatusBar } from './components/layout/StatusBar'
import { useHospitalStore } from './pages/store/hospitalStore'
import { LoginPage } from './pages/auth/login'
import { SigninPage } from './pages/auth/signin'
import { ConnectionsPage } from './pages/connections/ConnectionsPage'
import { AdminPage } from './pages/admin/AdminPage'
import { ReceptionPage } from './pages/reception/ReceptionPage'
import { NursingPage } from './pages/nursing/NursingPage'
import { ConsultationPage } from './pages/consultation/ConsultationPage'
import { LaboratoryPage } from './pages/laboratory/LaboratoryPage'
import { PharmacyPage } from './pages/pharmacy/PharmacyPage'
import { BillingPage } from './pages/billing/BillingPage'
import { ManagementPage } from './pages/management/ManagementPage'
import { hasModuleAccess, getAllowedModules } from './config/permissions'
import { ShieldAlert } from 'lucide-react'
import willoLogo from './assets/willo_logo1.png'

function App(): React.JSX.Element {
  const {
    isAuthenticated,
    isLoadingSession,
    currentUser,
    currentRole,
    setRole,
    checkAuthSession,
    showConnectionsModal,
    setShowConnectionsModal
  } = useHospitalStore()
  const [authView, setAuthView] = useState<'login' | 'signin' | 'connections'>('login')

  useEffect(() => {
    checkAuthSession()
  }, [])

  // Auto reset active module if user role changes or currentUser is not allowed to view currentRole module
  useEffect(() => {
    if (currentUser && !hasModuleAccess(currentUser.role, currentRole)) {
      const allowed = getAllowedModules(currentUser.role)
      if (allowed.length > 0) {
        setRole(allowed[0])
      }
    }
  }, [currentUser, currentRole])

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
    if (authView === 'connections') {
      return <ConnectionsPage onBack={() => setAuthView('login')} />
    }
    return (
      <LoginPage
        onSwitchToSignin={() => setAuthView('signin')}
        onOpenConnections={() => setAuthView('connections')}
      />
    )
  }

  const renderActiveModule = () => {
    // Guard check: User role permission
    if (currentUser && !hasModuleAccess(currentUser.role, currentRole)) {
      return (
        <div className="p-12 text-center max-w-xl mx-auto space-y-4 my-12">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
          <h2 className="text-xl font-bold text-slate-800">Accès Réstreint / Non Autorisé</h2>
          <p className="text-sm text-slate-600">
            Votre rôle actuel (<span className="font-bold text-slate-900">{currentUser.role}</span>) n'a pas les droits requis pour accéder au module sélectionné.
          </p>
          <button
            onClick={() => setRole(currentUser.role)}
            className="px-4 py-2 bg-medical-primary text-white text-xs font-bold rounded-xl shadow-md hover:bg-emerald-600 transition-all"
          >
            Retourner à mon espace principal
          </button>
        </div>
      )
    }

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
    <div className="h-screen bg-medical-lightBg text-slate-900 flex flex-col font-sans selection:bg-medical-primary selection:text-white overflow-hidden relative">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto pb-6">{renderActiveModule()}</main>
      </div>
      <StatusBar />

      {showConnectionsModal && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <ConnectionsPage onClose={() => setShowConnectionsModal(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default App
