'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1920&q=80')`,
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background/90 to-background/80" />

      {/* Header */}
      <header className="relative border-b bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-3xl font-display font-semibold text-foreground tracking-tight">
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
                className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors"
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
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
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
        <section className="py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-semibold text-foreground mb-6 leading-tight">
              Найдите идеального<br />
              <span className="text-primary">соседа</span>
            </h1>
            <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Умный алгоритм подбора соседей по совместимости привычек и образа жизни.
              Начните жить комфортно уже сегодня.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl"
              >
                Начать бесплатно
              </Link>
              <Link
                href="/signin"
                className="px-8 py-4 bg-card text-foreground rounded-lg font-medium hover:bg-accent hover:text-accent-foreground transition-all border border-border"
              >
                Войти
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-center text-foreground mb-14">
              Как это работает
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📝',
                title: 'Заполните анкету',
                description: 'Расскажите о своих привычках, предпочтениях и образе жизни. Чем больше деталей, тем точнее подбор.',
                delay: 0.1,
              },
              {
                icon: '🔍',
                title: 'Найдите совпадения',
                description: 'Алгоритм рассчитает совместимость и покажет наиболее подходящих соседей первыми.',
                delay: 0.2,
              },
              {
                icon: '💬',
                title: 'Начните общение',
                description: 'Свяжитесь с потенциальным соседом и узнайте, подходите ли вы друг другу.',
                delay: 0.3,
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: feature.delay }}
                className="bg-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Advantages Section */}
        <section className="py-20">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-center text-foreground mb-14">
              Почему выбирают Roomy
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { title: 'Умный подбор', description: 'Взвешенный алгоритм совместимости с определением критических несовместимостей' },
              { title: 'Конфиденциальность', description: 'Ваши данные защищены и видны только подобранным соседям' },
              { title: 'Чат в реальном времени', description: 'Общайтесь напрямую с потенциальными соседями' },
              { title: 'Бесплатно', description: 'Все основные функции полностью бесплатны' },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex gap-4 items-start"
              >
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-primary text-sm">✓</span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-foreground/70 text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative border-t bg-background/50 backdrop-blur-sm mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-foreground/60">
          <p className="font-display">&copy; 2026 Roomy. Создано для хакатона.</p>
        </div>
      </footer>
    </div>
  )
}
