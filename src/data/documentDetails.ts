export const DOCUMENT_DETAILS: Record<string, { description: string; whereToGet: string; example?: string }> = {
  '3 months business bank statements': {
    description:
      'The last 3 months of statements from your primary business checking account. Lenders use these to verify your cash flow and average monthly revenue.',
    whereToGet:
      'Log into your business bank account and download PDF statements for the last 3 months. Most banks offer this under "Statements" or "Documents."',
    example: 'Bank of America Business Advantage statement, Chase Business Complete Banking statement',
  },
  '6 months business bank statements': {
    description:
      'The last 6 months of statements from your primary business checking account. SBA lenders require a longer history to assess your business\'s financial stability.',
    whereToGet:
      'Log into your business bank account and download PDF statements for the last 6 months. Most banks offer this under "Statements" or "Documents."',
    example: 'Bank of America Business Advantage statement, Chase Business Complete Banking statement',
  },
  'Prior year business tax return': {
    description:
      'Your business federal tax return from the most recent completed tax year. This shows your business\'s total revenue, expenses, and profit.',
    whereToGet:
      'Locate your most recent Form 1120, 1120-S, 1065, or Schedule C (for sole proprietors). Your accountant or tax software can provide a copy.',
    example: 'Form 1120-S for an S-Corp, Form 1065 for a Partnership',
  },
  'Prior 2 years business tax return': {
    description:
      'Your business federal tax returns from the two most recent completed tax years. SBA lenders use these to assess business trends and long-term financial health.',
    whereToGet:
      'Gather your most recent two years of Form 1120, 1120-S, 1065, or Schedule C. Your accountant or the IRS Get Transcript tool can provide copies.',
  },
  'Prior year personal tax return': {
    description:
      'Your personal Form 1040 from the most recent completed tax year. Lenders use this to verify your personal income and liabilities.',
    whereToGet:
      'Locate your most recent Form 1040 with all schedules. Your tax software (TurboTax, H&R Block) or accountant should have a copy. You can also use the IRS Get Transcript tool.',
    example: 'Form 1040 with Schedule C or Schedule E if you have pass-through income',
  },
  'Prior 2 years personal tax return': {
    description:
      'Your personal Form 1040 returns from the two most recent completed tax years. SBA lenders require these to fully assess your personal financial history.',
    whereToGet:
      'Gather your last two years of Form 1040. Your accountant or the IRS Get Transcript tool can provide copies.',
  },
  'Current Balance Sheet': {
    description:
      'A financial statement showing your business\'s assets, liabilities, and equity as of a specific date. This gives lenders a snapshot of your business\'s financial position.',
    whereToGet:
      'Your accountant can prepare this, or you can generate it from accounting software like QuickBooks, Xero, or FreshBooks under "Reports" > "Balance Sheet."',
  },
  'Year to Date Profit & Loss Statement': {
    description:
      'A financial report showing your business\'s revenues, costs, and expenses from January 1st through today. Also called an income statement.',
    whereToGet:
      'Generate from accounting software like QuickBooks, Xero, or FreshBooks. Your accountant can also prepare this. It should cover January 1 through the most recent month.',
  },
  'Equipment quote or invoice': {
    description:
      'A formal quote or invoice from a vendor for the equipment you\'re planning to purchase with the loan proceeds.',
    whereToGet:
      'Contact the equipment vendor or dealer and request a formal written quote on their letterhead. It should include the equipment description, model number, and price.',
    example: 'Quote from a heavy machinery dealer, invoice from a technology supplier',
  },
  'Front and back of Driver\'s License': {
    description:
      'A clear photo or scan of the front and back of your government-issued driver\'s license or state ID. Used to verify your identity.',
    whereToGet:
      'Take a clear photo of both sides of your driver\'s license with your smartphone. Make sure all text is readable and the photo is not blurry.',
    example: 'Any US state-issued driver\'s license or state identification card',
  },
}
