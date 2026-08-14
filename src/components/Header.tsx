import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const [currentDateTime, setCurrentDateTime] = useState({
    date: '14-Aug-2026',
    time: '04:06:50 PM',
  });

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
      className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-xs select-none shrink-0"
    >
      <h2 id="page-header-title" className="text-xl font-bold text-[#002b49] tracking-tight">
        {title}
      </h2>

      <div id="header-datetime" className="flex items-center gap-4 text-sm font-semibold">
        <button
          type="button"
          onClick={() => {
            const event = new CustomEvent('open-mobile-scanner');
            window.dispatchEvent(event);
          }}
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
          title="Open Android Barcode Scanner Gun View"
        >
          <span className="font-mono font-black text-[9px] bg-slate-900 text-white px-1 py-0.5 rounded-xs">||| |</span>
          <span>Scanner Gun</span>
        </button>
        <span className="text-[#0070ba]">{currentDateTime.date}</span>
        <span className="text-slate-600 font-mono text-xs">{currentDateTime.time}</span>
      </div>
    </header>
  );
};
