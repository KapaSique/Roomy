'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useToast } from '@/lib/hooks/use-toast'

type Chat = {
  id: string
  otherUser: {
    id: string
    name: string
    avatarUrl?: string | null
  }
  lastMessage?: {
    content: string
    createdAt: string
  } | null
}

type Message = {
  id: string
  senderId: string
  content: string
  createdAt: string
}

function ChatsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const { success, error: showError } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChats()
    const userId = searchParams.get('userId')
    if (userId) {
      setSelectedChat(userId)
      fetchMessages(userId)
    }
  }, [])

  async function fetchChats() {
    try {
      const response = await fetch('/api/chats')
      const data = await response.json()
      if (response.ok) {
        setChats(data.chats)
      }
    } catch (error) {
      console.error('Failed to fetch chats:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchMessages(userId: string) {
    try {
      const response = await fetch(`/api/chats/${userId}`)
      const data = await response.json()
      if (response.ok) {
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    try {
      const response = await fetch(`/api/chats/${selectedChat}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages(selectedChat)
        fetchChats()
        success('Сообщение отправлено')
      } else {
        showError('Не удалось отправить сообщение')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
      showError('Не удалось отправить сообщение')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-semibold text-primary">Roomy</Link>
          <nav className="flex gap-4">
            <Link href="/search" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Поиск
            </Link>
            <Link href="/profile" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Профиль
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-2xl shadow-md overflow-hidden"
          >
            <div className="p-4 border-b">
              <h2 className="text-lg font-display font-semibold text-foreground">Сообщения</h2>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              {chats.length === 0 ? (
                <div className="p-4 text-center text-foreground/60">
                  Пока нет сообщений. Найдите соседей и начните общение!
                </div>
              ) : (
                chats.map(chat => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat.otherUser.id)
                      fetchMessages(chat.otherUser.id)
                    }}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors ${
                      selectedChat === chat.otherUser.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <img
                      src={chat.otherUser.avatarUrl || '/default-avatar.png'}
                      alt={chat.otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{chat.otherUser.name}</p>
                      {chat.lastMessage && (
                        <p className="text-sm text-foreground/60 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>

          {/* Chat Messages */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2 bg-card rounded-2xl shadow-md overflow-hidden flex flex-col"
          >
            {selectedChat ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-display font-semibold text-foreground">
                    {chats.find(c => c.otherUser.id === selectedChat)?.otherUser.name}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map(msg => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.senderId === session?.user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === session?.user?.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-foreground'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Напишите сообщение..."
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Отправить
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-foreground/60">
                Выберите чат для начала общения
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  )
}

export default function ChatsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ChatsContent />
    </Suspense>
  )
}
