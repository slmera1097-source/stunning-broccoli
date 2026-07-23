import { useEffect, useState } from "react";

interface DayData {
  date: string;
  total_calories: number;
  goal_calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function getBarColor(actual: number, goal: number): string {
  if (actual <= goal) return "bg-emerald-500";
  if (actual <= goal * 1.2) return "bg-amber-500";
  return "bg-red-500";
}

function getBarHoverColor(actual: number, goal: number): string {
  if (actual <= goal) return "hover:bg-emerald-400";
  if (actual <= goal * 1.2) return "hover:bg-amber-400";
  return "hover:bg-red-400";
}

function dayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().slice(0, 10);
}

export default function CalorieTrend({ date }: { date: string }) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/history/weekly?date=${date}`)
      .then((r) => r.json())
      .then((json) => setData(json as DayData[]))
      .finally(() => setLoading(false));
  }, [date]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex justify-center py-8">
        <div className="animate-spin h-5 w-5 border-3 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="text-gray-400 text-center py-4 text-sm">No data available.</p>
      </div>
    );
  }

  // Find the max value for bar scaling — use max of actual or goal
  const maxVal = Math.max(
    ...data.map((d) => Math.max(d.total_calories, d.goal_calories)),
    1 // prevent division by zero
  );

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
        Weekly Trend
      </h2>

      <div className="relative">
        {/* Chart area */}
        <div className="flex items-end gap-1.5 h-48 px-1">
          {data.map((day) => {
            const barHeight = Math.max((day.total_calories / maxVal) * 100, 2);
            const goalLinePct = (day.goal_calories / maxVal) * 100;

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center justify-end h-full relative group"
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg whitespace-nowrap text-center">
                    <div className="font-semibold mb-0.5">
                      {new Date(day.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                      {isToday(day.date) && " (Today)"}
                    </div>
                    <div className="tabular-nums">
                      <span className="font-bold">{Math.round(day.total_calories)}</span>
                      <span className="text-gray-300"> / {day.goal_calories} kcal</span>
                    </div>
                    <div className="text-gray-300 mt-0.5 tabular-nums">
                      P: {Math.round(day.protein)} · C: {Math.round(day.carbs)} · F: {Math.round(day.fat)}
                    </div>
                  </div>
                  <div className="w-0 h-0 mx-auto border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-800" />
                </div>

                {/* Goal line marker */}
                <div
                  className="absolute w-full border-t-2 border-dashed border-gray-300 z-10 pointer-events-none"
                  style={{ bottom: `${goalLinePct}%` }}
                />

                {/* The bar */}
                <div
                  className={`w-full ${getBarColor(day.total_calories, day.goal_calories)} ${getBarHoverColor(day.total_calories, day.goal_calories)} rounded-t-md transition-all duration-200 cursor-pointer relative z-10`}
                  style={{ height: `${barHeight}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Day labels */}
        <div className="flex gap-1.5 px-1 mt-2">
          {data.map((day) => (
            <div
              key={day.date}
              className={`flex-1 text-center text-xs tabular-nums ${
                isToday(day.date) ? "font-bold text-emerald-600" : "text-gray-400"
              }`}
            >
              {dayLabel(day.date)}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            Under goal
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            Up to 20% over
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            &gt;20% over
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="border-t-2 border-dashed border-gray-300 w-4" />
            Goal
          </div>
        </div>
      </div>
    </div>
  );
}
