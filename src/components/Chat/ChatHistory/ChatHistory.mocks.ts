import type { Thread } from '@/types/types'
import { DateTime } from 'luxon'

export const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    title: 'How do I implement a React component with TypeScript?',
    createdAt: DateTime.now().minus({ hours: 2 }).toISO(),
    updatedAt: DateTime.now().minus({ minutes: 30 }).toISO(),
  },
  {
    id: 'thread-2',
    title: 'What are the best practices for state management in React?',
    createdAt: DateTime.now().minus({ days: 1 }).toISO(),
    updatedAt: DateTime.now().minus({ hours: 5 }).toISO(),
  },
  {
    id: 'thread-3',
    title: 'Explain the difference between useEffect and useLayoutEffect',
    createdAt: DateTime.now().minus({ days: 3 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 2 }).toISO(),
  },
  {
    id: 'thread-4',
    title: 'Help me debug this CSS flexbox layout issue',
    createdAt: DateTime.now().minus({ weeks: 1 }).toISO(),
    updatedAt: DateTime.now().minus({ days: 5 }).toISO(),
  },
]
