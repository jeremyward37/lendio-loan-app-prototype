interface Props {
  ownerName: string
}

export default function CompletionScreen({ ownerName }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{ background: '#DCFCE7' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path
            d="M8 20l8.5 8.5L32 12"
            stroke="#16A34A"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h2 className="text-2xl font-semibold mb-3" style={{ color: '#192526' }}>
        Application Submitted!
      </h2>
      <p className="text-base mb-2" style={{ color: '#192526' }}>
        Thank you, {ownerName}. We'll review your application and be in touch shortly.
      </p>
      <p className="text-sm" style={{ color: '#6B717A' }}>
        Your loan advisor will reach out within 1 business day.
      </p>
    </div>
  )
}
