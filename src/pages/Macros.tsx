import { useEffect, useState } from "react";
import MacroDetail, { type MacroData } from "../components/MacroDetail";

interface MacrosProps {
  tier: "free" | "pro";
  onUpgrade: () => void;
}

export default function Macros({ tier, onUpgrade }: MacrosProps) {
  const [data, setData] = useState<MacroData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const today = new Date().toISOString().slice(0, 10);
  const isFreeTier = tier === "free";

  const fetchData = () => {
    setLoading(true);
    setError("");
    fetch(`/api/dashboard?date=${today}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load data");
        return r.json();
      })
      .then((d) => {
        setData({
          totals: d.totals,
          goals: d.goals,
        });
      })
      .catch((err) => setError(err.message || "Could not load macros"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [today]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-3">{error}</p>
        <button
          onClick={fetchData}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Nutrient Breakdown</h2>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <button
          onClick={fetchData}
          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Free tier: show locked preview */}
      {isFreeTier ? (
        <div className="relative">
          {/* Blurred preview */}
          <div className="opacity-30 pointer-events-none select-none">
            <MacroDetail data={data} />
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-xl">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 text-center max-w-xs mx-auto">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-200 mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Pro Feature
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Track your full macro and micronutrient breakdown — protein, carbs, fat, fiber, sugar, sodium and more.
              </p>
              <button
                onClick={onUpgrade}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm"
              >
                Upgrade to Pro — $6.99/mo
              </button>
            </div>
          </div>
        </div>
      ) : (
        <MacroDetail data={data} />
      )}

      {/* Empty state for pro users with no entries */}
      {!isFreeTier && data && data.totals.calories === 0 && (
        <div className="text-center py-8 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">🔬</div>
          <p className="text-gray-500 text-sm font-medium mb-1">
            Log some meals to see your nutrient breakdown
          </p>
          <p className="text-gray-400 text-xs">
            Your macro and micronutrient data will appear here once you start logging.
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Color Guide</h3>
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>On track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Approaching limit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Over / under target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
