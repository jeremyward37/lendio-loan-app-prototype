import type { LoanProduct } from '../types'

export const LOAN_PRODUCTS: LoanProduct[] = [
  {
    id: 'rbf',
    name: 'Revenue Based Financing',
    description:
      'Flexible financing where repayments scale with your monthly revenue — pay more when business is good, less when it slows.',
    typicalAmounts: '$5,000 – $500,000',
    typicalTerms: '3 – 18 months',
    bestFor: 'Businesses with consistent monthly revenue looking for flexible repayment',
    keyRequirements: [
      'Minimum 6 months in business',
      'At least $10,000/month in revenue',
      'Business bank account required',
      'No minimum credit score',
    ],
  },
  {
    id: 'loc',
    name: 'Line of Credit',
    description:
      'A revolving credit line you draw from as needed and repay over time — only pay interest on what you use.',
    typicalAmounts: '$10,000 – $250,000',
    typicalTerms: '6 – 24 months (revolving)',
    bestFor: 'Businesses needing flexible access to capital for ongoing expenses',
    keyRequirements: [
      'Minimum 1 year in business',
      'At least $50,000/year in revenue',
      '600+ credit score recommended',
      'Business checking account',
    ],
  },
  {
    id: 'term',
    name: 'Term Loan',
    description:
      'A lump sum loan repaid over a fixed term with regular payments — ideal for planned investments with a clear ROI.',
    typicalAmounts: '$25,000 – $500,000',
    typicalTerms: '1 – 5 years',
    bestFor: 'Established businesses making specific investments like equipment or expansion',
    keyRequirements: [
      'Minimum 2 years in business',
      'At least $100,000/year in revenue',
      '620+ credit score',
      'Business and personal tax returns required',
    ],
  },
  {
    id: 'sba',
    name: 'SBA Loan',
    description:
      'Government-backed loans with low rates and long terms — the gold standard for small business financing but with more paperwork.',
    typicalAmounts: '$50,000 – $5,000,000',
    typicalTerms: '5 – 25 years',
    bestFor: 'Creditworthy businesses that can handle a longer approval process',
    keyRequirements: [
      'Minimum 2 years in business',
      '680+ credit score',
      'Strong business financials and tax returns',
      'Collateral may be required',
    ],
  },
  {
    id: 'equipment',
    name: 'Equipment Loan',
    description:
      'Financing specifically for purchasing equipment — the equipment itself serves as collateral, making approval easier.',
    typicalAmounts: '$5,000 – $5,000,000',
    typicalTerms: '1 – 7 years',
    bestFor: 'Businesses purchasing machinery, vehicles, technology, or other equipment',
    keyRequirements: [
      'Equipment quote or invoice required',
      'Minimum 1 year in business',
      '600+ credit score',
      'Equipment serves as collateral',
    ],
  },
]
