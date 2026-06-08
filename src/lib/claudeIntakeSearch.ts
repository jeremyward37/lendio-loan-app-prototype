import type { IntakeSearchResult } from '../types'
import type { useApplicationStore } from '../store/useApplicationStore'

type AppStoreApi = ReturnType<typeof useApplicationStore.getState>


const WEB_SEARCH_TOOL = {
  type: 'web_search_20250305',
  name: 'web_search',
}

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

const OUTPUT_INTAKE_DATA_TOOL = {
  name: 'output_intake_data',
  description:
    'Output the structured business intake data discovered through web research. Call this tool exactly once after completing all research.',
  input_schema: {
    type: 'object' as const,
    properties: {
      business_name: STRING_FIELD,
      owner_name: STRING_FIELD,
      business_phone: STRING_FIELD,
      business_city: STRING_FIELD,
      business_state: STRING_FIELD,
      business_zip: STRING_FIELD,
    },
    required: [
      'business_name',
      'owner_name',
      'business_phone',
      'business_city',
      'business_state',
      'business_zip',
    ],
  },
}

const SYSTEM_PROMPT = `<SYSTEM_INSTRUCTIONS>
  You are a business intelligence agent for a small business lending platform.
  Given a business website URL or phone number, find basic identifying information
  about the business and its owner.

  TARGET DATA POINTS:
    - business_name    — the legal or operating name of the business
    - owner_name       — the owner's full first AND last name (both must be present and clearly identified as the owner; if only a first name, a business name, or an uncertain attribution is found, set to not_found)
    - business_phone   — main business phone number (format as (XXX) XXX-XXXX)
    - business_city    — city where the business operates
    - business_state   — 2-letter US state abbreviation (e.g. "IL", "CA")
    - business_zip     — 5-digit ZIP code

  RESEARCH STRATEGY:
    - If given a website URL: fetch the website first (contact/about page), then check
      Google Business listing or Yelp for the business name and address.
    - If given a phone number: search for the exact phone number in quotes (e.g.
      "(801) 446-6644") to find the business. Look at whatever result comes back —
      Google Business Profile, Yelp, BBB, Manta, or any directory listing — and
      fetch that page to extract the business name, address, and owner if present.
      Do not spend a tool call searching again if you already have a promising result to fetch.
    - Prioritize speed — you have very limited time. Use at most 3 web searches or
      fetches total. Stop as soon as you have enough data.

  HARD LIMITS:
    - Maximum 4 total tool calls (searches + fetches combined) before outputting results.
    - You MUST call output_intake_data exactly once, even if some fields are not found.

  DATA INTEGRITY:
    - For fields you cannot find, set status to "not_found" and value to null.
    - Do NOT guess or invent values.
    - business_state must be a 2-letter US state code.
    - business_zip must be 5 digits.
</SYSTEM_INSTRUCTIONS>`

interface ClaudeStringField {
  value: string | null
  status: 'found' | 'not_found' | 'source_failed'
  source: { name: string } | null
}

function parseIntakeResponse(json: unknown): Record<string, ClaudeStringField> | null {
  const content = (json as { content?: unknown[] })?.content
  if (!Array.isArray(content)) return null
  const toolUse = content.find(
    (block: unknown) =>
      (block as { type?: string; name?: string }).type === 'tool_use' &&
      (block as { name?: string }).name === 'output_intake_data'
  )
  return (toolUse as { input?: Record<string, ClaudeStringField> })?.input ?? null
}

function toIntakeField(field: ClaudeStringField | undefined): { value: string; found: boolean } {
  if (!field || field.status !== 'found' || !field.value) {
    return { value: '', found: false }
  }
  return { value: field.value.trim(), found: true }
}

function buildEmptyResult(): IntakeSearchResult {
  const empty = () => ({ value: '', found: false })
  return {
    businessName: empty(),
    ownerName: empty(),
    businessPhone: empty(),
    businessCity: empty(),
    businessState: empty(),
    businessZip: empty(),
  }
}

export async function runIntakeSearch(
  input: { websiteUrl?: string; phoneNumber?: string },
  store: AppStoreApi
): Promise<void> {
  store.setIntakeSearchStatus('searching')
  store.setIntakeSearchResult(null)

  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey) {
    store.setIntakeSearchStatus('complete')
    store.setIntakeSearchResult(buildEmptyResult())
    return
  }

  const userMessage = input.websiteUrl
    ? `Find business information for the website: ${input.websiteUrl}\n\nFetch the website (especially the contact or about page) to find the business name, owner name, phone number, and address (city, state, zip).`
    : `Find business information for this phone number: ${input.phoneNumber}\n\nStep 1: Run a web search for exactly: "${input.phoneNumber}"\nThe search results will likely show the business name and location directly in the snippet — read it carefully.\nStep 2: If the business name and address are clear from the search snippets, output the data immediately without fetching any pages.\nStep 3: Only fetch a page if the snippet is ambiguous and you need more detail.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [WEB_SEARCH_TOOL, OUTPUT_INTAKE_DATA_TOOL],
        tool_choice: { type: 'any' },
        messages: [{ role: 'user', content: userMessage }],
      }),
    })

    if (!response.ok) {
      store.setIntakeSearchResult(buildEmptyResult())
      store.setIntakeSearchStatus('complete')
      return
    }

    const json = await response.json()
    const output = parseIntakeResponse(json)

    if (!output) {
      store.setIntakeSearchResult(buildEmptyResult())
      store.setIntakeSearchStatus('complete')
      return
    }

    const result: IntakeSearchResult = {
      businessName: toIntakeField(output.business_name),
      ownerName: toIntakeField(output.owner_name),
      businessPhone: toIntakeField(output.business_phone),
      businessCity: toIntakeField(output.business_city),
      businessState: toIntakeField(output.business_state),
      businessZip: toIntakeField(output.business_zip),
    }

    store.setIntakeSearchResult(result)
    store.setIntakeSearchStatus('complete')
  } catch {
    clearTimeout(timeoutId)
    store.setIntakeSearchResult(buildEmptyResult())
    store.setIntakeSearchStatus('complete')
  }
}
