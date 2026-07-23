import { useState } from "react";

interface FoodEntryFormProps {
  onAdded: () => void;
  defaultDate?: string;
  photoUrl?: string | null;
}

export default function FoodEntryForm({ onAdded, defaultDate, photoUrl }: FoodEntryFormProps) {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [mealType, setMealType] = useState("snack");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields
  const [fiber, setFiber] = useState("");
  const [sugar, setSugar] = useState("");
  const [saturatedFat, setSaturatedFat] = useState("");
  const [sodium, setSodium] = useState("");
  const [cholesterol, setCholesterol] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) {
      setError("Food name is required");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const body: Record<string, unknown> = {
        food_name: foodName.trim(),
        calories: parseFloat(calories) || 0,
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
        meal_type: mealType,
      };
      if (defaultDate) body.date = defaultDate;
      if (photoUrl) body.photo_url = photoUrl;

      // Include advanced fields if they have values
      if (showAdvanced) {
        body.fiber = parseFloat(fiber) || 0;
        body.sugar = parseFloat(sugar) || 0;
        body.saturated_fat = parseFloat(saturatedFat) || 0;
        body.sodium = parseFloat(sodium) || 0;
        body.cholesterol = parseFloat(cholesterol) || 0;
      }

      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Failed to log entry");
        return;
      }

      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setFiber("");
      setSugar("");
      setSaturatedFat("");
      setSodium("");
      setCholesterol("");
      setMealType("snack");
      setShowAdvanced(false);
      onAdded();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Quick Add</h2>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          placeholder="What did you eat?"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="kcal"
          className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={protein}
          onChange={(e) => setProtein(e.target.value)}
          placeholder="Protein (g)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="number"
          value={carbs}
          onChange={(e) => setCarbs(e.target.value)}
          placeholder="Carbs (g)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        <input
          type="number"
          value={fat}
          onChange={(e) => setFat(e.target.value)}
          placeholder="Fat (g)"
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {/* Advanced toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Advanced
        </button>
      </div>

      {/* Advanced fields with animation */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          showAdvanced ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
                placeholder="Fiber (g)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="number"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                placeholder="Sugar (g)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={saturatedFat}
                onChange={(e) => setSaturatedFat(e.target.value)}
                placeholder="Sat. Fat (g)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <input
                type="number"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                placeholder="Sodium (mg)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                placeholder="Cholesterol (mg)"
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 items-center">
        <select
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snack">Snack</option>
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? "Adding..." : "Log Meal"}
        </button>
      </div>
    </form>
  );
}
