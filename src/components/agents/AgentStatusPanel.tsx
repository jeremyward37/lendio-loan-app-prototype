import { useAgentStore } from '../../store/useAgentStore'
import type { AgentStatus } from '../../types'
import { AGENT_SOURCES } from '../../data/agentSources'

function StatusIcon({ status }: { status: AgentStatus | 'idle' }) {
  if (status === 'pending' || status === 'idle') {
    return (
      <div
        className="w-5 h-5 rounded-full border-2 flex-shrink-0"
        style={{ borderColor: '#C0C3C3', backgroundColor: 'transparent' }}
      />
    )
  }

  if (status === 'searching' || status === 'retrying') {
    return (
      <div
        className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
        style={{ color: '#0800A6' }}
      >
        <svg
          className="animate-spin"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="9"
            cy="9"
            r="7"
            stroke="#C0C3C3"
            strokeWidth="2"
          />
          <path
            d="M9 2a7 7 0 0 1 7 7"
            stroke="#0800A6"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  if (status === 'complete') {
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#0800A6' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M1.5 5L4 7.5L8.5 3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  if (status === 'no-data') {
    return (
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: '#EAEBEB' }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path
            d="M2 2L8 8M8 2L2 8"
            stroke="#727879"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  return null
}

function statusLabel(status: AgentStatus | 'idle'): string {
  switch (status) {
    case 'pending': return 'Waiting...'
    case 'searching': return 'Searching...'
    case 'retrying': return 'Retrying...'
    case 'complete': return 'Complete'
    case 'no-data': return 'No data found'
    case 'idle': return 'Waiting...'
    default: return ''
  }
}

export default function AgentStatusPanel() {
  const agents = useAgentStore((s) => s.agents)
  const guardianStatus = useAgentStore((s) => s.guardianStatus)

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: '#DADFE3', backgroundColor: '#ffffff' }}
    >
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: '#DADFE3', backgroundColor: '#FAFAF9' }}
      >
        <h3 className="text-sm font-semibold" style={{ color: '#2F3637' }}>
          AI Research Agents
        </h3>
        <p className="text-xs mt-0.5" style={{ color: '#6B717A' }}>
          Gathering data from public business sources
        </p>
      </div>

      <div className="divide-y" style={{ borderColor: '#EAEBEB' }}>
        {AGENT_SOURCES.map((agentName) => {
          const agent = agents[agentName]
          if (!agent) return null
          return (
            <div key={agentName} className="flex items-center gap-3 px-4 py-2.5">
              <StatusIcon status={agent.status} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium" style={{ color: '#2F3637' }}>
                  {agentName}
                </span>
              </div>
              <span
                className="text-xs flex-shrink-0"
                style={{ color: '#727879' }}
              >
                {statusLabel(agent.status)}
              </span>
            </div>
          )
        })}

        {/* Data Guardian */}
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ backgroundColor: guardianStatus !== 'idle' ? '#FAFAF9' : 'transparent' }}
        >
          <StatusIcon
            status={
              guardianStatus === 'idle'
                ? 'idle'
                : guardianStatus === 'running'
                ? 'searching'
                : 'complete'
            }
          />
          <div className="flex-1 min-w-0">
            <span
              className="text-sm font-semibold"
              style={{ color: guardianStatus !== 'idle' ? '#0800A6' : '#C0C3C3' }}
            >
              Data Guardian
            </span>
            <p className="text-xs" style={{ color: '#6B717A' }}>
              Consolidates &amp; harmonizes all findings
            </p>
          </div>
          <span className="text-xs flex-shrink-0" style={{ color: '#727879' }}>
            {guardianStatus === 'idle' && 'Waiting...'}
            {guardianStatus === 'running' && 'Processing...'}
            {guardianStatus === 'complete' && 'Complete'}
          </span>
        </div>
      </div>
    </div>
  )
}
