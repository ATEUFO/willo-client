import React, { useEffect, useState } from 'react'
import { Minus, Square, Copy, X } from 'lucide-react'
import willoLogo from '../../assets/willo_logo1.png'

export const TitleBar: React.FC = () => {
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMac, setIsMac] = useState(false)

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
      className="h-[30px] bg-[#07111E] text-slate-300 flex items-center justify-between px-3 border-b border-slate-800/60 select-none z-50 shrink-0 shadow-sm relative font-sans"
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

      {/* Window Controls (Not displayed on macOS since native traffic lights are kept) */}
      {!isMac && (
        <div 
          className="flex items-center h-full" 
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          {/* Minimize */}
          <button
            onClick={handleMinimize}
            className="w-11 h-[30px] flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-default"
            title="Réduire"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Maximize / Restore */}
          <button
            onClick={handleMaximize}
            className="w-11 h-[30px] flex items-center justify-center hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-default"
            title={isMaximized ? "Restaurer" : "Agrandir"}
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
            className="w-11 h-[30px] flex items-center justify-center hover:bg-rose-600 text-slate-400 hover:text-white transition-colors cursor-default"
            title="Fermer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
