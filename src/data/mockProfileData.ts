import type { AgentName, IntakeFormData, ProfileData } from '../types'

function seedIndex(businessName: string, max: number): number {
  let sum = 0
  for (let i = 0; i < businessName.length; i++) {
    sum += businessName.charCodeAt(i)
  }
  return sum % max
}

export function generateMockData(
  businessName: string,
  intake: IntakeFormData
): Record<AgentName, Partial<Record<keyof ProfileData, string>>> {
  const city = intake.businessCity || 'Salt Lake City'
  const state = intake.businessState || 'UT'
  const ein = intake.ein || '82-4521890'

  // Use seed to vary disagreement fields
  const locationSeed = seedIndex(businessName, 2) // 0 = "1", 1 = "2"
  const entitySeed = seedIndex(businessName + 'entity', 3) // 0,1 = LLC, 2 = S-Corp

  const locationVariant = locationSeed === 0 ? '1' : '2'
  const entityVariant = entitySeed < 2 ? 'LLC' : 'S-Corp'

  // Base data that most agents agree on
  const base: Partial<Record<keyof ProfileData, string>> = {
    businessStreet: '123 Main St',
    businessCity: city,
    businessState: state,
    businessZip: '84101',
    ownerStreet: '456 Oak Ave',
    ownerCity: city,
    ownerState: state,
    ownerZip: '84102',
    businessStartDate: '2018-03-15',
    numberOfLocations: '1',
    entityType: 'LLC',
    ein: ein,
    numberOfEmployees: '12',
    isFranchise: 'No',
    isNonprofit: 'No',
    hasBankruptcy: 'No',
    bankruptcyStatus: '',
  }

  // Secretary of State — authoritative, complete
  const secretaryOfState: Partial<Record<keyof ProfileData, string>> = {
    ...base,
    businessStreet: '123 Main St',
    entityType: entityVariant,
    ein: ein,
  }

  // Dun & Bradstreet — authoritative, complete
  const dunBradstreet: Partial<Record<keyof ProfileData, string>> = {
    ...base,
    entityType: entityVariant,
    numberOfLocations: locationVariant,
    numberOfEmployees: '12',
  }

  // SBA Databases — complete, authoritative
  const sbaDatabases: Partial<Record<keyof ProfileData, string>> = {
    ...base,
    businessStartDate: '2018-03-15',
    numberOfEmployees: '12',
    entityType: entityVariant,
  }

  // Google Business Listing — mostly complete
  const googleBusiness: Partial<Record<keyof ProfileData, string>> = {
    businessStreet: '123 Main St',
    businessCity: city,
    businessState: state,
    businessZip: '84101',
    numberOfLocations: locationVariant,
    businessStartDate: '2018-03-15',
    isFranchise: 'No',
    isNonprofit: 'No',
  }

  // Better Business Bureau — partial (no owner info, no ein)
  const bbb: Partial<Record<keyof ProfileData, string>> = {
    businessStreet: '123 Main St',
    businessCity: city,
    businessState: state,
    businessZip: '84101',
    businessStartDate: '2018-03-15',
    isFranchise: 'No',
    isNonprofit: 'No',
    hasBankruptcy: 'No',
  }

  // Manta — mostly complete
  const manta: Partial<Record<keyof ProfileData, string>> = {
    ...base,
    numberOfLocations: '1',
    entityType: 'LLC',
  }

  // ZoomInfo — fairly complete
  const zoomInfo: Partial<Record<keyof ProfileData, string>> = {
    ...base,
    numberOfEmployees: '12',
    businessStartDate: '2018-03-15',
    entityType: entityVariant,
    numberOfLocations: locationVariant,
  }

  // LinkedIn — partial
  const linkedIn: Partial<Record<keyof ProfileData, string>> = {
    businessCity: city,
    businessState: state,
    numberOfEmployees: '12',
    businessStartDate: '2018-03-15',
    isFranchise: 'No',
  }

  // Credit Databases — mostly complete
  const creditDatabases: Partial<Record<keyof ProfileData, string>> = {
    ...base,
    ownerStreet: '456 Oak Ave',
    ownerCity: city,
    ownerState: state,
    ownerZip: '84102',
    hasBankruptcy: 'No',
  }

  // UCC — partial, address focused
  const ucc: Partial<Record<keyof ProfileData, string>> = {
    businessStreet: '123 Main St',
    businessCity: city,
    businessState: state,
    businessZip: '84101',
    ein: ein,
    entityType: 'LLC',
  }

  // Licensing Authorities — partial
  const licensingAuthorities: Partial<Record<keyof ProfileData, string>> = {
    businessStreet: '123 Main St',
    businessCity: city,
    businessState: state,
    businessZip: '84101',
    entityType: 'LLC',
    businessStartDate: '2018-03-15',
    isFranchise: 'No',
  }

  // Business Website — partial, address and contact
  const businessWebsite: Partial<Record<keyof ProfileData, string>> = {
    businessStreet: '123 Main St',
    businessCity: city,
    businessState: state,
    businessZip: '84101',
    isFranchise: 'No',
    isNonprofit: 'No',
  }

  // Bankruptcy Court Records — only bankruptcy fields
  const bankruptcyCourtRecords: Partial<Record<keyof ProfileData, string>> = {
    hasBankruptcy: 'No',
    bankruptcyStatus: '',
  }

  // Yelp — very partial (just location)
  const yelp: Partial<Record<keyof ProfileData, string>> = {
    businessStreet: '123 Main St',
    businessCity: city,
    businessState: state,
    businessZip: '84101',
    numberOfLocations: '1',
  }

  // Facebook — very partial
  const facebook: Partial<Record<keyof ProfileData, string>> = {
    businessCity: city,
    businessState: state,
    isFranchise: 'No',
    isNonprofit: 'No',
  }

  return {
    'Secretary of State': secretaryOfState,
    'Dun & Bradstreet': dunBradstreet,
    'SBA Databases': sbaDatabases,
    'Google Business Listing': googleBusiness,
    'Better Business Bureau': bbb,
    Manta: manta,
    ZoomInfo: zoomInfo,
    LinkedIn: linkedIn,
    'Credit Databases': creditDatabases,
    UCC: ucc,
    'Licensing Authorities': licensingAuthorities,
    'Business Website': businessWebsite,
    'Bankruptcy Court Records': bankruptcyCourtRecords,
    Yelp: yelp,
    Facebook: facebook,
    'Data Guardian': {},
  }
}
