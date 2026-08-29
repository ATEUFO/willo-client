import React, { useState, useEffect } from 'react'
import {
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Server,
  Network,
  Save,
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  X,
  Search,
  Check
} from 'lucide-react'
import { useHospitalStore } from '../store/hospitalStore'

interface ServerInfo {
  name: string
  host: string
  port: number
  caFingerprint: string
}

interface ConnectionsPageProps {
  onBack?: () => void
  onClose?: () => void
}

export const ConnectionsPage: React.FC<ConnectionsPageProps> = ({ onBack, onClose }) => {
  const {
    isOnline,
    lastSyncedAt,
    pendingCacheSync,
    loadAllData
  } = useHospitalStore()

  const [activeTab, setActiveTab] = useState<'status' | 'manual' | 'bonjour' | 'subnet'>('status')
  
  // Current Configuration
  const [currentConfig, setCurrentConfig] = useState<{ host: string; port: string; posteId: string } | null>(null)
  
  // Manual Fields
  const [manualHost, setManualHost] = useState('')
  const [manualPort, setManualPort] = useState('')
  
  // Connection Testing State
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; siteName?: string; error?: string } | null>(null)
  
  // Ping State
  const [pingTime, setPingTime] = useState<number | null>(null)
  const [isPinging, setIsPinging] = useState(false)

  // Discovery State
  const [discoveredServers, setDiscoveredServers] = useState<ServerInfo[]>([])
  const [isDiscovering, setIsDiscovering] = useState(false)

  // Subnet Scanning State
  const [scannedServers, setScannedServers] = useState<ServerInfo[]>([])
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  // Load current configuration on mount
  useEffect(() => {
    const fetchConfig = async () => {
      if (window.api && window.api.sync) {
        try {
          const config = await window.api.sync.getServerConfig()
          setCurrentConfig(config)
          setManualHost(config.host)
          setManualPort(config.port)
          
          // Trigger initial ping if online
          if (isOnline) {
            performPing(config.host, config.port)
          }
        } catch (err) {
          console.error('Failed to get server config:', err)
        }
      }
    }
    fetchConfig()
  }, [])

  const performPing = async (host: string, port: string) => {
    setIsPinging(true)
    const start = Date.now()
    try {
      if (window.api && window.api.sync) {
        const res = await window.api.sync.testConnection({ host, port })
        if (res.success) {
          setPingTime(Date.now() - start)
        } else {
          setPingTime(null)
        }
      } else {
        setPingTime(null)
      }
    } catch {
      setPingTime(null)
    } finally {
      setIsPinging(false)
    }
  }

  const handleTestConnection = async () => {
    if (!manualHost || !manualPort) return
    setIsTesting(true)
    setTestResult(null)
    try {
      if (window.api && window.api.sync) {
        const res = await window.api.sync.testConnection({ host: manualHost, port: manualPort })
        setTestResult(res)
      }
    } catch (err) {
      setTestResult({
        success: false,
        error: err instanceof Error ? err.message : String(err)
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSaveConfiguration = async (host: string, port: string) => {
    try {
      if (window.api && window.api.sync) {
        await window.api.sync.updateServerConfig({ host, port })
        const updatedConfig = await window.api.sync.getServerConfig()
        setCurrentConfig(updatedConfig)
        setManualHost(updatedConfig.host)
        setManualPort(updatedConfig.port)
        
        // Show success alert
        setTestResult({
          success: true,
          siteName: 'Config sauvegardée'
        })
        
        // Refresh local data & ping
        setTimeout(() => {
          loadAllData()
          performPing(host, port)
        }, 1000)
      }
    } catch (err) {
      alert(`Erreur lors de la sauvegarde : ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  const startBonjourDiscovery = async () => {
    setIsDiscovering(true)
    setDiscoveredServers([])
    try {
      if (window.api && window.api.discovery) {
        const servers = await window.api.discovery.discover(4000)
        setDiscoveredServers(servers || [])
      }
    } catch (err) {
      console.error('Bonjour discovery failed:', err)
    } finally {
      setIsDiscovering(false)
    }
  }

  const startSubnetScan = async () => {
    setIsScanning(true)
    setScannedServers([])
    setScanProgress(0)

    // Simulate progress bar since the scanning takes a bit of time
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    try {
      if (window.api && window.api.discovery) {
        const servers = await window.api.discovery.scanSubnet()
        setScannedServers(servers || [])
        setScanProgress(100)
      }
    } catch (err) {
      console.error('Subnet scanning failed:', err)
    } finally {
      clearInterval(interval)
      setIsScanning(false)
    }
  }

  const triggerForceSync = async () => {
    if (window.api && window.api.sync) {
      try {
        await window.api.sync.triggerDeltas()
        loadAllData()
      } catch (err) {
        console.error('Force sync failed:', err)
      }
    }
  }

  return (
    <div className="min-h-screen bg-medical-lightBg flex flex-col p-4 sm:p-6 select-none selection:bg-medical-primary selection:text-white font-sans animate-fade-in">
      <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl border border-medical-border shadow-xl overflow-hidden flex flex-col flex-1">
        {/* Header */}
        <div className="border-b border-medical-border px-6 py-4 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                title="Retour à l'authentification"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Network className="w-5 h-5 text-medical-primary" />
                Configuration Réseau & Connexions
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Gérer la communication locale avec Willo Server
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Area with Sidebar Tabs */}
        <div className="flex flex-col md:flex-row flex-1 min-h-[450px]">
          {/* Tabs Sidebar */}
          <div className="w-full md:w-56 border-r border-medical-border bg-slate-50/50 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible shrink-0">
            <button
              onClick={() => setActiveTab('status')}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all w-full text-left shrink-0 cursor-pointer ${
                activeTab === 'status'
                  ? 'bg-medical-subtle text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4 shrink-0" />
              Statut & Diagnostic
            </button>

            <button
              onClick={() => setActiveTab('manual')}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all w-full text-left shrink-0 cursor-pointer ${
                activeTab === 'manual'
                  ? 'bg-medical-subtle text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Save className="w-4 h-4 shrink-0" />
              Configuration Manuelle
            </button>

            <button
              onClick={() => {
                setActiveTab('bonjour')
                startBonjourDiscovery()
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all w-full text-left shrink-0 cursor-pointer ${
                activeTab === 'bonjour'
                  ? 'bg-medical-subtle text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Wifi className="w-4 h-4 shrink-0" />
              Recherche Automatique
            </button>

            <button
              onClick={() => setActiveTab('subnet')}
              className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-bold rounded-xl transition-all w-full text-left shrink-0 cursor-pointer ${
                activeTab === 'subnet'
                  ? 'bg-medical-subtle text-emerald-800 border border-emerald-200 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Search className="w-4 h-4 shrink-0" />
              Scanner Réseau (mDNS Fallback)
            </button>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Tab: Status */}
            {activeTab === 'status' && (
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase border-b pb-2">
                  État de la connexion
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Remote Server Card */}
                  <div className="border border-medical-border rounded-xl p-4 bg-slate-50 flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl ${isOnline ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                      <Server className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serveur Distant</p>
                      <h3 className="text-xs font-bold text-slate-700">
                        {currentConfig?.host}:{currentConfig?.port}
                      </h3>
                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className={`text-[11px] font-bold ${isOnline ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isOnline ? 'En ligne (WebSocket Connecté)' : 'Mode Hors Ligne (Déconnecté)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Latency Card */}
                  <div className="border border-medical-border rounded-xl p-4 bg-slate-50 flex items-start gap-3.5">
                    <div className={`p-3 rounded-xl ${isOnline && pingTime !== null ? 'bg-indigo-500/10 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Latence (Ping)</p>
                      <h3 className="text-xs font-bold text-slate-700">
                        {isPinging ? 'Calcul en cours...' : pingTime !== null ? `${pingTime} ms` : 'N/A (Déconnecté)'}
                      </h3>
                      <button
                        onClick={() => currentConfig && performPing(currentConfig.host, currentConfig.port)}
                        disabled={isPinging || !currentConfig}
                        className="text-[11px] font-bold text-medical-primary hover:underline flex items-center gap-1 transition-all mt-1 disabled:opacity-50 cursor-pointer"
                      >
                        <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                        Rafraîchir
                      </button>
                    </div>
                  </div>
                </div>

                {/* Local sync card */}
                <div className="border border-medical-border rounded-xl p-5 bg-white space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <Database className="w-4 h-4 text-medical-primary" />
                      <div>
                        <h3 className="text-xs font-bold text-slate-700">Base de Données Locale (SQLite)</h3>
                        <p className="text-[11px] text-slate-500">Dernière synchronisation incrémentale : {lastSyncedAt || 'Jamais'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono bg-medical-subtle text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      Offline-First
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-600">
                        Modifications locales en attente :{' '}
                        <span className={pendingCacheSync > 0 ? 'text-amber-600' : 'text-emerald-600'}>
                          {pendingCacheSync}
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {pendingCacheSync > 0
                          ? 'Ces requêtes seront envoyées automatiquement dès la reconnexion.'
                          : 'Aucune donnée en attente de synchronisation.'}
                      </p>
                    </div>
                    {isOnline && (
                      <button
                        onClick={triggerForceSync}
                        className="px-3 py-1.5 bg-medical-subtle border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                        Synchroniser maintenant
                      </button>
                    )}
                  </div>
                </div>

                {/* Client / Workstation ID Details */}
                <div className="text-[11px] font-mono text-slate-400 bg-slate-50 p-3 rounded-xl border border-medical-border space-y-1">
                  <p><span className="font-bold text-slate-600">ID Unique du Poste (UUID) :</span> {currentConfig?.posteId || 'N/A'}</p>
                  <p><span className="font-bold text-slate-600">Type de client :</span> Electron Client (React + TypeScript + better-sqlite3)</p>
                  <p className="text-[10px] text-slate-400/80 mt-1 italic">
                    Cet identifiant est communiqué à Willo Server (en-tête X-Poste-Id) pour garantir la traçabilité des dossiers médicaux.
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Manual Config */}
            {activeTab === 'manual' && (
              <div className="space-y-6">
                <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase border-b pb-2">
                  Configuration IP Manuelle
                </h2>

                <div className="space-y-4 max-w-md">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Adresse IP / Hôte</label>
                      <input
                        type="text"
                        value={manualHost}
                        onChange={(e) => setManualHost(e.target.value)}
                        placeholder="ex: 192.168.1.50"
                        className="w-full px-3 py-2 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-medical-primary focus:bg-white transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">Port</label>
                      <input
                        type="text"
                        value={manualPort}
                        onChange={(e) => setManualPort(e.target.value)}
                        placeholder="ex: 5030"
                        className="w-full px-3 py-2 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-medical-primary focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleTestConnection}
                      disabled={isTesting || !manualHost || !manualPort}
                      className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isTesting ? 'Vérification...' : 'Tester la connexion'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveConfiguration(manualHost, manualPort)}
                      disabled={!manualHost || !manualPort}
                      className="px-4 py-2 bg-medical-primary hover:bg-medical-hover text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Appliquer & Enregistrer
                    </button>
                  </div>

                  {/* Connection Test Results */}
                  {testResult && (
                    <div className={`p-4 rounded-xl border text-xs flex gap-3 ${
                      testResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}>
                      {testResult.success ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="font-bold">Connexion établie avec succès !</p>
                            <p className="text-[11px] text-emerald-700/90 mt-0.5">
                              Serveur identifié : <span className="font-bold">{testResult.siteName}</span>
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                          <div>
                            <p className="font-bold">Échec de la connexion</p>
                            <p className="text-[11px] text-rose-700/90 mt-0.5">{testResult.error}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Bonjour Discovery */}
            {activeTab === 'bonjour' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                    Découverte locale (Bonjour / mDNS)
                  </h2>
                  <button
                    onClick={startBonjourDiscovery}
                    disabled={isDiscovering}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDiscovering ? 'animate-spin' : ''}`} />
                    Rechercher
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Le protocole <strong>ZeroConf / Bonjour</strong> recherche automatiquement les services Willo (<code>_willo._tcp</code>) 
                  publiés sur votre réseau local. Aucun paramétrage manuel d'adresse IP n'est requis si le multicast réseau est autorisé.
                </p>

                {isDiscovering ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-medical-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-500">Recherche de serveurs sur le réseau local...</p>
                  </div>
                ) : discoveredServers.length === 0 ? (
                  <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                    <WifiOff className="w-8 h-8 text-slate-300 mx-auto" />
                    <h3 className="text-xs font-bold text-slate-500">Aucun serveur Willo détecté</h3>
                    <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                      Vérifiez que le serveur Willo est démarré sur le même réseau local ou tentez le scan de secours.
                    </p>
                  </div>
                ) : (
                  <div className="border border-medical-border rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-medical-border">
                          <th className="px-4 py-2.5">Nom du Centre</th>
                          <th className="px-4 py-2.5">Adresse IP / Hôte</th>
                          <th className="px-4 py-2.5">Port</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discoveredServers.map((server, idx) => {
                          const isCurrent = currentConfig && currentConfig.host === server.host && String(currentConfig.port) === String(server.port)
                          return (
                            <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-700 flex items-center gap-1.5">
                                <Server className="w-3.5 h-3.5 text-medical-primary" />
                                {server.name}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-600">{server.host}</td>
                              <td className="px-4 py-3 font-mono text-slate-500">{server.port}</td>
                              <td className="px-4 py-3 text-right">
                                {isCurrent ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg mr-2">
                                    <Check className="w-3 h-3" /> Connecté
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSaveConfiguration(server.host, String(server.port))}
                                    className="px-2.5 py-1 bg-medical-primary hover:bg-medical-hover text-white text-[11px] font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                                  >
                                    Connecter
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Subnet Scanning */}
            {activeTab === 'subnet' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b pb-2">
                  <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">
                    Scanner de réseau local (mDNS Fallback)
                  </h2>
                  <button
                    onClick={startSubnetScan}
                    disabled={isScanning}
                    className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                    Scanner
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                  Si la multidiffusion mDNS est bloquée par votre pare-feu ou votre commutateur, le scanner vérifie 
                  chaque adresse de la plage réseau locale de classe C (port <code>5030</code>) pour identifier 
                  le serveur de secours.
                </p>

                {isScanning && (
                  <div className="space-y-3 bg-slate-50 p-4 border border-medical-border rounded-xl">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-600">Scan du réseau local en cours...</span>
                      <span className="font-bold text-slate-500 font-mono">{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-medical-primary h-full transition-all duration-300 shadow-xs"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400 italic">Vérification de la plage IP active (environ 5-10 secondes)...</p>
                  </div>
                )}

                {!isScanning && scannedServers.length === 0 && (
                  <div className="py-12 border border-dashed border-slate-200 rounded-xl text-center space-y-2 bg-slate-50/50">
                    <Search className="w-8 h-8 text-slate-300 mx-auto" />
                    <h3 className="text-xs font-bold text-slate-500">Aucun serveur trouvé via scan IP</h3>
                    <p className="text-[10px] text-slate-400 max-w-sm mx-auto">
                      Cliquez sur <strong>Scanner</strong> pour sonder le réseau local de classe C et trouver Willo Server.
                    </p>
                  </div>
                )}

                {!isScanning && scannedServers.length > 0 && (
                  <div className="border border-medical-border rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-medical-border">
                          <th className="px-4 py-2.5">Nom du Centre</th>
                          <th className="px-4 py-2.5">Adresse IP / Hôte</th>
                          <th className="px-4 py-2.5">Port</th>
                          <th className="px-4 py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scannedServers.map((server, idx) => {
                          const isCurrent = currentConfig && currentConfig.host === server.host && String(currentConfig.port) === String(server.port)
                          return (
                            <tr key={idx} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-700 flex items-center gap-1.5">
                                <Server className="w-3.5 h-3.5 text-medical-primary" />
                                {server.name}
                              </td>
                              <td className="px-4 py-3 font-mono text-slate-600">{server.host}</td>
                              <td className="px-4 py-3 font-mono text-slate-500">{server.port}</td>
                              <td className="px-4 py-3 text-right">
                                {isCurrent ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg mr-2">
                                    <Check className="w-3 h-3" /> Connecté
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSaveConfiguration(server.host, String(server.port))}
                                    className="px-2.5 py-1 bg-medical-primary hover:bg-medical-hover text-white text-[11px] font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                                  >
                                    Connecter
                                  </button>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
