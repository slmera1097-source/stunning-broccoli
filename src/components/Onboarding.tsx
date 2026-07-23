interface OnboardingProps {
  onGetStarted: () => void;
}

export default function Onboarding({ onGetStarted }: OnboardingProps) {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center bg-gradient-to-b from-emerald-50 to-white px-4">
      <div className="max-w-sm w-full stagger">
        {/* App icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-200 mb-5 animate-fade-in-up">
            <span className="text-4xl">🥗</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Nibble
          </h1>
          <p className="text-lg text-gray-500 mt-1.5">
            Track calories, simply.
          </p>
        </div>

        {/* How it works */}
        <div className="space-y-4 mb-10">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">
            How it works
          </p>
          <div className="space-y-3">
            <Step
              number="1"
              emoji="🍽️"
              title="Log meals"
              description="Quickly add what you eat — type, snap a photo, or scan a barcode."
            />
            <Step
              number="2"
              emoji="📈"
              title="Track progress"
              description="See your daily calorie and macro breakdown at a glance."
            />
            <Step
              number="3"
              emoji="🎯"
              title="Reach goals"
              description="Stay on target with gentle nudges and weekly trend charts."
            />
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={onGetStarted}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3.5 rounded-xl text-base font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 btn-press active:scale-[0.98]"
        >
          Get Started
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          No account needed. Your data stays on your device.
        </p>
      </div>
    </div>
  );
}

function Step({
  number,
  emoji,
  title,
  description,
}: {
  number: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 bg-white rounded-xl p-4 border border-gray-100 shadow-sm card-hover">
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700">
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        </div>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
