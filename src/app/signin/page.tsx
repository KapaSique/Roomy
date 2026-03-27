'use client'

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
