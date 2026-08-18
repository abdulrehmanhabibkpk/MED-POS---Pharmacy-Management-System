import React, { useState } from 'react';
import { Pill, MapPin, Phone, ShieldCheck, ArrowRight, FileCheck2, Mail } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const LoginScreen: React.FC = () => {
  const { login, storeSettings } = usePOS();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const [showAgreementModal, setShowAgreementModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a valid username');
      return;
    }
    const success = login(username, password);
    if (!success) {
      setError('Invalid login credentials');
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f0f4f8] font-sans">
      {/* Left Blue Hero Banner */}
      <div
        id="login-hero-panel"
        className="md:w-5/12 bg-[#004b87] text-white p-8 md:p-14 flex flex-col justify-between relative overflow-hidden shadow-2xl"
      >
        <div>
          {/* Sub Store Header - Dynamically showing the name from Store Settings */}
          <div className="flex items-center gap-2 text-white/95 text-sm font-bold tracking-wider uppercase mb-8 bg-white/10 px-3.5 py-2 rounded-xs border border-white/10">
            <Pill className="w-5 h-5 text-[#00ff88]" />
            <span>{storeSettings.storeName || 'MY MEDICAL STORE'}</span>
          </div>

          {/* Software Logo & Big Title */}
          <div className="flex flex-col gap-4 mb-4">
            <img 
              src="/WhatsApp_Image_2026-08-07_at_11.56.27_PM-removebg-preview.png" 
              alt="HACKTES Logo" 
              className="h-28 w-auto object-contain self-start drop-shadow-lg"
              onError={(e) => {
                // Fallback invisibly if not loaded
                e.currentTarget.style.display = 'none';
              }}
            />
            <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white">
              HACKTES POS
            </h1>
          </div>
          <p className="text-md text-white/90 font-semibold tracking-wide">
            {storeSettings.tagline || 'Pharmacy & General Store Management System'}
          </p>

          {/* Contact & Support Meta Information */}
          <div className="mt-12 space-y-3.5 text-xs md:text-sm text-white/90 bg-black/10 p-4 border border-white/5 rounded-xs">
            <div className="text-xs font-extrabold uppercase tracking-widest text-[#00ff88] mb-1">
              Developer Support & Contact:
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#00ff88] shrink-0" />
              <span>WhatsApp: <strong className="font-mono text-white select-all">03195702823</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#00ff88] shrink-0" />
              <span>Email: <strong className="font-mono text-white select-all">teemthepakhacktes.com@gmail.com</strong></span>
            </div>
            <div className="flex items-center gap-2.5 pt-1.5 border-t border-white/10">
              <MapPin className="w-4 h-4 text-white/60 shrink-0" />
              <span className="text-white/70">Store Loc: {storeSettings.address || 'Main Market, Pakistan'}</span>
            </div>
            <p className="text-[10px] text-white/50 pt-1 font-mono">
              © Developed & Powered by THE PAK HACKERS
            </p>
          </div>
        </div>

        {/* Bottom Tag */}
        <div className="mt-12 pt-6">
          <div className="inline-flex items-center gap-2 text-[#00ff88] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>PHARMACY MANAGEMENT SYSTEM</span>
          </div>
        </div>
      </div>

      {/* Right Login Box */}
      <div
        id="login-form-panel"
        className="md:w-7/12 flex items-center justify-center p-6 md:p-12 bg-[#f0f4f8]"
      >
        <div className="bg-white p-8 md:p-10 shadow-lg rounded-none w-full max-w-md border border-slate-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#002b49]">
              Welcome Back
            </h2>
            <p className="text-slate-500 text-sm mt-1">Sign in to your POS account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Username
              </label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#0070ba] text-sm text-slate-800"
                placeholder="admin"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-none focus:outline-none focus:border-[#0070ba] text-sm text-slate-800"
                placeholder="••••••••"
              />
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full bg-[#0070ba] hover:bg-[#005a96] text-white font-bold py-2.5 px-4 rounded-none shadow transition-colors flex items-center justify-center gap-2 text-sm tracking-wide active:scale-[0.99]"
            >
              <span>LOGIN</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              id="btn-user-agreement"
              onClick={() => setShowAgreementModal(true)}
              className="w-full bg-[#1e7e34] hover:bg-[#155724] text-white font-bold py-2.5 px-4 rounded-none shadow transition-colors text-xs tracking-wide"
            >
              © User Agreement | THE PAK HACKERS
            </button>
          </form>
        </div>
      </div>

      {/* User Agreement Modal */}
      {showAgreementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white max-w-lg w-full p-6 shadow-2xl border border-slate-300 text-slate-800 animate-in fade-in">
            <div className="flex items-center gap-2 text-[#1e7e34] font-bold text-lg border-b border-slate-200 pb-3">
              <FileCheck2 className="w-6 h-6" />
              <span>HACKTES POS - Terms & License Agreement</span>
            </div>
            <div className="py-4 text-xs space-y-3 leading-relaxed text-slate-600 max-h-80 overflow-y-auto">
              <p>
                <strong>License:</strong> This software is authorized for use in retail pharmacy, wholesale medicine, and general store management.
              </p>
              <p>
                <strong>Offline-First & Security:</strong> All sales, customer ledgers, inventory counts, and financial reports are securely stored locally on this terminal with automatic recovery and cloud synchronization support.
              </p>
              <p>
                <strong>Support & Maintenance:</strong> Developed & powered by <strong>THE PAK HACKERS</strong>. For custom integrations, Android sync, or technical assistance, contact your system administrator.
              </p>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-200">
              <button
                onClick={() => setShowAgreementModal(false)}
                className="bg-[#0070ba] hover:bg-[#005a96] text-white px-5 py-1.5 text-xs font-semibold"
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
