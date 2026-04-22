import type { IntakeFormData, ProfileData, ProfileField } from '../types'
import type { useApplicationStore } from '../store/useApplicationStore'

type AppStoreApi = ReturnType<typeof useApplicationStore.getState>

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const WEB_SEARCH_TOOL = {
  type: 'web_search_20250305',
  name: 'web_search',
}

// Inline field schemas — Anthropic's API does not support $ref/$defs
const STRING_FIELD = {
  type: 'object' as const,
  properties: {
    value: { type: ['string', 'null'] },
    status: { type: 'string', enum: ['found', 'not_found', 'source_failed'] },
    source: {
      type: ['object', 'null'],
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        url: { type: ['string', 'null'] },
        retrieved_at: { type: 'string' },
      },
    },
  },
  required: ['value', 'status', 'source'],
}

const BOOL_FIELD = {
  type: 'object' as const,
  properties: {
    value: { type: ['boolean', 'null'] },
    status: { type: 'string', enum: ['found', 'not_found', 'source_failed'] },
    source: {
      type: ['object', 'null'],
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        url: { type: ['string', 'null'] },
        retrieved_at: { type: 'string' },
      },
    },
  },
  required: ['value', 'status', 'source'],
}

const OUTPUT_STRUCTURED_DATA_TOOL = {
  name: 'output_structured_data',
  description:
    'Output the structured business profile data discovered through web research. Call this tool exactly once after completing all research.',
  input_schema: {
    type: 'object' as const,
    properties: {
      business_street_address: STRING_FIELD,
      business_city: STRING_FIELD,
      business_state: STRING_FIELD,
      business_zip_code: STRING_FIELD,
      business_start_date: STRING_FIELD,
      entity_type: STRING_FIELD,
      number_of_locations: STRING_FIELD,
      is_franchise: BOOL_FIELD,
      is_nonprofit: BOOL_FIELD,
      has_bankruptcy: BOOL_FIELD,
      business_industry: STRING_FIELD,
      naics_code: STRING_FIELD,
      number_of_employees: STRING_FIELD,
      annual_profits: STRING_FIELD,
      ein: STRING_FIELD,
    },
    required: [
      'business_street_address',
      'business_city',
      'business_state',
      'business_zip_code',
      'business_start_date',
      'entity_type',
      'number_of_locations',
      'is_franchise',
      'is_nonprofit',
      'has_bankruptcy',
      'business_industry',
      'naics_code',
      'number_of_employees',
      'annual_profits',
      'ein',
    ],
  },
}

// ---------------------------------------------------------------------------
// System prompt
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `<SYSTEM_INSTRUCTIONS>
  You are a business intelligence agent for a small business lending platform.
  Given seed data about a business and its owner, research and return a structured
  borrower profile.

  TARGET DATA POINTS:
  These are the fields you are trying to find. Prioritize sources likely to
  contain the most fields in fewest fetches.

  Business fields:
    - business_street_address   — physical operating address
    - business_city             — city of operation
    - business_state            — state of operation
    - business_zip_code         — zip code
    - business_start_date       — date the business opened or was registered
    - entity_type               — LLC, Corporation, Sole Proprietor, etc.
    - number_of_locations       — how many locations this owner operates
    - is_franchise              — true/false: is this a franchise unit
    - is_nonprofit              — true/false: is this a nonprofit entity
    - has_bankruptcy            — true/false: any bankruptcy filings for the business or owner
    - business_industry         — industry or business category (e.g. "Department Stores")
    - naics_code                — 6-digit NAICS code for the business (e.g. 455110)
    - number_of_employees       — headcount, any estimate acceptable
    - annual_profits            — revenue or profit figures if publicly available
    - ein                       — Employer Identification Number

  RESEARCH PLAN:
  Before searching, identify the 5 most likely sources to contain data for
  this specific business. Choose based on business type, location, and which
  sources are most likely to cover the most target fields. Execute your plan
  in order.

  SOURCE PREFERENCES — prefer these sources for specific fields:
  - business_start_date:   Secretary of State filing for the business's state is the
                           most reliable source. Use it as one of your 3 planned sources
                           if the state is known.
  - number_of_employees:   LinkedIn company page (shows employee range) or the business
                           website's About/Team page.
  - number_of_locations:   The business's own website locations/store-finder page, or
                           a Google Maps search that shows multiple locations.
  - has_bankruptcy:        A targeted news or court records search for the business name
                           and owner name combined with the word "bankruptcy".
  - entity_type:           Secretary of State filing is authoritative. Google Business
                           Profile and BBB also often list entity type.

  SEARCH LIMITS — hard stops, non-negotiable:
  - Maximum 5 web searches total
  - Maximum 5 web fetches total
  - Maximum 2 fetches per domain
  - Do not follow links beyond the page you fetched
  - Stop researching once all 5 planned sources have been attempted,
    regardless of how many fields remain not_found

  DATA INTEGRITY:
  - A value counts as "found" ONLY if it came from a web search or web fetch.
    Reasoning from the business name, owner name, or any seed data is NOT a
    valid source — set status to not_found for any field you cannot confirm
    with an external URL.
  - Never populate source.name with phrases like "business name inference",
    "name analysis", or "inferred from". If you have no external URL to
    cite, the field is not_found.
  - Exception: if business_industry is found but naics_code is not_found, you
    may infer the most likely 6-digit NAICS code from the industry description
    using your knowledge of the NAICS classification system. Set status to found,
    source.type to "inferred", source.name to "NAICS taxonomy", and source.url
    to null.

  SOURCE METADATA RULES:
  - For every field you populate, record:
    - status: found
    - source.name: human-readable name of the source
    - source.type: one of: web_search, government, news, social_media, business_directory, api, unknown
    - source.url: the actual URL of the source page, NOT a redirect or proxy URL (e.g. do not use vertexaisearch.cloud.google.com grounding-api-redirect URLs)
    - source.retrieved_at: current ISO-8601 timestamp
  - If a source failed or timed out, set status to source_failed.
  - For every field not found or not searched, set status to not_found
    and value to null.

  OUTPUT RULES:
  - Your ONLY output must be a call to the output_structured_data tool.
  - Do NOT produce any markdown, tables, prose summaries, risk flags, or
    commentary before or after the tool call.
  - Do NOT populate fields that are not in the output schema.
  - If a field is not in the schema, discard it entirely.
  - For every field not found, set status to not_found and value to null.
</SYSTEM_INSTRUCTIONS>`

