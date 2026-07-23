import { useState, useRef, useEffect } from "react";
import Modal from "./Modal";

interface Product {
  name: string;
  calories: number;
}

// Hardcoded barcode lookup
const BARCODE_DB: Record<string, Product> = {
  "049000000443": { name: "Coca-Cola (12 oz)", calories: 140 },
  "0049000000443": { name: "Diet Coke (12 oz)", calories: 0 },
  "0074241000432": { name: "Nature Valley Granola Bar", calories: 190 },
};

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onProductFound: (product: Product) => void;
  onManualEntry: () => void;
}

export default function BarcodeScanner({
  isOpen,
  onClose,
  onProductFound,
  onManualEntry,
}: BarcodeScannerProps) {
  const [barcode, setBarcode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{
    type: "found" | "not-found";
    product?: Product;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setBarcode("");
      setResult(null);
      setScanning(false);
      // Focus input after a short delay (for animation)
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleScan = () => {
    const code = barcode.trim();
    if (!code) return;

    setScanning(true);
    setResult(null);

    // Simulate scan delay
    setTimeout(() => {
      const product = BARCODE_DB[code];
      if (product) {
        setResult({ type: "found", product });
      } else {
        setResult({ type: "not-found" });
      }
      setScanning(false);
    }, 800);
  };

  const handleAddToLog = () => {
    if (result?.type === "found" && result.product) {
      onProductFound(result.product);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleScan();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📱 Barcode Scan">
      <div className="space-y-4">
        {/* Barcode input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Enter barcode number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value);
                  setResult(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 049000000443"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono tracking-wider"
              />
              {scanning && (
                <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center">
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-sm text-emerald-700 font-medium">Scanning...</span>
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={handleScan}
              disabled={scanning || !barcode.trim()}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              Scan
            </button>
          </div>
        </div>

        {/* Simulated scan animation bar */}
        {scanning && (
          <div className="relative h-1 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-scan" />
          </div>
        )}

        {/* Result: Found */}
        {result?.type === "found" && result.product && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">✅</span>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">{result.product.name}</p>
                <p className="text-sm text-emerald-700 mt-0.5">
                  {result.product.calories} calories
                </p>
              </div>
            </div>
            <button
              onClick={handleAddToLog}
              className="mt-3 w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              Add to Log
            </button>
          </div>
        )}

        {/* Result: Not found */}
        {result?.type === "not-found" && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔍</span>
              <div>
                <p className="font-semibold text-amber-900">Barcode not in database yet</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  We couldn't find this product. You can add it manually below.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onManualEntry();
                onClose();
              }}
              className="mt-3 w-full bg-white border border-amber-300 text-amber-800 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors"
            >
              Enter Manually
            </button>
          </div>
        )}

        {/* No result yet — show hint */}
        {!result && !scanning && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-3">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2m4 0h-2m4 0h-2M4 12h16M4 12a4 4 0 014-4h2m8 4a4 4 0 01-4 4h-2" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">
              Point your camera at a barcode or type the number above.
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try: 049000000443 (Coca-Cola)
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
