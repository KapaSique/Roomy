'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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

  const getEmailValidationMessage = (): string => {
    if (!touched.email) return ''
    if (!validateEmail(email)) return 'Некорректный email'
    return ''
  }

  const getPasswordValidationMessage = (): string => {
    if (!touched.password) return ''
    if (password.length < 1) return 'Введите пароль'
    return ''
  }

  const isFormValid = (): boolean => {
    return validateEmail(email) && password.length >= 1
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setTouched({ email: true, password: true })

    if (!isFormValid()) {
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
      console.error('Sign in error:', result.error)
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

  async function handleGosuslugiSignIn() {
    try {
      await signIn('gosuslugi', { callbackUrl: '/search' })
    } catch (error) {
      console.error('Госуслуги вход ошибка:', error)
      showError('Ошибка входа через Госуслуги')
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
          <p className="text-foreground/60 mt-3">Войдите в свой аккаунт</p>
        </div>

        {/* Кнопка входа через Госуслуги */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGosuslugiSignIn}
          className="w-full mb-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          Войти через Госуслуги
        </motion.button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-foreground/60">или войдите с</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched({ ...touched, email: true })}
              required
              autoComplete="email"
              className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                touched.email && !validateEmail(email) ? 'border-destructive' : 'border-border'
              }`}
              placeholder="aleksandr.ivanov@example.com"
            />
            {getEmailValidationMessage() && (
              <p className="text-sm text-destructive mt-1">{getEmailValidationMessage()}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched({ ...touched, password: true })}
              required
              autoComplete="current-password"
              className={`mt-1 block w-full px-4 py-3 border rounded-lg bg-background text-foreground placeholder-foreground/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                touched.password && password.length === 0 ? 'border-destructive' : 'border-border'
              }`}
              placeholder="••••••••"
            />
            {getPasswordValidationMessage() && (
              <p className="text-sm text-destructive mt-1">{getPasswordValidationMessage()}</p>
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
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-foreground/60">
            Нет аккаунта?{' '}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Зарегистрироваться
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-foreground/50">
            Демо: aleksandr.ivanov@example.com<br/>
            Пароль: password123
          </p>
        </div>
      </motion.div>
    </div>
  )
}
