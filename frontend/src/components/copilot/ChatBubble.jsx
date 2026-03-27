import clsx from 'clsx'
import { Bot, User } from 'lucide-react'

export default function ChatBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={clsx('flex items-start gap-2', isUser && 'flex-row-reverse')}>
      <span className={clsx(
        'p-1.5 rounded-full shrink-0 mt-0.5',
        isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
      )}>
        {isUser ? <User size={13} /> : <Bot size={13} />}
      </span>

      <div className={clsx(
        'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap',
        isUser
          ? 'bg-blue-600 text-white rounded-tr-sm'
          : message.error
            ? 'bg-red-50 text-red-700 border border-red-200 rounded-tl-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
      )}>
        {message.content}
      </div>
    </div>
  )
}
