import React, { useState } from 'react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  FileCheck2,
  Mail,
  Lock,
  CheckCircle2,
  KeyRound,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const LoginScreen: React.FC = () => {
  const {
    loginWithFirebase,
    resetPasswordFirebase,
    storeSettings
  } = usePOS();

  // Mode: 'signin' | 'forgot'
  const [authMode, setAuthMode] = useState<'signin' | 'forgot'>('signin');

  // Sign In Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password Field
  const [forgotEmail, setForgotEmail] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  // Handle Standard Email Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (!trimmedEmail || !trimmedPass) {
      setError('Please enter your email address and password.');
      return;
    }

    setIsLoading(true);

    try {
      // Exclusively authenticate through Firebase Auth
      const fbResult = await loginWithFirebase(trimmedEmail, trimmedPass);
      if (fbResult.success) {
        setIsLoading(false);
        return;
      }

      setError(fbResult.error || 'Invalid email or password. Only registered accounts can log in.');
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Password Reset
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!forgotEmail.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await resetPasswordFirebase(forgotEmail.trim());
      if (res.success) {
        setSuccessMessage(`Password reset link has been sent to ${forgotEmail}. Please check your email.`);
      } else {
        setError(res.error || 'Unable to send password reset email.');
      }
    } catch (err: any) {
      setError(err?.message || 'Password reset request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F9FAFB] font-sans relative overflow-hidden select-none">
      {/* Background Accent Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E1EFFE]/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#E1EFFE]/30 rounded-full blur-[100px] pointer-events-none" />

      {/* Left side content panel (Welcome & Support Details) */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20 flex flex-col justify-between relative z-10">
        {/* Top Header Row */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-xs overflow-hidden p-1 border border-[#E5E7EB] shrink-0">
            <img 
              src="/WhatsApp_Image_2026-08-07_at_11.56.27_PM-removebg-preview.png" 
              alt="LimoPOS Logo" 
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.className = 'text-[#2563EB] font-black text-sm';
                  fallback.innerText = 'Limo';
                  parent.appendChild(fallback);
                }
              }}
            />
          </div>
          <div className="flex flex-col">
            <div className="text-xl font-black text-[#111827] tracking-tight flex items-center gap-1">
              <span>Limo<span className="text-[#3F83F8]">POS</span></span>
            </div>
            <span className="text-[11px] text-[#6B7280] font-semibold">Pharmacy & Retail Management</span>
          </div>
        </div>

        {/* Hero Copy Area */}
        <div className="my-10 lg:my-0 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5FF] text-[#1E429F] text-xs font-bold mb-5 tracking-wide border border-[#D0E1FD]">
            <span className="w-2 h-2 rounded-full bg-[#31C74E] animate-ping" />
            <span>LimoPOS Cloud Connected</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black tracking-tight text-[#111827] leading-[1.15]">
            Secure Point of Sale <br />
            <span className="text-[#2563EB]">LimoPOS System</span>
          </h1>

          <p className="text-sm text-[#4B5563] mt-4 leading-relaxed font-medium">
            Manage sales invoicing, inventory, customer ledgers, thermal barcode printing, and day-closing reports with real-time cloud data protection for {storeSettings.storeName || 'Ali Traders'}.
          </p>

          {/* Support & Contact Card */}
          <div className="mt-8 bg-white border border-[#E5E7EB] rounded-2xl p-5 shadow-xs max-w-md">
            <div className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-4">
              Support & Inquiries
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#DEF7EC] flex items-center justify-center text-[#03543F] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#6B7280] uppercase">Helpline</div>
                  <div className="text-xs font-bold text-[#111827] font-mono select-all">03195702823</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#EBF5FF] flex items-center justify-center text-[#1E429F] shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-[#6B7280] uppercase">Office Hours</div>
                  <div className="text-xs font-bold text-[#111827]">10 AM - 6 PM</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info brand */}
        <div className="text-xs text-[#6B7280] font-medium flex items-center gap-2 pt-6">
          <CheckCircle2 className="w-4 h-4 text-[#3F83F8]" />
          <span>Licensed Terminal • <strong className="text-slate-800 font-semibold">LimoPOS Enterprise</strong></span>
        </div>
      </div>

      {/* Right side Authentication Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 relative z-10">
        <div className="bg-white border border-[#E5E7EB] shadow-lg rounded-2xl w-full max-w-md p-6 sm:p-8 transition-all">
          
          {/* Header Title */}
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-[#111827] tracking-tight">
              {authMode === 'signin' ? 'Sign In to LimoPOS' : 'Reset Your Password'}
            </h2>
            <p className="text-[#6B7280] text-xs font-medium mt-1">
              {authMode === 'signin'
                ? 'Enter your email address and password to continue'
                : 'Enter your registered email to receive a password reset link'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] text-xs text-[#111827] bg-[#F9FAFB] placeholder-[#9CA3AF] font-medium"
                    placeholder="Enter your email (e.g. user@gmail.com)"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#374151]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-[#2563EB] hover:underline focus:outline-none cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] text-xs text-[#111827] bg-[#F9FAFB] placeholder-[#9CA3AF] font-medium"
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3F83F8] hover:bg-[#2563EB] text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs tracking-wide cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-3 text-xs font-semibold border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-[#03543F]">
                  <span className="w-2 h-2 rounded-full bg-[#31C74E]" />
                  <span>LimoPOS Online</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('forgot');
                    setError('');
                    setSuccessMessage('');
                    if (email) setForgotEmail(email);
                  }}
                  className="text-[#2563EB] hover:underline cursor-pointer font-bold"
                >
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            /* FORGOT PASSWORD FORM */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#374151] mb-1.5">
                  Your Registered Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-[#D1D5DB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] text-xs text-[#111827] bg-[#F9FAFB] placeholder-[#9CA3AF] font-medium"
                    placeholder="e.g. user@gmail.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#3F83F8] hover:bg-[#2563EB] text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-xs tracking-wide cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Email</span>
                    <KeyRound className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-[#6B7280]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setError('');
                    setSuccessMessage('');
                  }}
                  className="inline-flex items-center gap-1 text-[#2563EB] font-bold hover:underline cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Terms & Agreement Trigger */}
          <div className="pt-5 mt-4 border-t border-slate-100 flex justify-center">
            <button
              type="button"
              onClick={() => setShowAgreementModal(true)}
              className="text-[11px] text-[#6B7280] hover:text-[#2563EB] font-semibold underline cursor-pointer"
            >
              Terms of Service & License Policy
            </button>
          </div>
        </div>
      </div>

      {/* Terms & License Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white max-w-lg w-full p-6 rounded-2xl shadow-xl border border-slate-200 text-slate-800">
            <div className="flex items-center gap-2.5 text-[#03543F] font-extrabold text-base border-b border-slate-100 pb-3">
              <FileCheck2 className="w-5 h-5 text-[#10B981]" />
              <span>LimoPOS - Terms & Security Policy</span>
            </div>
            <div className="py-4 text-xs space-y-3 leading-relaxed text-[#4B5563] max-h-80 overflow-y-auto font-medium">
              <p>
                <strong>Authentication & Security:</strong> User accounts, credentials, and password resets are securely encrypted and verified through cloud-protected security protocols.
              </p>
              <p>
                <strong>License Authorization:</strong> This point of sale platform is authorized for Ali Traders pharmacy & retail operations with automated cloud backup and local sync.
              </p>
              <p>
                <strong>Privacy & Audit Logs:</strong> Invoicing, cash drawer transactions, and product ledgers remain encrypted and protected according to standard enterprise security protocols.
              </p>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAgreementModal(false)}
                className="bg-[#3F83F8] hover:bg-[#2563EB] text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                I Understand & Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
