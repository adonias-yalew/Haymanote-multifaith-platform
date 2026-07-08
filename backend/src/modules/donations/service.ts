import { getSupabase } from '../../db/supabaseClient.js';
import { DonationRecipient, Donation, CreateDonationRecipientInput, CreateDonationInput } from './types.js';

export class DonationService {
  async getRecipientsByReligion(religion: string): Promise<DonationRecipient[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('donation_recipients')
      .select('*')
      .eq('religion', religion)
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRecipient);
  }

  async getAllRecipients(): Promise<DonationRecipient[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('donation_recipients')
      .select('*')
      .order('religion', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapRecipient);
  }

  async getRecipientById(id: string): Promise<DonationRecipient | null> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('donation_recipients')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapRecipient(data);
  }

  async createRecipient(input: CreateDonationRecipientInput): Promise<DonationRecipient> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('donation_recipients')
      .insert({
        name: input.name,
        religion: input.religion,
        description: input.description || null,
        image_url: input.imageUrl || null,
        bank_account: input.bankAccount || null,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create donation recipient');
    return this.mapRecipient(data);
  }

  async updateRecipient(id: string, input: Partial<CreateDonationRecipientInput>): Promise<DonationRecipient> {
    const supabase = getSupabase();
    
    const updates: Record<string, unknown> = {};
    if (input.name) updates.name = input.name;
    if (input.religion) updates.religion = input.religion;
    if (input.description !== undefined) updates.description = input.description;
    if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
    if (input.bankAccount !== undefined) updates.bank_account = input.bankAccount;
    
    const { data, error } = await supabase
      .from('donation_recipients')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to update donation recipient');
    return this.mapRecipient(data);
  }

  async deleteRecipient(id: string): Promise<void> {
    const supabase = getSupabase();
    const { error } = await supabase.from('donation_recipients').delete().eq('id', id);
    if (error) throw new Error(error.message);
  }

  async createDonation(userId: string, input: CreateDonationInput): Promise<Donation> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('donations')
      .insert({
        user_id: userId,
        recipient_id: input.recipientId,
        amount: input.amount,
        transaction_id: input.transactionId || null,
      })
      .select('*')
      .single();
    
    if (error || !data) throw new Error(error?.message || 'Failed to create donation');
    return this.mapDonation(data);
  }

  async getUserDonations(userId: string): Promise<Donation[]> {
    const supabase = getSupabase();
    
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapDonation);
  }

  async getDonationStats(): Promise<{ totalDonations: number; totalAmount: number }> {
    const supabase = getSupabase();
    
    const { data, error, count } = await supabase
      .from('donations')
      .select('amount', { count: 'exact' });
    
    if (error) throw new Error(error.message);
    
    const totalAmount = (data || []).reduce((sum, donation) => sum + (donation.amount || 0), 0);
    
    return {
      totalDonations: count || 0,
      totalAmount
    };
  }

  async getRecipientDonations(recipientId: string): Promise<{ totalAmount: number; donationCount: number }> {
    const supabase = getSupabase();
    
    const { data, error, count } = await supabase
      .from('donations')
      .select('amount', { count: 'exact' })
      .eq('recipient_id', recipientId);
    
    if (error) throw new Error(error.message);
    
    const totalAmount = (data || []).reduce((sum, donation) => sum + (donation.amount || 0), 0);
    
    return {
      totalAmount,
      donationCount: count || 0
    };
  }

  private mapRecipient(data: Record<string, unknown>): DonationRecipient {
    return {
      id: data.id as string,
      religion: data.religion as string,
      name: data.name as string,
      description: data.description as string | undefined,
      imageUrl: data.image_url as string | undefined,
      bankAccount: data.bank_account as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }

  private mapDonation(data: Record<string, unknown>): Donation {
    return {
      id: data.id as string,
      userId: data.user_id as string,
      recipientId: data.recipient_id as string,
      amount: data.amount as number,
      transactionId: data.transaction_id as string | undefined,
      createdAt: data.created_at as string,
      updatedAt: data.updated_at as string,
    };
  }
}

export const donationService = new DonationService();
