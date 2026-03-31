interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100))

  return (
    <div
      className="w-full h-2 rounded-full overflow-hidden"
      style={{ backgroundColor: '#EAEBEB' }}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${percentage}%`,
          backgroundColor: '#0800A6',
        }}
      />
    </div>
  )
}