// ---------------------------------------------------------------------------
// Normalization utilities
// ---------------------------------------------------------------------------

const STATE_NAME_TO_ABBR: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR',
  california: 'CA', colorado: 'CO', connecticut: 'CT', delaware: 'DE',
  florida: 'FL', georgia: 'GA', hawaii: 'HI', idaho: 'ID',
  illinois: 'IL', indiana: 'IN', iowa: 'IA', kansas: 'KS',
  kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS',
  missouri: 'MO', montana: 'MT', nebraska: 'NE', nevada: 'NV',
  'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
  'north carolina': 'NC', 'north dakota': 'ND', ohio: 'OH', oklahoma: 'OK',
  oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
  'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV',
  wisconsin: 'WI', wyoming: 'WY',
}

function normalizeState(raw: string): string {
  const trimmed = raw.trim()
  if (/^[A-Za-z]{2}$/.test(trimmed)) return trimmed.toUpperCase()
  return STATE_NAME_TO_ABBR[trimmed.toLowerCase()] ?? trimmed
}

function normalizeDate(raw: string): string {
  if (!raw) return ''
  const trimmed = raw.trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed
  const mdyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (mdyMatch) {
    const [, m, d, y] = mdyMatch
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  if (/^\d{4}$/.test(trimmed)) return `${trimmed}-01-01`
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) return parsed.toISOString().substring(0, 10)
  return ''
}

const VALID_ENTITY_TYPES = ['Sole Proprietor', 'LLC', 'S-Corp', 'C-Corp', 'Partnership', 'Nonprofit']

function normalizeEntityType(raw: string): string {
  const map: Record<string, string> = {
    'limited liability company': 'LLC',
    llc: 'LLC',
    's corporation': 'S-Corp',
    's-corporation': 'S-Corp',
    scorp: 'S-Corp',
    's corp': 'S-Corp',
    'c corporation': 'C-Corp',
    'c-corporation': 'C-Corp',
    ccorp: 'C-Corp',
    'c corp': 'C-Corp',
    'sole proprietorship': 'Sole Proprietor',
    'sole proprietor': 'Sole Proprietor',
    'sole prop': 'Sole Proprietor',
    nonprofit: 'Nonprofit',
    'non-profit': 'Nonprofit',
    'not-for-profit': 'Nonprofit',
    '501(c)(3)': 'Nonprofit',
    partnership: 'Partnership',
    corporation: 'C-Corp',
    inc: 'C-Corp',
    'incorporated': 'C-Corp',
  }
  const normalized = map[raw.trim().toLowerCase()] ?? raw
  // Return empty string if result isn't a valid dropdown option — prevents
  // the select rendering blank with an AI badge on an unrecognized value
  return VALID_ENTITY_TYPES.includes(normalized) ? normalized : ''
}

