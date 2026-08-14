import React, { useState, useRef } from 'react';
import { Smartphone, QrCode, Download, Upload, CheckCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { usePOS } from '../context/POSContext';

export const AndroidSyncModal: React.FC = () => {
  const { showSyncModal, setShowSyncModal, exportDatabase, importDatabase } = usePOS();
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('synced');
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showSyncModal) return null;

  const handleSyncNow = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('synced');
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          const success = importDatabase(text);
          if (success) {
            setImportStatus('Backup successfully restored!');
            setTimeout(() => setImportStatus(''), 4000);
          } else {
            setImportStatus('Failed to restore backup file. Invalid format.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div
      id="android-sync-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-slate-300 shadow-2xl max-w-lg w-full text-slate-800 animate-in fade-in">
        {/* Header */}
        <div className="bg-[#28a745] text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Smartphone className="w-5 h-5" />
            <span>MED POS - Android Mobile & Cloud Sync</span>
          </div>
          <button
            onClick={() => setShowSyncModal(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6 text-xs">
          {/* QR Code & Mobile Connection */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 border border-slate-200">
            {/* SVG QR Code Simulation */}
            <div className="w-32 h-32 bg-white p-2 border border-slate-300 flex items-center justify-center shadow-inner shrink-0">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                {/* Corner Markers */}
                <rect x="5" y="5" width="25" height="25" fill="#002b49" />
                <rect x="10" y="10" width="15" height="15" fill="white" />
                <rect x="13" y="13" width="9" height="9" fill="#002b49" />

                <rect x="70" y="5" width="25" height="25" fill="#002b49" />
                <rect x="75" y="10" width="15" height="15" fill="white" />
                <rect x="78" y="13" width="9" height="9" fill="#002b49" />

                <rect x="5" y="70" width="25" height="25" fill="#002b49" />
                <rect x="10" y="75" width="15" height="15" fill="white" />
                <rect x="13" y="78" width="9" height="9" fill="#002b49" />

                {/* Data modules */}
                <rect x="35" y="10" width="5" height="10" fill="#002b49" />
                <rect x="45" y="5" width="10" height="5" fill="#002b49" />
                <rect x="50" y="20" width="15" height="5" fill="#002b49" />
                <rect x="35" y="35" width="30" height="30" fill="#0070ba" />
                <rect x="40" y="40" width="20" height="20" fill="white" />
                <rect x="45" y="45" width="10" height="10" fill="#28a745" />

                <rect x="70" y="40" width="10" height="5" fill="#002b49" />
                <rect x="75" y="55" width="15" height="10" fill="#002b49" />
                <rect x="70" y="80" width="20" height="10" fill="#002b49" />
                <rect x="40" y="75" width="15" height="15" fill="#002b49" />
                <rect x="10" y="40" width="15" height="5" fill="#002b49" />
              </svg>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-sm text-[#002b49]">Scan with MED POS Android App</h4>
              <p className="text-slate-600 leading-relaxed">
                Connect your Android phone as a wireless barcode scanner terminal. Anything scanned with your phone's camera instantly adds to your PC's Sale Invoice.
              </p>
              <div className="flex items-center gap-1.5 text-[#28a745] font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Scanner Node Online • Real-time Sync Active</span>
              </div>
            </div>
          </div>

          {/* Quick Scanner Launch Button for Mobile View / PWA */}
          <div className="bg-lime-50 border border-lime-300 p-3.5 rounded flex items-center justify-between">
            <div>
              <div className="font-bold text-xs text-lime-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>Android Barcode Gun Mode</span>
              </div>
              <div className="text-[11px] text-lime-700 mt-0.5">
                Install as Android PWA App or open dedicated fullscreen camera barcode scanner.
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSyncModal(false);
                const event = new CustomEvent('open-mobile-scanner');
                window.dispatchEvent(event);
              }}
              className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-3 py-1.5 text-xs rounded shadow"
            >
              Open Scanner
            </button>
          </div>

          {/* Backup & Restore database */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-xs">Offline Database Backup & Restore</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={exportDatabase}
                className="bg-[#0070ba] hover:bg-[#005a96] text-white font-bold py-2 px-3 text-xs flex items-center justify-center gap-2 shadow"
              >
                <Download className="w-4 h-4" />
                <span>Export JSON Backup</span>
              </button>

              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-3 text-xs flex items-center justify-center gap-2 shadow"
                >
                  <Upload className="w-4 h-4" />
                  <span>Restore Backup</span>
                </button>
              </div>
            </div>

            {importStatus && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-3 flex justify-between items-center">
          <button
            onClick={handleSyncNow}
            className="bg-[#28a745] hover:bg-[#218838] text-white font-bold px-4 py-1.5 text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            <span>{syncStatus === 'syncing' ? 'Syncing...' : 'Force Sync Now'}</span>
          </button>

          <button
            onClick={() => setShowSyncModal(false)}
            className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold px-4 py-1.5 text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
