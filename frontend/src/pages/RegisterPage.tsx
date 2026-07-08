import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, ArrowRight, Check, X, Mail, Clock, Shield, Users, Sparkles } from 'lucide-react';
import { authApi } from '../services/api';
import { getRoleDashboardPath, useAuth } from '../hooks/useAuth.tsx';

// Input sanitization helpers
const sanitizeEmail = (email: string): string => {
  return email
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.@_+-]/g, '');
};

const sanitizePassword = (password: string): string => {
  // Allow common special characters but strip control characters
  return password.replace(/[\x00-\x1F\x7F]/g, '');
};

// Password validation
interface PasswordRequirements {
  minLength: boolean;
  hasSpecialChar: boolean;
  hasNumber: boolean;
  hasUppercase: boolean;
}

const checkPasswordStrength = (password: string): PasswordRequirements => {
  return {
    minLength: password.length >= 8,
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    hasNumber: /\d/.test(password),
    hasUppercase: /[A-Z]/.test(password),
  };
};

const religions = [
  { value: 'orthodox', label: 'Orthodox' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'protestant', label: 'Protestant' },
];

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    isAnonymous: true,
    role: 'member' as 'member' | 'leader' | 'vendor',
    religion: 'orthodox',
    organizationName: '',
    document: null as File | null,
  });

  // Phone OTP state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneData, setPhoneData] = useState({
    phone: '',
    email: '',
    otp: '',
    step: 'phone' as 'phone' | 'otp',
  });
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Post-signup state
  const [signupState, setSignupState] = useState<'idle' | 'email-verification' | 'admin-verification'>('idle');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState<'member' | 'leader' | 'vendor'>('member');

  const passwordStrength = useMemo(() => checkPasswordStrength(formData.password), [formData.password]);
  const isPasswordValid = passwordStrength.minLength && passwordStrength.hasSpecialChar;
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeEmail(e.target.value);
    setFormData({ ...formData, email: sanitized });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePassword(e.target.value);
    setFormData({ ...formData, password: sanitized });
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePassword(e.target.value);
    setFormData({ ...formData, confirmPassword: sanitized });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!passwordStrength.hasSpecialChar) {
      setError('Password must contain at least one special character');
      return;
    }

    // Validate document upload for leaders and vendors
    if ((formData.role === 'leader' || formData.role === 'vendor') && !formData.document) {
      setError('Please upload a verification document');
      return;
    }

    // Check document size (max 2MB)
    if (formData.document && formData.document.size > 2 * 1024 * 1024) {
      setError('Document must be less than 2MB');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const response = await authApi.register(
        formData.email,
        formData.password,
        formData.role === 'member' ? formData.isAnonymous : false,
        formData.role === 'member' ? 'user' : formData.role,
        formData.religion,
        formData.role === 'vendor' ? formData.organizationName : undefined,
        formData.document || undefined
      );
      const { token, user } = response.data.data;

      login(token, user);
      navigate(getRoleDashboardPath(user.role), { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);
    try {
      // Note: In production, use @react-oauth/google library to get actual Google token
      // For now, this is a placeholder. Implement with actual Google OAuth flow.
      const mockGoogleToken = 'google_token_placeholder';

      if (!mockGoogleToken) {
        throw new Error('Google authentication not configured. Please set up Google OAuth credentials.');
      }

      const response = await authApi.googleSignup(mockGoogleToken, formData.religion, formData.isAnonymous);
      const { token, user } = response.data.data;
      login(token, user);

      navigate(getRoleDashboardPath(user.role), { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Google signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneOTPRequest = async () => {
    if (!phoneData.phone || !phoneData.email) {
      setError('Phone number and email are required');
      return;
    }

    setError('');
    setPhoneLoading(true);
    try {
      await authApi.requestPhoneOTP(phoneData.phone, phoneData.email);
      setPhoneData({ ...phoneData, step: 'otp' });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const handlePhoneOTPVerify = async () => {
    if (!phoneData.otp) {
      setError('OTP is required');
      return;
    }

    setError('');
    setPhoneLoading(true);
    try {
      const response = await authApi.verifyPhoneOTPAndSignup(
        phoneData.phone,
        phoneData.otp,
        formData.religion,
        formData.isAnonymous
      );
      const { token, user } = response.data.data;
      login(token, user);

      setShowPhoneModal(false);
      navigate(getRoleDashboardPath(user.role), { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || 'OTP verification failed. Please try again.');
    } finally {
      setPhoneLoading(false);
    }
  };

  const features = [
    'Anonymous posting by default',
    'Verified leader support',
    'Encrypted & secure',
    'Free forever'
  ];

  // Verification Pages Components
  const EmailVerificationPage = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          Verify Your Email
        </h2>
        <p className="text-slate-600 text-center mb-6">
          We've sent a verification link to {formData.email}. Please check your email and click the link to continue.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/login'}
            className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
          >
            Go to Login
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const AdminVerificationPage = () => (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 text-center">
          Awaiting Admin Verification
        </h2>
        <p className="text-slate-600 text-center mb-2">
          Thank you for signing up as a {formData.role}!
        </p>
        <p className="text-slate-600 text-center mb-6">
          We've received your documents. Our admin team will review and verify your account within 24-48 hours.
        </p>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-emerald-800">
            ✓ We've sent a confirmation email to {formData.email}
          </p>
          <p className="text-sm text-emerald-800 mt-2">
            ✓ Check your email for updates on your verification status
          </p>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all"
          >
            Go Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  // Show verification pages after signup
  if (signupState === 'email-verification') {
    return <EmailVerificationPage />;
  }

  if (signupState === 'admin-verification') {
    return <AdminVerificationPage />;
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Benefits/Decorative */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-emerald-50 via-white to-teal-50 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Join Our Community</h2>
          
          <div className="space-y-6">
            {/* Benefit 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100">
                  <Heart className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Spiritual Connection</h3>
                <p className="text-slate-600 text-sm">Connect with people who share your faith and beliefs</p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100">
                  <Shield className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Privacy & Safety</h3>
                <p className="text-slate-600 text-sm">Your privacy is protected with end-to-end encryption</p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Supportive Community</h3>
                <p className="text-slate-600 text-sm">Find guidance from verified leaders and mentors</p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-100">
                  <Sparkles className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Growing Together</h3>
                <p className="text-slate-600 text-sm">Access resources and learn from the community</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <div className="mb-8">
            <Link to="/welcome" className="flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl object-contain shadow-sm" />
              <span className="font-bold text-xl text-slate-900">Haymanote</span>
            </Link>
            <Link to="/welcome" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 transition-colors mt-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
            <p className="text-slate-600">Join our spiritual community</p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Email Signup Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Account Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['member', 'leader', 'vendor'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: role as 'member' | 'leader' | 'vendor' })}
                      className={`py-2 px-3 rounded-lg border-2 font-medium text-sm transition-all capitalize ${
                        formData.role === role
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  maxLength={100}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
              </div>

              {/* Religion Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Religion
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {religions.map((religion) => (
                    <label
                      key={religion.value}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        formData.religion === religion.value
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="religion"
                        value={religion.value}
                        checked={formData.religion === religion.value}
                        onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-medium">{religion.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter password"
                  maxLength={128}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>

                {/* Password Strength */}
                {formData.password.length > 0 && !isPasswordValid && (
                  <div className="mt-2 space-y-2 text-sm">
                    <p className="text-slate-600 font-medium">Password requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center gap-2 ${passwordStrength.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordStrength.minLength ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>8+ characters</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasSpecialChar ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordStrength.hasSpecialChar ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Special char</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordStrength.hasNumber ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Number</span>
                      </div>
                      <div className={`flex items-center gap-2 ${passwordStrength.hasUppercase ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {passwordStrength.hasUppercase ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        <span>Uppercase</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
                {formData.confirmPassword && (
                  <div className={`mt-1 text-sm ${doPasswordsMatch ? 'text-emerald-600' : 'text-red-600'}`}>
                    {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </div>
                )}
              </div>

              {/* Anonymous Toggle - Only for members */}
              {formData.role === 'member' && (
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">Stay Anonymous</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Your identity will be protected by default
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) =>
                        setFormData({ ...formData, isAnonymous: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-12 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              )}

              {/* Organization Name - For vendors */}
              {formData.role === 'vendor' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="Your business name"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              )}

              {/* Document Upload - For leaders and vendors */}
              {(formData.role === 'leader' || formData.role === 'vendor') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Verification Document (Max 2MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 hover:border-emerald-400 transition-all">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          if (file.size > 2 * 1024 * 1024) {
                            setError('File must be less than 2MB');
                            return;
                          }
                          setFormData({ ...formData, document: file });
                        }
                      }}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {formData.document && (
                      <p className="mt-2 text-sm text-emerald-600">✓ {formData.document.name}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">PDF, DOC, or image files (2MB max)</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                className="w-full py-3 px-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Social Auth Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-500">Or sign up with</span>
                </div>
              </div>

              {/* Social Auth Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#4285F4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(true)}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-slate-700 font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                  Phone
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700">
                Sign in
              </Link>
            </p>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Secure
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Private
            </span>
          </div>
        </div>
      </div>

      {/* Phone OTP Modal */}
      {showPhoneModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              type="button"
              onClick={() => {
                setShowPhoneModal(false);
                setPhoneData({ phone: '', email: '', otp: '', step: 'phone' });
                setError('');
              }}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-700"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sign up with Phone</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {phoneData.step === 'phone' ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phoneData.phone}
                    onChange={(e) => setPhoneData({ ...phoneData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={phoneData.email}
                    onChange={(e) => setPhoneData({ ...phoneData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <button
                  onClick={handlePhoneOTPRequest}
                  disabled={phoneLoading}
                  className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {phoneLoading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </>
            ) : (
              <>
                <p className="text-slate-600 mb-4">Enter the 6-digit OTP sent to your phone</p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">OTP Code</label>
                  <input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    value={phoneData.otp}
                    onChange={(e) => setPhoneData({ ...phoneData, otp: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-2xl tracking-widest"
                  />
                </div>

                <button
                  onClick={handlePhoneOTPVerify}
                  disabled={phoneLoading || phoneData.otp.length !== 6}
                  className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                >
                  {phoneLoading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <button
                  type="button"
                  onClick={() => setPhoneData({ ...phoneData, step: 'phone', otp: '' })}
                  className="w-full py-3 px-4 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all"
                >
                  Back
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
