import React from 'react'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useHospitalStore } from '../../pages/store/hospitalStore'

export const NotificationModal: React.FC = () => {
  const { notificationModal, closeNotification } = useHospitalStore()

  if (!notificationModal || !notificationModal.isOpen) return null

  const { title, message, type = 'info', confirmText = "D'accord" } = notificationModal

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50 border-emerald-200',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      defaultTitle: 'Succès'
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-50 border-rose-200',
      btnColor: 'bg-rose-600 hover:bg-rose-700 text-white',
      defaultTitle: 'Erreur'
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50 border-amber-200',
      btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
      defaultTitle: 'Attention'
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      btnColor: 'bg-medical-primary hover:bg-emerald-600 text-white',
      defaultTitle: 'Information'
    }
  }[type]

  const IconComponent = config.icon

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden select-none">
        <div className={`p-6 border-b flex items-start gap-4 ${config.bgColor}`}>
          <div className="p-2.5 bg-white rounded-xl shadow-xs shrink-0">
            <IconComponent className={`w-7 h-7 ${config.iconColor}`} />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-slate-900 text-base">
              {title || config.defaultTitle}
            </h3>
            <p className="text-xs text-slate-700 font-medium leading-relaxed mt-1 whitespace-pre-line">
              {message}
            </p>
          </div>

          <button
            onClick={closeNotification}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-white/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 bg-slate-50 flex justify-end">
          <button
            onClick={closeNotification}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${config.btnColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
