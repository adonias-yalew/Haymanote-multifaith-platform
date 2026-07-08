import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Trash2, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from 'react-router-dom';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SESSION_KEY = 'ai_widget_session';

function getTheme(user: { religion?: string | null } | null) {
  const isAdmin = !user?.religion;
  const religion = user?.religion?.toLowerCase() || 'orthodox';
  if (isAdmin) return {
    accent: 'indigo', gradient: 'from-indigo-600 to-purple-600',
    btn: 'bg-indigo-600 hover:bg-indigo-700', light: 'indigo-50',
    text: 'indigo-600', shadow: 'shadow-indigo-500/25',
  };
  if (religion === 'muslim') return {
    accent: 'emerald', gradient: 'from-emerald-600 to-teal-600',
    btn: 'bg-emerald-600 hover:bg-emerald-700', light: 'emerald-50',
    text: 'emerald-600', shadow: 'shadow-emerald-500/25',
  };
  if (religion === 'protestant') return {
    accent: 'blue', gradient: 'from-blue-600 to-cyan-600',
    btn: 'bg-blue-600 hover:bg-blue-700', light: 'blue-50',
    text: 'blue-600', shadow: 'shadow-blue-500/25',
  };
  return {
    accent: 'amber', gradient: 'from-amber-600 to-orange-600',
    btn: 'bg-amber-600 hover:bg-amber-700', light: 'amber-50',
    text: 'amber-600', shadow: 'shadow-amber-500/25',
  };
}

function loadSession(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return [];
    return JSON.parse(raw).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch { return []; }
}

function saveSession(msgs: ChatMessage[]) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(msgs));
}

const AIChatWidget = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const theme = getTheme(user);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadSession);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  if (!isAuthenticated || location.pathname === '/copilot') return null;

  const startNewSession = () => {
    setMessages([]);
    setInput('');
    localStorage.removeItem(SESSION_KEY);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'wm-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    const updated = [...messages, userMsg];
    setMessages(updated);
    saveSession(updated);
    setInput('');
    setIsLoading(true);

    try {
      await new Promise(r => setTimeout(r, 1200));
      const reply: ChatMessage = {
        id: 'wm-' + Date.now() + 1,
        role: 'assistant',
        content: 'Thank you for your question. I am here to provide spiritual guidance and support. Could you tell me more about what is on your heart so I can offer meaningful assistance?',
        timestamp: new Date(),
      };
      const final = [...updated, reply];
      setMessages(final);
      saveSession(final);
    } catch {
      const errMsg: ChatMessage = {
        id: 'wm-' + Date.now() + 2,
        role: 'assistant',
        content: 'I am sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      const final = [...updated, errMsg];
      setMessages(final);
      saveSession(final);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 sm:bg-transparent sm:pointer-events-none animate-fadeIn" onClick={() => setIsOpen(false)} />
      )}

      {/* Glow behind button */}
      <div
        className={`fixed bottom-5 right-5 z-40 w-20 h-20 -m-3 rounded-2xl bg-gradient-to-br ${theme.gradient} opacity-20 blur-xl transition-all duration-700 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-20 animate-pulse-soft'
        }`}
      />

      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open AI chat'}
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-90 animate-float ${
          isOpen ? 'rotate-90 opacity-0 scale-75 pointer-events-none' : 'opacity-100 scale-100'
        }`}
      >
        <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain" />
      </button>

      {/* Close button */}
      <button
        onClick={() => setIsOpen(false)}
        aria-label="Close chat"
        className={`fixed bottom-5 right-5 z-50 w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center shadow-xl transition-all duration-300 hover:bg-slate-700 hover:scale-105 active:scale-90 ${
          isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
        }`}
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className={`fixed z-50 bottom-24 right-5 w-[calc(100vw-40px)] sm:w-[380px] h-[520px] max-h-[calc(100vh-140px)] bg-white rounded-2xl shadow-2xl border border-slate-200/80 flex flex-col transition-all duration-300 ease-out overflow-hidden ${
          isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 h-14 border-b border-slate-200/80 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm shrink-0`}>
              <img src="/logo.png" alt="Logo" className="w-4 h-4 object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate leading-tight">AI Spiritual Guide</p>
              <p className="text-[10px] text-slate-400 leading-tight">Faith-based assistant</p>
            </div>
          </div>
          <button
            onClick={startNewSession}
            title="New session"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-3 animate-fadeIn">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-md mb-3`}>
                <img src="/logo.png" alt="Logo" className="w-5 h-5 object-contain" />
              </div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Ask me anything</p>
              <p className="text-xs text-slate-400">Spiritual guidance, prayer support, or scripture help</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 items-start animate-fadeIn ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm shrink-0 mt-1`}>
                      <img src="/logo.png" alt="Logo" className="w-3.5 h-3.5 object-contain" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? `bg-${theme.accent}-600 text-white rounded-2xl rounded-br-md`
                        : 'bg-slate-50 text-slate-800 rounded-2xl rounded-bl-md border border-slate-200/60'
                    }`}
                  >
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shadow-sm shrink-0 mt-1">
                      <span className="text-[11px] font-bold text-white">
                        {(user?.email?.split('@')[0] || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2.5 items-start animate-fadeIn">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm shrink-0 mt-1`}>
                    <img src="/logo.png" alt="Logo" className="w-3.5 h-3.5 object-contain" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '0.6s' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms', animationDuration: '0.6s' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms', animationDuration: '0.6s' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 border-t border-slate-200/80 bg-white p-3 rounded-b-2xl">
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:border-slate-300 focus-within:bg-white transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question..."
              disabled={isLoading}
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none max-h-[120px] py-1 disabled:opacity-50 transition-opacity"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-lg ${theme.btn} text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:scale-105 active:scale-90 shrink-0`}
            >
              {isLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatWidget;