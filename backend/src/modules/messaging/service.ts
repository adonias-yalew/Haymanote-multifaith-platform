import { getSupabase } from '../../db/supabaseClient.js';
import { Conversation, Message, CreateConversationInput, SendMessageInput } from './types.js';
import { notificationService } from '../notifications/service.js';

export class MessagingService {
  async getOrCreateConversation(userId: string, input: CreateConversationInput): Promise<Conversation> {
    const supabase = getSupabase();

    const buyerId = userId;
    const vendorId = input.vendorId;
    const productId = input.productId || null;

    // Validate vendor exists and has vendor role
    const { data: vendorUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', vendorId)
      .single();
    if (!vendorUser || (vendorUser.role !== 'vendor' && vendorUser.role !== 'admin')) {
      throw new Error('Invalid vendor');
    }

    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('buyer_id', buyerId)
      .eq('vendor_id', vendorId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existing) return this.mapConversation(existing);

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        buyer_id: buyerId,
        vendor_id: vendorId,
        product_id: productId,
        subject: input.subject,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to create conversation');
    return this.mapConversation(data);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('conversations')
      .select('*, buyer:users!conversations_buyer_id_fkey(email), vendor:users!conversations_vendor_id_fkey(email, organization_name), product:products(title)')
      .or(`buyer_id.eq.${userId},vendor_id.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) throw new Error(error.message);

    const conversations: Conversation[] = [];

    for (const row of (data || [])) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', row.id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      const { data: lastMsg } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', row.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      conversations.push({
        ...this.mapConversation(row),
        lastMessage: lastMsg ? this.mapMessage(lastMsg) : undefined,
        productTitle: row.product?.title,
        buyerEmail: row.buyer?.email,
        vendorEmail: row.vendor?.email,
        vendorOrganizationName: row.vendor?.organization_name,
        unreadCount: count || 0,
      });
    }

    return conversations;
  }

  async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    const supabase = getSupabase();

    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .maybeSingle();

    if (!conv) throw new Error('Conversation not found');
    if (conv.buyer_id !== userId && conv.vendor_id !== userId) {
      const { data: user } = await supabase.from('users').select('role').eq('id', userId).single();
      if (user?.role !== 'admin') throw new Error('Access denied');
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*, sender:users(email)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((m) => ({
      ...this.mapMessage(m),
      senderEmail: m.sender?.email,
    }));
  }

  async sendMessage(userId: string, input: SendMessageInput): Promise<Message> {
    const supabase = getSupabase();

    const { data: conv } = await supabase
      .from('conversations')
      .select('*')
      .eq('id', input.conversationId)
      .maybeSingle();

    if (!conv) throw new Error('Conversation not found');
    if (conv.buyer_id !== userId && conv.vendor_id !== userId) {
      throw new Error('Access denied');
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: input.conversationId,
        sender_id: userId,
        content: input.content,
      })
      .select('*')
      .single();

    if (error || !data) throw new Error(error?.message || 'Failed to send message');

    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', input.conversationId);

    // Notify the other participant
    const recipientId = conv.buyer_id === userId ? conv.vendor_id : conv.buyer_id;
    const { data: senderUser } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    await notificationService.createNewMessageNotification(
      input.conversationId,
      recipientId,
      senderUser?.email || 'Unknown'
    ).catch(() => {});

    return this.mapMessage(data);
  }

  async markMessagesRead(conversationId: string, userId: string): Promise<void> {
    const supabase = getSupabase();

    await supabase
      .from('messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);
  }

  async markNotificationRead(notificationId: string, userId: string): Promise<void> {
    const supabase = getSupabase();
    await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);
  }

  private mapConversation(data: Record<string, unknown>): Conversation {
    return {
      id: data.id as string,
      productId: data.product_id as string | undefined,
      buyerId: data.buyer_id as string,
      vendorId: data.vendor_id as string,
      subject: data.subject as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapMessage(data: Record<string, unknown>): Message {
    return {
      id: data.id as string,
      conversationId: data.conversation_id as string,
      senderId: data.sender_id as string,
      content: data.content as string,
      isRead: data.is_read as boolean,
      readAt: data.read_at as string | undefined,
      createdAt: data.created_at as string,
    };
  }
}

export const messagingService = new MessagingService();
