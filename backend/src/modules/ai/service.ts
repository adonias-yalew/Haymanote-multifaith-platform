import { getSupabase } from '../../db/supabaseClient.js';
import { Conversation, Message, ChatInput } from './types.js';
import { env } from '../../config/env.js';

const getGeminiApiUrl = () =>
  `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`;

const SPIRITUAL_RESPONSES = [
  {
    keywords: ['prayer', 'fasting', 'scripture', 'faith', 'guidance', 'peace'],
    response: `When you feel anxious or overwhelmed, remember the words of Philippians 4:6-7: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."

Take a deep breath and offer a quiet prayer. You can use our **Prayer Tracker** to write down your worries as prayer requests and share them with the community so others can stand in prayer with you. Would you like me to help you write a simple prayer for peace?`
  },
  {
    keywords: ['prayer', 'pray', 'devotion', 'intercede'],
    response: `Prayer is our direct lifeline to the Divine—a simple, heartfelt conversation. If you are looking to build a consistent prayer routine, I encourage you to visit our **Prayer Tracker**. 

There, you can log your daily prayers, track your answered prayers, and share public prayer requests on the community board for other members to support you. Let me know if you'd like a guided prayer or a scripture translation for your devotions today!`
  },
  {
    keywords: ['faith', 'doubt', 'believe', 'trust'],
    response: `Doubt is not the opposite of faith; it is often a stepping stone to a deeper, more mature relationship with God. As Hebrews 11:1 reminds us: "Now faith is confidence in what we hope for and assurance about what we do not see."

Take time to read the **Sermons & Teachings** section, where spiritual leaders post theological articles and reflections to help answer difficult questions and build your faith. Is there a specific theological question or doubt you are reflecting on today?`
  },
  {
    keywords: ['sermon', 'teach', 'learn', 'preach', 'bible', 'scripture'],
    response: `Exploring scriptures and spiritual teachings is key to growth. In our **Sermons & Teachings** section, you will find columns, articles, and lectures uploaded by verified spiritual Leaders. 

If you need deeper spiritual guidance or have detailed questions, you can also browse the **Find Leaders** page to get in touch directly with our spiritual fathers, ministers, and advisors. What scriptures are you studying right now?`
  },
  {
    keywords: ['marketplace', 'buy', 'product', 'book', 'bible', 'cross', 'candle'],
    response: `Looking for spiritual books, study Bibles, candles, icons, crosses, or other religious items? Our **Marketplace** connects you with verified vendors from our community who offer high-quality religious items and educational resources. 

You can browse the catalog, support local vendors, and purchase items directly. What kind of items are you looking for today?`
  },
  {
    keywords: ['leader', 'father', 'pastor', 'priest', 'shepherd', 'counsel'],
    response: `If you are facing a difficult personal challenge or seeking pastoral care, connecting with a verified spiritual leader is highly recommended. 

Through our **Find Leaders** section, you can review the focus areas, credentials, and years of experience of our spiritual guides, and send them a private message or email. We are here to support your journey.`
  }
];

