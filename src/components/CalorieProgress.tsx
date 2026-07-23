export default function CalorieProgress({
  consumed,
  goal,
  percent,
}: {
  consumed: number;
  goal: number;
  percent: number;
}) {
  const remaining = goal - consumed;
  const over = consumed > goal;

  let barColor = "bg-emerald-500";
  if (percent > 90) barColor = "bg-amber-500";
  if (percent > 100) barColor = "bg-red-500";

  const displayPct = Math.min(percent, 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-end justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Calories</h2>
        <div className="text-right">
          <span className="text-3xl font-bold tabular-nums">{Math.round(consumed)}</span>
          <span className="text-gray-400 text-lg"> / {goal}</span>
        </div>
      </div>

      <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full progress-bar ${barColor}`}
          style={{ width: `${displayPct}%` }}
        />
      </div>

      <div className="mt-2 text-sm text-center">
        {over ? (
          <span className="text-red-500 font-medium">{Math.abs(Math.round(remaining))} kcal over goal</span>
        ) : remaining > 0 ? (
          <span className="text-gray-500">{Math.round(remaining)} kcal remaining</span>
        ) : (
          <span className="text-emerald-600 font-medium">Goal reached! 🎉</span>
        )}
      </div>
    </div>
  );
}
