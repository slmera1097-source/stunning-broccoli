interface NutrientRowProps {
  label: string;
  current: number;
  goal: number | null;
  unit: string;
  isLimit?: boolean; // true for nutrients where less is better (sugar, sat fat, sodium, cholesterol)
}

function NutrientRow({ label, current, goal, unit, isLimit }: NutrientRowProps) {
  const hasGoal = goal !== null && goal !== undefined && goal > 0;
  const pct = hasGoal ? Math.min(200, Math.round((current / goal!) * 100)) : 0;
  const displayPct = Math.min(pct, 100);

  // Colors: for "limit" nutrients, amber at 80% and red at 100% of goal
  // For "good" nutrients (protein, fiber), green up to 200%, amber if under 80%, red if under 50%
  let barColor = "bg-emerald-500";
  let textColor = "text-emerald-700";

  if (hasGoal) {
    if (isLimit) {
      // Limit nutrients: lower is better
      if (pct > 100) {
        barColor = "bg-red-500";
        textColor = "text-red-600";
      } else if (pct >= 80) {
        barColor = "bg-amber-500";
        textColor = "text-amber-600";
      } else {
        barColor = "bg-emerald-500";
        textColor = "text-emerald-700";
      }
    } else {
      // Good nutrients: higher is better (protein, fiber)
      if (pct < 50) {
        barColor = "bg-red-500";
        textColor = "text-red-600";
      } else if (pct < 80) {
        barColor = "bg-amber-500";
        textColor = "text-amber-600";
      } else {
        barColor = "bg-emerald-500";
        textColor = "text-emerald-700";
      }
    }
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg odd:bg-gray-50">
      <div className="w-32 shrink-0">
        <span className={`text-sm font-medium ${textColor}`}>{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full progress-bar ${barColor}`}
            style={{ width: `${displayPct}%` }}
          />
        </div>
      </div>
      <div className="text-right shrink-0 w-28">
        <span className="text-sm font-semibold tabular-nums">
          {Math.round(current * 10) / 10}
        </span>
        {hasGoal ? (
          <span className="text-xs text-gray-400"> / {goal}{unit}</span>
        ) : (
          <span className="text-xs text-gray-400">{unit}</span>
        )}
      </div>
    </div>
  );
}

interface MicroPlaceholderProps {
  label: string;
  unit: string;
}

function MicroPlaceholder({ label, unit }: MicroPlaceholderProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg odd:bg-gray-50 opacity-60">
      <div className="w-32 shrink-0">
        <span className="text-sm font-medium text-gray-400">{label}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gray-200" style={{ width: "0%" }} />
        </div>
      </div>
      <div className="text-right shrink-0 w-28">
        <span className="text-xs text-gray-300 italic">– {unit}</span>
      </div>
      <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full shrink-0">
        Soon
      </span>
    </div>
  );
}

export interface MacroData {
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    saturated_fat: number;
    sodium: number;
    cholesterol: number;
  };
  goals: {
    calorie_goal: number;
    protein_goal: number;
    carbs_goal: number;
    fat_goal: number;
    fiber_goal: number | null;
    sugar_goal: number | null;
    saturated_fat_goal: number | null;
    sodium_goal: number | null;
    cholesterol_goal: number | null;
  };
}

export default function MacroDetail({ data }: { data: MacroData | null }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { totals, goals } = data;

  return (
    <div className="space-y-5">
      {/* Macronutrients Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Macronutrients</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <NutrientRow label="Calories" current={totals.calories} goal={goals.calorie_goal} unit=" kcal" isLimit />
          <NutrientRow label="Protein" current={totals.protein} goal={goals.protein_goal} unit="g" />
          <NutrientRow label="Carbs" current={totals.carbs} goal={goals.carbs_goal} unit="g" />
          <NutrientRow label="Fat" current={totals.fat} goal={goals.fat_goal} unit="g" isLimit />
          <NutrientRow label="Fiber" current={totals.fiber} goal={goals.fiber_goal} unit="g" />
          <NutrientRow label="Sugar" current={totals.sugar} goal={goals.sugar_goal} unit="g" isLimit />
          <NutrientRow label="Saturated Fat" current={totals.saturated_fat} goal={goals.saturated_fat_goal} unit="g" isLimit />
          <NutrientRow label="Sodium" current={totals.sodium} goal={goals.sodium_goal} unit="mg" isLimit />
          <NutrientRow label="Cholesterol" current={totals.cholesterol} goal={goals.cholesterol_goal} unit="mg" isLimit />
        </div>
      </div>

      {/* Micronutrients Section (Placeholders) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Micronutrients</h2>
        </div>
        <div className="divide-y divide-gray-50">
          <MicroPlaceholder label="Vitamin A" unit="µg" />
          <MicroPlaceholder label="Vitamin C" unit="mg" />
          <MicroPlaceholder label="Calcium" unit="mg" />
          <MicroPlaceholder label="Iron" unit="mg" />
        </div>
      </div>
    </div>
  );
}
