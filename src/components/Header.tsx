import React, { useState, useEffect } from 'react';
import { Download, Menu } from 'lucide-react';

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
      hours = hours ? hours : 12;
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
      className="bg-white border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between shadow-xs select-none shrink-0"
    >
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden text-slate-700 hover:text-slate-900 focus:outline-none p-2 rounded-xl hover:bg-slate-50 transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <h2 id="page-header-title" className="text-base md:text-lg font-black text-[#111827] tracking-tight truncate max-w-[150px] xs:max-w-none">
            {title}
          </h2>
        </div>
      </div>

      <div id="header-datetime" className="flex items-center gap-2 md:gap-3.5 text-xs font-bold shrink-0">
        {!isInstalled && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 bg-[#3F83F8] hover:bg-[#2563EB] text-white px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-150 active:scale-95"
            title="Install App on Device / Android"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        <a
          href="/MEDPOS_COMPLETE_USER_MANUAL.txt"
          download="MEDPOS_COMPLETE_USER_MANUAL.txt"
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer active:scale-95"
          title="Download Complete Software User Manual & Features Guide (.TXT)"
        >
          <Download className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">User Manual (.TXT)</span>
        </a>

        <button
          type="button"
          onClick={() => {
            const event = new CustomEvent('open-mobile-scanner');
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#03543F] border border-emerald-100 px-3.5 py-2 rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer active:scale-95"
          title="Open Android Barcode Scanner Gun View"
        >
          <span className="font-mono font-black text-[9px] bg-[#03543F] text-white px-1.5 py-0.5 rounded-md">|||</span>
          <span className="hidden sm:inline">Scanner Gun</span>
        </button>

        <div className="hidden xs:flex items-center gap-2 text-slate-400 font-bold border-l border-slate-200 pl-3 md:pl-4">
          <span className="text-[#2563EB]">{currentDateTime.date}</span>
          <span className="text-slate-500 font-mono text-[10px] md:text-xs hidden md:inline">{currentDateTime.time}</span>
        </div>
      </div>
    </header>
  );
};
