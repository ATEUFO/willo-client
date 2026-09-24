import React, { useEffect, useState, useRef } from 'react'
import { Minus, Square, Copy, X, Settings, LogOut, ChevronDown } from 'lucide-react'
import willoLogo from '../../assets/willo_logo1.png'
import { useHospitalStore } from '../../pages/store/hospitalStore'
import { ROLE_CONFIGS } from '../../config/permissions'

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const { currentUser, isAuthenticated, setShowSettingsModal, logout } = useHospitalStore()

  useEffect(() => {
    if (window.api && window.api.windowControls) {
      setIsMac(window.api.windowControls.isMac)

      // Query initial state
      window.api.windowControls.isMaximized().then(setIsMaximized)

      // Listen for window state changes
      const unsubscribe = window.api.windowControls.onMaximizedStateChange((maximized) => {
        setIsMaximized(maximized)
      })
      return unsubscribe
    }
    return undefined
  }, [])

  // Close dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getUserInitials = (name?: string) => {
    if (!name) return 'US'
    const parts = name.split(' ').filter(Boolean)
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const handleMinimize = () => {
    window.api?.windowControls?.minimize()
  }

  const handleMaximize = async () => {
    if (window.api?.windowControls) {
      const state = await window.api.windowControls.maximize()
      setIsMaximized(state)
    }
  }

  const handleClose = () => {
    window.api?.windowControls?.close()
  }

  return (
    <div
      className="h-[32px] bg-[#07111E] text-slate-300 flex items-center justify-between px-3 border-b border-slate-800/60 select-none z-50 shrink-0 shadow-sm relative font-sans"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Brand logo & name */}
      <div className={`flex items-center gap-2 ${isMac ? 'pl-[72px]' : ''}`}>
        <img src={willoLogo} alt="" className="h-4 w-auto object-contain opacity-80" />
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Willo Hospital
        </span>
        <span className="text-[9px] text-slate-600">•</span>
        <span className="text-[10px] font-semibold text-slate-500 font-mono">
          SIH v1.0.0
        </span>
      </div>

      {/* Right side: User Profile & Settings + Window Controls */}
      <div
        className="flex items-center h-full gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {isAuthenticated && currentUser && (
          <div className="flex items-center gap-1 border-r border-slate-800 pr-2 mr-1 relative" ref={menuRef}>
            {/* Settings button */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="h-6 w-6 rounded flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
              title="Préférences & Paramètres"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>

            {/* User Profile Avatar / Badge */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="h-6 px-1.5 rounded bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-emerald-400 font-bold text-[10px] flex items-center gap-1.5 transition-colors cursor-pointer"
                title={currentUser.name}
              >
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[9px] font-extrabold border border-emerald-500/30">
                  {getUserInitials(currentUser.name)}
                </span>
                <span className="text-slate-300 text-[11px] font-semibold max-w-[90px] truncate hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-[#0B1727] text-white rounded-xl shadow-2xl border border-slate-700/90 py-2 z-50 text-xs font-sans animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-bold text-slate-100 text-xs truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-emerald-400 font-medium">
                      {ROLE_CONFIGS[currentUser.role]?.label || currentUser.role}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowSettingsModal(true)
                        setShowUserMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 flex items-center gap-2 transition-colors text-xs cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Préférences & Paramètres</span>
                    </button>

                    <button
                      onClick={() => {
                        logout()
                        setShowUserMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 flex items-center gap-2 transition-colors text-xs cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Window Controls (Not displayed on macOS since native traffic lights are kept) */}
        {!isMac && (
          <div className="flex items-center h-full">
            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className="w-10 h-full flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-default"
              title="Réduire"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Maximize / Restore */}
            <button
              onClick={handleMaximize}
              className="w-10 h-full flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-default"
              title={isMaximized ? 'Restaurer' : 'Agrandir'}
            >
              {isMaximized ? (
                <Copy className="w-3 h-3 rotate-180" />
              ) : (
                <Square className="w-3 h-3" />
              )}
            </button>

            {/* Close */}
            <button
              onClick={handleClose}
              className="w-10 h-full flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-default"
              title="Fermer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
