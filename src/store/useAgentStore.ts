import { create } from 'zustand'
import type { AgentName, AgentRecord, AgentStatus } from '../types'
import { AGENT_SOURCES } from '../data/agentSources'

type AgentStore = {
  agents: Record<AgentName, AgentRecord>
  allAgentsComplete: boolean
  guardianStatus: 'idle' | 'running' | 'complete'

  updateAgent: (name: AgentName, update: Partial<AgentRecord>) => void
  setAllAgentsComplete: (val: boolean) => void
  setGuardianStatus: (status: 'idle' | 'running' | 'complete') => void
  resetAgents: () => void
  initAgents: () => void
}

function buildInitialAgents(): Record<AgentName, AgentRecord> {
  const result = {} as Record<AgentName, AgentRecord>
  for (const name of AGENT_SOURCES) {
    result[name] = {
      name,
      status: 'pending' as AgentStatus,
      data: null,
    }
  }
  return result
}

const initialAgents = buildInitialAgents()

export const useAgentStore = create<AgentStore>()((set) => ({
  agents: initialAgents,
  allAgentsComplete: false,
  guardianStatus: 'idle',

  updateAgent: (name, update) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [name]: { ...state.agents[name], ...update },
      },
    })),

  setAllAgentsComplete: (val) => set({ allAgentsComplete: val }),

  setGuardianStatus: (status) => set({ guardianStatus: status }),

  resetAgents: () =>
    set({
      agents: buildInitialAgents(),
      allAgentsComplete: false,
      guardianStatus: 'idle',
    }),

  initAgents: () =>
    set({
      agents: buildInitialAgents(),
      allAgentsComplete: false,
      guardianStatus: 'idle',
    }),
}))
