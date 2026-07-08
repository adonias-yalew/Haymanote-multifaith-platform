import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, Loader, ArrowLeft, User, Store, Search, CheckCheck } from 'lucide-react';
import { messagingApi } from '../services/api';
import type { Conversation, Message } from '../types';

const QUICK_QUESTIONS = [
  'Is it available?',
  'Is the price fixed?',
  'Can you deliver?',
  'What is the condition?',
  'Do you have more photos?',
];

const CustomerMessagesPage = () => {
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await messagingApi.getConversations();
        setConversations(res.data.data || []);
        const convId = searchParams.get('conversationId');
        if (convId) {
          setSelectedId(convId);
          setShowMobileList(false);
        }
      } catch { setError('Failed to load conversations'); }
      finally { setLoading(false); }
    };
    load();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) return;
    setShowMobileList(false);
    setError('');
    const load = async () => {
      try {
        const res = await messagingApi.getMessages(selectedId);
        setMessages(res.data.data || []);
        await messagingApi.markConversationRead(selectedId).catch(() => {});
      } catch { setError('Failed to load messages'); }
    };
    load();
  }, [selectedId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (text?: string) => {
    const msg = text || content;
    if (!msg.trim() || !selectedId) return;
    setSending(true);
    try {
      await messagingApi.sendMessage({ conversationId: selectedId, content: msg.trim() });
      setContent('');
      const res = await messagingApi.getMessages(selectedId);
      setMessages(res.data.data || []);
    } catch { setError('Failed to send'); }
    finally { setSending(false); }
  };

  const filtered = conversations.filter(c =>
    c.lastMessage || messages.some(m => m.conversationId === c.id)
  ).filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.productTitle || '').toLowerCase().includes(q) ||
      (c.vendorOrganizationName || c.vendorEmail || '').toLowerCase().includes(q)
    );
  });

  const selectedConversation = conversations.find(c => c.id === selectedId);

  return (
    <div className="mx-auto max-w-6xl py-6 px-4">
      <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to Marketplace
      </Link>
      <h1 className="text-2xl font-bold text-slate-950 mb-6">My Messages</h1>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 mb-4">{error}</div>}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="flex h-full flex-row-reverse md:flex-row">
          {/* Chat area (right on mobile, right on desktop when sidebar is left) */}
          <div className={`flex-1 flex flex-col min-w-0 ${showMobileList ? 'hidden md:flex' : 'flex'}`}>
            {selectedId ? (
              <>
                {/* Header */}
                <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 shrink-0 bg-white">
                  <button className="md:hidden text-slate-500 p-1 -ml-1" onClick={() => { setShowMobileList(true); setSelectedId(null); }}>
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {selectedConversation?.vendorOrganizationName || selectedConversation?.vendorEmail || 'Vendor'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {selectedConversation?.productTitle || 'Product Inquiry'}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-[#f0f2f5]">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Store className="h-10 w-10 text-slate-300 mb-3" />
                      <p className="text-sm text-slate-500 mb-4 text-center">
                        Ask the vendor about this product
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center max-w-xs">
                        {QUICK_QUESTIONS.map(q => (
                          <button
                            key={q}
                            onClick={() => handleSend(q)}
                            disabled={sending}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm text-slate-700 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors disabled:opacity-50"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const conv = selectedConversation;
                      const isMine = msg.senderId === conv?.buyerId || msg.senderId === conv?.vendorId || !msg.senderEmail;
                      const showTime = i === 0 || new Date(msg.createdAt).toDateString() !== new Date(messages[i - 1].createdAt).toDateString();
                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <div className="flex justify-center mb-3">
                              <span className="text-[11px] text-slate-500 bg-white px-3 py-1 rounded-full shadow-sm">
                                {new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                                isMine
                                  ? 'bg-[#d1fae5] text-slate-900 rounded-br-sm'
                                  : 'bg-white text-slate-900 rounded-bl-sm border border-slate-100'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[10px] ${isMine ? 'text-emerald-700/60' : 'text-slate-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {isMine && (
                                  <CheckCheck className={`h-3.5 w-3.5 ${msg.isRead ? 'text-blue-500' : 'text-slate-400'}`} />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t border-slate-200 bg-white p-3 shrink-0">
                  {messages.length > 0 && messages.length < 3 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUICK_QUESTIONS.slice(0, 3).map(q => (
                        <button
                          key={q}
                          onClick={() => handleSend(q)}
                          disabled={sending}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2 items-end">
                    <input
                      value={content}
                      onChange={e => setContent(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Type a message..."
                      className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                    <button
                      onClick={() => handleSend()}
                      disabled={sending || !content.trim()}
                      className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-slate-400 bg-[#f0f2f5]">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                  <p className="font-medium text-slate-500">Select a conversation</p>
                  <p className="text-xs text-slate-400 mt-1">Choose a conversation from the list</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - LEFT */}
          <div className={`md:w-80 border-r border-slate-200 overflow-y-auto shrink-0 bg-white ${showMobileList ? 'w-full block' : 'hidden md:block'}`}>
            {/* Search */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full h-9 rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16"><Loader className="h-6 w-6 animate-spin text-slate-400" /></div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-16">No conversations yet.</p>
            ) : filtered.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex items-start gap-3 ${
                  selectedId === conv.id ? 'bg-indigo-50/50' : ''
                }`}
              >
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {conv.vendorOrganizationName || conv.vendorEmail || 'Vendor'}
                    </p>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(conv.lastMessage.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate">{conv.productTitle || 'Product Inquiry'}</p>
                  {conv.lastMessage && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{conv.lastMessage.content}</p>
                  )}
                </div>
                {conv.unreadCount && conv.unreadCount > 0 && (
                  <span className="h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-1">
                    {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerMessagesPage;
