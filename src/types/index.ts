export interface IntakeFormData {
  businessName: string
  ownerName: string
  businessCity: string
  businessState: string
  websiteUrl?: string
  ein?: string
}

export interface FundingAnswers {
  creditScore: string  // "Below 500" | "500–599" | "600–649" | "650–699" | "700–749" | "750+"
  monthlyRevenue: number
  loanAmount: number
  useOfFunds: string[]
}

export interface ProfileField {
  value: string
  source: string
  found: boolean
}

export interface ProfileData {
  businessStreet: ProfileField
  businessCity: ProfileField
  businessState: ProfileField
  businessZip: ProfileField
  ownerStreet: ProfileField
  ownerCity: ProfileField
  ownerState: ProfileField
  ownerZip: ProfileField
  businessStartDate: ProfileField
  numberOfLocations: ProfileField
  entityType: ProfileField
  ein: ProfileField
  numberOfEmployees: ProfileField
  isFranchise: ProfileField
  isNonprofit: ProfileField
  hasBankruptcy: ProfileField
  bankruptcyStatus: ProfileField
}

export type AgentName =
  | 'Business Website'
  | 'Google Business Listing'
  | 'Manta'
  | 'Dun & Bradstreet'
  | 'Secretary of State'
  | 'Yelp'
  | 'Better Business Bureau'
  | 'UCC'
  | 'Bankruptcy Court Records'
  | 'LinkedIn'
  | 'Licensing Authorities'
  | 'Facebook'
  | 'ZoomInfo'
  | 'Credit Databases'
  | 'SBA Databases'
  | 'Data Guardian'

export type AgentStatus = 'pending' | 'searching' | 'complete' | 'no-data' | 'retrying'

export interface AgentRecord {
  name: AgentName
  status: AgentStatus
  data: Partial<Record<keyof ProfileData, string>> | null
  completedAt?: number
}

export type LoanProductId = 'rbf' | 'loc' | 'term' | 'sba' | 'equipment'

export interface LoanProduct {
  id: LoanProductId
  name: string
  description: string
  typicalAmounts: string
  typicalTerms: string
  bestFor: string
  keyRequirements: string[]
}

export type DocRequirement = 'required' | 'optional' | null

export interface DocumentChecks {
  type: boolean
  time: boolean
  association: boolean
}

export interface DocumentRecord {
  id: string
  name: string
  requirement: 'required' | 'optional'
  drivingProducts: LoanProductId[]
  status: 'outstanding' | 'verifying' | 'complete' | 'failed'
  checks?: DocumentChecks
  errorMessage?: string
  fileName?: string
  delegatedTo?: string
  delegationNote?: string
  delegationSessionId?: string
  completedAt?: number
}

export interface DelegationRecord {
  sessionId: string
  assigneeEmail: string
  note?: string
  documentIds: string[]
  completed: boolean
  createdAt: number
}

export type AppScreen = 1 | 2 | 'interstitial' | 3 | 4 | 5
