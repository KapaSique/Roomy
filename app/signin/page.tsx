'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { useToast } from '@/lib/hooks/use-toast'

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function SignInPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  const emailError = touched.email && !validateEmail(email) ? 'Некорректный email' : ''
  const passwordError = touched.password && password.length < 1 ? 'Введите пароль' : ''
  const isFormValid = validateEmail(email) && password.length >= 1

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setTouched({ email: true, password: true })
    if (!isFormValid) {
      showError('Заполните все поля корректно')
      return
    }
    setError('')
    setLoading(true)
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl: '/search',
    })
    setLoading(false)

    if (result?.error) {
      setError('Неверный email или пароль')
      showError('Неверный email или пароль')
    } else if (result?.url) {
      success('Успешный вход!')
      router.push(result.url)
    } else {
      setError('Что-то пошло не так')
      showError('Что-то пошло не так')
    }
  }

  function handleGosuslugiSignIn() {
    window.location.href = 'https://esia.gosuslugi.ru/login/'
  }

  return (
    <div className="relative flex min-h-screen bg-background">
      <div className="absolute inset-0 bg-mesh opacity-80" aria-hidden />

      {/* Left column — editorial */}
      <aside className="relative hidden w-1/2 flex-col justify-between p-12 md:flex">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-gradient" />
          Roomy
        </Link>

        <div>
          <div className="section-eyebrow">Вход</div>
          <h1 className="mt-4 font-display text-5xl font-bold leading-tight tracking-tight text-balance">
            Добро пожаловать <br /> в <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Roomy</span>.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
            Алгоритм уже пересчитал совместимость. Войди — и увидишь, кто ждёт тебя в ленте.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-foreground/80">
            {['Подбор по 12 параметрам', 'Видимые совпадения и разрывы', 'Чат без обмена номерами'].map((s) => (
              <li key={s} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-match-high" /> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="text-xs text-muted-foreground">roomy.live · IMI Labs</div>
      </aside>

      {/* Right column — form */}
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

          <h2 className="font-display text-2xl font-semibold">Войти в аккаунт</h2>
          <p className="mt-1 text-sm text-muted-foreground">Введи email и пароль или войди через Госуслуги.</p>

          <button
            onClick={handleGosuslugiSignIn}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-border/80 bg-card px-5 py-3 text-sm font-medium transition-colors hover:bg-muted"
          >
            <svg className="h-4 w-4 text-[#1e4aa3]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
            </svg>
            Войти через Госуслуги
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/70" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs uppercase tracking-widest text-muted-foreground">или</span></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                required
                autoComplete="email"
                className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                  emailError ? 'border-destructive' : 'border-border'
                }`}
                placeholder="aleksandr.ivanov@example.com"
              />
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
                autoComplete="current-password"
                className={`mt-2 block w-full rounded-xl border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10 ${
                  passwordError ? 'border-destructive' : 'border-border'
                }`}
                placeholder="••••••••"
              />
              {passwordError && <p className="mt-1.5 text-xs text-destructive">{passwordError}</p>}
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
              {loading ? 'Вход…' : (
                <>
                  Войти
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Нет аккаунта?{' '}
            <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">Зарегистрироваться</Link>
          </p>

          <div className="mt-6 rounded-xl border border-border/70 bg-muted/40 p-3 text-center text-[11px] leading-relaxed text-muted-foreground">
            Демо · <span className="font-mono">aleksandr.ivanov@example.com</span> / <span className="font-mono">password123</span>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
