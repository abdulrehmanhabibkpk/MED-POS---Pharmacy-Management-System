import React, { useState, useEffect } from 'react';
import { Download, Menu, Tablet } from 'lucide-react';
import { usePOS } from '../context/POSContext';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '14-Aug-2026',
    time: '04:06:50 PM',
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    // Check if the application is running inside a sandbox preview iframe
    const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

    if (isInsideIframe) {
      alert("Aap is waqt AI Studio ke preview iframe ke andar hain, jahan browser security installation block karti hai. Hum aapke liye direct app tab open kar rahe hain, wahan 'Install App' par click karke aap real application install kar sakte hain!");
      window.open(window.location.href, '_blank');
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
      } catch (err) {
        console.error('PWA installation error:', err);
      }
      setDeferredPrompt(null);
    } else {
      // Direct user fallback instructions
      alert('LimoPOS install karne ke liye:\n\n1. Browser ke top-right 3-dots (⋮) par click karein.\n2. "Install App" ya "Add to Home Screen" par click karein.');
    }
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = String(now.getDate()).padStart(2, '0');
      const month = months[now.getMonth()];
      const year = now.getFullYear();

      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = String(hours).padStart(2, '0');

      setCurrentDateTime({
        date: `${day}-${month}-${year}`,
        time: `${formattedHours}:${minutes}:${seconds} ${ampm}`,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      id="main-app-header"
      className="bg-white border-b border-slate-200 px-4 md:px-6 py-2.5 flex items-center justify-between shadow-xs select-none shrink-0"
    >
      <div className="flex items-center gap-2.5">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden text-slate-700 hover:text-slate-900 focus:outline-none p-1.5 rounded hover:bg-slate-100 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 id="page-header-title" className="text-sm md:text-lg font-black text-[#002b49] tracking-tight truncate max-w-[140px] xs:max-w-none">
          {title}
        </h2>
      </div>

      <div id="header-datetime" className="flex items-center gap-2 md:gap-3 text-xs font-semibold shrink-0">
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1 bg-[#0070ba] hover:bg-[#005a96] text-white px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-colors cursor-pointer shadow-xs"
            title="Install App on Device / Android"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        <a
          href="/MEDPOS_COMPLETE_USER_MANUAL.txt"
          download="MEDPOS_COMPLETE_USER_MANUAL.txt"
          className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 px-2 py-1 rounded text-[10px] md:text-xs font-bold transition-colors cursor-pointer"
          title="Download Complete Software User Manual & Features Guide (.TXT)"
        >
          <Download className="w-3 h-3 text-slate-600" />
          <span className="hidden sm:inline">User Manual (.TXT)</span>
        </a>

        <button
          type="button"
          onClick={() => {
            const event = new CustomEvent('open-mobile-scanner');
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-1 rounded text-[10px] md:text-xs transition-colors cursor-pointer"
          title="Open Android Barcode Scanner Gun View"
        >
          <span className="font-mono font-black text-[8px] bg-slate-900 text-white px-1 py-0.2 rounded-xs">|||</span>
          <span className="hidden sm:inline">Scanner Gun</span>
        </button>

        <span className="text-[#0070ba] hidden xs:inline">{currentDateTime.date}</span>
        <span className="text-slate-500 font-mono text-[10px] md:text-xs hidden md:inline">{currentDateTime.time}</span>
      </div>
    </header>
  );
};
