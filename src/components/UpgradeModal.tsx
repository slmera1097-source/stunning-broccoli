import Modal from "./Modal";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  upgrading?: boolean;
}

export default function UpgradeModal({
  isOpen,
  onClose,
  onUpgrade,
  upgrading,
}: UpgradeModalProps) {
  const freeFeatures = [
    "Manual food logging",
    "Basic dashboard",
    "Daily calorie goal",
    "3 meals per day",
    "Weekly trend charts",
    "History view",
  ];

  const proFeatures = [
    "Unlimited meal logging",
    "Barcode scanning",
    "Photo meal logging",
    "Macros & micronutrients",
    "Custom nutrition goals",
    "Data export",
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upgrade to Nibble Pro">
      <div className="space-y-4">
        <p className="text-sm text-gray-500 text-center">
          Get the most out of your nutrition tracking with Pro.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Free Plan */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-sm">Free</h4>
              <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                Current Plan
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">$0</p>
            <p className="text-xs text-gray-400 mb-4">forever</p>
            <ul className="space-y-2">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-xl p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border border-emerald-400 overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-white text-sm">Pro</h4>
              <span className="text-xs font-medium bg-white/20 text-white px-2 py-0.5 rounded-full">
                Best Value
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-0.5">$6.99</p>
            <p className="text-xs text-emerald-100 mb-4">/mo or $39.99/yr</p>
            <ul className="space-y-2">
              {proFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-emerald-50">
                  <svg
                    className="w-3.5 h-3.5 text-white mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={onUpgrade}
              disabled={upgrading}
              className="mt-4 w-full bg-white text-emerald-700 px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-emerald-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              {upgrading ? "Upgrading..." : "Upgrade to Pro"}
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center">
          No payment required — this is a simulated upgrade for the Nibble demo.
        </p>
      </div>
    </Modal>
  );
}
