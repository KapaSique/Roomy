'use client'

import { ProfileSkeleton } from '@/components/ui/skeletons'

export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-20 bg-secondary rounded" />
          <div className="flex gap-4">
            <div className="h-8 w-16 bg-secondary rounded" />
            <div className="h-8 w-24 bg-secondary rounded" />
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <main className="container mx-auto px-4 py-8">
        <ProfileSkeleton />
      </main>
    </div>
  )
}
