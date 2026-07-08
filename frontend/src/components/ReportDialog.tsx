import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Button from './Button';
import { reportsApi } from '../services/api';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'POST' | 'COMMENT';
}

const REPORT_REASONS = [
  { value: 'HARASSMENT', label: 'Harassment or Bullying' },
  { value: 'HATE_SPEECH', label: 'Hate Speech' },
  { value: 'MISINFORMATION', label: 'Misinformation' },
  { value: 'SPAM', label: 'Spam or Promotions' },
  { value: 'SELF_HARM', label: 'Self-Harm or Violence' },
  { value: 'OTHER', label: 'Other' },
];

const ReportDialog = ({ isOpen, onClose, targetId, targetType }: ReportDialogProps) => {
  const [reason, setReason] = useState(REPORT_REASONS[0].value);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await reportsApi.create({
        targetId,
        targetType,
        reason,
        description,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setReason(REPORT_REASONS[0].value);
        setDescription('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="font-bold">Report {targetType === 'POST' ? 'Question' : 'Comment'}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Report Submitted</h4>
            <p className="text-slate-500">Thank you for helping keep our community safe.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100">
                {error}
              </div>
            )}
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Why are you reporting this?
                </label>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r) => (
                    <label key={r.value} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => setReason(e.target.value)}
                        className="text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-sm font-medium text-slate-700">{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Additional Details (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide any additional context..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} className="flex-1 bg-rose-600 hover:bg-rose-700 focus:ring-rose-500">
                Submit Report
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportDialog;
