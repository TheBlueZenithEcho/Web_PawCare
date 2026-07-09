const STEPS = [
  { id: 1, label: 'Service' },
  { id: 2, label: 'Details' },
  { id: 3, label: 'Payment' },
];

export default function BookingStepper({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      {STEPS.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isDone = step.id < currentStep;
        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  isActive || isDone
                    ? 'bg-understory text-white'
                    : 'border border-wood-bark/30 text-wood-bark/50'
                }`}
              >
                {step.id}
              </span>
              <span
                className={`text-sm font-medium ${
                  isActive ? 'text-understory font-bold' : 'text-wood-bark/60'
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <span className="h-px w-10 bg-wood-bark/20" />
            )}
          </div>
        );
      })}
    </div>
  );
}