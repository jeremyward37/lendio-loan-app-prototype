import type { ProfileData, FundingAnswers, IntakeFormData, LoanProduct } from '../types'

export function buildSystemPrompt(
  profile: ProfileData | null,
  fundingAnswers: Partial<FundingAnswers>,
  intake: IntakeFormData | null,
  products: LoanProduct[]
): string {
  const productList = products
    .map(
      (p) =>
        `- ${p.name}: ${p.description} Typical amounts: ${p.typicalAmounts}. Typical terms: ${p.typicalTerms}. Best for: ${p.bestFor}. Key requirements: ${p.keyRequirements.join(', ')}.`
    )
    .join('\n')

  const productNames = products.map((p) => p.name).join(', ')

  let prompt = `You are a loan advisor for Lendio helping a small business owner compare loan options.

IMPORTANT RULES:
- Only discuss and recommend from the following loan products. Do not mention, suggest, or reference any other loan types, lenders, or financial products not on this list.
- Respond in plain conversational text only. Do not use markdown formatting — no bullet points with hyphens or asterisks, no bold (**), no headers (##), no numbered lists. Write in short natural paragraphs.
- Keep responses concise — 2 to 4 sentences unless the question clearly requires more detail.
- Never quote specific interest rates.

AVAILABLE LOAN PRODUCTS (${productNames}):
${productList}`

  if (intake) {
    prompt += `\n\nAPPLICANT: ${intake.ownerName}, ${intake.businessName}, ${intake.businessCity} ${intake.businessState}`
  }

  if (Object.keys(fundingAnswers).length > 0) {
    const parts = []
    if (fundingAnswers.creditScore) parts.push(`credit score ${fundingAnswers.creditScore}`)
    if (fundingAnswers.monthlyRevenue) parts.push(`$${fundingAnswers.monthlyRevenue.toLocaleString()}/month revenue`)
    if (fundingAnswers.loanAmount) parts.push(`seeking $${fundingAnswers.loanAmount.toLocaleString()}`)
    if (fundingAnswers.useOfFunds?.length) parts.push(`use of funds: ${fundingAnswers.useOfFunds.join(', ')}`)
    if (parts.length) prompt += `\nFunding profile: ${parts.join(', ')}.`
  }

  if (profile) {
    const pv = (field: { value: string; found: boolean }) => (field.found ? field.value : null)
    const details = []
    if (pv(profile.entityType)) details.push(`entity type: ${pv(profile.entityType)}`)
    if (pv(profile.businessStartDate)) details.push(`in business since ${pv(profile.businessStartDate)}`)
    if (pv(profile.numberOfEmployees)) details.push(`${pv(profile.numberOfEmployees)} employees`)
    if (pv(profile.hasBankruptcy) === 'Yes') details.push(`has prior bankruptcy (${pv(profile.bankruptcyStatus) ?? 'unknown status'})`)
    if (details.length) prompt += `\nBusiness details: ${details.join(', ')}.`
  }

  return prompt
}

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  apiKey: string
): Promise<ReadableStream> {
  const response = await fetch('/api/claude/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`)
  }

  if (!response.body) {
    throw new Error('No response body received')
  }

  return response.body
}
