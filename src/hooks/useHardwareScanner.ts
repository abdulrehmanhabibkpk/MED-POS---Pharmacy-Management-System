import { useEffect, useRef } from 'react';

interface HardwareScannerOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
  minChars?: number;
  maxIntervalMs?: number;
}

/**
 * Hook to automatically listen for hardware USB/Bluetooth barcode scanner inputs.
 * Hardware scanners send rapid keystrokes (< 50ms) terminated by an 'Enter' key.
 */
export function useHardwareScanner({
  onScan,
  enabled = true,
  minChars = 2,
  maxIntervalMs = 70,
}: HardwareScannerOptions) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if modifying with Ctrl/Alt/Meta
      if (e.ctrlKey || e.altKey || e.metaKey) return;

      const now = Date.now();
      const elapsed = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // If key is Enter
      if (e.key === 'Enter') {
        if (bufferRef.current.length >= minChars && elapsed <= maxIntervalMs * 2) {
          const barcode = bufferRef.current.trim();
          bufferRef.current = '';
          if (barcode) {
            e.preventDefault();
            e.stopPropagation();
            onScan(barcode);
          }
        } else {
          // Reset buffer if not fast enough
          bufferRef.current = '';
        }
        return;
      }

      // Only accept printable single characters
      if (e.key.length === 1) {
        if (elapsed > maxIntervalMs) {
          // Started a new sequence
          bufferRef.current = e.key;
        } else {
          // Continuing rapid scanner sequence
          bufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [onScan, enabled, minChars, maxIntervalMs]);
}
