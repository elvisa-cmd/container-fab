import { getMessages } from '@/lib/data'
import MessagesClient from './MessagesClient'
import type { Message } from '@/types'

export default async function MessagesPage() {
  const all = await getMessages()
  // Newest first
  const messages: Message[] = all.slice().sort((a, b) => b.created_at.localeCompare(a.created_at))
  return <MessagesClient initialMessages={messages} />
}
