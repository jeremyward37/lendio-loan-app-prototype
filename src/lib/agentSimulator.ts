import type { IntakeFormData, ProfileData, AgentName } from '../types'
import { generateMockData } from '../data/mockProfileData'
import { AGENT_SOURCES, SOURCE_PRIORITY } from '../data/agentSources'
import type { useAgentStore } from '../store/useAgentStore'
import type { useApplicationStore } from '../store/useApplicationStore'

type AgentStoreApi = ReturnType<typeof useAgentStore.getState>
type AppStoreApi = ReturnType<typeof useApplicationStore.getState>

const PROFILE_KEYS: (keyof ProfileData)[] = [
  'businessStreet',
  'businessCity',
  'businessState',
  'businessZip',
  'ownerStreet',
  'ownerCity',
  'ownerState',
  'ownerZip',
  'businessStartDate',
  'numberOfLocations',
  'entityType',
  'ein',
  'numberOfEmployees',
  'isFranchise',
  'isNonprofit',
  'hasBankruptcy',
  'bankruptcyStatus',
]

export function buildResolvedProfile(
  agentResults: Partial<Record<AgentName, Partial<Record<keyof ProfileData, string>>>>,
  intake: IntakeFormData
): ProfileData {
  const profile = {} as ProfileData

  for (const key of PROFILE_KEYS) {
    // Collect all values from each agent for this field
    const valueCounts: Record<string, number> = {}
    const valueAgents: Record<string, AgentName[]> = {}

    for (const agentName of AGENT_SOURCES) {
      const agentData = agentResults[agentName]
      if (!agentData) continue
      const val = agentData[key]
      if (val === undefined || val === null) continue

      const normalized = val.trim()
      valueCounts[normalized] = (valueCounts[normalized] || 0) + 1
      if (!valueAgents[normalized]) valueAgents[normalized] = []
      valueAgents[normalized].push(agentName)
    }

    const candidates = Object.keys(valueCounts)

    if (candidates.length === 0) {
      // No agent found this field
      profile[key] = {
        value: '',
        source: 'Not found',
        found: false,
      }
      continue
    }

    // Find highest frequency
    let maxCount = 0
    for (const val of candidates) {
      if (valueCounts[val] > maxCount) maxCount = valueCounts[val]
    }

    // Get all values tied at max frequency
    const tied = candidates.filter((v) => valueCounts[v] === maxCount)

    let winner: string
    let winnerAgent: AgentName

    if (tied.length === 1) {
      winner = tied[0]
      winnerAgent = valueAgents[winner][0]
    } else {
      // Tie-break by SOURCE_PRIORITY
      winner = tied[0]
      winnerAgent = valueAgents[winner][0]
      outerLoop: for (const priorityAgent of SOURCE_PRIORITY) {
        for (const candidateVal of tied) {
          if (valueAgents[candidateVal].includes(priorityAgent)) {
            winner = candidateVal
            winnerAgent = priorityAgent
            break outerLoop
          }
        }
      }
    }

    profile[key] = {
      value: winner,
      source: `Source: ${winnerAgent}`,
      found: true,
    }
  }

  // Override EIN from intake if provided
  if (intake.ein) {
    profile.ein = {
      value: intake.ein,
      source: 'Source: Application',
      found: true,
    }
  }

  // Always leave these two fields empty to demonstrate the "not found" state
  profile.businessZip = { value: '', source: 'Not found', found: false }
  profile.numberOfEmployees = { value: '', source: 'Not found', found: false }

  return profile
}

export function runAgentSimulation(
  intake: IntakeFormData,
  agentStore: AgentStoreApi,
  applicationStore: AppStoreApi
): void {
  const mockData = generateMockData(intake.businessName, intake)

  const agentResults: Partial<Record<AgentName, Partial<Record<keyof ProfileData, string>>>> = {}
  let completedCount = 0
  const total = AGENT_SOURCES.length

  for (const agentName of AGENT_SOURCES) {
    const delay = 3000 + Math.random() * 9000 // 3-12 seconds

    // Set to searching
    setTimeout(() => {
      agentStore.updateAgent(agentName, { status: 'searching' })
    }, delay * 0.1)

    // Complete after delay
    setTimeout(() => {
      // BBB returns no-data 20% of time
      const noData =
        agentName === 'Better Business Bureau' && Math.random() < 0.2

      const status = noData ? 'no-data' : 'complete'
      const data = noData ? null : (mockData[agentName] ?? null)

      agentStore.updateAgent(agentName, {
        status,
        data,
        completedAt: Date.now(),
      })

      if (!noData && data) {
        agentResults[agentName] = data
      }

      completedCount++

      if (completedCount === total) {
        // All agents done, run Data Guardian
        agentStore.setGuardianStatus('running')
        agentStore.updateAgent('Data Guardian' as AgentName, {
          status: 'searching',
          data: null,
        })

        setTimeout(() => {
          const resolvedProfile = buildResolvedProfile(agentResults, intake)

          agentStore.updateAgent('Data Guardian' as AgentName, {
            status: 'complete',
            data: null,
            completedAt: Date.now(),
          })
          agentStore.setGuardianStatus('complete')
          agentStore.setAllAgentsComplete(true)
          applicationStore.setResolvedProfile(resolvedProfile)
        }, 1500)
      }
    }, delay)
  }
}
