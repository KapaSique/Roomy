'use client'

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-8xl mb-6"
        >
          404
        </motion.div>
        <h1 className="text-2xl font-display font-semibold text-foreground mb-2">
          Страница не найдена
        </h1>
        <p className="text-foreground/60 mb-6">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          На главную
        </Link>
      </motion.div>
    </div>
  )
}
