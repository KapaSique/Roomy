'use client'

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
    } catch (err) {
      setError('Что-то пошло не так')
      showError('Что-то пошло не так')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-card rounded-2xl shadow-xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="text-4xl font-display font-semibold text-foreground tracking-tight">
            Roomy
          </Link>
          <p className="text-foreground/60 mt-3">Создайте аккаунт</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground/80">
              Имя <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched({ ...touched, name: true })}
              required
              className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                touched.name && name.length > 0 && name.length < 2
                  ? 'border-destructive'
                  : 'border-border'
              }`}
              placeholder="Ваше имя"
            />
            {getValidationMessage() && (
              <p className="text-sm text-destructive mt-1">{getValidationMessage()}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
              Email <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched({ ...touched, email: true })}
                required
                className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              required
              minLength={6}
              className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                touched.password && password.length > 0 && password.length < 6
                  ? 'border-destructive'
                  : 'border-border'
              }`}
              placeholder="••••••••"
            />
            {password && (
              <div className="mt-2">
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
              </div>
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
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, confirmPassword: true })}
              required
              className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                touched.confirmPassword && confirmPassword && password !== confirmPassword
                  ? 'border-destructive'
                  : touched.confirmPassword && confirmPassword && password === confirmPassword
                  ? 'border-green-500'
                  : 'border-border'
              }`}
              placeholder="••••••••"
            />
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
              className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !isFormValid()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
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
