import React, { useState, useEffect } from 'react';
import { Heart, Copy, Check, Loader2, Gift, CreditCard } from 'lucide-react';
import { donationsApi } from '../services/api';
import { useAuth } from '../hooks/useAuth.tsx';

interface DonationRecipient {
  id: string;
  religion: string;
  name: string;
  description?: string;
  imageUrl?: string;
  bankAccount?: string;
}

const DonatePage = () => {
  const { user } = useAuth();
  const [allRecipients, setAllRecipients] = useState<DonationRecipient[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<DonationRecipient[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipients = async () => {
      try {
        setLoading(true);
        const response = await donationsApi.getAllRecipients();
        const recipients = response.data.data || [];
        setAllRecipients(recipients);
        
        // Filter recipients by user's religion
        if (user?.religion) {
          const filtered = recipients.filter(
            (r: DonationRecipient) => r.religion.toLowerCase() === user.religion.toLowerCase()
          );
          setFilteredRecipients(filtered);
          if (filtered.length > 0) {
            setSelectedRecipient(filtered[0].id);
          }
        }
      } catch (err) {
        setError('Failed to load donation recipients');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipients();
  }, [user?.religion]);

  const handleCopyBankAccount = (bankAccount: string, recipientId: string) => {
    navigator.clipboard.writeText(bankAccount);
    setCopiedId(recipientId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const selectedRecipientData = filteredRecipients.find(r => r.id === selectedRecipient);
  
  const getReligionDisplay = (religion: string) => {
    const map: Record<string, string> = {
      orthodox: 'Orthodox Churches',
      muslim: 'Mosques',
      protestant: 'Protestant Churches',
    };
    return map[religion?.toLowerCase() || 'orthodox'] || religion;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <Heart className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Support Your Community</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Help support churches, mosques, and spiritual organizations in your faith community. Every donation makes a difference.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Recipients Grid */}
      <section>
        <h2 className="mb-2 text-2xl font-bold text-slate-950">{getReligionDisplay(user?.religion || 'orthodox')}</h2>
        <p className="mb-6 text-slate-600">Support these community organizations</p>
        {filteredRecipients.length === 0 ? (
          <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-600">
            No donation recipients available for your religion yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRecipients.map((recipient) => (
              <button
                key={recipient.id}
                onClick={() => setSelectedRecipient(recipient.id)}
                className={`text-left rounded-2xl border-2 overflow-hidden transition-all ${
                  selectedRecipient === recipient.id
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-lg'
                    : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                {recipient.imageUrl && (
                  <div className="h-48 bg-gradient-to-br from-emerald-100 to-slate-100 overflow-hidden">
                    <img
                      src={recipient.imageUrl}
                      alt={recipient.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-bold text-slate-950 text-lg">{recipient.name}</h3>
                  {recipient.description && (
                    <p className="text-sm text-slate-600 mt-2">{recipient.description}</p>
                  )}
                  {recipient.bankAccount && (
                    <div className="mt-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-slate-400" />
                      <p className="text-xs text-slate-500 font-mono break-all">{recipient.bankAccount}</p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Direct Bank Transfer Info */}
      {selectedRecipientData && selectedRecipientData.bankAccount && (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-950">
            <Gift className="h-5 w-5 text-indigo-600" />
            How to Support {selectedRecipientData.name}
          </h2>
          <p className="mb-6 text-slate-600">
            You can donate directly to {selectedRecipientData.name} using the bank account information below. Copy the account details and transfer through your preferred banking method.
          </p>
          <div className="rounded-lg bg-slate-50 p-5">
            <p className="font-medium text-slate-900 mb-3">{selectedRecipientData.name}</p>
            <div className="flex items-center justify-between gap-3 bg-white rounded-lg p-4 border border-slate-200">
              <p className="text-slate-600 font-mono text-sm flex-1 break-all">{selectedRecipientData.bankAccount}</p>
              <button
                onClick={() => handleCopyBankAccount(selectedRecipientData.bankAccount!, selectedRecipientData.id)}
                className="text-indigo-600 hover:text-indigo-700 transition flex-shrink-0"
              >
                {copiedId === selectedRecipientData.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DonatePage;
