'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useToast } from '@/lib/hooks/use-toast'

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0

  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Слабый', color: 'text-red-500' }
  if (score <= 2) return { score, label: 'Средний', color: 'text-yellow-500' }
  if (score <= 3) return { score, label: 'Хороший', color: 'text-blue-500' }
  return { score, label: 'Надёжный', color: 'text-green-500' }
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SignUpPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Validation states
  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(''))
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  })

  // Debounced email check
  const checkEmailAvailability = useCallback(async (emailToCheck: string) => {
    if (!validateEmail(emailToCheck)) {
      setEmailValid(false)
      setEmailExists(false)
      return
    }

    setEmailChecking(true)
    try {
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(emailToCheck)}`)
      const data = await response.json()

      if (response.ok) {
        setEmailValid(true)
        setEmailExists(data.exists)
      } else {
        setEmailValid(false)
        setEmailExists(false)
      }
    } catch (error) {
      console.error('Email check error:', error)
      setEmailValid(null)
      setEmailExists(false)
    } finally {
      setEmailChecking(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && touched.email) {
        checkEmailAvailability(email)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [email, touched.email, checkEmailAvailability])

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password))
  }, [password])

  const getValidationMessage = (): string => {
    if (!touched.name && name) return ''
    if (name.length < 2) return 'Имя должно быть не менее 2 символов'
    if (name.length > 50) return 'Имя должно быть не более 50 символов'
    return ''
  }

  const getEmailValidationMessage = (): string => {
    if (!touched.email) return ''
    if (!validateEmail(email)) return 'Некорректный email'
    if (emailChecking) return 'Проверка...'
    if (emailExists) return 'Этот email уже зарегистрирован'
    return ''
  }

  const getPasswordValidationMessage = (): string => {
    if (!touched.password) return ''
    if (password.length < 6) return 'Минимум 6 символов'
    return ''
  }

  const getConfirmPasswordValidationMessage = (): string => {
    if (!touched.confirmPassword) return ''
    if (password !== confirmPassword) return 'Пароли не совпадают'
    return ''
  }

  const isFormValid = (): boolean => {
    if (name.length < 2 || name.length > 50) return false
    if (!validateEmail(email) || emailExists) return false
    if (password.length < 6) return false
    if (password !== confirmPassword) return false
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    })

    if (!isFormValid()) {
      showError('Исправьте ошибки в форме')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Что-то пошло не так')
        showError(data.error || 'Что-то пошло не так')
        setLoading(false)
        return
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Аккаунт создан, но вход не удался')
        showError('Аккаунт создан, но вход не удался')
      } else {
        success('Аккаунт успешно создан!')
        router.push('/onboarding')
        router.refresh()
      }
    } catch {
      setError('Что-то пошло не так')
      showError('Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  async function handleGosuslugiSignIn() {
    window.location.href = 'https://esia.gosuslugi.ru/login/'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900 relative overflow-hidden">
      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 glass rounded-3xl shadow-xl border border-white/20 relative z-10 my-8"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Link href="/" className="text-5xl font-display font-semibold gradient-text tracking-tight">
              Roomy
            </Link>
          </motion.div>
          <p className="text-foreground/60 mt-4 text-lg">Создайте аккаунт</p>
          <p className="text-foreground/50 text-sm mt-1">Присоединяйтесь к Roomy</p>
        </div>

        {/* Кнопка входа через Госуслуги */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGosuslugiSignIn}
          className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:shadow-blue-500/30 flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          Войти через Госуслуги
        </motion.button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/50"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background/80 text-foreground/50">или зарегистрируйтесь</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground/80">
              Имя <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched({ ...touched, name: true })}
                required
                className={`block w-full pl-10 pr-4 py-3 border rounded-xl bg-background/50 text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  touched.name && name.length > 0 && name.length < 2
                    ? 'border-destructive'
                    : 'border-border'
                }`}
                placeholder="Ваше имя"
              />
            </div>
            {getValidationMessage() && (
              <p className="text-sm text-destructive mt-1">{getValidationMessage()}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
              Email <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                required
                className={`block w-full pl-10 pr-12 py-3 border rounded-xl bg-background/50 text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  emailExists
                    ? 'border-destructive'
                    : emailValid === true
                    ? 'border-green-500'
                    : 'border-border'
                }`}
                placeholder="you@example.com"
              />
              {emailChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                </div>
              )}
              {emailValid === true && !emailChecking && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">✓</div>
              )}
              {emailExists && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">✗</div>
              )}
            </div>
            {getEmailValidationMessage() && (
              <p className="text-sm text-destructive mt-1">{getEmailValidationMessage()}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
              Пароль <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, password: true })}
                required
                minLength={6}
                className={`block w-full pl-10 pr-4 py-3 border rounded-xl bg-background/50 text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  touched.password && password.length > 0 && password.length < 6
                    ? 'border-destructive'
                    : 'border-border'
                }`}
                placeholder="••••••••"
              />
            </div>
            {password && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2"
              >
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength.score
                          ? passwordStrength.score <= 2
                            ? 'bg-red-500'
                            : passwordStrength.score <= 3
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                          : 'bg-secondary'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </p>
              </motion.div>
            )}
            {getPasswordValidationMessage() && (
              <p className="text-sm text-destructive mt-1">{getPasswordValidationMessage()}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground/80">
              Подтверждение пароля <span className="text-destructive">*</span>
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-foreground/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched({ ...touched, confirmPassword: true })}
                required
                className={`block w-full pl-10 pr-4 py-3 border rounded-xl bg-background/50 text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  touched.confirmPassword && confirmPassword && password !== confirmPassword
                    ? 'border-destructive'
                    : touched.confirmPassword && confirmPassword && password === confirmPassword
                    ? 'border-green-500'
                    : 'border-border'
                }`}
                placeholder="••••••••"
              />
            </div>
            {confirmPassword && password === confirmPassword && (
              <p className="text-sm text-green-500 mt-1">✓ Пароли совпадают</p>
            )}
            {getConfirmPasswordValidationMessage() && (
              <p className="text-sm text-destructive mt-1">{getConfirmPasswordValidationMessage()}</p>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Создание...
              </span>
            ) : (
              'Создать аккаунт'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-foreground/60">
            Уже есть аккаунт?{' '}
            <Link href="/signin" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Войти
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
