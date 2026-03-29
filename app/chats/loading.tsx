'use client'

import { ChatListSkeleton, MessageViewSkeleton } from '@/components/ui/skeletons'

export default function ChatsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="h-8 w-20 bg-secondary rounded" />
          <div className="flex gap-4">
            <div className="h-8 w-16 bg-secondary rounded" />
            <div className="h-8 w-20 bg-secondary rounded" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          <ChatListSkeleton />
          <div className="md:col-span-2">
            <MessageViewSkeleton />
          </div>
        </div>
      </main>
    </div>
  )
}
