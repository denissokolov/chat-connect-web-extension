import type { IRepository } from './IRepository'
import type { Message, Thread } from '@/types/types'

export class MemoryDBRepository implements IRepository {
  private threads: Map<string, Thread> = new Map()
  private messages: Map<string, Message> = new Map()

  init(): Promise<void> {
    this.threads.clear()
    this.messages.clear()
    return Promise.resolve()
  }

  getThreads(): Promise<Thread[]> {
    return Promise.resolve(
      Array.from(this.threads.values()).sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    )
  }

  createThread(thread: Thread): Promise<void> {
    this.threads.set(thread.id, { ...thread })
    return Promise.resolve()
  }

  updateThread(thread: Partial<Thread>): Promise<void> {
    const threadId = thread.id
    if (!threadId) {
      return Promise.reject(new Error('Thread id is required'))
    }

    const existingThread = this.threads.get(threadId)
    if (!existingThread) {
      return Promise.reject(new Error(`Thread with id ${threadId} not found`))
    }

    this.threads.set(threadId, {
      ...existingThread,
      ...thread,
      createdAt: existingThread.createdAt,
    })
    return Promise.resolve()
  }

  deleteThread(id: string): Promise<void> {
    this.threads.delete(id)

    for (const [messageId, message] of this.messages) {
      if (message.threadId === id) {
        this.messages.delete(messageId)
      }
    }

    return Promise.resolve()
  }

  getMessages(threadId: string): Promise<Message[]> {
    const messages: Message[] = []

    for (const message of this.messages.values()) {
      if (message.threadId === threadId) {
        messages.push(message)
      }
    }

    messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

    return Promise.resolve(messages)
  }

  createMessage(message: Message): Promise<void> {
    this.messages.set(message.id, { ...message })
    return Promise.resolve()
  }

  updateMessage(message: Message): Promise<void> {
    this.messages.set(message.id, { ...message })
    return Promise.resolve()
  }
}
