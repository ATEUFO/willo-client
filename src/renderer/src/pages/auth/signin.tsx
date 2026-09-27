import React, { useState } from 'react'
import { User, Mail, Lock, Eye, EyeOff, UserPlus, ArrowLeft, Building2, CheckCircle2, AlertCircle, Hospital } from 'lucide-react'
import { useHospitalStore, Role } from '../store/hospitalStore'
import willoLogo from '../../assets/willo_logo1.png'
import { useTranslation } from 'react-i18next'

interface SigninPageProps {
  onSwitchToLogin?: () => void
  onSigninSuccess?: () => void
}

export const SigninPage: React.FC<SigninPageProps> = ({ onSwitchToLogin, onSigninSuccess }) => {
  const { register, login } = useHospitalStore()
  const { t } = useTranslation('auth')

  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('Médecine Générale')
  const [selectedRole, setSelectedRole] = useState<Role>('consultation')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')

    if (!fullName.trim()) { setErrorMessage(t('signin.errors.failed')); return }
    if (!username.trim()) { setErrorMessage(t('errors.usernameRequired')); return }
    if (!password) { setErrorMessage(t('errors.passwordRequired')); return }
    if (password.length < 4) { setErrorMessage(t('signin.errors.passwordMismatch')); return }
    if (password !== confirmPassword) { setErrorMessage(t('signin.errors.passwordMismatch')); return }
    if (!acceptTerms) { setErrorMessage(t('signin.errors.failed')); return }

    setIsLoading(true)

    try {
      const regResult = await register({
        name: fullName.trim(),
        username: username.trim(),
        role: selectedRole,
        department,
        status: 'Active',
        password
      })

      if (regResult.success) {
        setSuccessMessage(t('signin.success'))
        const loginRes = await login(username.trim(), password)
        setIsLoading(false)
        if (loginRes.success && onSigninSuccess) onSigninSuccess()
      } else {
        setIsLoading(false)
        setErrorMessage(regResult.message || t('signin.errors.failed'))
      }
    } catch (err) {
      setIsLoading(false)
      const message =
        err instanceof Error
          ? err.message
          : (err as { message?: string })?.message || t('errors.generic')
      setErrorMessage(message)
    }
  }

  // Role options
  const roleOptions: { value: Role; labelKey: string }[] = [
    { value: 'consultation', labelKey: 'common:roles.consultation' },
    { value: 'reception', labelKey: 'common:roles.reception' },
    { value: 'nursing', labelKey: 'common:roles.nursing' },
    { value: 'laboratory', labelKey: 'common:roles.laboratory' },
    { value: 'pharmacy', labelKey: 'common:roles.pharmacy' },
    { value: 'billing', labelKey: 'common:roles.billing' },
    { value: 'management', labelKey: 'common:roles.management' },
    { value: 'admin', labelKey: 'common:roles.admin' }
  ]

  return (
    <div className="min-h-screen bg-medical-lightBg flex items-center justify-center p-4 selection:bg-medical-primary selection:text-white">
      <div className="w-full max-w-lg space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-md border border-medical-border">
            <img src={willoLogo} alt="WILLO" className="h-14 w-auto object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-medical-dark tracking-tight">WILLO HOSPITAL</h1>
            <p className="text-xs text-slate-500 font-medium">{t('signin.title')}</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-medical-cardBg border border-medical-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="border-b border-medical-border pb-3">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-medical-primary" />
              {t('signin.title')}
            </h2>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">{t('signin.fullName')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder={t('signin.fullNamePlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">{t('signin.username')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('signin.usernamePlaceholder')}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium" />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Email (Optionnel)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="adresse@email.com"
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium" />
              </div>
            </div>

            {/* Department & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">{t('signin.department')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select value={department} onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium">
                    <option value="Médecine Générale">Médecine Générale</option>
                    <option value="Urgences & Réanimation">Urgences & Réanimation</option>
                    <option value="Pédiatrie & Maternité">Pédiatrie & Maternité</option>
                    <option value="Cardiologie">Cardiologie</option>
                    <option value="Laboratoire & Biologie">Laboratoire & Biologie</option>
                    <option value="Pharmacie Centrale">Pharmacie Centrale</option>
                    <option value="Caisse & Admissions">Caisse & Admissions</option>
                    <option value="Direction Médicale">Direction Médicale</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">{t('signin.role')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Hospital className="w-4 h-4" />
                  </div>
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as Role)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-semibold">
                    {roleOptions.map(r => (
                      <option key={r.value} value={r.value}>{t(r.labelKey, { ns: 'common', defaultValue: r.value })}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">{t('signin.password')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">{t('signin.confirm')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input type={showPassword ? 'text' : 'password'} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••"
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-medical-border rounded-xl text-xs text-slate-900 focus:outline-none focus:border-medical-primary focus:bg-white transition-all font-medium" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="pt-1">
              <label className="flex items-start gap-2 text-xs text-slate-600 cursor-pointer font-medium">
                <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-medical-border text-medical-primary focus:ring-medical-primary accent-medical-primary shrink-0" />
                <span>J'accepte les règles de confidentialité des données de santé et le secret médical.</span>
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full bg-medical-primary hover:bg-medical-hover text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t('signin.loading')}
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{t('signin.submit')}</span>
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="border-t border-medical-border pt-4 text-center">
            <button onClick={onSwitchToLogin}
              className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-medical-primary font-semibold transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('signin.alreadyAccount')} {t('signin.backToLogin')}</span>
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] text-slate-400 font-medium">{t('footer')}</p>
      </div>
    </div>
  )
}

export default SigninPage
