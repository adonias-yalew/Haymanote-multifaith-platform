import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  Loader,
  Sparkles,
  Copy,
  Check,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Edit3,
  CheckCheck,
  X,
} from 'lucide-react';
import { aiApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

function parseMarkdown(text: string): string {
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : '';
    return `<pre class="code-block"><button class="copy-btn" onclick="(function(btn){var code=btn.parentElement.querySelector('code').textContent;navigator.clipboard.writeText(code);btn.innerHTML='Copied!';setTimeout(function(){btn.innerHTML='Copy'},2000)})(this)">Copy</button><code${langClass}>${code.trim()}</code></pre>`;
  });

  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul class="list">$&</ul>');

  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ol class="list">$&</ol>');

  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');

  return `<p>${html}</p>`;
}

function truncate(str: string, len: number) {
  return str.length > len ? str.substring(0, len) + '...' : str;
}

const AICopilotPage = () => {
  const { user } = useAuth();
  const isAdmin = !user?.religion;
  const religion = user?.religion?.toLowerCase() || 'orthodox';

  const theme = isAdmin
    ? { accent: 'indigo', gradient: 'from-indigo-600 to-purple-600', btn: 'bg-indigo-600 hover:bg-indigo-700', light: 'indigo-50', text: 'indigo-600', ring: 'indigo-500', border: 'indigo-200/60' }
    : religion === 'muslim'
    ? { accent: 'emerald', gradient: 'from-emerald-600 to-teal-600', btn: 'bg-emerald-600 hover:bg-emerald-700', light: 'emerald-50', text: 'emerald-600', ring: 'emerald-500', border: 'emerald-200/60' }
    : religion === 'protestant'
    ? { accent: 'blue', gradient: 'from-blue-600 to-cyan-600', btn: 'bg-blue-600 hover:bg-blue-700', light: 'blue-50', text: 'blue-600', ring: 'blue-500', border: 'blue-200/60' }
    : { accent: 'amber', gradient: 'from-amber-600 to-orange-600', btn: 'bg-amber-600 hover:bg-amber-700', light: 'amber-50', text: 'amber-600', ring: 'amber-500', border: 'amber-200/60' };

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const saved = localStorage.getItem('ai_conversations');
      return saved ? JSON.parse(saved).map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        updatedAt: new Date(c.updatedAt),
        messages: (c.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
      })) : [];
    } catch { return []; }
  });
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pageView, setPageView] = useState<'list' | 'chat'>('list');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const currentConv = conversations.find(c => c.id === currentConversationId);

  const saveConversations = useCallback((updated: Conversation[]) => {
    setConversations(updated);
    localStorage.setItem('ai_conversations', JSON.stringify(updated));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (currentConversationId) {
      const conv = conversations.find(c => c.id === currentConversationId);
      if (conv) {
        setMessages(conv.messages);
        setStreamingContent('');
      }
    }
  }, [currentConversationId, conversations]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const openConv = (id: string) => {
    setCurrentConversationId(id);
    setPageView('chat');
  };

  const startNewChat = () => {
    const newConv: Conversation = {
      id: 'local-' + Date.now(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    saveConversations([newConv, ...conversations]);
    setCurrentConversationId(newConv.id);
    setMessages([]);
    setInput('');
    setStreamingContent('');
    setPageView('chat');
  };

  const deleteConversation = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = conversations.filter(c => c.id !== id);
    saveConversations(updated);
    if (currentConversationId === id) {
      if (updated.length > 0) {
        setCurrentConversationId(updated[0].id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
        setPageView('list');
      }
    }
  };

  const startEditTitle = (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    setEditingTitle(id);
    setEditTitleValue(title);
  };

  const saveTitle = (id: string) => {
    const updated = conversations.map(c =>
      c.id === id ? { ...c, title: editTitleValue || 'New Chat', updatedAt: new Date() } : c
    );
    saveConversations(updated);
    setEditingTitle(null);
  };

  const goBackToList = () => {
    setPageView('list');
    setCurrentConversationId(null);
    setMessages([]);
  };

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    let convId = currentConversationId;
    let isNew = false;

    if (!convId) {
      const newConv: Conversation = {
        id: 'local-' + Date.now(),
        title: text.substring(0, 50).split('\n')[0] || 'New Chat',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveConversations([newConv, ...conversations]);
      convId = newConv.id;
      setCurrentConversationId(convId);
      isNew = true;
    }

    const userMsg: Message = {
      id: 'msg-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    setStreamingContent('');

    try {
      const response = await aiApi.chat({
        message: text,
        conversationId: undefined,
        history: messages.map(m => ({ role: m.role, content: m.content })),
      });
      const data = response.data.data;
      const persistedId = data.conversation.id as string;
      const replyText = data.message.content || 'How can I help you further?';

      const assistantMsg: Message = {
        id: data.message.id || ('msg-' + Date.now() + 1),
        role: 'assistant',
        content: replyText,
        timestamp: new Date(data.message.createdAt || Date.now()),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setCurrentConversationId(persistedId);

      const updated = (() => {
        const exists = conversations.some(c => c.id === convId || c.id === persistedId);
        const allMsgs = [...(exists ? conversations.find(c => c.id === convId || c.id === persistedId)?.messages || [] : []), userMsg, assistantMsg];
        const base = exists ? conversations.map(c =>
          (c.id === convId || c.id === persistedId)
            ? { ...c, id: persistedId, messages: allMsgs, title: c.title === 'New Chat' ? text.substring(0, 50).split('\n')[0] : c.title, updatedAt: new Date() }
            : c
        ) : [...conversations];
        if (!exists) {
          return [{
            id: persistedId,
            title: text.substring(0, 50).split('\n')[0],
            messages: allMsgs,
            createdAt: new Date(data.conversation.createdAt || Date.now()),
            updatedAt: new Date(data.conversation.updatedAt || Date.now()),
          }, ...conversations];
        }
        return base;
      })();
      saveConversations(updated);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: Message = {
        id: 'msg-' + Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    const plain = text.replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(plain);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (pageView === 'list') {
    return (
      <div className="h-[calc(100vh-72px)] flex items-center justify-center bg-white">
        <div className="w-full max-w-lg mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center mx-auto shadow-lg mb-4`}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">AI Copilot</h1>
            <p className="text-sm text-slate-500 mt-1">Faith-based spiritual assistant</p>
          </div>

          {/* New Chat */}
          <button
            onClick={startNewChat}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl ${theme.btn} text-white font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-[0.98] mb-6`}
          >
            <Plus className="w-5 h-5" />
            <span>New Chat</span>
          </button>

          {/* Conversations */}
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm font-medium text-slate-400">No conversations yet</p>
              <p className="text-xs text-slate-300 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map(conv => {
                const lastMsg = conv.messages[conv.messages.length - 1];
                return (
                  <button
                    key={conv.id}
                    onClick={() => openConv(conv.id)}
                    className="w-full text-left flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50 transition-all group shadow-sm hover:shadow-md"
                  >
                    <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{conv.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {lastMsg ? truncate(lastMsg.content, 80) : 'No messages'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {conv.messages.length} {conv.messages.length === 1 ? 'message' : 'messages'}
                      </p>
                    </div>
                    <button
                      onClick={e => deleteConversation(e, conv.id)}
                      className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shrink-0 self-start mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-72px)] flex relative">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`absolute lg:relative z-40 h-full transition-all duration-300 ease-out flex flex-col bg-white border-r border-slate-200/80 ${
          sidebarOpen ? 'w-72 translate-x-0' : 'w-0 -translate-x-full lg:w-0 lg:translate-x-0 overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-slate-200/80">
          <button
            onClick={startNewChat}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 ${theme.btn} text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg active:scale-[0.98]`}
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400">No conversations yet</p>
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setCurrentConversationId(conv.id)}
                className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                  currentConversationId === conv.id
                    ? `bg-${theme.light} border border-${theme.border}`
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentConversationId === conv.id ? `text-${theme.text}` : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  {editingTitle === conv.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        value={editTitleValue}
                        onChange={e => setEditTitleValue(e.target.value)}
                        className="flex-1 text-sm px-1.5 py-0.5 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                        onKeyDown={e => { if (e.key === 'Enter') saveTitle(conv.id); if (e.key === 'Escape') setEditingTitle(null); }}
                        onClick={e => e.stopPropagation()}
                      />
                      <button onClick={e => { e.stopPropagation(); saveTitle(conv.id); }} className="p-0.5 text-green-600 hover:text-green-700"><CheckCheck className="w-3.5 h-3.5" /></button>
                      <button onClick={e => { e.stopPropagation(); setEditingTitle(null); }} className="p-0.5 text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ) : (
                    <p className="text-sm font-medium text-slate-800 truncate">{conv.title}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-0.5">
                    {conv.messages.length} {conv.messages.length === 1 ? 'message' : 'messages'}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => startEditTitle(e, conv.id, conv.title)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => deleteConversation(e, conv.id)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-14 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-all shrink-0"
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            </button>
            <button
              onClick={goBackToList}
              className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-all shrink-0"
              title="Back to conversations"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-slate-900 truncate">
                  {currentConv ? currentConv.title : 'AI Copilot'}
                </h1>
                <p className="text-xs text-slate-400">Faith-based spiritual assistant</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 && currentConversationId ? (
            <div className="h-full flex flex-col items-center justify-center px-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-md mb-4`}>
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm text-slate-500">Ask a question to start the conversation</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
              {messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 group items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: '0s' }}
                >
                  {msg.role === 'assistant' && (
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm shrink-0 mt-1`}>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`relative max-w-[85%] sm:max-w-[75%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                    <div
                      className={`px-4 py-3 ${
                        msg.role === 'user'
                          ? `bg-${theme.accent}-600 text-white rounded-2xl rounded-br-md`
                          : 'bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-bl-md shadow-sm'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div
                          className="prose-sm leading-relaxed [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:rounded-xl [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_code]:bg-slate-100 [&_code]:text-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-sm [&_pre_code]:bg-transparent [&_pre_code]:text-slate-100 [&_pre_code]:p-0 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mb-1 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2 [&_li]:mb-0.5 [&_p]:mb-2 [&_p:last-child]:mb-0]"
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                        />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                      )}
                    </div>
                    <div className={`flex items-center gap-2 mt-1 px-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px] text-slate-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {msg.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(msg.content, msg.id)}
                          className="p-0.5 text-slate-400 hover:text-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center shadow-sm shrink-0 mt-1">
                      <span className="text-xs font-bold text-white">
                        {(user?.email?.split('@')[0] || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex gap-3 items-start animate-fade-in">
                  <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-sm shrink-0 mt-1`}>
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-slate-200/80 rounded-2xl rounded-bl-md shadow-sm px-5 py-4">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-200/80 bg-white px-4 py-4 shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-slate-300 focus-within:bg-white transition-all shadow-sm">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask for spiritual guidance..."
                disabled={isLoading}
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none resize-none max-h-[200px] py-1.5 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className={`p-2.5 rounded-xl ${theme.btn} text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md active:scale-[0.95] shrink-0`}
              >
                {isLoading ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              Press Enter to send &middot; Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICopilotPage;