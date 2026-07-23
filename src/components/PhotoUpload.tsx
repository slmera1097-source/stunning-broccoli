import { useState, useRef, useCallback } from "react";
import Modal from "./Modal";

interface PhotoUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onPhotoLogged: (photoUrl: string, foodName?: string, calories?: number) => void;
}

export default function PhotoUpload({ isOpen, onClose, onPhotoLogged }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [logged, setLogged] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;

    // Show preview immediately
    const dataUrl = URL.createObjectURL(file);
    setPreview(dataUrl);
    setUploading(true);
    setLogged(false);

    try {
      // Upload to server
      const formData = new FormData();
      formData.append("photo", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      if (res.ok) {
        const { url } = await res.json();
        setUploading(false);
        setLogged(true);
        // Store the server URL so we can save it
        (window as unknown as Record<string, unknown>).__lastPhotoUrl = url;
      } else {
        // Fallback: store as data URL
        setUploading(false);
        setLogged(true);
        (window as unknown as Record<string, unknown>).__lastPhotoUrl = dataUrl;
      }
    } catch {
      // Fallback: store as data URL locally
      setUploading(false);
      setLogged(true);
      (window as unknown as Record<string, unknown>).__lastPhotoUrl = dataUrl;
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleLogMeal = () => {
    const url = (window as unknown as Record<string, unknown>).__lastPhotoUrl as string || "";
    onPhotoLogged(url);
    resetAndClose();
  };

  const resetAndClose = () => {
    setPreview(null);
    setLogged(false);
    setUploading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={resetAndClose} title="📸 Photo Log">
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragOver
              ? "border-emerald-500 bg-emerald-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <div className="text-4xl mb-3">📷</div>
          <p className="text-sm text-gray-600 mb-1 font-medium">
            Drag & drop a meal photo here
          </p>
          <p className="text-xs text-gray-400 mb-4">or use one of the options below</p>

          <div className="flex gap-3 justify-center">
            {/* Camera button (mobile-friendly) */}
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Take Photo
            </button>

            {/* File picker */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Choose File
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFilePick}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFilePick}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Thumbnail preview */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img
              src={preview}
              alt="Meal preview"
              className="w-full h-48 object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-4 border-white border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {logged && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <span className="text-amber-500 text-lg">📸</span>
                <div>
                  <p className="text-sm font-medium text-amber-800">Photo logged</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Photo recognition coming soon — calories estimated at 0. Add them manually below.
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogMeal}
                className="mt-3 w-full bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
              >
                Log Meal with Photo
              </button>
            </div>
          )}

          <button
            onClick={resetAndClose}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </Modal>
  );
}
