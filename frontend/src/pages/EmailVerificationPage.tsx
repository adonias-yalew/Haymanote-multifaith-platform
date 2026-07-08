import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader, Mail, ShieldCheck } from 'lucide-react';
import { authApi } from '../services/api';
import { getRoleDashboardPath, useAuth } from '../hooks/useAuth.tsx';

type VerificationStatus = 'pending' | 'verifying' | 'verified' | 'error';

const EmailVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) setEmail(decodeURIComponent(emailParam));
  }, [searchParams]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = window.setTimeout(() => setResendCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCountdown]);

  const verifyEmail = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email) {
      setError('Email is required.');
      setStatus('error');
      return;
    }

    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      setStatus('error');
      return;
    }

    try {
      setStatus('verifying');
      setError('');
      const response = await authApi.verifyEmail(code, email);
      const { token, user } = response.data.data;
      login(token, user);
      setStatus('verified');

      window.setTimeout(() => {
        navigate(getRoleDashboardPath(user.role), { replace: true });
      }, 1200);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setStatus('error');
      setError(axiosErr.response?.data?.error || 'Invalid or expired verification code.');
    }
  };

  const resendCode = async () => {
    if (!email) {
      setError('Email is required before resending a code.');
      return;
    }

    try {
      setIsResending(true);
      setError('');
      await authApi.resendVerificationEmail(email);
      setCode('');
      setStatus('pending');
      setResendCountdown(60);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  if (status === 'verified') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-card">
          <CheckCircle className="mx-auto mb-5 h-14 w-14 text-emerald-600" />
          <h1 className="mb-2 text-2xl font-bold text-slate-950">Email Verified</h1>
          <p className="text-slate-600">Your account is ready. Redirecting now...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheck className="h-8 w-8" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-slate-950">Verify Your Email</h1>
        <p className="mb-6 text-center text-sm text-slate-600">
          Enter the 6-digit code sent to your email address.
        </p>

        <form onSubmit={verifyEmail} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value.trim())}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 pl-10 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Verification Code</label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl font-semibold tracking-[0.35em] outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              placeholder="000000"
              required
            />
          </div>

          {error && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'verifying' || code.length !== 6}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === 'verifying' && <Loader className="h-4 w-4 animate-spin" />}
            Verify and Continue
          </button>
        </form>

        <button
          type="button"
          onClick={resendCode}
          disabled={isResending || resendCountdown > 0}
          className="mt-3 w-full rounded-xl bg-slate-100 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isResending ? 'Sending code...' : resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend Code'}
        </button>

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="mt-3 w-full text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
