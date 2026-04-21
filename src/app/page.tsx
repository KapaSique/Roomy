'use client'

import Link from 'next/link'

export const dynamic = 'force-dynamic'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />

      {/* Floating Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 80, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 60, 0],
            y: [0, 40, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 right-1/3 w-64 h-64 bg-pink-400/15 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <header className="relative glass sticky top-0 z-50 border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-3xl font-display font-semibold gradient-text tracking-tight">
              Roomy
            </Link>
          </motion.div>

          <nav className="flex gap-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link
                href="/signin"
                className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                Войти
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/signup"
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5"
              >
                Регистрация
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative container mx-auto px-4">
        {/* Hero Section */}
        <section className="py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20"
            >
              <span className="text-sm font-medium text-foreground/80">
                ✨ Умный подбор соседей
              </span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold text-foreground mb-6 leading-tight">
              Найдите своего<br />
              <span className="gradient-text">идеального соседа</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/60 mb-12 max-w-2xl mx-auto leading-relaxed">
              Алгоритм на основе 12 параметров совместимости подберёт соседа,
              с которым вам будет комфортно жить
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 flex items-center gap-2"
              >
                Начать бесплатно
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/signin"
                className="px-8 py-4 glass text-foreground rounded-full font-medium hover:bg-white/50 transition-all border border-border/50"
              >
                Войти
              </Link>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20"
            >
              {[
                { value: '1000+', label: 'Пользователей' },
                { value: '85%', label: 'Совпадений' },
                { value: '15 мин', label: 'На подбор' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-display font-semibold gradient-text mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-foreground/50">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-center text-foreground mb-4">
              Как это работает
            </h2>
            <p className="text-foreground/60 text-center mb-16 max-w-xl mx-auto">
              Простой процесс из трёх шагов приведёт вас к идеальному соседу
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📝',
                gradient: 'from-blue-500 to-cyan-500',
                title: 'Заполните анкету',
                description: 'Расскажите о своих привычках, предпочтениях и образе жизни. Чем больше деталей, тем точнее подбор.',
              },
              {
                icon: '🔍',
                gradient: 'from-purple-500 to-pink-500',
                title: 'Найдите совпадения',
                description: 'Алгоритм рассчитает совместимость и покажет наиболее подходящих соседей первыми.',
              },
              {
                icon: '💬',
                gradient: 'from-orange-500 to-red-500',
                title: 'Начните общение',
                description: 'Свяжитесь с потенциальным соседом и узнайте, подходите ли вы друг другу.',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="glass p-8 rounded-3xl soft-shadow border border-white/20 card-hover group"
              >
                <motion.div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  <span className="text-3xl">{feature.icon}</span>
                </motion.div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
              Почему выбирают Roomy
            </h2>
            <p className="text-foreground/60 max-w-xl mx-auto">
              Наш подход к подбору соседей основан на научном анализе совместимости
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                icon: '🧠',
                title: 'Умный подбор',
                description: 'Взвешенный алгоритм совместимости с определением критических несовместимостей'
              },
              {
                icon: '🔒',
                title: 'Конфиденциальность',
                description: 'Ваши данные защищены и видны только подобранным соседям'
              },
              {
                icon: '⚡',
                title: 'Чат в реальном времени',
                description: 'Общайтесь напрямую с потенциальными соседями'
              },
              {
                icon: '🎁',
                title: 'Бесплатно',
                description: 'Все основные функции полностью бесплатны'
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="glass p-6 rounded-2xl soft-shadow border border-white/20 flex gap-4 items-start"
              >
                <div className="text-3xl">{item.icon}</div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-foreground/60 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-30" />
            <div className="relative glass p-12 rounded-3xl text-center border border-white/20 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
                  Готовы найти идеального соседа?
                </h2>
                <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
                  Присоединяйтесь к Roomy уже сегодня и начните жить комфортно
                </p>
                <Link
                  href="/signup"
                  className="inline-flex px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  Создать аккаунт
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative glass border-t border-white/20 mt-24">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-foreground/60 mb-2">&copy; 2026 Roomy</p>
          <p className="text-xs text-foreground/40">Создано для хакатона</p>
        </div>
      </footer>
    </div>
  )
}
