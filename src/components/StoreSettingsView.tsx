import React, { useState, useRef } from 'react';
import { Settings, Save, Upload, Trash2, CheckCircle2, Image as ImageIcon, RotateCcw, Printer } from 'lucide-react';
import { usePOS } from '../context/POSContext';
import { ThermalPaperSize } from '../types';

export const StoreSettingsView: React.FC = () => {
  const { storeSettings, updateStoreSettings, resetToDefaults, thermalPaperSize, setThermalPaperSize } = usePOS();

  const [storeName, setStoreName] = useState(storeSettings.storeName);
  const [tagline, setTagline] = useState(storeSettings.tagline);
  const [address, setAddress] = useState(storeSettings.address);
  const [phone, setPhone] = useState(storeSettings.phone);
  const [currency, setCurrency] = useState(storeSettings.currency || 'Rs.');
  const [logoUrl, setLogoUrl] = useState(storeSettings.logoUrl);
  const [footerNote, setFooterNote] = useState(storeSettings.footerNote);
  const [defaultPaperSize, setDefaultPaperSize] = useState<ThermalPaperSize>(
    storeSettings.defaultPaperSize || thermalPaperSize || '80mm'
  );

  const [savedMsg, setSavedMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) {
      alert('Store / Business Name is required');
      return;
    }

    updateStoreSettings({
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      address: address.trim(),
      phone: phone.trim(),
      currency: currency.trim() || 'Rs.',
      logoUrl,
      footerNote,
      defaultPaperSize,
    });
    setThermalPaperSize(defaultPaperSize);

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setLogoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div id="store-settings-container" className="p-6 bg-[#f4f7fa] min-h-full space-y-6">
      {/* Banner matching Image 12 */}
      <div className="bg-[#002b49] text-white px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wide">
          <Settings className="w-4 h-4 text-white" />
          <span>STORE BUSINESS PROFILE SETTINGS</span>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3 bg-green-50 border border-green-300 text-green-800 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>Store settings successfully updated and saved!</span>
        </div>
      )}

      {/* Main Settings Form Card */}
      <div className="bg-white border border-slate-200 p-6 shadow-xs max-w-4xl">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Inputs (7 cols) */}
            <div className="md:col-span-7 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Store / Business Name *
                </label>
                <input
                  id="settings-store-name"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#0070ba]"
                  placeholder="MY MEDICAL STORE"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tagline / Subtitle</label>
                <input
                  id="settings-tagline"
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                  placeholder="Pharmacy & General Store"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Store Address</label>
                <input
                  id="settings-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                  placeholder="Main Market, Pakistan"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Phone / Contact Number
                </label>
                <input
                  id="settings-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                  placeholder="0300-1234567"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-800 text-xs font-bold focus:outline-none focus:border-[#0070ba]"
                    placeholder="Rs."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Footer Slip Note</label>
                  <input
                    type="text"
                    value={footerNote}
                    onChange={(e) => setFooterNote(e.target.value)}
                    className="w-full bg-white border border-slate-300 px-3 py-2 text-slate-800 text-xs focus:outline-none focus:border-[#0070ba]"
                    placeholder="THANK YOU! VISIT AGAIN"
                  />
                </div>
              </div>

              {/* Default Thermal Printer Paper Size */}
              <div className="bg-slate-50 border border-slate-200 p-3 rounded space-y-2">
                <label className="block font-bold text-slate-700 text-xs flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-[#0070ba]" />
                  <span>Default Thermal Printer Paper Size</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      defaultPaperSize === '80mm'
                        ? 'bg-blue-50 border-[#0070ba] text-[#002b49] font-bold'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultPaper"
                      checked={defaultPaperSize === '80mm'}
                      onChange={() => setDefaultPaperSize('80mm')}
                      className="text-[#0070ba]"
                    />
                    <div>
                      <div className="text-xs">80mm Standard POS</div>
                      <div className="text-[10px] text-slate-500 font-normal">3 inch thermal roll</div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                      defaultPaperSize === '58mm'
                        ? 'bg-blue-50 border-[#0070ba] text-[#002b49] font-bold'
                        : 'bg-white border-slate-300 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="defaultPaper"
                      checked={defaultPaperSize === '58mm'}
                      onChange={() => setDefaultPaperSize('58mm')}
                      className="text-[#0070ba]"
                    />
                    <div>
                      <div className="text-xs">58mm Mini Thermal</div>
                      <div className="text-[10px] text-slate-500 font-normal">2 inch thermal roll</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Logo Upload (5 cols) matching Image 12 */}
            <div className="md:col-span-5 flex flex-col items-start space-y-3">
              <label className="block font-bold text-slate-700 text-xs">
                Store Logo (Receipt Header)
              </label>

              {/* Logo Preview Box matching HackTes style in screenshot */}
              <div className="w-52 h-44 border border-slate-300 bg-white flex flex-col items-center justify-center p-2 relative overflow-hidden shadow-inner">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Store Logo"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    {/* Simulated HackTes logo graphic */}
                    <div className="text-center font-black">
                      <div className="text-3xl text-[#0070ba] tracking-tighter">HT</div>
                      <div className="text-xs text-slate-800 font-bold tracking-widest">HackTes</div>
                      <div className="text-[8px] text-slate-400 uppercase tracking-wider">Innovate • Secure • Empower</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Browse / Remove buttons */}
              <div className="flex gap-2 w-52">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold py-1.5 px-3 text-xs flex items-center justify-center gap-1 shadow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse...</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="bg-[#dc3545] hover:bg-[#c82333] text-white font-bold py-1.5 px-3 text-xs flex items-center justify-center gap-1 shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Row matching Image 12 */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              id="btn-save-store-settings"
              type="submit"
              className="bg-[#28a745] hover:bg-[#218838] text-white font-bold py-2.5 px-8 text-xs flex items-center gap-2 shadow transition-colors active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              <span>SAVE STORE SETTINGS</span>
            </button>

            <p className="text-[11px] text-slate-500 italic">
              ⓘ Settings save hone ke baad agle sale aur receipt par naye details apply ho jayenge.
            </p>
          </div>
        </form>
      </div>

      {/* Danger Zone: Reset Default Data */}
      <div className="bg-white border border-rose-200 p-4 shadow-xs max-w-4xl flex items-center justify-between">
        <div>
          <div className="text-xs font-bold text-rose-800">Reset Demo Data</div>
          <div className="text-[11px] text-slate-500">Restore factory sample products, sales and settings</div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all demo data back to default state?')) {
              resetToDefaults();
            }
          }}
          className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-semibold px-4 py-1.5 text-xs flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>
    </div>
  );
};
