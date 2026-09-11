import React, { useState } from 'react'
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle
} from 'lucide-react'
import { useHospitalStore } from '../store/hospitalStore'
import willoLogo from '../../assets/willo_logo1.png'

interface LoginPageProps {
  onSwitchToSignin?: () => void
  onLoginSuccess?: () => void
  onOpenConnections?: () => void
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSwitchToSignin, onLoginSuccess }) => {
  const { login } = useHospitalStore()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMessage('')

    if (!username.trim()) {
      setErrorMessage("Veuillez saisir votre nom d'utilisateur.")
      return
    }

    if (!password) {
      setErrorMessage('Veuillez saisir votre mot de passe.')
      return
    }

    setIsLoading(true)

    try {
      const result = await login(username.trim(), password)
      setIsLoading(false)

      if (result.success) {
        if (onLoginSuccess) {
          onLoginSuccess()
        }
      } else {
        setErrorMessage(result.message || 'Échec de la connexion. Vérifiez vos identifiants.')
      }
    } catch (err) {
      setIsLoading(false)
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || 'Une erreur est survenue lors de la connexion.'
      setErrorMessage(message)
    }
  }

  return (
    <div className="min-h-screen bg-medical-lightBg flex items-center justify-center p-4 selection:bg-medical-primary selection:text-white">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-md border border-medical-border">
            <img src={willoLogo} alt="WILLO" className="h-14 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-medical-dark tracking-tight">
              WILLO HOSPITAL
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Système d'Information Hospitalier
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-medical-cardBg border border-medical-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="border-b border-medical-border pb-3">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-medical-primary" />
              Connexion Utilisateur
            </h2>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Username / Email Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Identifiant Utilisateur
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nom d'utilisateur"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-medical-border text-medical-primary focus:ring-medical-primary accent-medical-primary"
                />
                <span>Se souvenir de ce poste</span>
              </label>

              <button
                type="button"
                onClick={() => alert("Veuillez contacter l'administrateur de l'hôpital pour réinitialiser votre mot de passe.")}
                className="text-medical-primary hover:underline font-semibold"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-medical-primary hover:bg-medical-hover text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connexion en cours...
                </span>
              ) : (
                <>
                  <span>Se Connecter</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Signin Link */}
          <div className="text-center pt-2 border-t border-medical-border">
            <p className="text-xs text-slate-600">
              Nouveau membre du personnel ?{' '}
              <button
                onClick={onSwitchToSignin}
                className="text-medical-primary font-bold hover:underline"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-400 font-medium">
          WILLO • Plateforme Hospitalière
        </p>
      </div>
    </div>
  )
}

export default LoginPage
