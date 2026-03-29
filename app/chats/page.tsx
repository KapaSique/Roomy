'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { useToast } from '@/lib/hooks/use-toast'
import { ChatListSkeleton, MessageViewSkeleton } from '@/components/ui/skeletons'
import { MobileMenu } from '@/components/MobileMenu'

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
  unreadCount?: number
}

type Message = {
  id: string
  senderId: string
  content: string
  createdAt: string
}

type UserStatus = 'online' | 'offline' | 'away'

function ChatsContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const { success, error: showError } = useToast()
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [userStatus, setUserStatus] = useState<Record<string, UserStatus>>({})
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    fetchChats()
    const userId = searchParams.get('userId')
    if (userId) {
      setSelectedChat(userId)
      fetchMessages(userId)
    }

    // Simulate online status (in real app, use WebSocket/Socket.io)
    const interval = setInterval(() => {
      if (selectedChat) {
        // Simulate random online status
        setUserStatus(prev => ({
          ...prev,
          [selectedChat]: Math.random() > 0.3 ? 'online' : 'offline'
        }))
      }
    }, 5000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat)
    }
  }, [selectedChat])

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

    setSending(true)
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
    } finally {
      setSending(false)
      setIsTyping(false)
    }
  }

  function handleTyping() {
    if (!selectedChat) return

    setIsTyping(true)

    // Debounce typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Только что'
    if (minutes < 60) return `${minutes} мин назад`
    if (hours < 24) return `${hours} ч назад`
    if (days < 7) return `${days} дн назад`

    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    })
  }

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'offline': return 'bg-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
        <header className="bg-card border-b shadow-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="h-8 w-20 bg-secondary rounded" />
            <div className="flex gap-4">
              <div className="h-8 w-16 bg-secondary rounded" />
              <div className="h-8 w-20 bg-secondary rounded" />
            </div>
          </div>
        </header>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-display font-semibold text-primary">Roomy</Link>
          {/* Desktop Nav */}
          <nav className="hidden lg:flex gap-4">
            <Link href="/search" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Поиск
            </Link>
            <Link href="/profile" className="px-4 py-2 text-foreground/70 hover:text-foreground transition-colors">
              Профиль
            </Link>
          </nav>
          {/* Mobile Menu */}
          <MobileMenu
            links={[
              { href: '/search', label: 'Поиск' },
              { href: '/profile', label: 'Профиль' },
            ]}
          />
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
                    className={`w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors relative ${
                      selectedChat === chat.otherUser.id ? 'bg-primary/10' : ''
                    }`}
                  >
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={chat.otherUser.avatarUrl || '/default-avatar.png'}
                        alt={chat.otherUser.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${getStatusColor(
                          userStatus[chat.otherUser.id] || 'offline'
                        )}`}
                      />
                    </div>
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-foreground truncate">{chat.otherUser.name}</p>
                        {chat.lastMessage && (
                          <span className="text-xs text-foreground/50">
                            {formatTime(chat.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <p className="text-sm text-foreground/60 truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                    </div>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                        {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                      </div>
                    )}
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
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={chats.find(c => c.otherUser.id === selectedChat)?.otherUser.avatarUrl || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div
                        className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card ${getStatusColor(
                          userStatus[selectedChat] || 'offline'
                        )}`}
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-foreground">
                        {chats.find(c => c.otherUser.id === selectedChat)?.otherUser.name}
                      </h3>
                      <p className="text-xs text-foreground/60">
                        {userStatus[selectedChat] === 'online' ? 'В сети' : 'Был(а) недавно'}
                      </p>
                    </div>
                  </div>
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
                          {formatMessageTime(msg.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="bg-secondary px-4 py-3 rounded-lg">
                        <div className="flex gap-1">
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                            className="w-2 h-2 bg-foreground/50 rounded-full"
                          />
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-foreground/50 rounded-full"
                          />
                          <motion.span
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                            className="w-2 h-2 bg-foreground/50 rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value)
                      handleTyping()
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage(e)
                      }
                    }}
                    placeholder="Напишите сообщение..."
                    disabled={sending}
                    className="flex-1 px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                      />
                    ) : (
                      'Отправить'
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-foreground/60">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className="text-6xl mb-4"
                  >
                    💬
                  </motion.div>
                  <p className="text-lg">Выберите чат для начала общения</p>
                </div>
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
