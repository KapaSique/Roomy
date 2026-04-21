'use client'
export const dynamic = 'force-dynamic'

import { useState, useCallback, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check, X } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

function getPasswordStrength(password: string): { score: number; label: string; color: string; bar: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: 'Слабый', color: 'text-destructive', bar: 'bg-destructive' }
  if (score <= 2) return { score, label: 'Средний', color: 'text-match-mid', bar: 'bg-match-mid' }
  if (score <= 3) return { score, label: 'Хороший', color: 'text-accent', bar: 'bg-accent' }
  return { score, label: 'Надёжный', color: 'text-match-high', bar: 'bg-match-high' }
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

  const [emailValid, setEmailValid] = useState<boolean | null>(null)
  const [emailChecking, setEmailChecking] = useState(false)
  const [emailExists, setEmailExists] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(getPasswordStrength(''))
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirmPassword: false })

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
    } catch {
      setEmailValid(null)
      setEmailExists(false)
    } finally {
      setEmailChecking(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email && touched.email) checkEmailAvailability(email)
    }, 500)
    return () => clearTimeout(timer)
  }, [email, touched.email, checkEmailAvailability])

  useEffect(() => {
    setPasswordStrength(getPasswordStrength(password))
  }, [password])

  const nameError = touched.name && (name.length < 2 || name.length > 50) ? 'Имя 2–50 символов' : ''
  const emailError =
    touched.email
      ? !validateEmail(email)
        ? 'Некорректный email'
        : emailChecking
        ? 'Проверка…'
        : emailExists
        ? 'Email уже зарегистрирован'
        : ''
      : ''
  const passwordError = touched.password && password.length < 6 ? 'Минимум 6 символов' : ''
  const confirmError = touched.confirmPassword && password !== confirmPassword ? 'Пароли не совпадают' : ''

  const isFormValid =
    name.length >= 2 &&
    name.length <= 50 &&
    validateEmail(email) &&
    !emailExists &&
    password.length >= 6 &&
    password === confirmPassword

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    if (!isFormValid) {
      showError('Исправь ошибки в форме')
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

      const result = await signIn('credentials', { email, password, redirect: false })

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

  function handleGosuslugiSignIn() {
    window.location.href = 'https://esia.gosuslugi.ru/login/'
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="absolute inset-0 bg-mesh opacity-80" aria-hidden />

      <aside className="relative hidden w-1/2 flex-col justify-between p-12 md:flex">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-gradient" />
          Roomy
        </Link>

        <div>
          <div className="section-eyebrow">Регистрация</div>
          <h1 className="mt-4 font-display text-5xl font-bold leading-tight tracking-tight text-balance">
            2 минуты — и ты в <br /> <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ленте совпадений</span>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Заполняешь анкету на 12 вопросов — и алгоритм сразу показывает, с кем реально уживёшься.
          </p>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent" style={{ filter: `hue-rotate(${i * 60}deg)` }} />
              ))}
            </div>
            <div className="text-sm">
              <span className="font-semibold">25 демо-пользователей</span>
              <span className="text-muted-foreground"> · 300 пар посчитано</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">roomy.live · IMI Labs</div>
      </aside>

      <main className="relative flex w-full items-center justify-center p-6 md:w-1/2 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="card-soft w-full max-w-md p-8"
        >
          <div className="mb-8 md:hidden">
            <Link href="/" className="font-display text-2xl font-bold">Roomy</Link>
          </div>

          <h2 className="font-display text-2xl font-semibold">Создать аккаунт</h2>
          <p className="mt-1 text-sm text-muted-foreground">Без СМС и подтверждений email. Просто начни.</p>

          <button
            onClick={handleGosuslugiSignIn}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <svg className="h-4 w-4 text-[#1e4aa3]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            Через Госуслуги
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/70" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground">или</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Имя</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                required
                className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                  nameError ? 'border-destructive' : 'border-border'
                }`}
                placeholder="Твоё имя"
              />
              {nameError && <p className="mt-1.5 text-xs text-destructive">{nameError}</p>}
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                  required
                  className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 pr-10 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                    emailExists ? 'border-destructive' : emailValid === true && !emailExists ? 'border-match-high' : 'border-border'
                  }`}
                  placeholder="you@example.com"
                />
                {emailChecking && <div className="absolute right-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />}
                {!emailChecking && emailValid === true && !emailExists && <Check className="absolute right-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-match-high" />}
                {!emailChecking && emailExists && <X className="absolute right-3 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-destructive" />}
              </div>
              {emailError && <p className="mt-1.5 text-xs text-destructive">{emailError}</p>}
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Пароль</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                required
                minLength={6}
                className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                  passwordError ? 'border-destructive' : 'border-border'
                }`}
                placeholder="••••••••"
              />
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= passwordStrength.score ? passwordStrength.bar : 'bg-border'}`} />
                    ))}
                  </div>
                  <p className={`mt-1 text-xs ${passwordStrength.color}`}>{passwordStrength.label}</p>
                </div>
              )}
              {passwordError && <p className="mt-1.5 text-xs text-destructive">{passwordError}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Повтори пароль</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                required
                className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                  confirmError ? 'border-destructive' : touched.confirmPassword && password === confirmPassword && confirmPassword ? 'border-match-high' : 'border-border'
                }`}
                placeholder="••••••••"
              />
              {confirmError && <p className="mt-1.5 text-xs text-destructive">{confirmError}</p>}
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className="group flex w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-all hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Создаём…' : (
                <>
                  Создать аккаунт
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Уже есть аккаунт?{' '}
            <Link href="/signin" className="font-medium text-foreground underline-offset-4 hover:underline">Войти</Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}
