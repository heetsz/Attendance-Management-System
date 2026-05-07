import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './AdminChatbot.css';

const initialAssistantMessage = {
  role: 'assistant',
  content: 'Hi! Ask me about anything visible on this admin dashboard (e.g., a student’s attendance in the loaded subject table).',
};

const normalizeMarkdown = (text) => {
  if (typeof text !== 'string') return '';

  // Common LLM formatting: ** name ** -> **name**
  const normalized = text
    .replace(/\*\*\s+([^*\n][^*\n]*?)\s+\*\*/g, '**$1**')
    .replace(/__\s+([^_\n][^_\n]*?)\s+__/g, '__$1__');

  return normalized;
};

const AdminChatbot = ({ dashboardState }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([initialAssistantMessage]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const listRef = useRef(null);

  const stateForPrompt = useMemo(() => {
    return dashboardState || {};
  }, [dashboardState]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [open, messages, sending]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setError('');
    setSending(true);
    setInput('');

    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);

    try {
      const { data } = await api.post('/groq/chat', {
        messages: nextMessages,
        dashboardState: stateForPrompt,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send message';
      const status = err.response?.data?.groqStatus;
      const details = err.response?.data?.details;
      const detailText = details ? String(details).slice(0, 800) : '';
      setError(`${msg}${status ? ` (Groq ${status})` : ''}${detailText ? ` — ${detailText}` : ''}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="acb-root" aria-live="polite">
      {/* Floating button */}
      <button
        className={`acb-fab ${open ? 'open' : ''}`}
        onClick={() => setOpen((p) => !p)}
        type="button"
        title={open ? 'Close assistant' : 'Open assistant'}
        aria-expanded={open}
        aria-controls="admin-chatbot-panel"
      >
        {open ? '✕' : '💬'}
      </button>

      {/* Panel */}
      {open && (
        <div className="acb-panel glass" id="admin-chatbot-panel" role="dialog" aria-label="Admin assistant">
          <div className="acb-header">
            <div className="acb-title">
              <span className="acb-dot" />
              Admin Assistant
            </div>
            <button className="acb-close" onClick={() => setOpen(false)} type="button">✕</button>
          </div>

          <div className="acb-messages" ref={listRef}>
            {messages.map((m, idx) => (
              <div key={idx} className={`acb-msg ${m.role === 'user' ? 'user' : 'assistant'}`}>
                <div className="acb-bubble">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: (props) => (
                        <a
                          {...props}
                          target="_blank"
                          rel="noreferrer noopener"
                        />
                      ),
                    }}
                  >
                    {normalizeMarkdown(m.content)}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            {sending && (
              <div className="acb-msg assistant">
                <div className="acb-bubble">Thinking…</div>
              </div>
            )}
          </div>

          {error && <div className="acb-error">{error}</div>}

          <div className="acb-input">
            <input
              className="acb-text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about attendance, subjects, etc…"
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              disabled={sending}
            />
            <button className="acb-send" onClick={sendMessage} disabled={sending || !input.trim()} type="button">
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatbot;