interface ClaudeFieldResult {
  value: string | boolean | number | null
  status: 'found' | 'not_found' | 'source_failed'
  source: { name: string; type: string; url: string | null; retrieved_at: string } | null
}

function normalizeNaicsCode(raw: string): string {
  const digits = raw.replace(/\D/g, '')
  return digits.length >= 4 && digits.length <= 6 ? digits : ''
}

interface NormalizeOpts {
  boolToYesNo?: boolean
  normalizeDate?: boolean
  normalizeState?: boolean
  normalizeEntity?: boolean
  numericOnly?: boolean
  normalizeNaics?: boolean
}

function normalizeToProfileField(
  field: ClaudeFieldResult | undefined,
  opts: NormalizeOpts = {}
): ProfileField {
  if (!field || field.status !== 'found' || field.value === null || field.value === '') {
    return { value: '', source: 'Not found', found: false }
  }

  let value = String(field.value)

  if (opts.boolToYesNo) {
    value = (field.value === true || field.value === 'true') ? 'Yes' : 'No'
  }
  if (opts.normalizeDate) {
    value = normalizeDate(value)
  }
  if (opts.normalizeState) {
    value = normalizeState(value)
  }
  if (opts.normalizeEntity) {
    value = normalizeEntityType(value)
  }
  if (opts.numericOnly && !/^\d+$/.test(value.trim())) {
    return { value: '', source: 'Not found', found: false }
  }
  if (opts.normalizeNaics) {
    value = normalizeNaicsCode(value)
  }

  if (value === '') {
    return { value: '', source: 'Not found', found: false }
  }

  const sourceName = field.source?.name ?? 'Web search'
  return { value, source: `Source: ${sourceName}`, found: true }
}

// ---------------------------------------------------------------------------
// Empty profile fallback
// ---------------------------------------------------------------------------

function buildEmptyProfile(intake: IntakeFormData): ProfileData {
  const empty = (): ProfileField => ({ value: '', source: 'Not found', found: false })
  return {
    businessStreet: empty(),
    businessCity: { value: intake.businessCity, source: 'Source: Application', found: true },
    businessState: { value: intake.businessState, source: 'Source: Application', found: true },
    businessZip: { value: intake.businessZip, source: 'Source: Application', found: true },
    ownerStreet: empty(),
    ownerCity: empty(),
    ownerState: empty(),
    ownerZip: empty(),
    businessStartDate: empty(),
    numberOfLocations: empty(),
    entityType: empty(),
    ein: intake.ein
      ? { value: intake.ein, source: 'Source: Application', found: true }
      : empty(),
    numberOfEmployees: empty(),
    isFranchise: empty(),
    isNonprofit: empty(),
    hasBankruptcy: empty(),
    bankruptcyStatus: empty(),
    businessIndustry: empty(),
    naicsCode: empty(),
  }
}

// ---------------------------------------------------------------------------
// Response parsing + mapping
// ---------------------------------------------------------------------------

function parseClaudeResponse(json: unknown): Record<string, ClaudeFieldResult> | null {
  const content = (json as { content?: unknown[] })?.content
  if (!Array.isArray(content)) return null
  const toolUse = content.find(
    (block: unknown) =>
      (block as { type?: string; name?: string }).type === 'tool_use' &&
      (block as { name?: string }).name === 'output_structured_data'
  )
  return (toolUse as { input?: Record<string, ClaudeFieldResult> })?.input ?? null
}

