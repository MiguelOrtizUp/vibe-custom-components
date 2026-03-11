/**
 * ChatPanel
 *
 * Left-side conversation panel where the user can describe a custom component
 * in natural language. Messages are sent to the runner's /api/chat/message
 * endpoint, which currently returns stub responses. In a future phase, the
 * endpoint will forward messages to a real LLM agent that generates component
 * code automatically.
 *
 * Future LLM agent workflow:
 *  1. User types a component description here (e.g. "Build a bar chart that
 *     takes a 'data' prop with {label, value} items").
 *  2. The runner sends the conversation history to the LLM (OpenAI / Anthropic /
 *     Azure OpenAI – configurable via env vars).
 *  3. The LLM returns a structured response with the component plan + code.
 *  4. The runner writes the generated files to the workspace.
 *  5. The preview panel hot-reloads to show the new component immediately.
 *  6. The user iterates via follow-up messages in this panel.
 */
import { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import { ChatMessage } from '../types';

interface Props {
  libraryName: string;
  onLog: (msg: string) => void;
}

export default function ChatPanel({ libraryName, onLog }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        `👋 Hi! I'm your component-building assistant for **${libraryName}**.\n\n` +
        `Describe the React component you'd like to create and I'll help you build it. ` +
        `For example:\n\n` +
        `_"Create a badge component that accepts a label string and a color prop."_\n\n` +
        `⚠️ **Note:** LLM integration is coming in a later phase. Right now I'll echo ` +
        `your message and explain what the agent will do.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const result = await api.sendChatMessage(updated);
      setMessages((prev) => [...prev, { role: 'assistant', content: result.reply }]);
      onLog(`[chat] Received ${result.isStub ? 'stub' : 'LLM'} response.`);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `❌ Error: ${errMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <span>💬 Component Chat</span>
        <span style={styles.badge}>Phase 1 – LLM stub</span>
      </div>

      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              ...(msg.role === 'user' ? styles.userMessage : styles.assistantMessage),
            }}
          >
            <span style={styles.roleLabel}>{msg.role === 'user' ? 'You' : 'Assistant'}</span>
            <p style={styles.messageText}>{msg.content}</p>
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.message, ...styles.assistantMessage }}>
            <span style={styles.roleLabel}>Assistant</span>
            <p style={{ ...styles.messageText, color: '#64748b' }}>Thinking…</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={sendMessage} style={styles.inputRow}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage(e as unknown as React.FormEvent);
            }
          }}
          placeholder="Describe the component you want to build…"
          rows={3}
          disabled={loading}
          style={styles.textarea}
        />
        <button type="submit" disabled={loading || !input.trim()} style={styles.sendBtn}>
          Send
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  panel: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    background: '#1a1d27',
    borderRight: '1px solid #2a2d3e',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #2a2d3e',
    color: '#e2e8f0',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  badge: {
    background: '#374151',
    color: '#9ca3af',
    fontSize: '0.7rem',
    padding: '0.15rem 0.5rem',
    borderRadius: '999px',
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  message: {
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    maxWidth: '100%',
  },
  userMessage: {
    background: '#312e81',
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    background: '#1e293b',
    alignSelf: 'flex-start',
  },
  roleLabel: {
    fontSize: '0.7rem',
    color: '#64748b',
    display: 'block',
    marginBottom: '0.2rem',
  },
  messageText: {
    margin: 0,
    color: '#e2e8f0',
    fontSize: '0.85rem',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.5,
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '0.75rem',
    borderTop: '1px solid #2a2d3e',
  },
  textarea: {
    resize: 'none',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid #2a2d3e',
    background: '#0f1117',
    color: '#e2e8f0',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit',
  },
  sendBtn: {
    alignSelf: 'flex-end',
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
};
