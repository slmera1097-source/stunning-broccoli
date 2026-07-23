import type { Page } from "../App";

const tabs: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "macros", label: "Macros", icon: "🔬" },
  { id: "log", label: "Log", icon: "➕" },
  { id: "history", label: "History", icon: "📅" },
];

export default function Navigation({
  current,
  onNavigate,
}: {
  current: Page;
  onNavigate: (p: Page) => void;
}) {
  return (
    <>
      {/* Desktop: horizontal pill nav */}
      <nav className="hidden md:flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onNavigate(t.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all btn-press ${
              current === t.id
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Mobile: bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 pb-safe">
        <div className="flex items-center justify-around h-16">
          {tabs.map((t) => {
            const isActive = current === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onNavigate(t.id)}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors btn-press ${
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className={`text-xl transition-transform ${isActive ? "scale-110" : ""}`}>
                  {t.icon}
                </span>
                <span className={`text-[10px] font-medium ${isActive ? "text-emerald-600" : ""}`}>
                  {t.label}
                </span>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