function mapOutputToProfileData(
  output: Record<string, ClaudeFieldResult>,
  intake: IntakeFormData
): ProfileData {
  const rawStreet = output.business_street_address
  if (rawStreet?.value && /^\s*p\.?\s*o\.?\s*box/i.test(String(rawStreet.value))) {
    rawStreet.status = 'not_found'
    rawStreet.value = null
  }

  const profile: ProfileData = {
    businessStreet: normalizeToProfileField(rawStreet),
    businessCity: normalizeToProfileField(output.business_city),
    businessState: normalizeToProfileField(output.business_state, { normalizeState: true }),
    businessZip: normalizeToProfileField(output.business_zip_code),
    ownerStreet: { value: '', source: 'Not found', found: false },
    ownerCity: { value: '', source: 'Not found', found: false },
    ownerState: { value: '', source: 'Not found', found: false },
    ownerZip: { value: '', source: 'Not found', found: false },
    businessStartDate: normalizeToProfileField(output.business_start_date, { normalizeDate: true }),
    numberOfLocations: normalizeToProfileField(output.number_of_locations, { numericOnly: true }),
    entityType: normalizeToProfileField(output.entity_type, { normalizeEntity: true }),
    ein: normalizeToProfileField(output.ein),
    numberOfEmployees: normalizeToProfileField(output.number_of_employees, { numericOnly: true }),
    isFranchise: normalizeToProfileField(output.is_franchise, { boolToYesNo: true }),
    isNonprofit: normalizeToProfileField(output.is_nonprofit, { boolToYesNo: true }),
    hasBankruptcy: normalizeToProfileField(output.has_bankruptcy, { boolToYesNo: true }),
    bankruptcyStatus: { value: '', source: 'Not found', found: false },
    businessIndustry: normalizeToProfileField(output.business_industry),
    naicsCode: normalizeToProfileField(output.naics_code, { normalizeNaics: true }),
  }

  // Override EIN from intake if provided
  if (intake.ein) {
    profile.ein = { value: intake.ein, source: 'Source: Application', found: true }
  }

  return profile
}

// ---------------------------------------------------------------------------
// User message builder
// ---------------------------------------------------------------------------

function buildUserMessage(intake: IntakeFormData): string {
  const lines = [
    'Research this business:',
    '',
    `Business Name: ${intake.businessName}`,
    `Owner Name: ${intake.ownerName}`,
    `Business Phone: ${intake.businessPhone}`,
    `Business Location: ${intake.businessCity}, ${intake.businessState} ${intake.businessZip}`,
  ]
  if (intake.websiteUrl) {
    lines.push(`Business Website: ${intake.websiteUrl}`)
    lines.push('(Fetch the website above first — it is the most reliable source for address, entity type, and founding date.)')
  }
  if (intake.ein) lines.push(`EIN: ${intake.ein}`)
  const fullStateName = Object.entries(STATE_NAME_TO_ABBR).find(([, abbr]) => abbr === intake.businessState)?.[0] ?? intake.businessState
  const stateTitleCase = fullStateName.replace(/\b\w/g, (c) => c.toUpperCase())
  lines.push(
    '',
    'For business_street_address, return only a physical street address — never a PO Box.',
    `For business_start_date, search "${intake.businessName} ${stateTitleCase} Secretary of State" to find the official registration date.`,
    `For has_bankruptcy, search "${intake.businessName} ${intake.ownerName} bankruptcy" to check for any filing history.`,
    'Search public sources and call the output_structured_data tool with all findings.'
  )
  return lines.join('\n')
}

// ---------------------------------------------------------------------------
// Main exported function
// ---------------------------------------------------------------------------

export function runProfileSearch(intake: IntakeFormData, applicationStore: AppStoreApi): void {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  applicationStore.setProfileSearchStatus('searching')

  ;(async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 90_000)

    try {
      console.log('[ProfileSearch] Starting search for:', intake.businessName)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 8192,
          system: SYSTEM_PROMPT,
          tools: [WEB_SEARCH_TOOL, OUTPUT_STRUCTURED_DATA_TOOL],
          messages: [{ role: 'user', content: buildUserMessage(intake) }],
        }),
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[ProfileSearch] API error:', response.status, errorText)
        throw new Error(`API error: ${response.status}`)
      }

      const json = await response.json()
      console.log('[ProfileSearch] Raw response stop_reason:', (json as { stop_reason?: string }).stop_reason)
      console.log('[ProfileSearch] Content blocks:', (json as { content?: unknown[] }).content?.map((b: unknown) => (b as { type: string; name?: string }).type + (((b as { name?: string }).name) ? ':' + (b as { name: string }).name : '')))

      const claudeOutput = parseClaudeResponse(json)
      console.log('[ProfileSearch] Parsed output fields found:', claudeOutput
        ? Object.entries(claudeOutput).filter(([, v]) => (v as ClaudeFieldResult)?.status === 'found').map(([k]) => k)
        : 'null — no output_structured_data tool call found')

      const profile = claudeOutput
        ? mapOutputToProfileData(claudeOutput, intake)
        : buildEmptyProfile(intake)

      applicationStore.setResolvedProfile(profile)
      applicationStore.setProfileSearchStatus('complete')
    } catch (err) {
      clearTimeout(timeoutId)
      console.error('[ProfileSearch] Error (timeout or network):', err)
      applicationStore.setResolvedProfile(buildEmptyProfile(intake))
      applicationStore.setProfileSearchStatus('complete')
    }
  })()
}
