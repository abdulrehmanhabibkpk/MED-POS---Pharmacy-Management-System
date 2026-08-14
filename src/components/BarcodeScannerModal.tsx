import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, Flashlight, RefreshCw, Smartphone, Volume2, VolumeX, QrCode, Check, AlertCircle, Sparkles } from 'lucide-react';
import { posSound } from '../utils/audio';
import { usePOS } from '../context/POSContext';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string, wholesaleMode?: boolean) => void;
  title?: string;
  initialWholesale?: boolean;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  title = 'Scan Barcode',
  initialWholesale = false,
}) => {
  const { products } = usePOS();
  const [isWholesale, setIsWholesale] = useState(initialWholesale);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<'camera' | 'mobile_sync' | 'quick_test'>('camera');
  const [recentScan, setRecentScan] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'interactive-barcode-video-container';

  useEffect(() => {
    setIsWholesale(initialWholesale);
  }, [initialWholesale]);

  // Handle successful scan
  const handleBarcodeDetected = (decodedText: string) => {
    const cleanCode = decodedText.trim();
    if (!cleanCode) return;

    if (soundEnabled) {
      if (isWholesale) {
        posSound.playDoubleBeep();
      } else {
        posSound.playScanBeep();
      }
    }

    setRecentScan(cleanCode);
    setTimeout(() => setRecentScan(null), 1500);

    onScan(cleanCode, isWholesale);
  };

  // Start Html5Qrcode scanner
  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let isMounted = true;

    if (isOpen && activeTab === 'camera') {
      setCameraError(null);
      setIsScanning(true);

      const initScanner = async () => {
        try {
          // Check if container element exists
          const container = document.getElementById(scannerContainerId);
          if (!container) return;

          html5QrCode = new Html5Qrcode(scannerContainerId, {
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.CODE_39,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.UPC_E,
              Html5QrcodeSupportedFormats.QR_CODE,
              Html5QrcodeSupportedFormats.ITF,
            ],
            verbose: false,
          });
          scannerRef.current = html5QrCode;

          const config = {
            fps: 15,
            qrbox: { width: 280, height: 160 },
            aspectRatio: 1.777778,
          };

          await html5QrCode.start(
            { facingMode: cameraFacing },
            config,
            (decodedText) => {
              if (isMounted) {
                handleBarcodeDetected(decodedText);
              }
            },
            () => {
              // Ignore frame decode errors
            }
          );
        } catch (err: unknown) {
          if (isMounted) {
            console.warn('Camera scanner start warning:', err);
            const errStr = String(err);
            if (errStr.includes('NotAllowedError') || errStr.includes('Permission')) {
              setCameraError('Camera access permission denied. Please allow camera permissions in browser settings, or use Manual / Quick Scan.');
            } else {
              setCameraError('Unable to start live camera feed (No camera or in use). You can use Manual input or Quick Product Barcodes below.');
            }
            setIsScanning(false);
          }
        }
      };

      // Slight delay to ensure DOM modal is mounted
      const timer = setTimeout(() => {
        initScanner();
      }, 150);

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
    }
  }, [isOpen, activeTab, cameraFacing]);

  // Flashlight toggle
  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const capabilities = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          const newTorch = !torchOn;
          await scannerRef.current.applyVideoConstraints({
            advanced: [{ torch: newTorch } as unknown as MediaTrackConstraintSet],
          });
          setTorchOn(newTorch);
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

  // Flip Camera
  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleBarcodeDetected(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div
      id="barcode-scanner-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 w-full max-w-md overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header matching Image 4 & 5 */}
        <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Custom Barcode Icon matching user image */}
            <div className="relative flex items-center justify-center w-8 h-6 bg-slate-100 rounded border border-slate-300">
              <span className="font-mono text-[10px] tracking-tighter font-black text-slate-800">||| ||</span>
              <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_4px_#ef4444]"></div>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 leading-tight">Add Product By Name / Barcode</h3>
              <p className="text-[11px] text-slate-500">{title}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
              title={soundEnabled ? 'Mute Beep' : 'Enable Beep'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-[#0070ba]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>
            <button
              id="btn-close-barcode-scanner"
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-600 hover:bg-slate-100 hover:text-red-600 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switchers: Live Camera / Mobile Wireless Gun / Quick Test */}
        <div className="flex bg-slate-100 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'camera'
                ? 'border-[#0070ba] text-[#0070ba] bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Live Camera</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quick_test')}
            className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'quick_test'
                ? 'border-[#0070ba] text-[#0070ba] bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Barcodes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mobile_sync')}
            className={`flex-1 py-2 px-3 flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
              activeTab === 'mobile_sync'
                ? 'border-[#0070ba] text-[#0070ba] bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-green-600" />
            <span>Mobile Scanner App</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'camera' && (
            <div className="space-y-3">
              {/* Scanner Video Canvas with Target Box matching Image 4 & 5 */}
              <div className="relative bg-black rounded-lg overflow-hidden border-2 border-slate-700 shadow-inner aspect-[4/3] flex items-center justify-center">
                {/* HTML5 QR Container */}
                <div id={scannerContainerId} className="w-full h-full object-cover"></div>

                {/* Overlaid UI Elements on Camera View */}
                {/* Flashlight button in top-right (blue rounded icon with torch like user image 4) */}
                <button
                  type="button"
                  onClick={toggleTorch}
                  className={`absolute top-3 right-3 z-20 p-2.5 rounded-xl shadow-lg flex items-center justify-center transition-all ${
                    torchOn ? 'bg-amber-400 text-slate-900 shadow-amber-500/50' : 'bg-[#0078d7] text-white hover:bg-[#0063b1]'
                  }`}
                  title="Toggle Flashlight / Torch"
                >
                  <Flashlight className="w-5 h-5" />
                </button>

                {/* Flip camera button top-left */}
                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  className="absolute top-3 left-3 z-20 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs transition-colors"
                  title="Switch Camera (Front / Rear)"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>

                {/* Target Frame: Green corner brackets and Glowing Laser Line */}
                <div className="pointer-events-none absolute inset-x-8 inset-y-12 sm:inset-x-12 sm:inset-y-10 border-2 border-transparent flex flex-col justify-between">
                  {/* Top corners */}
                  <div className="flex justify-between w-full">
                    <div className="w-7 h-7 border-t-4 border-l-4 border-lime-400 rounded-tl-sm"></div>
                    <div className="w-7 h-7 border-t-4 border-r-4 border-lime-400 rounded-tr-sm"></div>
                  </div>

                  {/* Red Laser scan animation */}
                  <div className="relative w-full h-0.5 bg-red-500 shadow-[0_0_12px_3px_#ef4444] animate-pulse"></div>

                  {/* Bottom corners */}
                  <div className="flex justify-between w-full">
                    <div className="w-7 h-7 border-b-4 border-l-4 border-lime-400 rounded-bl-sm"></div>
                    <div className="w-7 h-7 border-b-4 border-r-4 border-lime-400 rounded-br-sm"></div>
                  </div>
                </div>

                {/* Camera Error Fallback */}
                {cameraError && (
                  <div className="absolute inset-0 bg-slate-900/90 p-5 flex flex-col items-center justify-center text-center text-white z-10 space-y-3">
                    <AlertCircle className="w-10 h-10 text-amber-400" />
                    <p className="text-xs text-slate-200 max-w-xs">{cameraError}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('quick_test')}
                        className="bg-[#0078d7] hover:bg-[#0066b8] text-white text-xs font-bold py-1.5 px-3 rounded shadow"
                      >
                        Use Quick Barcodes
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wholesale Rate Mode Toggle Pill Button matching Image 4 & 5 */}
              <div className="flex justify-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsWholesale(!isWholesale)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all shadow-xs flex items-center gap-1.5 ${
                    isWholesale
                      ? 'bg-[#155724] border-[#28a745] text-white'
                      : 'bg-white border-[#28a745] text-[#28a745] hover:bg-green-50'
                  }`}
                >
                  {isWholesale && <Check className="w-3.5 h-3.5" />}
                  <span>{isWholesale ? 'Wholesale Rate Mode: ACTIVE' : 'Turn ON Whole Sale Rate Mode'}</span>
                </button>
              </div>

              {/* Hardware Barcode Scanner Status indicator */}
              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-center text-[11px] text-emerald-800 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>USB / Bluetooth Hardware Barcode Gun is also Active. Aim & Scan anytime!</span>
              </div>
            </div>
          )}

          {activeTab === 'quick_test' && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-2.5 rounded text-xs text-blue-900">
                Click any product below to instantly simulate a 1-second laser scan:
              </div>

              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleBarcodeDetected(p.barcode)}
                    className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded text-left transition-colors group"
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-800 group-hover:text-[#0070ba]">{p.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Barcode: {p.barcode} • {p.company}</div>
                    </div>
                    <div className="text-right shrink-0 font-semibold text-xs text-[#28a745]">
                      Rs. {isWholesale ? p.wholesalePrice : p.retailPrice}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mobile_sync' && (
            <div className="space-y-4 text-center">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-center">
                  <div className="bg-white p-3 border border-slate-300 rounded shadow-xs">
                    <QrCode className="w-32 h-32 text-slate-800 mx-auto" />
                  </div>
                </div>
                <h4 className="font-bold text-sm text-[#002b49]">Android Mobile Wireless Scanner</h4>
                <p className="text-xs text-slate-600">
                  Open this POS app on your Android phone browser or install as Android PWA. Tap <strong>"Android Sync"</strong> or <strong>"Mobile Barcode Scanner"</strong> to use your phone's camera as a wireless laser scanner.
                </p>
                <div className="bg-white p-2 rounded border border-slate-200 text-left text-[11px] text-slate-700 space-y-1">
                  <div>• <strong>Real-time Broadcast:</strong> Anything scanned on phone automatically adds to your PC invoice.</div>
                  <div>• <strong>Offline PWA:</strong> Save on Android home screen to open directly as scanner terminal.</div>
                </div>
              </div>
            </div>
          )}

          {/* Scanned notification pill */}
          {recentScan && (
            <div className="p-2.5 bg-green-600 text-white rounded text-xs font-bold text-center animate-bounce flex items-center justify-center gap-1.5 shadow-md">
              <Check className="w-4 h-4" />
              <span>Scanned Barcode: {recentScan}!</span>
            </div>
          )}

          {/* Manual Barcode Input Bar */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Or type / paste barcode manually..."
              className="flex-1 bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0070ba] rounded"
            />
            <button
              type="submit"
              className="bg-[#0078d7] hover:bg-[#0066b8] text-white font-bold px-3 py-1.5 text-xs rounded shadow transition-colors active:scale-[0.98]"
            >
              Add Item
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            Mode: {isWholesale ? 'Wholesale' : 'Retail'} Rate
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-bold px-4 py-1 rounded"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
