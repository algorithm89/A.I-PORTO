import { useState, useRef, useEffect } from 'react'
import './ChatBot.css'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function ChatBot() {
  const [open, setOpen]           = useState(false)
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef            = useRef(null)
  const inputRef                  = useRef(null)

  const token = localStorage.getItem('token')

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  // Focus input when panel opens
  useEffect(() => {
    if (open && token) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open, token])

  async function handleSend() {
    const text = input.trim()
    if (!text || streaming) return

    const userMsg = { role: 'user', content: text }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setStreaming(true)

    // Add empty assistant message that we'll stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      // Build history (last 10 messages for context)
      const history = newMessages.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(errText || `HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        // SSE format: lines starting with "data:"
        const lines = chunk.split('\n')
        for (const line of lines) {
          let text = line
          if (line.startsWith('data:')) {
            text = line.slice(5)
          }
          if (!text || text.trim() === '') continue

          // Append token to the last assistant message
          setMessages(prev => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last && last.role === 'assistant') {
              updated[updated.length - 1] = {
                ...last,
                content: last.content + text,
              }
            }
            return updated
          })
        }
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => {
        const updated = [...prev]
        const last = updated[updated.length - 1]
        if (last && last.role === 'assistant' && last.content === '') {
          updated[updated.length - 1] = {
            ...last,
            content: 'Sorry, something went wrong. Please try again.',
          }
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating action button */}
      <button className="chatbot-fab" onClick={() => setOpen(o => !o)} aria-label="Chat">
        {open ? '✕' : '💬'}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-title">
              <span>AI</span> Assistant
            </div>
            <button className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>

          {!token ? (
            /* Not logged in */
            <div className="chatbot-login-prompt">
              <p>🔒 <strong>Log in</strong> to chat with our AI assistant.</p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="chatbot-messages">
                {messages.length === 0 && (
                  <div className="chatbot-msg chatbot-msg-assistant">
                    Hey! 👋 I'm the BublikStudios AI. Ask me anything!
                  </div>
                )}
                {messages.map((msg, i) => (
                  <div key={i} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                    {msg.content}
                  </div>
                ))}
                {streaming && messages[messages.length - 1]?.content === '' && (
                  <div className="chatbot-typing">
                    <span /><span /><span />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="chatbot-input-area">
                <textarea
                  ref={inputRef}
                  className="chatbot-input"
                  rows={1}
                  placeholder="Type a message..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={streaming}
                />
                <button
                  className="chatbot-send"
                  onClick={handleSend}
                  disabled={streaming || !input.trim()}
                  aria-label="Send"
                >
                  ▶
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}

