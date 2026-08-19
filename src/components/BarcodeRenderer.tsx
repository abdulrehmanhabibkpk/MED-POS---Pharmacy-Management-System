import React, { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';

export type BarcodeFormat = 'CODE128' | 'EAN13' | 'UPC' | 'CODE39' | 'ITF' | 'pharmacode';

interface BarcodeRendererProps {
  value: string;
  format?: BarcodeFormat;
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  fontOptions?: string;
  font?: string;
  textMargin?: number;
  margin?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  background?: string;
  lineColor?: string;
  className?: string;
}

export const BarcodeRenderer: React.FC<BarcodeRendererProps> = ({
  value,
  format = 'CODE128',
  width = 1.5,
  height = 36,
  displayValue = false,
  fontSize = 11,
  fontOptions = '',
  font = 'monospace',
  textMargin = 2,
  margin = 0,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  background = 'transparent',
  lineColor = '#000000',
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    // Clean value
    const rawVal = (value || '000000').trim();
    if (!rawVal) {
      setRenderError('Empty barcode');
      return;
    }

    try {
      setRenderError(null);

      // Validate & clean input according to format
      let finalVal = rawVal;
      let targetFormat = format;

      if (format === 'EAN13') {
        // EAN-13 requires 12 or 13 numeric digits
        const numericOnly = rawVal.replace(/\D/g, '');
        if (numericOnly.length >= 12) {
          finalVal = numericOnly.slice(0, 13);
        } else {
          // Fallback to CODE128 for non-standard lengths
          targetFormat = 'CODE128';
        }
      } else if (format === 'UPC') {
        const numericOnly = rawVal.replace(/\D/g, '');
        if (numericOnly.length >= 11) {
          finalVal = numericOnly.slice(0, 12);
        } else {
          targetFormat = 'CODE128';
        }
      } else if (format === 'CODE39') {
        // CODE39 uppercase alphanumeric
        finalVal = rawVal.toUpperCase().replace(/[^0-9A-Z\-.\s$%+/]/g, '-');
      }

      JsBarcode(svgRef.current, finalVal, {
        format: targetFormat,
        width: Math.max(1, width),
        height: Math.max(15, height),
        displayValue: displayValue,
        fontSize: fontSize,
        fontOptions: fontOptions,
        font: font,
        textAlign: 'center',
        textPosition: 'bottom',
        textMargin: textMargin,
        background: background,
        lineColor: lineColor,
        margin: margin,
        marginTop: marginTop,
        marginBottom: marginBottom,
        marginLeft: marginLeft,
        marginRight: marginRight,
        valid: (valid) => {
          if (!valid) {
            // If primary format validation fails, retry safely with CODE128
            try {
              JsBarcode(svgRef.current!, rawVal, {
                format: 'CODE128',
                width: Math.max(1, width),
                height: Math.max(15, height),
                displayValue: displayValue,
                fontSize: fontSize,
                font: font,
                background: background,
                lineColor: lineColor,
                margin: margin,
              });
            } catch (err: any) {
              setRenderError(err.message || 'Invalid barcode');
            }
          }
        },
      });
    } catch (err: any) {
      // Fallback try with CODE128
      try {
        JsBarcode(svgRef.current, rawVal, {
          format: 'CODE128',
          width: Math.max(1, width),
          height: Math.max(15, height),
          displayValue: displayValue,
          fontSize: fontSize,
          font: font,
          background: background,
          lineColor: lineColor,
          margin: margin,
        });
        setRenderError(null);
      } catch (innerErr: any) {
        setRenderError(innerErr.message || 'Barcode render failed');
      }
    }
  }, [
    value,
    format,
    width,
    height,
    displayValue,
    fontSize,
    fontOptions,
    font,
    textMargin,
    margin,
    marginTop,
    marginBottom,
    marginLeft,
    marginRight,
    background,
    lineColor,
  ]);

  if (renderError) {
    return (
      <div className="flex flex-col items-center justify-center p-1 bg-red-50 text-red-600 text-[9px] font-mono border border-red-200 rounded">
        <span>⚠️ {renderError}</span>
        <span className="font-bold">{value}</span>
      </div>
    );
  }

  return (
    <div className={`flex justify-center items-center w-full overflow-hidden ${className}`}>
      <svg
        ref={svgRef}
        className="max-w-full h-auto mx-auto select-none"
        style={{ display: 'block' }}
      />
    </div>
  );
};
