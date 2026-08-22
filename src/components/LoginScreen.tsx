import React, { useState } from 'react';
import { Pill, Phone, ShieldCheck, ArrowRight, FileCheck2, Mail, Eye, EyeOff, Lock, CheckCircle2 } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const LoginScreen: React.FC = () => {
  const { login, storeSettings } = usePOS();
  const [username, setUsername] = useState('alitrader@gmail.com');
  const [password, setPassword] = useState('alitrader');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid email or username');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await login(username, password);
      if (!result.success) {
        setError(result.error || 'Invalid login credentials.');
      }
    } catch (err) {
      setError('Server unreachable. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F4F8FC] font-sans relative overflow-hidden select-none">
      {/* Soft background decorative blobs for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#E1EFFE]/60 rounded-full blur-[120px] pointer-events-none transform translateZ(0) will-change-transform" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#E1EFFE]/40 rounded-full blur-[100px] pointer-events-none transform translateZ(0) will-change-transform" />
      <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] bg-[#EBF5FF]/50 rounded-full blur-[90px] pointer-events-none transform translateZ(0) will-change-transform" />

      {/* Left side content panel (Welcome & Support Details) */}
      <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-20 flex flex-col justify-between relative z-10">
        {/* Top Header Row */}
        <div className="flex items-center gap-3 animate-fade-in">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-md shadow-blue-100 overflow-hidden p-1 border border-slate-100 shrink-0">
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
          </div>
        </div>

        {/* Hero Copy Area */}
        <div className="my-12 lg:my-0 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5FF] text-[#1E429F] text-xs font-bold mb-6 tracking-wide border border-[#D0E1FD]">
            <span>Cloud-Based POS Solution</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[46px] font-black tracking-tight text-[#111827] leading-[1.15]">
            Welcome to Your <br />
            <span className="text-[#2563EB] bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] bg-clip-text text-transparent">LimoPOS Workspace</span>
          </h1>

          <p className="text-sm sm:text-base text-[#4B5563] mt-5 leading-relaxed font-medium">
            Manage sales, inventory, and accounts with absolute clarity. A high-performance, responsive interface custom tailored for {storeSettings.storeName || 'Ali Traders'}.
          </p>

          {/* Support & Contact Card */}
          <div className="mt-10 bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm shadow-slate-100 max-w-md">
            <div className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-5">
              Support & Contact
            </div>

            <div className="grid grid-cols-1 gap-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#DEF7EC] flex items-center justify-center text-[#03543F] shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                    Service Helpline
                  </div>
                  <div className="text-sm font-black text-[#111827] font-mono select-all">
                    03195702823
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#DEF7EC] flex items-center justify-center text-[#03543F] shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                    Official Email
                  </div>
                  <div className="text-sm font-black text-[#111827] font-mono select-all">
                    teemthepakhacktes.com@gmail.com
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-[#EBF5FF] flex items-center justify-center text-[#1E429F] shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wide">
                    Office Hours
                  </div>
                  <div className="text-sm font-black text-[#111827] select-all">
                    10:00 AM - 6:00 PM
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#03543F] bg-[#DEF7EC] rounded-md">
                6 Days/Week
              </span>
              <span className="px-2.5 py-1 text-[11px] font-bold text-[#9B1C1C] bg-[#FDE8E8] rounded-md">
                Friday Off
              </span>
            </div>
          </div>
        </div>

        {/* Footer info brand */}
        <div className="text-xs text-[#9CA3AF] font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3F83F8]" />
          <span>Licensed & Secured Management Terminal</span>
        </div>
      </div>

      {/* Right side login form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20 relative z-10">
        <div className="bg-white border border-[#E5E7EB] shadow-xl shadow-slate-100 rounded-[32px] w-full max-w-md p-8 sm:p-10 transform translateZ(0) will-change-transform transition-all">
          
          {/* Premium Blue Logo Box */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-[22px] bg-white flex items-center justify-center shadow-md p-2 overflow-hidden border border-slate-100 shrink-0">
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
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-[#111827] tracking-tight">
              Sign In
            </h2>
            <p className="text-[#6B7280] text-xs font-semibold mt-1.5">
              Enter your credentials to continue
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs font-semibold flex items-center gap-2 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#4B5563] mb-2">
                Username or Email
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-[#D1D5DB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] text-sm text-[#111827] bg-[#F9FAFB] placeholder-[#9CA3AF] transition-all font-medium"
                placeholder="Enter username or email"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#4B5563]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-[#2563EB] hover:underline focus:outline-none"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-[#D1D5DB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] text-sm text-[#111827] bg-[#F9FAFB] placeholder-[#9CA3AF] transition-all font-medium"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#3F83F8] hover:bg-[#2563EB] disabled:bg-[#9CA3AF] text-white font-bold py-3.5 px-5 rounded-2xl shadow-lg shadow-blue-100 disabled:shadow-none transition-all flex items-center justify-center gap-2 text-sm tracking-wide active:scale-[0.98] transform translateZ(0) will-change-transform"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Account...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>

            <div className="flex items-center justify-between pt-4 text-xs font-bold border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-[#03543F]">
                <span className="w-2 h-2 rounded-full bg-[#31C74E] animate-ping" />
                <span>Secured</span>
              </div>
              <button
                type="button"
                onClick={() => setError('Password reset requested. Please contact Ali Traders Admin.')}
                className="text-[#2563EB] hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <div className="pt-2">
              <button
                type="button"
                id="btn-user-agreement"
                onClick={() => setShowAgreementModal(true)}
                className="w-full border border-dashed border-[#D1D5DB] hover:border-[#3F83F8] text-[#4B5563] hover:text-[#2563EB] font-bold py-3 px-4 rounded-xl transition-all text-xs tracking-wide bg-[#F9FAFB]"
              >
                Terms & Conditions
              </button>
            </div>
          </form>

          <div className="text-center mt-8 text-[11px] text-[#9CA3AF] font-bold">
            © 2026 The Pak Hacktes (Pvt) Ltd
          </div>
        </div>
      </div>

      {/* User Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white max-w-lg w-full p-6 rounded-3xl shadow-2xl border border-slate-100 text-slate-800 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2.5 text-[#03543F] font-black text-lg border-b border-slate-100 pb-4">
              <FileCheck2 className="w-6 h-6 text-[#10B981]" />
              <span>HACKTES POS - Terms & License Agreement</span>
            </div>
            <div className="py-5 text-xs sm:text-sm space-y-3.5 leading-relaxed text-[#4B5563] max-h-80 overflow-y-auto font-medium">
              <p>
                <strong>License Authorization:</strong> This point of sale platform is authorized exclusively for use in pharmacy, retail, and general trade management system.
              </p>
              <p>
                <strong>Offline-First & Security:</strong> All sales data, ledger books, inventory registers, and financial audit logs are safely committed to local storage with automated cloud backup.
              </p>
              <p>
                <strong>Developer Support:</strong> Developed & powered by <strong>THE PAK HACKTES</strong>. For custom API integrations, system upgrades, or technical assistance, contact support via WhatsApp.
              </p>
            </div>
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowAgreementModal(false)}
                className="bg-[#3F83F8] hover:bg-[#2563EB] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
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

