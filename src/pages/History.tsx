import { useEffect, useState } from "react";
import CalorieTrend from "../components/CalorieTrend";

interface Entry {
  id: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: string;
  date: string;
  created_at: string;
}

interface HistoryProps {
  tier: "free" | "pro";
  onUpgrade: () => void;
}

export default function History({ tier, onUpgrade }: HistoryProps) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchEntries = (d: string) => {
    setLoading(true);
    fetch(`/api/entries?date=${d}`)
      .then((r) => r.json())
      .then(setEntries)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEntries(date);
  }, [date]);

  const handleDelete = async (id: number) => {
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    fetchEntries(date);
  };

  const handleExport = async () => {
    if (tier !== "pro") {
      onUpgrade();
      return;
    }
    setExporting(true);
    try {
      const res = await fetch(`/api/entries/export?date=${date}`);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nibble-export-${date}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    } finally {
      setExporting(false);
    }
  };

  const changeDay = (offset: number) => {
    const d = new Date(date + "T00:00:00");
    d.setDate(d.getDate() + offset);
    setDate(d.toISOString().slice(0, 10));
  };

  const totals = entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
      carbs: acc.carbs + e.carbs,
      fat: acc.fat + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const isToday = date === new Date().toISOString().slice(0, 10);
  const displayDate = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-4">
      {/* Weekly trend chart */}
      <CalorieTrend date={date} />

      <div className="flex items-center justify-between">
        <button
          onClick={() => changeDay(-1)}
          className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors btn-press"
        >
          ← Prev
        </button>
        <h2 className="text-lg font-semibold text-center">
          {displayDate}
          {isToday && <span className="text-emerald-600 text-sm ml-2">(Today)</span>}
        </h2>
        <button
          onClick={() => changeDay(1)}
          disabled={isToday}
          className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30 transition-colors btn-press"
        >
          Next →
        </button>
      </div>

      {/* Totals */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm grid grid-cols-4 gap-2 text-center">
        <div>
          <div className="text-lg font-bold tabular-nums">{Math.round(totals.calories)}</div>
          <div className="text-xs text-gray-400">kcal</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums">{Math.round(totals.protein)}</div>
          <div className="text-xs text-gray-400">protein (g)</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums">{Math.round(totals.carbs)}</div>
          <div className="text-xs text-gray-400">carbs (g)</div>
        </div>
        <div>
          <div className="text-lg font-bold tabular-nums">{Math.round(totals.fat)}</div>
          <div className="text-xs text-gray-400">fat (g)</div>
        </div>
      </div>

      {/* Export button */}
      <div className="flex justify-end">
        <button
          onClick={handleExport}
          disabled={exporting}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all btn-press ${
            tier === "pro"
              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
              : "bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
          }`}
          title={tier === "pro" ? "Download today's entries as CSV" : "Export is a Pro feature"}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? "Exporting..." : "Export Data"}
          {tier !== "pro" && (
            <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full ml-1">
              Pro
            </span>
          )}
        </button>
      </div>

      {/* Entries */}
      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin h-6 w-6 border-4 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="text-4xl mb-3">📅</div>
          <p className="text-gray-500 text-sm font-medium mb-1">
            No entries for this day
          </p>
          <p className="text-gray-400 text-xs">
            {isToday ? "Start logging your meals to see them here!" : "Try a different date or log some meals."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => (
            <li
              key={entry.id}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm card-hover"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {entry.meal_type}
                  </span>
                  <span className="font-medium">{entry.food_name}</span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold tabular-nums">{entry.calories} kcal</span>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors text-lg"
                  title="Delete entry"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
