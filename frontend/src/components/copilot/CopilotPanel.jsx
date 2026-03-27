import { useRef, useEffect, useState } from 'react'
import { X, Zap, Send, Trash2 } from 'lucide-react'
import useCopilotStore from '../../store/useCopilotStore'
import { copilotApi }  from '../../api/client'
import ChatBubble      from './ChatBubble'

const SUGGESTED = [
  'Summarise my pipeline',
  'Which leads are Prospects?',
  'Show opportunities above RM 10,000',
  'How many open opportunities do I have?',
]

const MIN_WIDTH = 280
const MAX_WIDTH = 720
const DEFAULT_WIDTH = 384   // w-96

export default function CopilotPanel() {
  const { isOpen, messages, isLoading, toggleOpen, addMessage, setLoading, clearMessages, getApiHistory } =
    useCopilotStore()

  const [input,    setInput]    = useState('')
  const [width,    setWidth]    = useState(DEFAULT_WIDTH)
  const bottomRef              = useRef(null)
  const dragging               = useRef(false)

  function onResizeMouseDown(e) {
    e.preventDefault()
    dragging.current = true

    function onMouseMove(ev) {
      if (!dragging.current) return
      const newWidth = window.innerWidth - ev.clientX
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, newWidth)))
    }

    function onMouseUp() {
      dragging.current = false
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function sendMessage(text) {
    const userText = (text ?? input).trim()
    if (!userText || isLoading) return
    setInput('')

    addMessage({ role: 'user', content: userText })
    setLoading(true)

    try {
      const history = getApiHistory()
      const res = await copilotApi.query(userText, history)
      addMessage({ role: 'assistant', content: res.data.answer })
    } catch (err) {
      const errMsg = err.response?.data?.error ?? 'Something went wrong. Please try again.'
      addMessage({ role: 'assistant', content: errMsg, error: true })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed right-0 top-0 h-full bg-white border-l border-gray-200 shadow-2xl flex flex-col z-40"
      style={{ width: `${width}px` }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute left-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-blue-400 transition-colors z-50"
        title="Drag to resize"
      />
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-900 text-white">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-yellow-400" />
          <span className="text-sm font-semibold">CRM Copilot</span>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
              title="Clear chat"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={toggleOpen}
            className="p-1.5 text-gray-400 hover:text-white rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <div className="text-center pt-6">
              <div className="inline-flex p-3 bg-yellow-50 rounded-full mb-3">
                <Zap size={24} className="text-yellow-500" />
              </div>
              <p className="text-sm font-semibold text-gray-700">Ask about your CRM data</p>
              <p className="text-xs text-gray-400 mt-1">
                Powered by Claude AI · Answers based on your live data
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 px-1">Try asking:</p>
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => <ChatBubble key={msg.id} message={msg} />)
        )}

        {isLoading && (
          <div className="flex items-start gap-2">
            <span className="p-1.5 rounded-full bg-gray-200 text-gray-600 mt-0.5">
              <Zap size={13} className="text-yellow-500" />
            </span>
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your CRM data..."
            rows={2}
            className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
