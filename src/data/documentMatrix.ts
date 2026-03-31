import type { LoanProductId, DocumentRecord, DocRequirement } from '../types'
import { nanoid } from 'nanoid'

type DocMatrixEntry = {
  name: string
  rbf: DocRequirement
  loc: DocRequirement
  term: DocRequirement
  sba: DocRequirement
  equipment: DocRequirement
}

export const DOCUMENT_MATRIX: DocMatrixEntry[] = [
  {
    name: '3 months business bank statements',
    rbf: 'required',
    loc: 'required',
    term: 'required',
    sba: null,
    equipment: 'required',
  },
  {
    name: '6 months business bank statements',
    rbf: null,
    loc: null,
    term: null,
    sba: 'required',
    equipment: null,
  },
  {
    name: 'Prior year business tax return',
    rbf: null,
    loc: null,
    term: 'required',
    sba: null,
    equipment: 'optional',
  },
  {
    name: 'Prior 2 years business tax return',
    rbf: null,
    loc: null,
    term: null,
    sba: 'required',
    equipment: null,
  },
  {
    name: 'Prior year personal tax return',
    rbf: null,
    loc: null,
    term: 'required',
    sba: null,
    equipment: null,
  },
  {
    name: 'Prior 2 years personal tax return',
    rbf: null,
    loc: null,
    term: null,
    sba: 'required',
    equipment: null,
  },
  {
    name: 'Current Balance Sheet',
    rbf: null,
    loc: null,
    term: 'required',
    sba: 'required',
    equipment: 'optional',
  },
  {
    name: 'Year to Date Profit & Loss Statement',
    rbf: null,
    loc: null,
    term: 'required',
    sba: 'required',
    equipment: null,
  },
  {
    name: 'Equipment quote or invoice',
    rbf: null,
    loc: null,
    term: null,
    sba: null,
    equipment: 'required',
  },
  {
    name: 'Front and back of Driver\'s License',
    rbf: 'optional',
    loc: 'optional',
    term: 'optional',
    sba: 'required',
    equipment: 'optional',
  },
]

export function getRequiredDocuments(selectedProductIds: LoanProductId[]): DocumentRecord[] {
  const hasSBA = selectedProductIds.includes('sba')

  // Collect drivers from suppressed 1-year entries so they can be merged into the 2-year equivalents
  const getDriversFor = (docName: string) =>
    selectedProductIds.filter((id) => {
      const entry = DOCUMENT_MATRIX.find((e) => e.name === docName)
      return entry ? entry[id] !== null : false
    })

  const twoYearBusinessExtraDrivers = getDriversFor('Prior year business tax return')
  const twoYearPersonalExtraDrivers = getDriversFor('Prior year personal tax return')
  const bankStatementExtraDrivers = getDriversFor('3 months business bank statements')

  const needsTwoYearBusiness = getDriversFor('Prior 2 years business tax return').length > 0
  const needsTwoYearPersonal = getDriversFor('Prior 2 years personal tax return').length > 0

  const docMap = new Map<string, { requirement: 'required' | 'optional'; drivingProducts: LoanProductId[] }>()

  for (const entry of DOCUMENT_MATRIX) {
    const docName = entry.name

    // Suppress lesser requirements when a stricter superset is present
    if (hasSBA && docName === '3 months business bank statements') continue
    if (needsTwoYearBusiness && docName === 'Prior year business tax return') continue
    if (needsTwoYearPersonal && docName === 'Prior year personal tax return') continue

    let highestReq: DocRequirement = null
    const drivers: LoanProductId[] = []

    for (const productId of selectedProductIds) {
      const req = entry[productId]
      if (req === 'required') {
        highestReq = 'required'
        drivers.push(productId)
      } else if (req === 'optional') {
        if (highestReq == null) highestReq = 'optional'
        drivers.push(productId)
      }
    }

    if (highestReq === null) continue

    // Merge in drivers from suppressed lesser-requirement documents
    if (hasSBA && docName === '6 months business bank statements') {
      bankStatementExtraDrivers.forEach((id) => { if (!drivers.includes(id)) drivers.push(id) })
    }
    if (needsTwoYearBusiness && docName === 'Prior 2 years business tax return') {
      twoYearBusinessExtraDrivers.forEach((id) => { if (!drivers.includes(id)) drivers.push(id) })
    }
    if (needsTwoYearPersonal && docName === 'Prior 2 years personal tax return') {
      twoYearPersonalExtraDrivers.forEach((id) => { if (!drivers.includes(id)) drivers.push(id) })
    }

    const existing = docMap.get(docName)
    if (!existing) {
      docMap.set(docName, { requirement: highestReq, drivingProducts: drivers })
    } else {
      docMap.set(docName, {
        requirement: highestReq === 'required' ? 'required' : existing.requirement,
        drivingProducts: Array.from(new Set([...existing.drivingProducts, ...drivers])),
      })
    }
  }

  return Array.from(docMap.entries()).map(([name, { requirement, drivingProducts }]) => ({
    id: nanoid(),
    name,
    requirement,
    drivingProducts,
    status: 'outstanding' as const,
  }))
}
