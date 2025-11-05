import type { Message, Thread } from '@/types/chat.types'

export interface IRepository {
  init(): Promise<void>
  getThreads(): Promise<Thread[]>
  createThread(thread: Thread): Promise<void>
  updateThread(thread: Partial<Thread>): Promise<void>
  deleteThread(id: string): Promise<void>
  clearAllHistory(): Promise<void>
  getMessages(threadId: string): Promise<Message[]>
  createMessage(message: Message): Promise<void>
  updateMessage(message: Message): Promise<void>
}
