/**
 * Payment Service Abstraction
 *
 * Clean interface for payment providers. Add new providers by implementing
 * the PaymentProvider interface and registering them in the registry.
 *
 * Supported providers: chapa, telebirr, cbe_birr, stripe, paypal, cash_on_delivery
 */

import { getSupabase } from '../db/supabaseClient.js';

export type PaymentProvider = 'chapa' | 'telebirr' | 'cbe_birr' | 'stripe' | 'paypal' | 'cash_on_delivery' | 'other';

export interface PaymentRequest {
  orderId: string;
  userId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  providerTransactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  message?: string;
  redirectUrl?: string;
}

export interface PaymentProviderInterface {
  name: PaymentProvider;
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  verifyPayment(transactionId: string): Promise<PaymentResult>;
  refundPayment(transactionId: string, amount?: number): Promise<PaymentResult>;
}

export class PaymentService {
  private providers: Map<PaymentProvider, PaymentProviderInterface> = new Map();

  registerProvider(provider: PaymentProviderInterface): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: PaymentProvider): PaymentProviderInterface {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`Payment provider "${name}" is not registered`);
    }
    return provider;
  }

  async processPayment(providerName: PaymentProvider, request: PaymentRequest): Promise<PaymentResult> {
    const provider = this.getProvider(providerName);
    const result = await provider.processPayment(request);

    const supabase = getSupabase();
    await supabase.from('payment_transactions').insert({
      order_id: request.orderId,
      user_id: request.userId,
      provider: providerName,
      provider_transaction_id: result.providerTransactionId,
      amount: request.amount,
      currency: request.currency || 'ETB',
      status: result.status,
      metadata: request.metadata,
    });

    return result;
  }

  async verifyPayment(providerName: PaymentProvider, transactionId: string): Promise<PaymentResult> {
    const provider = this.getProvider(providerName);
    return provider.verifyPayment(transactionId);
  }

  async refundPayment(providerName: PaymentProvider, transactionId: string, amount?: number): Promise<PaymentResult> {
    const provider = this.getProvider(providerName);
    const result = await provider.refundPayment(transactionId, amount);

    if (result.success) {
      const supabase = getSupabase();
      await supabase
        .from('payment_transactions')
        .update({ status: 'refunded' })
        .eq('provider_transaction_id', transactionId);
    }

    return result;
  }

  async getTransactionHistory(orderId: string): Promise<any[]> {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
  }
}

export const paymentService = new PaymentService();
