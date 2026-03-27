'use client'

import { Skeleton } from './skeleton'

export function UserCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden p-6">
      <div className="flex items-center gap-4 mb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-3 w-full rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3 mb-4" />
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl shadow-md p-8">
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
        <div className="mt-6">
          <Skeleton className="h-11 w-40 rounded-lg" />
        </div>
      </div>

      {/* Housing Info */}
      <div className="bg-card rounded-2xl shadow-md p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
          <Skeleton className="h-16 rounded-lg" />
        </div>
      </div>

      {/* Survey/Habits */}
      <div className="bg-card rounded-2xl shadow-md p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChatListSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-24" />
      </div>
      <div className="divide-y">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function MessageViewSkeleton() {
  return (
    <div className="bg-card rounded-2xl shadow-md overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <Skeleton className="h-12 w-48 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="p-4 border-t flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  )
}

export function SearchPageSkeletons() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <UserCardSkeleton key={i} />
      ))}
    </div>
  )
}
