import { describe, it, expect, beforeEach } from 'vitest'

import {
  MessageContentType,
  MessageRole,
  type Message,
  type MessageContent,
  type Thread,
} from '@/types/types'

import { MemoryDBRepository } from './MemoryDBRepository'

describe('MemoryDBRepository', () => {
  let repository: MemoryDBRepository

  const mockThread1: Thread = {
    id: 'thread-1',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
  }

  const mockThread2: Thread = {
    id: 'thread-2',
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T13:00:00Z',
  }

  const mockMessage1: Message = {
    id: 'message-1',
    role: MessageRole.User,
    content: [{ type: MessageContentType.OutputText, text: 'Hello world', id: '1' }],
    createdAt: '2024-01-01T10:30:00Z',
    threadId: 'thread-1',
  }

  const mockMessage2: Message = {
    id: 'message-2',
    role: MessageRole.Assistant,
    content: [{ type: MessageContentType.OutputText, text: 'Hello there!', id: '2' }],
    createdAt: '2024-01-01T10:31:00Z',
    threadId: 'thread-1',
  }

  const mockMessage3: Message = {
    id: 'message-3',
    role: MessageRole.User,
    content: [{ type: MessageContentType.OutputText, text: 'How are you?', id: '3' }],
    createdAt: '2024-01-01T11:30:00Z',
    threadId: 'thread-2',
  }

  beforeEach(async () => {
    repository = new MemoryDBRepository()
    await repository.init()
  })

  describe('init', () => {
    it('should clear all threads and messages', async () => {
      await repository.createThread(mockThread1)
      await repository.createMessage(mockMessage1)

      const threadsBefore = await repository.getThreads()
      const messagesBefore = await repository.getMessages('thread-1')
      expect(threadsBefore).toHaveLength(1)
      expect(messagesBefore).toHaveLength(1)

      await repository.init()

      const threadsAfter = await repository.getThreads()
      const messagesAfter = await repository.getMessages('thread-1')
      expect(threadsAfter).toHaveLength(0)
      expect(messagesAfter).toHaveLength(0)
    })

    it('should resolve successfully', async () => {
      await expect(repository.init()).resolves.toBeUndefined()
    })
  })

  describe('getThreads', () => {
    it('should return empty array when no threads exist', async () => {
      const threads = await repository.getThreads()
      expect(threads).toEqual([])
    })

    it('should return all threads sorted by updatedAt descending', async () => {
      await repository.createThread(mockThread1)
      await repository.createThread(mockThread2)

      const threads = await repository.getThreads()

      expect(threads).toHaveLength(2)
      expect(threads[0]).toEqual(mockThread2)
      expect(threads[1]).toEqual(mockThread1)
    })

    it('should return stored thread objects directly', async () => {
      await repository.createThread(mockThread1)

      const threads = await repository.getThreads()
      expect(threads[0]).toEqual(mockThread1)
      expect(threads[0]).toBe(threads[0])
    })
  })

  describe('createThread', () => {
    it('should create a thread successfully', async () => {
      await repository.createThread(mockThread1)

      const threads = await repository.getThreads()
      expect(threads).toHaveLength(1)
      expect(threads[0]).toEqual(mockThread1)
    })

    it('should store thread as a copy', async () => {
      const thread = { ...mockThread1 }
      await repository.createThread(thread)

      thread.updatedAt = '2024-12-31T23:59:59Z'

      const threads = await repository.getThreads()
      expect(threads[0]).toEqual(mockThread1)
    })

    it('should allow creating multiple threads', async () => {
      await repository.createThread(mockThread1)
      await repository.createThread(mockThread2)

      const threads = await repository.getThreads()
      expect(threads).toHaveLength(2)
    })

    it('should resolve successfully', async () => {
      await expect(repository.createThread(mockThread1)).resolves.toBeUndefined()
    })
  })

  describe('updateThread', () => {
    it('should update an existing thread', async () => {
      await repository.createThread(mockThread1)

      const updatedThread: Thread = {
        ...mockThread1,
        updatedAt: '2024-01-01T15:00:00Z',
      }

      await repository.updateThread(updatedThread)

      const threads = await repository.getThreads()
      expect(threads[0]).toEqual(updatedThread)
    })

    it('should preserve createdAt when updating', async () => {
      await repository.createThread(mockThread1)

      const updatedThread: Thread = {
        ...mockThread1,
        createdAt: '2024-12-31T23:59:59Z',
        updatedAt: '2024-01-01T15:00:00Z',
      }

      await repository.updateThread(updatedThread)

      const threads = await repository.getThreads()
      expect(threads[0].createdAt).toBe(mockThread1.createdAt)
      expect(threads[0].updatedAt).toBe('2024-01-01T15:00:00Z')
    })

    it('should reject when thread does not exist', async () => {
      await expect(repository.updateThread(mockThread1)).rejects.toThrow(
        'Thread with id thread-1 not found',
      )
    })

    it('should resolve successfully when thread exists', async () => {
      await repository.createThread(mockThread1)
      await expect(repository.updateThread(mockThread1)).resolves.toBeUndefined()
    })
  })

  describe('deleteThread', () => {
    it('should delete an existing thread', async () => {
      await repository.createThread(mockThread1)
      await repository.createThread(mockThread2)

      await repository.deleteThread('thread-1')

      const threads = await repository.getThreads()
      expect(threads).toHaveLength(1)
      expect(threads[0].id).toBe('thread-2')
    })

    it('should delete all messages associated with the thread', async () => {
      await repository.createThread(mockThread1)
      await repository.createThread(mockThread2)
      await repository.createMessage(mockMessage1)
      await repository.createMessage(mockMessage2)
      await repository.createMessage(mockMessage3)

      const messages1Before = await repository.getMessages('thread-1')
      const messages2Before = await repository.getMessages('thread-2')
      expect(messages1Before).toHaveLength(2)
      expect(messages2Before).toHaveLength(1)

      await repository.deleteThread('thread-1')

      const messages1After = await repository.getMessages('thread-1')
      const messages2After = await repository.getMessages('thread-2')
      expect(messages1After).toHaveLength(0)
      expect(messages2After).toHaveLength(1)
      expect(messages2After[0]).toEqual(mockMessage3)
    })

    it('should handle deleting non-existent thread gracefully', async () => {
      await expect(repository.deleteThread('non-existent')).resolves.toBeUndefined()
    })

    it('should resolve successfully', async () => {
      await repository.createThread(mockThread1)
      await expect(repository.deleteThread('thread-1')).resolves.toBeUndefined()
    })
  })

  describe('getMessages', () => {
    it('should return empty array when no messages exist for thread', async () => {
      const messages = await repository.getMessages('non-existent-thread')
      expect(messages).toEqual([])
    })

    it('should return messages for specific thread only', async () => {
      await repository.createMessage(mockMessage1)
      await repository.createMessage(mockMessage2)
      await repository.createMessage(mockMessage3)

      const messages1 = await repository.getMessages('thread-1')
      const messages2 = await repository.getMessages('thread-2')

      expect(messages1).toHaveLength(2)
      expect(messages2).toHaveLength(1)

      expect(messages1.some(m => m.id === 'message-1' && m.threadId === 'thread-1')).toBe(true)
      expect(messages1.some(m => m.id === 'message-2' && m.threadId === 'thread-1')).toBe(true)

      expect(messages2.some(m => m.id === 'message-3' && m.threadId === 'thread-2')).toBe(true)
    })

    it('should return messages sorted by createdAt ascending', async () => {
      await repository.createMessage(mockMessage2)
      await repository.createMessage(mockMessage1)

      const messages = await repository.getMessages('thread-1')

      expect(messages).toHaveLength(2)
      expect(messages[0]).toEqual(mockMessage1)
      expect(messages[1]).toEqual(mockMessage2)
    })

    it('should return stored message objects directly', async () => {
      await repository.createMessage(mockMessage1)

      const messages = await repository.getMessages('thread-1')
      expect(messages[0]).toEqual(mockMessage1)
      expect(messages[0]).toBe(messages[0])
    })
  })

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      await repository.createMessage(mockMessage1)

      const messages = await repository.getMessages('thread-1')
      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(mockMessage1)
    })

    it('should store message as a copy', async () => {
      const message = { ...mockMessage1 }
      await repository.createMessage(message)

      message.content = [
        { id: '333', type: MessageContentType.OutputText, text: 'Modified content' },
      ]

      const messages = await repository.getMessages('thread-1')
      expect(messages[0]).toEqual(mockMessage1)
    })

    it('should allow creating multiple messages', async () => {
      await repository.createMessage(mockMessage1)
      await repository.createMessage(mockMessage2)

      const messages = await repository.getMessages('thread-1')
      expect(messages).toHaveLength(2)
    })

    it('should handle messages with errors', async () => {
      const messageWithError: Message = {
        ...mockMessage1,
        error: 'Something went wrong',
      }

      await repository.createMessage(messageWithError)

      const messages = await repository.getMessages('thread-1')
      expect(messages[0]).toEqual(messageWithError)
      expect(messages[0].error).toBe('Something went wrong')
    })

    it('should resolve successfully', async () => {
      await expect(repository.createMessage(mockMessage1)).resolves.toBeUndefined()
    })
  })

  describe('edge cases and integration', () => {
    it('should handle multiple operations in sequence', async () => {
      await repository.createThread(mockThread1)
      await repository.createThread(mockThread2)
      await repository.createMessage(mockMessage1)
      await repository.createMessage(mockMessage2)
      await repository.createMessage(mockMessage3)

      const updatedThread = { ...mockThread1, updatedAt: '2024-01-01T16:00:00Z' }
      await repository.updateThread(updatedThread)

      const createdMessage = {
        ...mockMessage1,
        content: [
          {
            id: '444',
            text: 'Updated hello',
            type: MessageContentType.OutputText,
          } as MessageContent,
        ],
      }
      await repository.createMessage(createdMessage)

      await repository.deleteThread('thread-2')

      const threads = await repository.getThreads()
      const messages = await repository.getMessages('thread-1')

      expect(threads).toHaveLength(1)
      expect(threads[0]).toEqual(updatedThread)
      expect(messages).toHaveLength(2)
      expect(messages[0].content).toEqual([
        {
          id: '444',
          text: 'Updated hello',
          type: MessageContentType.OutputText,
        },
      ])
    })

    it('should handle same ID replacement for threads', async () => {
      await repository.createThread(mockThread1)

      const replacementThread: Thread = {
        id: 'thread-1',
        createdAt: '2024-01-02T10:00:00Z',
        updatedAt: '2024-01-02T12:00:00Z',
      }

      await repository.createThread(replacementThread)

      const threads = await repository.getThreads()
      expect(threads).toHaveLength(1)
      expect(threads[0]).toEqual(replacementThread)
    })

    it('should handle same ID replacement for messages', async () => {
      await repository.createMessage(mockMessage1)

      const replacementMessage: Message = {
        id: 'message-1',
        role: MessageRole.Assistant,
        content: [{ id: '555', type: MessageContentType.OutputText, text: 'Replacement content' }],
        createdAt: '2024-01-01T12:00:00Z',
        threadId: 'thread-1',
      }

      await repository.createMessage(replacementMessage)

      const messages = await repository.getMessages('thread-1')
      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(replacementMessage)
    })

    it('should maintain data consistency after init', async () => {
      await repository.createThread(mockThread1)
      await repository.createMessage(mockMessage1)

      await repository.init()

      await repository.createThread(mockThread2)
      await repository.createMessage(mockMessage3)

      const threads = await repository.getThreads()
      const messages = await repository.getMessages('thread-2')

      expect(threads).toHaveLength(1)
      expect(threads[0]).toEqual(mockThread2)
      expect(messages).toHaveLength(1)
      expect(messages[0]).toEqual(mockMessage3)

      const oldMessages = await repository.getMessages('thread-1')
      expect(oldMessages).toHaveLength(0)
    })
  })
})
