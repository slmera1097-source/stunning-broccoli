interface DashboardData {
  date: string;
  entries: Array<{
    id: number;
    food_name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    saturated_fat: number;
    sodium: number;
    cholesterol: number;
    meal_type: string;
  }>;
  totals: { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; saturated_fat: number; sodium: number; cholesterol: number };
  goals: { calorie_goal: number; protein_goal: number; carbs_goal: number; fat_goal: number; fiber_goal: number | null; sugar_goal: number | null; saturated_fat_goal: number | null; sodium_goal: number | null; cholesterol_goal: number | null };
  progress: { calories: number; protein: number; carbs: number; fat: number; fiber: number; sugar: number; saturated_fat: number; sodium: number; cholesterol: number };
}

import { useEffect, useState } from "react";
import CalorieProgress from "../components/CalorieProgress";
import FoodEntryForm from "../components/FoodEntryForm";

interface DashboardProps {
  onEntryAdded: () => void;
  tier: "free" | "pro";
  onUpgrade: () => void;
  onNavigateLog: () => void;
}

export default function Dashboard({ onEntryAdded, tier, onUpgrade, onNavigateLog }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [goalsExpanded, setGoalsExpanded] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const isFreeTier = tier === "free";

  const fetchDashboard = () => {
    setLoading(true);
    fetch(`/api/dashboard?date=${today}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, [today]);

  const handleDelete = async (id: number) => {
    await fetch(`/api/entries/${id}`, { method: "DELETE" });
    fetchDashboard();
    onEntryAdded();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!data) return <p className="text-gray-500 text-center py-10">Could not load dashboard.</p>;

  const { entries, totals, goals, progress } = data;

  return (
    <div className="space-y-6">
      {/* Quick Add Section */}
      <FoodEntryForm
        onAdded={() => {
          fetchDashboard();
          onEntryAdded();
        }}
      />

      {/* Calorie Progress */}
      <CalorieProgress consumed={totals.calories} goal={goals.calorie_goal} percent={progress.calories} />

      {/* Macro Summary */}
      <div className="grid grid-cols-3 gap-3">
        <MacroCard label="Protein" current={totals.protein} goal={goals.protein_goal} unit="g" color="bg-blue-500" />
        <MacroCard label="Carbs" current={totals.carbs} goal={goals.carbs_goal} unit="g" color="bg-amber-500" />
        <MacroCard label="Fat" current={totals.fat} goal={goals.fat_goal} unit="g" color="bg-pink-500" />
      </div>

      {/* Daily Goals Section */}
      <section className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Daily Goals
          </h2>
          <div className="flex items-center gap-2">
            {isFreeTier && (
              <span
                onClick={onUpgrade}
                className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full cursor-pointer hover:bg-emerald-100 transition-colors"
                title="Upgrade to Pro to customize goals"
              >
                Pro
              </span>
            )}
            <button
              onClick={() => {
                if (isFreeTier) {
                  onUpgrade();
                } else {
                  setGoalsExpanded(!goalsExpanded);
                }
              }}
              className={`text-xs font-medium transition-colors ${
                isFreeTier
                  ? "text-gray-400 cursor-pointer"
                  : "text-emerald-600 hover:text-emerald-700"
              }`}
            >
              {isFreeTier ? "🔒 Read-only" : goalsExpanded ? "Collapse" : "Edit"}
            </button>
          </div>
        </div>

        {/* Goals grid */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <GoalItem label="Calories" value={goals.calorie_goal} unit="kcal" />
          <GoalItem label="Protein" value={goals.protein_goal} unit="g" />
          <GoalItem label="Carbs" value={goals.carbs_goal} unit="g" />
          <GoalItem label="Fat" value={goals.fat_goal} unit="g" />
          <GoalItem label="Fiber" value={goals.fiber_goal} unit="g" />
          <GoalItem label="Sugar" value={goals.sugar_goal} unit="g" />
          <GoalItem label="Sat. Fat" value={goals.saturated_fat_goal} unit="g" />
          <GoalItem label="Sodium" value={goals.sodium_goal} unit="mg" />
          <GoalItem label="Cholesterol" value={goals.cholesterol_goal} unit="mg" />
        </div>

        {/* Free tier upgrade prompt */}
        {isFreeTier && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              💡 Custom nutrition goals are a Pro feature.{" "}
              <button
                onClick={onUpgrade}
                className="text-emerald-600 hover:text-emerald-700 font-medium underline"
              >
                Upgrade to Pro
              </button>{" "}
              to set your own targets.
            </p>
          </div>
        )}
      </section>

      {/* Today's Entries */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Today's Entries</h2>
        {entries.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-gray-500 text-sm font-medium mb-2">
              No meals logged yet today
            </p>
            <p className="text-gray-400 text-xs mb-4">
              Tap Log to add your first meal!
            </p>
            <button
              onClick={onNavigateLog}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors btn-press"
            >
              <span>+</span> Add a Meal
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                      {entry.meal_type}
                    </span>
                    <span className="font-medium truncate">{entry.food_name}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    P: {entry.protein}g · C: {entry.carbs}g · F: {entry.fat}g
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="font-semibold text-gray-800 tabular-nums">
                    {entry.calories} <span className="text-xs text-gray-400">kcal</span>
                  </span>
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
      </section>
    </div>
  );
}

function GoalItem({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="text-sm font-semibold text-gray-700 tabular-nums">
        {value ?? "—"}
        {value != null && <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}

function MacroCard({
  label,
  current,
  goal,
  unit,
  color,
}: {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}) {
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0;
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-lg font-bold tabular-nums">
        {Math.round(current)}
        <span className="text-xs font-normal text-gray-400">/{goal}{unit}</span>
      </div>
      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} progress-bar`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
