import { useState, useCallback, useEffect } from "react";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import Log from "./pages/Log";
import History from "./pages/History";
import Macros from "./pages/Macros";
import UpgradeModal from "./components/UpgradeModal";
import Onboarding from "./components/Onboarding";

export type Page = "dashboard" | "macros" | "log" | "history";

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);
  const [tier, setTier] = useState<"free" | "pro" | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // Fetch user tier and onboarding status on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/user/tier").then((r) => r.json()),
      fetch("/api/user/onboarding").then((r) => r.json()),
    ])
      .then(([tierData, onboardingData]) => {
        setTier(tierData.tier);
        setNeedsOnboarding(onboardingData.needsOnboarding);
      })
      .catch(() => {
        setTier("free");
        setNeedsOnboarding(false);
      });
  }, []);

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch("/api/user/tier", { method: "PUT" });
      const data = await res.json();
      setTier(data.tier);
      setUpgradeModalOpen(false);
      triggerRefresh();
    } catch {
      // ignore
    } finally {
      setUpgrading(false);
    }
  };

  const openUpgradeModal = useCallback(() => {
    setUpgradeModalOpen(true);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setNeedsOnboarding(false);
    setPage("log");
  }, []);

  const navigateToLog = useCallback(() => setPage("log"), []);

  // Still loading
  if (tier === null || needsOnboarding === null) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Show onboarding welcome screen
  if (needsOnboarding) {
    return <Onboarding onGetStarted={handleOnboardingComplete} />;
  }

  const currentPageContent = (
    <main key={page} className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 md:pb-0 pb-20 page-enter">
      {page === "dashboard" && (
        <Dashboard
          key={`dash-${refreshKey}`}
          onEntryAdded={triggerRefresh}
          tier={tier}
          onUpgrade={openUpgradeModal}
          onNavigateLog={navigateToLog}
        />
      )}
      {page === "macros" && <Macros tier={tier} onUpgrade={openUpgradeModal} />}
      {page === "log" && (
        <Log
          onLogged={() => {
            if (needsOnboarding) setNeedsOnboarding(false);
            triggerRefresh();
            setPage("dashboard");
          }}
          tier={tier}
          onUpgrade={openUpgradeModal}
        />
      )}
      {page === "history" && <History tier={tier} onUpgrade={openUpgradeModal} />}
    </main>
  );

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Desktop header with nav */}
      <header className="hidden md:block bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight text-emerald-600">🥗 Nibble</h1>
          <div className="flex items-center gap-3">
            <Navigation current={page} onNavigate={setPage} />
            {tier === "pro" ? (
              <span className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2.5 py-1 rounded-full shadow-sm">
                Pro
              </span>
            ) : (
              <button
                onClick={openUpgradeModal}
                className="text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded-full transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile header (logo only, nav is at bottom) */}
      <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-tight text-emerald-600">🥗 Nibble</h1>
          <div className="flex items-center gap-2">
            {tier === "pro" ? (
              <span className="text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-0.5 rounded-full shadow-sm">
                Pro
              </span>
            ) : (
              <button
                onClick={openUpgradeModal}
                className="text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded-full transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>
      </header>

      {currentPageContent}

      {/* Mobile bottom tab bar */}
      <Navigation current={page} onNavigate={setPage} />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        onUpgrade={handleUpgrade}
        upgrading={upgrading}
      />
    </div>
  );
}