export class AiService {
  async getConversations(userId: string): Promise<Conversation[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapConversation);
  }
  
  async getMessages(conversationId: string, userId: string): Promise<Message[]> {
    const supabase = getSupabase();
    
    // Verify conversation ownership
    const { data: conv } = await supabase
      .from('ai_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();
    
    if (!conv || conv.user_id !== userId) {
      throw new Error('Access denied or conversation not found');
    }
    
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapMessage);
  }
  
  async deleteConversation(conversationId: string, userId: string): Promise<void> {
    const supabase = getSupabase();
    
    const { data: conv } = await supabase
      .from('ai_conversations')
      .select('user_id')
      .eq('id', conversationId)
      .single();
    
    if (!conv || conv.user_id !== userId) {
      throw new Error('Access denied or conversation not found');
    }
    
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);
      
    if (error) throw new Error(error.message);
  }

  private async callGeminiAPI(message: string, history: Array<{ role: string; content: string }>, religion: string): Promise<string> {
    if (!env.GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, using fallback responses');
      return this.generateFallbackResponse(message);
    }

    try {
      const systemPrompt = `You are a spiritual assistant on a faith-based community platform called Haymanote. You provide guidance and support for ${religion} community members. 
      Keep responses thoughtful, respectful, and grounded in spiritual wisdom. When appropriate, direct users to our platform features like Prayer Tracker, Sermons & Teachings, Marketplace, or suggest connecting with verified spiritual leaders.
      Always maintain a warm, supportive tone and respect the user's faith tradition.`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\nUser: ' + message }]
        }
      ];

      // Include conversation history if available
      history.slice(-5).forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });

      const response = await fetch(`${getGeminiApiUrl()}?key=${env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents })
      });

      if (!response.ok) {
        console.error('Gemini API error:', response.statusText);
        return this.generateFallbackResponse(message);
      }

      const data: unknown = await response.json();
      const reply = (data as any)?.candidates?.[0]?.content?.parts?.[0]?.text as string;
      return reply || this.generateFallbackResponse(message);
    } catch (error) {
      console.error('Gemini API call failed:', error);
      return this.generateFallbackResponse(message);
    }
  }

  private generateFallbackResponse(message: string): string {
    const query = message.toLowerCase();
    for (const item of SPIRITUAL_RESPONSES) {
      if (item.keywords.some(kw => query.includes(kw))) {
        return item.response;
      }
    }
    return `Thank you for sharing that with me. As a spiritual assistant on Haymanote, I am here to walk with you on your faith journey.\n\nPlease let me know if you would like to explore scriptural reflections, log your worries in our **Prayer Tracker**, check out the latest spiritual articles in **Sermons & Teachings**, or connect with one of our verified **Spiritual Leaders** for pastoral guidance. How can I support you right now?`;
  }
  
  async chat(userId: string, religion: string, input: ChatInput): Promise<{ conversation: Conversation; message: Message }> {
    const supabase = getSupabase();
    let conversationId = input.conversationId;
    let conversation: Conversation;
    
    // 1. Create conversation if missing
    if (!conversationId) {
      const title = input.message.substring(0, 40) || 'New Chat';
      const { data: newConv, error: convErr } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          religion: religion,
          title,
        })
        .select('*')
        .single();
        
      if (convErr || !newConv) throw new Error(convErr?.message || 'Failed to start AI conversation');
      conversation = this.mapConversation(newConv);
      conversationId = conversation.id;
    } else {
      // Fetch existing conversation and verify ownership
      const { data: existingConv } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();
        
      if (!existingConv || existingConv.user_id !== userId) {
        throw new Error('Access denied or conversation not found');
      }
      conversation = this.mapConversation(existingConv);
    }
    
    // 2. Save user message to database
    const { error: userMsgErr } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: input.message,
      });
      
    if (userMsgErr) throw new Error(userMsgErr.message);
    
    // 3. Get conversation history for context
    const history = input.history || [];

    // 4. Generate response using Gemini API or fallback
    const reply = await this.callGeminiAPI(input.message, history, religion);
    
    // 5. Save assistant response to database
    const { data: assistantMsg, error: asstMsgErr } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: reply,
      })
      .select('*')
      .single();
      
    if (asstMsgErr || !assistantMsg) throw new Error(asstMsgErr?.message || 'Failed to save assistant response');
    
    // Update conversation timestamp
    await supabase
      .from('ai_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
      
    return {
      conversation,
      message: this.mapMessage(assistantMsg),
    };
  }
  
  private mapConversation(data: Record<string, unknown>): Conversation {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      title: data.title as string,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
  
  private mapMessage(data: Record<string, unknown>): Message {
    return {
      id: data.id as string,
      conversationId: data.conversation_id as string,
      role: data.role as 'user' | 'assistant',
      content: data.content as string,
      createdAt: data.created_at as string,
    };
  }
}

export const aiService = new AiService();
