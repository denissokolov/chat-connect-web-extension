import { memo } from 'react'

import ChatFooter from './ChatFooter/ChatFooter'
import ChatInput from './ChatInput/ChatInput'
import ChatContent from './ChatContent/ChatContent'
import { MessageRole, type Message } from '@/types/chat.types'

const messages: Message[] = [
  {
    id: '1',
    content: 'Please make a summary of this page',
    role: MessageRole.User,
    timestamp: new Date(),
  },
  {
    id: '2',
    content:
      'This is the summary of the page: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    role: MessageRole.Assistant,
    timestamp: new Date(),
  },
  {
    id: '3',
    content: 'What is the main idea of the page?',
    role: MessageRole.User,
    timestamp: new Date(),
  },
  {
    id: '4',
    content: 'The main idea of the page is to make a summary of the page',
    role: MessageRole.Assistant,
    timestamp: new Date(),
  },
  {
    id: '5',
    content: 'What time is it?',
    role: MessageRole.User,
    timestamp: new Date(),
  },
  {
    id: '6',
    content: 'It is 12:00 PM',
    role: MessageRole.Assistant,
    timestamp: new Date(),
  },
  {
    id: '7',
    content: 'Ultimate Question of Life, the Universe, and Everything',
    role: MessageRole.User,
    timestamp: new Date(),
  },
  {
    id: '8',
    content: '',
    role: MessageRole.Assistant,
    timestamp: new Date(),
    loading: true,
  },
]

function Chat() {
  return (
    <div className="h-full flex-1 flex flex-col">
      <ChatContent messages={messages} loading={false} error={null} retry={() => {}} />
      <ChatInput />
      <ChatFooter />
    </div>
  )
}

export default memo(Chat)
