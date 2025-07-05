import type { IRepository } from './IRepository'
import type { Message, Thread } from '@/types/types'

export class IndexedDBRepository implements IRepository {
  private readonly dbName = 'ChatConnectDB'
  private readonly dbVersion = 1
  private readonly threadsStore = 'threads'
  private readonly messagesStore = 'messages'

  private db: IDBDatabase | undefined = undefined

  async init(): Promise<void> {
    this.db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = () => {
        const db = request.result

        if (!db.objectStoreNames.contains(this.threadsStore)) {
          const threadsStore = db.createObjectStore(this.threadsStore, { keyPath: 'id' })
          threadsStore.createIndex('createdAt', 'createdAt', { unique: false })
          threadsStore.createIndex('updatedAt', 'updatedAt', { unique: false })
        }

        if (!db.objectStoreNames.contains(this.messagesStore)) {
          const messagesStore = db.createObjectStore(this.messagesStore, { keyPath: 'id' })
          messagesStore.createIndex('threadId', 'threadId', { unique: false })
          messagesStore.createIndex('createdAt', 'createdAt', { unique: false })
        }
      }
    })
  }

  private getDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('Database not initialized')
    }
    return this.db
  }

  getThreads(): Promise<Thread[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([this.threadsStore], 'readonly')
      const store = transaction.objectStore(this.threadsStore)
      const index = store.index('updatedAt')
      const request = index.openCursor(null, 'prev') // Sort by updatedAt descending

      const threads: Thread[] = []

      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) {
          const thread = cursor.value
          threads.push(thread)
          cursor.continue()
        } else {
          resolve(threads)
        }
      }

      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  createThread(thread: Thread): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([this.threadsStore], 'readwrite')
      const store = transaction.objectStore(this.threadsStore)

      const request = store.add(thread)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  updateThread(thread: Omit<Thread, 'createdAt'>): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([this.threadsStore], 'readwrite')
      const store = transaction.objectStore(this.threadsStore)

      const getRequest = store.get(thread.id)

      getRequest.onsuccess = () => {
        const existingThread = getRequest.result
        if (!existingThread) {
          reject(new Error(`Thread with id ${thread.id} not found`))
          return
        }

        const updatedThread = {
          id: thread.id,
          createdAt: existingThread.createdAt,
          updatedAt: thread.updatedAt,
        }

        const putRequest = store.put(updatedThread)

        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      }
      getRequest.onerror = () => reject(getRequest.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  deleteThread(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction(
        [this.threadsStore, this.messagesStore],
        'readwrite',
      )
      const threadsStore = transaction.objectStore(this.threadsStore)
      const messagesStore = transaction.objectStore(this.messagesStore)

      const deleteThreadRequest = threadsStore.delete(id)

      const messagesIndex = messagesStore.index('threadId')
      const messagesRequest = messagesIndex.openCursor(IDBKeyRange.only(id))

      messagesRequest.onsuccess = () => {
        const cursor = messagesRequest.result
        if (cursor) {
          cursor.delete()
          cursor.continue()
        }
      }

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
      deleteThreadRequest.onerror = () => reject(deleteThreadRequest.error)
      messagesRequest.onerror = () => reject(messagesRequest.error)
    })
  }

  getMessages(threadId: string): Promise<Message[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([this.messagesStore], 'readonly')
      const store = transaction.objectStore(this.messagesStore)
      const index = store.index('threadId')
      const request = index.getAll(threadId)

      request.onsuccess = () => {
        const messages: Message[] = request.result
        resolve(messages)
      }

      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  createMessage(message: Message): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([this.messagesStore], 'readwrite')
      const store = transaction.objectStore(this.messagesStore)

      const request = store.add(message)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }

  updateMessage(message: Message): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.getDB().transaction([this.messagesStore], 'readwrite')
      const store = transaction.objectStore(this.messagesStore)

      const request = store.put(message)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
      transaction.onerror = () => reject(transaction.error)
    })
  }
}
