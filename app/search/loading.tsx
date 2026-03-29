'use client'

import { motion } from 'framer-motion'
import { SearchPageSkeletons } from '@/components/ui/skeletons'

export default function SearchLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-b shadow-sm sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-20 bg-secondary rounded" />
          <div className="flex gap-4">
            <div className="h-8 w-20 bg-secondary rounded" />
            <div className="h-8 w-24 bg-secondary rounded" />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-secondary rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-secondary rounded-lg" />
            <div className="h-9 w-32 bg-secondary rounded-lg" />
          </div>
        </div>

        <SearchPageSkeletons />
      </main>
    </div>
  )
}
