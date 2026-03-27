'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const CITIES = [
  'Москва', 'Санкт-Петербург', 'Якутск', 'Казань', 'Новосибирск',
  'Екатеринбург', 'Нижний Новгород', 'Челябинск', 'Самара', 'Омск',
  'Ростов-на-Дону', 'Уфа', 'Красноярск', 'Воронеж', 'Пермь', 'Волгоград',
]

type FilterDrawerProps = {
  isOpen: boolean
  onClose: () => void
  filters: {
    city: string
    minScore: number
    budgetMin: number
    budgetMax: number
    hideDealbreakers: boolean
  }
  setFilters: (filters: any) => void
  onApply: () => void
  onReset: () => void
  hasActiveFilters: boolean
}

export function FilterDrawer({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
  hasActiveFilters,
}: FilterDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full max-w-sm bg-card shadow-2xl z-50 lg:hidden overflow-y-auto"
          >
            <div className="sticky top-0 bg-card border-b p-4 flex items-center justify-between">
              <h2 className="text-lg font-display font-semibold text-foreground">Фильтры</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label="Close filters"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Город
                </label>
                <select
                  value={filters.city}
                  onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Все города</option>
                  {CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Min Score Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Мин. совместимость: {filters.minScore}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={filters.minScore}
                  onChange={(e) => setFilters({ ...filters, minScore: parseInt(e.target.value) })}
                  className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-foreground/50 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-foreground/80 mb-2">
                  Бюджет
                </label>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground/60">От</span>
                      <span className="font-medium">{filters.budgetMin.toLocaleString()}₽</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="5000"
                      value={filters.budgetMin}
                      onChange={(e) => setFilters({
                        ...filters,
                        budgetMin: Math.min(parseInt(e.target.value), filters.budgetMax - 5000)
                      })}
                      className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-foreground/60">До</span>
                      <span className="font-medium">{filters.budgetMax.toLocaleString()}₽</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100000"
                      step="5000"
                      value={filters.budgetMax}
                      onChange={(e) => setFilters({
                        ...filters,
                        budgetMax: Math.max(parseInt(e.target.value), filters.budgetMin + 5000)
                      })}
                      className="w-full h-3 bg-secondary rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Hide Dealbreakers Toggle */}
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <span className="text-sm font-medium text-foreground">
                  Скрыть конфликты
                </span>
                <button
                  onClick={() => setFilters({ ...filters, hideDealbreakers: !filters.hideDealbreakers })}
                  className={`w-14 h-8 rounded-full transition-colors ${
                    filters.hideDealbreakers ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${
                      filters.hideDealbreakers ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-card border-t p-4 flex gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onReset}
                className="flex-1 px-6 py-3 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Сбросить
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={onApply}
                className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Применить
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
