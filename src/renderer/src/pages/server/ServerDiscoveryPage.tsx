import React, { useState, useEffect, useRef } from 'react'
import {
  Wifi, WifiOff, Server, RefreshCw, Search, ArrowRight,
  CheckCircle2, AlertCircle, Network, Keyboard, Check, Zap, Globe, Settings2
} from 'lucide-react'
import willoLogo from '../../assets/willo_logo1.png'
import { useTranslation } from 'react-i18next'

interface ServerInfo { name: string; host: string; port: number; caFingerprint: string }
interface ServerDiscoveryPageProps { onServerSelected: () => void }
type DiscoveryStep = 'idle' | 'scanning' | 'done'
type InputMode = 'auto' | 'manual'

export const ServerDiscoveryPage: React.FC<ServerDiscoveryPageProps> = ({ onServerSelected }) => {
  const { t } = useTranslation('server')

  const [step, setStep] = useState<DiscoveryStep>('idle')
  const [inputMode, setInputMode] = useState<InputMode>('auto')
  const [discoveredServers, setDiscoveredServers] = useState<ServerInfo[]>([])
  const [selectedServer, setSelectedServer] = useState<ServerInfo | null>(null)
  const [manualHost, setManualHost] = useState('')
  const [manualPort, setManualPort] = useState('5030')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; siteName?: string; error?: string } | null>(null)
  const [savedConfig, setSavedConfig] = useState<{ host: string; port: string } | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanPhase, setScanPhase] = useState<'mdns' | 'subnet'>('mdns')
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const init = async () => {
      if (window.api?.sync) {
        try {
          const config = await window.api.sync.getServerConfig()
          if (config?.host) {
            setSavedConfig(config)
            setManualHost(config.host)
            setManualPort(config.port || '5030')
          }
        } catch { /* ignore */ }
      }
      startDiscovery()
    }
    init()
    return () => { if (progressRef.current) clearInterval(progressRef.current) }
  }, [])

  const startDiscovery = async () => {
    setStep('scanning')
    setDiscoveredServers([])
    setSelectedServer(null)
    setTestResult(null)
    setScanProgress(0)
    setScanPhase('mdns')

    if (progressRef.current) clearInterval(progressRef.current)
    progressRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev < 60) return prev + 2.5
        if (prev < 95) return prev + 0.5
        return prev
      })
    }, 100)

    try {
      if (window.api?.discovery) {
        const servers = await window.api.discovery.discover(4000)
        if (servers && servers.length > 0) {
          clearInterval(progressRef.current!)
          setScanProgress(100)
          setDiscoveredServers(servers)
          setSelectedServer(servers[0])
          setStep('done')
          return
        }
        setScanPhase('subnet')
        const scanned = await window.api.discovery.scanSubnet()
        clearInterval(progressRef.current!)
        setScanProgress(100)
        if (scanned && scanned.length > 0) {
          setDiscoveredServers(scanned)
          setSelectedServer(scanned[0])
        }
      }
    } catch (err) {
      clearInterval(progressRef.current!)
      setScanProgress(100)
      console.error('Discovery error:', err)
    }
    setStep('done')
  }

  const handleTestAndSave = async (host: string, port: string): Promise<boolean> => {
    if (!host || !port) return false
    setIsTesting(true)
    setTestResult(null)
    try {
      if (window.api?.sync) {
        const res = await window.api.sync.testConnection({ host, port })
        setTestResult(res)
        if (res.success) {
          await window.api.sync.updateServerConfig({ host, port })
          setSavedConfig({ host, port })
        }
        return res.success
      }
    } catch (err) {
      setTestResult({ success: false, error: err instanceof Error ? err.message : String(err) })
    } finally {
      setIsTesting(false)
    }
    return false
  }

  const handleSelectServer = (server: ServerInfo) => { setSelectedServer(server); setTestResult(null) }

  const handleConfirmAndContinue = async () => {
    if (inputMode === 'manual') {
      if (!manualHost || !manualPort) return
      const ok = await handleTestAndSave(manualHost, manualPort)
      if (ok) onServerSelected()
    } else {
      if (!selectedServer) return
      await handleTestAndSave(selectedServer.host, String(selectedServer.port))
      onServerSelected()
    }
  }

  const handleManualConfirm = async () => { await handleTestAndSave(manualHost, manualPort) }

  const canContinue = inputMode === 'manual' ? Boolean(manualHost && manualPort) : Boolean(selectedServer)
  const isAlreadySaved = (host: string, port: string | number) =>
    savedConfig?.host === host && String(savedConfig?.port) === String(port)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#07111E] via-[#0d1f35] to-[#0a1929] flex flex-col items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      <div className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16, 185, 129, 0.5) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

      <div className="w-full max-w-2xl relative z-10 space-y-5">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 shadow-2xl">
            <img src={willoLogo} alt="WILLO" className="h-14 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">WILLO HOSPITAL</h1>
            <p className="text-xs text-emerald-400/80 font-medium mt-1">{t('subtitle')}</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white/[0.05] backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          {/* Card header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-emerald-500/15 rounded-xl border border-emerald-500/20">
                <Network className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{t('title')}</h2>
                <p className="text-[11px] text-slate-400">{t('subtitle2')}</p>
              </div>
            </div>

            {/* Mode toggle */}
            <div className="flex items-center gap-1 bg-white/10 rounded-xl p-1">
              <button onClick={() => setInputMode('auto')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'auto' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}>
                <Wifi className="w-3.5 h-3.5" />
                {t('modeAuto')}
              </button>
              <button onClick={() => setInputMode('manual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  inputMode === 'manual' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}>
                <Keyboard className="w-3.5 h-3.5" />
                {t('modeManual')}
              </button>
            </div>
          </div>

          {/* Card body */}
          <div className="p-6">
            {/* AUTO MODE */}
            {inputMode === 'auto' && (
              <div className="space-y-4">
                {step === 'scanning' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="font-medium">
                        {scanPhase === 'mdns' ? t('scanning.mdns') : t('scanning.subnet')}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                        <span>{scanPhase === 'mdns' ? t('scanning.mdnsPhase') : t('scanning.subnetPhase')}</span>
                        <span className="font-mono text-emerald-400">{Math.round(scanProgress)}%</span>
                      </div>
                      <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${scanProgress}%` }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[t('scanning.mdnsLabel'), t('scanning.subnetLabel')].map((phase, i) => (
                        <div key={i}
                          className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                            (i === 0 && scanPhase === 'mdns') || (i === 1 && scanPhase === 'subnet')
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                              : i === 0 && scanPhase === 'subnet'
                              ? 'bg-white/5 border-white/10 text-slate-500 line-through opacity-50'
                              : 'bg-white/5 border-white/10 text-slate-500'
                          }`}>
                          {i === 0 ? <Globe className="w-3.5 h-3.5 shrink-0" /> : <Search className="w-3.5 h-3.5 shrink-0" />}
                          {phase}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 'done' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-300">
                        {discoveredServers.length > 0
                          ? t('results.found', { count: discoveredServers.length, defaultValue: `${discoveredServers.length} serveur(s) trouvé(s)` })
                          : t('results.noneAuto')}
                      </p>
                      <button onClick={startDiscovery}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-xl transition-all cursor-pointer">
                        <RefreshCw className="w-3 h-3" />
                        {t('results.relaunch')}
                      </button>
                    </div>

                    {discoveredServers.length === 0 ? (
                      <div className="py-10 border border-dashed border-white/10 rounded-xl text-center space-y-3 bg-white/[0.02]">
                        <WifiOff className="w-10 h-10 text-slate-600 mx-auto" />
                        <div>
                          <h3 className="text-sm font-bold text-slate-400">{t('results.noServerTitle')}</h3>
                          <p className="text-[11px] text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                            {t('results.noServerMsg')}
                          </p>
                        </div>
                        <button onClick={() => setInputMode('manual')}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-all cursor-pointer">
                          <Settings2 className="w-3.5 h-3.5" />
                          {t('results.manualEntry')}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {discoveredServers.map((server, idx) => {
                          const isSelected = selectedServer?.host === server.host && selectedServer?.port === server.port
                          const isSaved = isAlreadySaved(server.host, server.port)
                          return (
                            <button key={idx} onClick={() => handleSelectServer(server)}
                              className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
                                  : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07] hover:border-white/20'
                              }`}>
                              <div className={`p-2.5 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                <Server className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold text-white truncate">{server.name}</p>
                                  {isSaved && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded-full shrink-0">
                                      <Zap className="w-2.5 h-2.5" />
                                      {t('results.current')}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">{server.host}:{server.port}</p>
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MANUAL MODE */}
            {inputMode === 'manual' && (
              <div className="space-y-5">
                <p className="text-xs text-slate-400 leading-relaxed">{t('manual.description')}</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">{t('manual.host')}</label>
                    <input type="text" value={manualHost} onChange={(e) => setManualHost(e.target.value)}
                      placeholder={t('manual.hostPlaceholder')}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-xl text-xs text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:bg-white/15 transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-300">{t('manual.port')}</label>
                    <input type="text" value={manualPort} onChange={(e) => setManualPort(e.target.value)}
                      placeholder={t('manual.portPlaceholder')}
                      className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-xl text-xs text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 focus:bg-white/15 transition-all" />
                  </div>
                </div>

                <button onClick={handleManualConfirm} disabled={isTesting || !manualHost || !manualPort}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-300 rounded-xl transition-all cursor-pointer disabled:opacity-40">
                  {isTesting ? (
                    <><span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin" /> {t('manual.testing')}</>
                  ) : (
                    <><Search className="w-3.5 h-3.5" /> {t('manual.test')}</>
                  )}
                </button>

                {testResult && (
                  <div className={`p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
                    testResult.success
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}>
                    {testResult.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{t('manual.success')}</p>
                          <p className="text-[11px] opacity-80 mt-0.5">{t('manual.successMsg', { name: testResult.siteName })}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">{t('manual.error')}</p>
                          <p className="text-[11px] opacity-80 mt-0.5">{testResult.error}</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 pb-6 flex items-center justify-between gap-4">
            {savedConfig?.host ? (
              <button onClick={onServerSelected}
                className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors cursor-pointer underline underline-offset-2">
                {t('actions.continue', { host: savedConfig.host, port: savedConfig.port })}
              </button>
            ) : <div />}

            <button onClick={handleConfirmAndContinue} disabled={!canContinue || isTesting}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                canContinue ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30' : 'bg-white/10 text-slate-400'
              }`}>
              {t('actions.proceed')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-600 font-medium">{t('footer')}</p>
      </div>
    </div>
  )
}

export default ServerDiscoveryPage
