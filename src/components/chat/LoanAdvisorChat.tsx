import { useState, useRef, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { buildSystemPrompt } from '../../lib/claudeClient'
import { useApplicationStore } from '../../store/useApplicationStore'
import { LOAN_PRODUCTS } from '../../data/loanProducts'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STARTER_MESSAGE: Message = {
  role: 'assistant',
  content:
    "Hi! I'm here to help you compare these loan options. Based on your profile, I can help you understand which products might be the best fit. What questions do you have?",
}

export default function LoanAdvisorChat() {
  const [messages, setMessages] = useState<Message[]>([STARTER_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { resolvedProfile, fundingAnswers, intake } = useApplicationStore()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const newMessages: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
      const systemPrompt = buildSystemPrompt(resolvedProfile, fundingAnswers, intake, LOAN_PRODUCTS)

      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: systemPrompt,
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      })

      const assistantText =
        response.content[0].type === 'text' ? response.content[0].text : ''

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble connecting right now. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      className="flex flex-col bg-white rounded-2xl shadow-sm border overflow-hidden"
      style={{
        borderColor: '#DADFE3',
        height: 'calc(100vh - 80px)',
        position: 'sticky',
        top: '64px',
      }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-start gap-3 flex-shrink-0"
        style={{ borderColor: '#DADFE3' }}
      >
        <span className="text-2xl leading-none mt-0.5">🤖</span>
        <div>
          <h2 className="font-semibold text-base" style={{ color: '#192526' }}>
            Loan Advisor
          </h2>
          <p className="text-xs mt-0.5" style={{ color: '#6B717A' }}>
            Ask me anything about these loan options
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
              style={
                msg.role === 'user'
                  ? { background: '#192526', color: '#fff' }
                  : {
                      background: '#F5F5F4',
                      color: '#192526',
                      border: '1px solid #DADFE3',
                    }
              }
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl px-4 py-3 text-sm"
              style={{
                background: '#F5F5F4',
                border: '1px solid #DADFE3',
                color: '#6B717A',
              }}
            >
              <span className="inline-flex gap-1 items-center">
                <span className="animate-bounce" style={{ animationDelay: '0ms' }}>
                  •
                </span>
                <span className="animate-bounce" style={{ animationDelay: '150ms' }}>
                  •
                </span>
                <span className="animate-bounce" style={{ animationDelay: '300ms' }}>
                  •
                </span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t flex-shrink-0" style={{ borderColor: '#DADFE3' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 text-sm border rounded-xl px-3 py-2 outline-none focus:ring-2"
            style={{
              borderColor: '#DADFE3',
              color: '#192526',
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
            style={{ background: '#192526', color: '#fff' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
