import { useEffect, useMemo, useRef, useState } from 'react';
import { Mail, MessageSquare, Search, Send, ArrowLeft, Loader } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import type { Conversation, Message } from '../types';
import { messagingApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

const VendorMessagesPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    try {
      const res = await messagingApi.getConversations();
      setConversations(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const res = await messagingApi.getMessages(conversationId);
      setMessages(res.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load messages');
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadMessages(selectedId);
      messagingApi.markConversationRead(selectedId).catch(() => {});
    }
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Realtime subscription for messages and conversations
  useEffect(() => {
    if (!supabase || !user) return;

    const channel = supabase
      .channel('messaging_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as any;
          if (selectedId && newMsg.conversation_id === selectedId) {
            setMessages(prev => {
              if (prev.some(m => m.id === newMsg.id)) return prev;
              return [...prev, {
                id: newMsg.id,
                conversationId: newMsg.conversation_id,
                senderId: newMsg.sender_id,
                content: newMsg.content,
                isRead: newMsg.is_read,
                readAt: newMsg.read_at,
                createdAt: newMsg.created_at,
              }];
            });
          }
          // Reload conversations to update last message
          loadConversations();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'conversations' },
        () => { loadConversations(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedId, user]);

  const filteredConversations = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return conversations;
    return conversations.filter(c =>
      (c.buyerEmail?.toLowerCase().includes(needle)) ||
      (c.vendorEmail?.toLowerCase().includes(needle)) ||
      (c.subject?.toLowerCase().includes(needle)) ||
      (c.lastMessage?.content?.toLowerCase().includes(needle))
    );
  }, [query, conversations]);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const handleSend = async () => {
    if (!reply.trim() || !selectedId || sending) return;
    setSending(true);
    try {
      await messagingApi.sendMessage({ conversationId: selectedId, content: reply });
      setReply('');
      await loadMessages(selectedId);
      loadConversations();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getOtherPartyName = (conv: Conversation) => {
    if (!user) return '';
    if (conv.buyerId === user.id) {
      return conv.vendorOrganizationName || conv.vendorEmail || 'Vendor';
    }
    return conv.buyerEmail || 'Customer';
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6 pb-8">
        <div><h1 className="text-3xl font-semibold tracking-tight text-slate-950">Messages</h1></div>
        <div className="flex items-center justify-center py-20"><Loader className="h-8 w-8 animate-spin text-slate-400" /></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Messages</h1>
        <p className="mt-1 text-sm text-slate-600">Customer conversations and inquiries.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        {/* Inbox Sidebar */}
        <section className="rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Inbox</h2>
              <p className="text-sm text-slate-600">{conversations.filter(c => c.unreadCount && c.unreadCount > 0).length} unread</p>
            </div>
            <Mail className="h-5 w-5 text-slate-400" />
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">No conversations yet.</p>
            ) : filteredConversations.map(conv => (
              <button
                key={conv.id}
                type="button"
                onClick={() => setSelectedId(conv.id)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedId === conv.id ? 'border-indigo-200 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950 truncate">{getOtherPartyName(conv)}</p>
                  <span className="text-xs text-slate-500 shrink-0">
                    {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : conv.createdAt.slice(0, 10)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-sm font-medium text-slate-700">{conv.subject || 'General inquiry'}</p>
                {conv.lastMessage && (
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{conv.lastMessage.content}</p>
                )}
                {conv.unreadCount && conv.unreadCount > 0 && (
                  <span className="mt-1 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                    {conv.unreadCount} new
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Chat Panel */}
        <section className="rounded-lg border border-slate-200 bg-white p-5 flex flex-col h-[600px]">
          {selectedConversation ? (
            <>
              <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-4 shrink-0">
                <button onClick={() => { setSelectedId(null); setMessages([]); }} className="lg:hidden p-1 text-slate-500 hover:text-slate-700">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-950 truncate">{selectedConversation.subject || 'Conversation'}</h2>
                  <p className="text-sm text-slate-600 truncate">{getOtherPartyName(selectedConversation)}</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4 px-1">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-sm text-slate-500">
                    No messages yet. Start the conversation.
                  </div>
                ) : messages.map(msg => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMine
                            ? 'bg-indigo-600 text-white rounded-br-md'
                            : 'bg-slate-50 text-slate-800 border border-slate-200/60 rounded-bl-md'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {isMine && (
                            <span className="ml-1">{msg.isRead ? '✓✓' : '✓'}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 border-t border-slate-100 pt-4">
                <div className="flex gap-2 items-end">
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    rows={2}
                    placeholder="Type your reply..."
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
                  />
                  <Button
                    type="button"
                    onClick={handleSend}
                    disabled={!reply.trim() || sending}
                    isLoading={sending}
                    rightIcon={<Send className="h-4 w-4" />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <MessageSquare className="h-12 w-12 mb-3 text-slate-300" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs text-slate-400 mt-1">Choose a conversation from the inbox to start chatting</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default VendorMessagesPage;
