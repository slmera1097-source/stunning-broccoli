import { useState, useEffect } from "react";
import FoodEntryForm from "../components/FoodEntryForm";
import PhotoUpload from "../components/PhotoUpload";
import BarcodeScanner from "../components/BarcodeScanner";

interface LogProps {
  onLogged: () => void;
  tier: "free" | "pro";
  onUpgrade: () => void;
}

export default function Log({ onLogged, tier, onUpgrade }: LogProps) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [mealCount, setMealCount] = useState(0);
  const [upgradeReason, setUpgradeReason] = useState<"photo" | "barcode" | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const isFreeTier = tier === "free";
  const mealLimitReached = isFreeTier && mealCount >= 3;

  const fetchMealCount = () => {
    fetch(`/api/user/meal-count?date=${today}`)
      .then((r) => r.json())
      .then((d) => setMealCount(d.count))
      .catch(() => setMealCount(0));
  };

  useEffect(() => {
    fetchMealCount();
  }, [today]);

  const handlePhotoClick = () => {
    if (isFreeTier) {
      setUpgradeReason("photo");
    } else {
      setPhotoModalOpen(true);
    }
  };

  const handleBarcodeClick = () => {
    if (isFreeTier) {
      setUpgradeReason("barcode");
    } else {
      setBarcodeModalOpen(true);
    }
  };

  const handlePhotoLogged = (url: string, foodName?: string, calories?: number) => {
    setPhotoUrl(url);
    setPhotoModalOpen(false);
  };

  const handleBarcodeFound = (product: { name: string; calories: number }) => {
    fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        food_name: product.name,
        calories: product.calories,
        protein: 0,
        carbs: 0,
        fat: 0,
        meal_type: "snack",
        photo_url: photoUrl || null,
      }),
    })
      .then((res) => {
        if (res.ok) {
          setPhotoUrl(null);
          fetchMealCount();
          onLogged();
        }
      })
      .catch(console.error);
    setBarcodeModalOpen(false);
  };

  const handleManualEntry = () => {
    // Just close the modal, user will use the form below
  };

  const handleLocalLogged = () => {
    fetchMealCount();
    onLogged();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Log a Meal</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {mealCount === 0
              ? "Your food log is empty. Add your first meal below!"
              : `${mealCount} meal${mealCount !== 1 ? "s" : ""} logged today`}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Photo upload button */}
          <button
            onClick={handlePhotoClick}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            title={isFreeTier ? "Photo logging requires Pro" : "Log meal with photo"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Photo
          </button>

          {/* Barcode scan button */}
          <button
            onClick={handleBarcodeClick}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
            title={isFreeTier ? "Barcode scanning requires Pro" : "Scan barcode"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2m4 0h-2m4 0h-2M4 12h16M4 12a4 4 0 014-4h2m8 4a4 4 0 01-4 4h-2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 8h.01M10 8h.01" />
            </svg>
            Barcode
          </button>
        </div>
      </div>

      {/* Free tier meal limit warning */}
      {mealLimitReached && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                Free tier limit: 3 meals/day
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Upgrade to Pro for unlimited meal logging, barcode scanning, photo logging, and more.
              </p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="mt-3 w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
          >
            Upgrade to Pro — $6.99/mo
          </button>
        </div>
      )}

      {/* Pro feature upgrade prompt (photo) */}
      {upgradeReason === "photo" && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📸</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">Photo Logging is a Pro Feature</p>
              <p className="text-xs text-purple-700 mt-0.5">
                Snap photos of your meals and log them instantly. Upgrade to unlock photo logging along with barcode scanning, custom goals, and more.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setUpgradeReason(null)}
              className="flex-1 bg-white border border-purple-200 text-purple-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                setUpgradeReason(null);
                onUpgrade();
              }}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {/* Pro feature upgrade prompt (barcode) */}
      {upgradeReason === "barcode" && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📱</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Barcode Scanning is a Pro Feature</p>
              <p className="text-xs text-blue-700 mt-0.5">
                Scan product barcodes to instantly log nutritional info. Upgrade to unlock barcode scanning along with photo logging, custom goals, and more.
              </p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setUpgradeReason(null)}
              className="flex-1 bg-white border border-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={() => {
                setUpgradeReason(null);
                onUpgrade();
              }}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      )}

      {photoUrl && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <img src={photoUrl} alt="Meal" className="w-10 h-10 rounded-lg object-cover" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">Photo attached</p>
            <p className="text-xs text-amber-600">Recognition coming soon — fill details below</p>
          </div>
          <button
            onClick={() => setPhotoUrl(null)}
            className="text-amber-500 hover:text-amber-700 text-sm"
          >
            Remove
          </button>
        </div>
      )}

      {mealLimitReached ? (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">
            You've logged {mealCount} meals today. Come back tomorrow or upgrade to Pro.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Enter the details of what you ate. All fields except the food name are optional.
          </p>
          <FoodEntryForm onAdded={handleLocalLogged} photoUrl={photoUrl} />
        </>
      )}

      {/* Photo Upload Modal — only rendered for Pro users */}
      {tier === "pro" && (
        <>
          <PhotoUpload
            isOpen={photoModalOpen}
            onClose={() => setPhotoModalOpen(false)}
            onPhotoLogged={handlePhotoLogged}
          />
          <BarcodeScanner
            isOpen={barcodeModalOpen}
            onClose={() => setBarcodeModalOpen(false)}
            onProductFound={handleBarcodeFound}
            onManualEntry={handleManualEntry}
          />
        </>
      )}
    </div>
  );
}
