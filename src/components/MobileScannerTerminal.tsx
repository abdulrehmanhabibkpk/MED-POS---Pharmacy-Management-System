import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Smartphone, Flashlight, RefreshCw, Volume2, VolumeX, ArrowLeft, Check, AlertCircle, ShoppingCart } from 'lucide-react';
import { posSound } from '../utils/audio';
import { usePOS } from '../context/POSContext';

interface MobileScannerTerminalProps {
  onBack?: () => void;
}

export const MobileScannerTerminal: React.FC<MobileScannerTerminalProps> = ({ onBack }) => {
  const { products, addToCart, cart, activeTab } = usePOS();
  const [isWholesale, setIsWholesale] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [lastScannedItem, setLastScannedItem] = useState<{ name: string; barcode: string; rate: number; time: string } | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'mobile-pwa-camera-viewport';

  const handleScanSuccess = (barcodeText: string) => {
    const code = barcodeText.trim();
    if (!code) return;

    if (soundOn) {
      if (isWholesale) {
        posSound.playDoubleBeep();
      } else {
        posSound.playScanBeep();
      }
    }

    const found = products.find(
      (p) => p.barcode.toLowerCase() === code.toLowerCase()
    );

    const rate = found ? (isWholesale ? found.wholesalePrice : found.retailPrice) : 0;
    const itemName = found ? found.name : 'Unknown Barcode';

    setLastScannedItem({
      name: itemName,
      barcode: code,
      rate,
      time: new Date().toLocaleTimeString(),
    });

    if (found) {
      addToCart(found, 1, rate);
    }

    // Broadcast event to desktop POS if running on another tab/window
    try {
      if (typeof window !== 'undefined') {
        const payload = JSON.stringify({
          type: 'BARCODE_SCANNED',
          barcode: code,
          wholesale: isWholesale,
          timestamp: Date.now(),
        });
        localStorage.setItem('med_pos_latest_scan', payload);
        if ('BroadcastChannel' in window) {
          const bc = new BroadcastChannel('med_pos_channel');
          bc.postMessage({ type: 'BARCODE_SCANNED', barcode: code, wholesale: isWholesale });
          bc.close();
        }
      }
    } catch {}
  };

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    const startCamera = async () => {
      try {
        const el = document.getElementById(containerId);
        if (!el) return;

        html5QrCode = new Html5Qrcode(containerId, {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.CODE_39,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
            Html5QrcodeSupportedFormats.QR_CODE,
          ],
          verbose: false,
        });
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: cameraFacing },
          { fps: 15, qrbox: { width: 280, height: 160 }, aspectRatio: 1.5 },
          (decoded) => {
            if (isMounted) handleScanSuccess(decoded);
          },
          () => {}
        );
      } catch (err) {
        if (isMounted) {
          console.warn('Mobile scanner camera error:', err);
          setCameraError('Camera not available or permission denied. Please allow camera access in browser settings.');
        }
      }
    };

    const timer = setTimeout(startCamera, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {}).finally(() => {
          try {
            html5QrCode?.clear();
          } catch {}
        });
      }
    };
  }, [cameraFacing]);

  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          const next = !torchOn;
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: next } as unknown as MediaTrackConstraintSet],
          });
          setTorchOn(next);
        } else {
          setTorchOn(!torchOn);
        }
      } catch {
        setTorchOn(!torchOn);
      }
    } else {
      setTorchOn(!torchOn);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[500px] bg-slate-900 text-white select-none">
      {/* Top Mobile App Header matching Image 4 & 5 */}
      <div className="bg-[#002b49] px-4 py-3 flex items-center justify-between shadow-md border-b border-slate-700">
        <div className="flex items-center gap-3">
          {onBack && (
            <button onClick={onBack} className="p-1 text-slate-300 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-7 h-5 bg-white rounded-xs">
              <span className="font-mono text-[9px] font-black text-slate-900">||| ||</span>
              <div className="absolute inset-x-0 h-0.5 bg-red-500"></div>
            </div>
            <div>
              <h2 className="font-bold text-sm leading-none">Android Barcode Scanner</h2>
              <span className="text-[10px] text-cyan-400">MED POS Mobile Gun</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundOn(!soundOn)}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-green-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            type="button"
            onClick={() => setCameraFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
            className="p-1.5 rounded-full bg-slate-800 text-slate-300"
            title="Switch Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Camera Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[260px]">
        <div id={containerId} className="w-full h-full object-cover"></div>

        {/* Torch / Flashlight Button top right */}
        <button
          type="button"
          onClick={toggleTorch}
          className={`absolute top-4 right-4 z-20 p-3 rounded-2xl shadow-xl transition-all ${
            torchOn ? 'bg-amber-400 text-slate-900 shadow-amber-400/50' : 'bg-[#0078d7] text-white hover:bg-[#0063b1]'
          }`}
          title="Torch"
        >
          <Flashlight className="w-6 h-6" />
        </button>

        {/* Targeting Corners and Laser Line */}
        <div className="pointer-events-none absolute inset-x-10 inset-y-12 border-2 border-transparent flex flex-col justify-between">
          <div className="flex justify-between w-full">
            <div className="w-8 h-8 border-t-4 border-l-4 border-lime-400"></div>
            <div className="w-8 h-8 border-t-4 border-r-4 border-lime-400"></div>
          </div>
          <div className="relative w-full h-0.5 bg-red-500 shadow-[0_0_15px_4px_#ef4444] animate-pulse"></div>
          <div className="flex justify-between w-full">
            <div className="w-8 h-8 border-b-4 border-l-4 border-lime-400"></div>
            <div className="w-8 h-8 border-b-4 border-r-4 border-lime-400"></div>
          </div>
        </div>

        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-12 h-12 text-amber-400 mb-2" />
            <p className="text-xs text-slate-300 mb-4">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Wholesale Rate Mode Toggle Pill Button matching Image 4 & 5 */}
      <div className="bg-slate-950 p-3 flex flex-col items-center gap-3 border-t border-slate-800">
        <button
          type="button"
          onClick={() => setIsWholesale(!isWholesale)}
          className={`px-5 py-2 text-xs font-bold rounded-full border transition-all flex items-center gap-2 shadow ${
            isWholesale
              ? 'bg-[#155724] border-[#28a745] text-white'
              : 'bg-slate-900 border-[#28a745] text-lime-400 hover:bg-slate-800'
          }`}
        >
          {isWholesale && <Check className="w-4 h-4" />}
          <span>{isWholesale ? 'WHOLESALE RATE MODE: ACTIVE' : 'Turn ON Whole Sale Rate Mode'}</span>
        </button>

        {/* Last Scanned Item Banner */}
        {lastScannedItem ? (
          <div className="w-full bg-emerald-900/60 border border-emerald-500/50 p-2.5 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
            <div className="truncate pr-2">
              <div className="font-bold text-lime-300 truncate">{lastScannedItem.name}</div>
              <div className="text-[10px] text-slate-300 font-mono">
                Code: {lastScannedItem.barcode} • {lastScannedItem.time}
              </div>
            </div>
            <div className="text-right shrink-0 font-bold text-emerald-400">
              Rs. {lastScannedItem.rate.toLocaleString()}
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 font-mono">
            Aim camera at barcode on medicine / product box
          </div>
        )}

        {/* Manual code & Cart items count */}
        <div className="w-full flex items-center gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Type barcode..."
            className="flex-1 bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white rounded focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => {
              if (manualBarcode.trim()) {
                handleScanSuccess(manualBarcode.trim());
                setManualBarcode('');
              }
            }}
            className="bg-[#0078d7] hover:bg-[#0063b1] text-white text-xs font-bold px-3 py-1.5 rounded"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
