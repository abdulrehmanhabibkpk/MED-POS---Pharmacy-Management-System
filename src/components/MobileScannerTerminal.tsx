import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Smartphone, Flashlight, RefreshCw, Volume2, VolumeX, ArrowLeft, Check, AlertCircle, Download, Zap } from 'lucide-react';
import { posSound } from '../utils/audio';
import { usePOS } from '../context/POSContext';

interface MobileScannerTerminalProps {
  onBack?: () => void;
}

export const MobileScannerTerminal: React.FC<MobileScannerTerminalProps> = ({ onBack }) => {
  const { products } = usePOS();
  const [isWholesale, setIsWholesale] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [lastScannedItem, setLastScannedItem] = useState<{ name: string; barcode: string; rate: number; time: string } | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');
  const [soundOn, setSoundOn] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [scanCount, setScanCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const html5ScannerRef = useRef<Html5Qrcode | null>(null);
  const lastScannedCodeRef = useRef<string>('');
  const lastScannedTimeRef = useRef<number>(0);
  const isDetectingRef = useRef<boolean>(false);
  const animFrameIdRef = useRef<number | null>(null);

  // Catch PWA Install Prompt
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

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install app: Tap the 3 dots (⋮) in Chrome menu and select "Install App" or "Add to Home Screen".');
    }
  };

  const handleScanSuccess = useCallback((barcodeText: string) => {
    const code = barcodeText.trim();
    if (!code) return;

    // Cooldown check (prevent repeated multi-scans of same barcode within 1.2s)
    const now = Date.now();
    if (code === lastScannedCodeRef.current && now - lastScannedTimeRef.current < 1200) {
      return;
    }

    lastScannedCodeRef.current = code;
    lastScannedTimeRef.current = now;

    // Trigger instant custom MP3 scanner sound
    if (soundOn) {
      if (isWholesale) {
        posSound.playDoubleBeep();
      } else {
        posSound.playScanBeep();
      }
    }

    // Vibrate phone for tactile feedback (50ms)
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(60);
      } catch {}
    }

    const found = products.find(
      (p) => p.barcode.trim().toLowerCase() === code.toLowerCase()
    );

    const rate = found ? (isWholesale ? found.wholesalePrice : found.retailPrice) : 0;
    const itemName = found ? found.name : 'Unregistered Product';

    setLastScannedItem({
      name: itemName,
      barcode: code,
      rate,
      time: new Date().toLocaleTimeString(),
    });
    setScanCount((c) => c + 1);

    // Real-time Cross-Device broadcast to PC Sale Invoice
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
  }, [products, isWholesale, soundOn]);

  // High-Speed Camera Scanner with Native BarcodeDetector (Ultra-Fast 60fps) + Html5Qrcode Fallback
  useEffect(() => {
    let isMounted = true;
    isDetectingRef.current = true;

    const startFastScanner = async () => {
      setCameraError(null);
      posSound.unlockAudio();

      // Check if native BarcodeDetector is supported on this Android device (Hardware accelerated)
      const hasNativeDetector = 'BarcodeDetector' in window;

      if (hasNativeDetector) {
        try {
          const BarcodeDetectorClass = (window as any).BarcodeDetector;
          const barcodeDetector = new BarcodeDetectorClass({
            formats: ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'qr_code', 'itf'],
          });

          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: cameraFacing },
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { ideal: 30 },
            },
            audio: false,
          });

          if (!isMounted) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.setAttribute('playsinline', 'true');
            await videoRef.current.play();

            // Run ultra-fast detection loop
            const detectFrame = async () => {
              if (!isMounted || !isDetectingRef.current || !videoRef.current) return;

              if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                try {
                  const barcodes = await barcodeDetector.detect(videoRef.current);
                  if (barcodes && barcodes.length > 0) {
                    const rawVal = barcodes[0].rawValue;
                    if (rawVal) {
                      handleScanSuccess(rawVal);
                    }
                  }
                } catch {}
              }
              animFrameIdRef.current = requestAnimationFrame(detectFrame);
            };

            detectFrame();
          }
          return;
        } catch (nativeErr) {
          console.warn('Native detector fallback to HTML5 engine:', nativeErr);
        }
      }

      // Fallback: Html5Qrcode (Optimized for High FPS)
      try {
        const containerId = 'fast-mobile-scanner-view';
        const el = document.getElementById(containerId);
        if (!el) return;

        const html5QrCode = new Html5Qrcode(containerId, {
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
        html5ScannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: cameraFacing },
          {
            fps: 30, // 30 FPS for instant capture
            qrbox: { width: 300, height: 180 },
            aspectRatio: 1.777778,
            disableFlip: false,
          },
          (decoded) => {
            if (isMounted) handleScanSuccess(decoded);
          },
          () => {}
        );
      } catch (err: any) {
        if (isMounted) {
          setCameraError('Camera access unavailable. Please grant camera permission in browser settings.');
        }
      }
    };

    const timer = setTimeout(startFastScanner, 100);

    return () => {
      isMounted = false;
      isDetectingRef.current = false;
      clearTimeout(timer);

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (html5ScannerRef.current && html5ScannerRef.current.isScanning) {
        html5ScannerRef.current.stop().catch(() => {}).finally(() => {
          try {
            html5ScannerRef.current?.clear();
          } catch {}
        });
      }
    };
  }, [cameraFacing, handleScanSuccess]);

  // Flashlight toggle
  const toggleTorch = async () => {
    try {
      if (streamRef.current) {
        const track = streamRef.current.getVideoTracks()[0];
        if (track) {
          const next = !torchOn;
          await track.applyConstraints({
            advanced: [{ torch: next } as any],
          });
          setTorchOn(next);
          return;
        }
      }
      if (html5ScannerRef.current && html5ScannerRef.current.isScanning) {
        const capabilities = html5ScannerRef.current.getRunningTrackCapabilities();
        if (capabilities && 'torch' in capabilities) {
          const next = !torchOn;
          await html5ScannerRef.current.applyVideoConstraints({
            advanced: [{ torch: next } as any],
          });
          setTorchOn(next);
        }
      }
    } catch {
      setTorchOn(!torchOn);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-white select-none overflow-hidden font-sans">
      {/* Top Mobile App Bar */}
      <div className="bg-[#002b49] px-4 py-3 flex items-center justify-between shadow-lg border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-full bg-slate-800 text-slate-200 active:scale-90 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-7 h-5 bg-white rounded-xs">
              <span className="font-mono text-[9px] font-black text-slate-900">||| ||</span>
              <div className="absolute inset-x-0 h-0.5 bg-red-500"></div>
            </div>
            <div>
              <h2 className="font-bold text-sm leading-none flex items-center gap-1.5">
                <span>MED Scanner Gun</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                  FAST
                </span>
              </h2>
              <span className="text-[10px] text-cyan-300">Live PC Sync: Active ({scanCount} Scanned)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Install Android PWA Button */}
          {!isInstalled && (
            <button
              type="button"
              onClick={handleInstallApp}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-2.5 py-1.5 rounded flex items-center gap-1 shadow animate-pulse"
              title="Install as Android App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-full bg-slate-800 text-slate-200"
            title="Toggle Beep"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            type="button"
            onClick={() => setCameraFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
            className="p-2 rounded-full bg-slate-800 text-slate-200"
            title="Flip Camera"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Live Viewport */}
      <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
        {/* Native video element for BarcodeDetector */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Html5Qrcode container fallback */}
        <div id="fast-mobile-scanner-view" className="absolute inset-0 w-full h-full object-cover"></div>

        {/* Torch Button */}
        <button
          type="button"
          onClick={toggleTorch}
          className={`absolute top-4 right-4 z-30 p-3.5 rounded-2xl shadow-2xl transition-all active:scale-95 ${
            torchOn ? 'bg-amber-400 text-slate-900 shadow-amber-400/60' : 'bg-[#0078d7] text-white hover:bg-[#0063b1]'
          }`}
          title="Torch / Flashlight"
        >
          <Flashlight className="w-6 h-6" />
        </button>

        {/* Laser Targeting Grid */}
        <div className="pointer-events-none absolute inset-x-8 inset-y-16 sm:inset-x-16 sm:inset-y-20 flex flex-col justify-between z-20">
          <div className="flex justify-between w-full">
            <div className="w-9 h-9 border-t-4 border-l-4 border-lime-400 rounded-tl-md"></div>
            <div className="w-9 h-9 border-t-4 border-r-4 border-lime-400 rounded-tr-md"></div>
          </div>
          {/* Animated Laser Beam */}
          <div className="relative w-full h-0.5 bg-red-500 shadow-[0_0_16px_4px_#ef4444] animate-pulse"></div>
          <div className="flex justify-between w-full">
            <div className="w-9 h-9 border-b-4 border-l-4 border-lime-400 rounded-bl-md"></div>
            <div className="w-9 h-9 border-b-4 border-r-4 border-lime-400 rounded-br-md"></div>
          </div>
        </div>

        {/* Camera Error Message */}
        {cameraError && (
          <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center z-30 space-y-3">
            <AlertCircle className="w-12 h-12 text-amber-400" />
            <p className="text-xs text-slate-200">{cameraError}</p>
            <button
              onClick={() => setCameraFacing((f) => (f === 'environment' ? 'user' : 'environment'))}
              className="bg-[#0078d7] text-white font-bold px-4 py-2 text-xs rounded"
            >
              Retry Camera
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls & Feedback */}
      <div className="bg-slate-900 p-3.5 flex flex-col items-center gap-3 border-t border-slate-800 shrink-0">
        {/* Wholesale Rate Mode Toggle Pill Button */}
        <button
          type="button"
          onClick={() => setIsWholesale(!isWholesale)}
          className={`w-full py-2.5 text-xs font-bold rounded-full border transition-all flex items-center justify-center gap-2 shadow-md ${
            isWholesale
              ? 'bg-[#155724] border-[#28a745] text-white ring-2 ring-green-500/50'
              : 'bg-slate-800 border-[#28a745] text-lime-400 hover:bg-slate-700'
          }`}
        >
          {isWholesale && <Check className="w-4 h-4" />}
          <span>{isWholesale ? 'WHOLESALE RATE MODE: ACTIVE' : 'Turn ON Wholesale Rate Mode'}</span>
        </button>

        {/* Last Scanned Item Banner */}
        {lastScannedItem ? (
          <div className="w-full bg-emerald-950/80 border border-emerald-500/60 p-3 rounded-lg flex items-center justify-between text-xs animate-in fade-in">
            <div className="truncate pr-2">
              <div className="font-bold text-lime-300 truncate text-sm">{lastScannedItem.name}</div>
              <div className="text-[11px] text-slate-300 font-mono">
                Code: <span className="text-white font-bold">{lastScannedItem.barcode}</span> • {lastScannedItem.time}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-black text-emerald-400 text-sm">
                Rs. {lastScannedItem.rate.toLocaleString()}
              </div>
              <span className="text-[9px] bg-emerald-700/60 text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                Synced to PC
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-400 font-mono py-1">
            ⚡ Aim camera at barcode on medicine box to auto-scan
          </div>
        )}

        {/* Manual Barcode entry fallback */}
        <div className="w-full flex items-center gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Type barcode manually..."
            className="flex-1 bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white rounded focus:outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={() => {
              if (manualBarcode.trim()) {
                handleScanSuccess(manualBarcode.trim());
                setManualBarcode('');
              }
            }}
            className="bg-[#0078d7] hover:bg-[#0063b1] text-white text-xs font-bold px-4 py-2 rounded shadow shrink-0"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};
