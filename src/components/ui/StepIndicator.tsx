interface StepIndicatorProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
}

export default function StepIndicator({ currentStep, totalSteps, stepLabels }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNum = i + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isFuture = stepNum > currentStep

        return (
          <div key={stepNum} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  backgroundColor: isCompleted
                    ? '#0800A6'
                    : isActive
                    ? '#0800A6'
                    : '#EAEBEB',
                  color: isCompleted || isActive ? '#ffffff' : '#727879',
                  border: isActive ? '2px solid #0800A6' : 'none',
                }}
              >
                {isCompleted ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 7L5.5 10.5L12 4"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className="text-xs mt-1 text-center max-w-16 leading-tight"
                style={{
                  color: isActive ? '#0800A6' : isFuture ? '#C0C3C3' : '#727879',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {stepLabels[i]}
              </span>
            </div>

            {/* Connector line */}
            {stepNum < totalSteps && (
              <div
                className="h-0.5 mx-2 flex-1"
                style={{
                  width: '48px',
                  backgroundColor: isCompleted ? '#0800A6' : '#EAEBEB',
                  minWidth: '32px',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
