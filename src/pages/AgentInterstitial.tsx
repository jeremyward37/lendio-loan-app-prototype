import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAgentStore } from '../store/useAgentStore'
import AgentStatusPanel from '../components/agents/AgentStatusPanel'

export default function AgentInterstitial() {
  const navigate = useNavigate()
  const allAgentsComplete = useAgentStore((s) => s.allAgentsComplete)

  useEffect(() => {
    if (allAgentsComplete) {
      const timer = setTimeout(() => {
        navigate('/profile-review')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [allAgentsComplete, navigate])

  return (
    <div className="flex flex-col items-center py-8">
      <div
        className="w-full bg-white rounded-2xl shadow-sm border p-8"
        style={{ maxWidth: '620px', borderColor: '#DADFE3' }}
      >
        {/* Animated spinner */}
        <div className="flex justify-center mb-6">
          <div
            className="w-14 h-14 rounded-full border-4 animate-spin"
            style={{
              borderColor: '#EAEBEB',
              borderTopColor: '#0800A6',
            }}
          />
        </div>

        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#192526' }}>
            Hang tight while we research your business...
          </h1>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            Our AI agents are gathering information from public sources. This usually takes less than a minute.
          </p>
        </div>

        {/* Agent Status Panel */}
        <AgentStatusPanel />

        {allAgentsComplete && (
          <div
            className="mt-4 p-3 rounded-lg text-sm font-medium text-center"
            style={{ backgroundColor: '#f0efff', color: '#0800A6' }}
          >
            Research complete! Redirecting you to review your profile...
          </div>
        )}
      </div>
    </div>
  )
}
