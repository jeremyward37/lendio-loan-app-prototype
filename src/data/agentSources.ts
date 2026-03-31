import type { AgentName } from '../types'

export const AGENT_SOURCES: AgentName[] = [
  'Business Website',
  'Google Business Listing',
  'Manta',
  'Dun & Bradstreet',
  'Secretary of State',
  'Yelp',
  'Better Business Bureau',
  'UCC',
  'Bankruptcy Court Records',
  'LinkedIn',
  'Licensing Authorities',
  'Facebook',
  'ZoomInfo',
  'Credit Databases',
  'SBA Databases',
]

// Ordered from most to least authoritative for conflict resolution
export const SOURCE_PRIORITY: AgentName[] = [
  'Secretary of State',
  'Dun & Bradstreet',
  'SBA Databases',
  'Google Business Listing',
  'Better Business Bureau',
  'Manta',
  'ZoomInfo',
  'LinkedIn',
  'Credit Databases',
  'UCC',
  'Licensing Authorities',
  'Business Website',
  'Bankruptcy Court Records',
  'Yelp',
  'Facebook',
]
