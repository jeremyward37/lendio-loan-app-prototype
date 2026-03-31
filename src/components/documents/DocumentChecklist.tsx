import { useState } from 'react'
import type { DocumentRecord } from '../../types'
import DocumentRow from './DocumentRow'
import BankConnectModal from './BankConnectModal'
import AccountingConnectModal from './AccountingConnectModal'

interface Props {
  documents: DocumentRecord[]
  showDelegateButton?: boolean
}

function isBankDoc(name: string) {
  return name.toLowerCase().includes('bank statement')
}

function isAccountingDoc(name: string) {
  const lower = name.toLowerCase()
  return lower.includes('balance sheet') || lower.includes('profit & loss')
}

export default function DocumentChecklist({ documents, showDelegateButton = true }: Props) {
  const [bankOpen, setBankOpen] = useState(false)
  const [accountingOpen, setAccountingOpen] = useState(false)

  const requiredOutstanding = documents
    .filter((d) => d.requirement === 'required' && (d.status === 'outstanding' || d.status === 'failed' || d.status === 'verifying'))
    .sort((a, b) => a.name.localeCompare(b.name))

  const optional = documents
    .filter((d) => d.requirement === 'optional' && d.status !== 'complete')
    .sort((a, b) => a.name.localeCompare(b.name))

  const completed = documents
    .filter((d) => d.status === 'complete')
    .sort((a, b) => a.name.localeCompare(b.name))

  const hasBankDoc = documents.some((d) => isBankDoc(d.name))
  const hasAccountingDoc = documents.some((d) => isAccountingDoc(d.name))

  return (
    <>
      <div className="space-y-6">
        {requiredOutstanding.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#B45309' }}>
              Required — Outstanding
            </h3>
            <div className="space-y-3">
              {requiredOutstanding.map((doc) => (
                <div key={doc.id}>
                  <DocumentRow
                    doc={doc}
                    showDelegateButton={showDelegateButton}
                    onOpenBankConnect={isBankDoc(doc.name) ? () => setBankOpen(true) : undefined}
                    onOpenAccountingConnect={isAccountingDoc(doc.name) ? () => setAccountingOpen(true) : undefined}
                  />
                  {/* Upsell: bank account after bank statements */}
                  {isBankDoc(doc.name) && (
                    <div
                      className="mt-1.5 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs"
                      style={{ background: '#F0F9FF', border: '1px solid #BAE6FD' }}
                    >
                      <span style={{ color: '#0369A1' }}>
                        Need a business bank account? We can help.
                      </span>
                      <a
                        href="#"
                        className="font-medium underline ml-3 flex-shrink-0"
                        style={{ color: '#0369A1' }}
                        onClick={(e) => e.preventDefault()}
                      >
                        Learn more
                      </a>
                    </div>
                  )}
                  {/* Upsell: accounting software after P&L / Balance Sheet */}
                  {isAccountingDoc(doc.name) && (
                    <div
                      className="mt-1.5 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs"
                      style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}
                    >
                      <span style={{ color: '#166534' }}>
                        Don't have financials ready? Try QuickBooks.
                      </span>
                      <button
                        className="font-medium underline ml-3 flex-shrink-0"
                        style={{ color: '#166534' }}
                        onClick={() => setAccountingOpen(true)}
                      >
                        Connect
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {optional.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: '#6B717A' }}>
              Optional
            </h3>
            <p className="text-xs mb-3" style={{ color: '#6B717A' }}>
              Providing these now will speed up your closing
            </p>
            <div className="space-y-3">
              {optional.map((doc) => (
                <div key={doc.id}>
                  <DocumentRow
                    doc={doc}
                    showDelegateButton={showDelegateButton}
                    onOpenBankConnect={isBankDoc(doc.name) ? () => setBankOpen(true) : undefined}
                    onOpenAccountingConnect={isAccountingDoc(doc.name) ? () => setAccountingOpen(true) : undefined}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {completed.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: '#166534' }}>
              Completed
            </h3>
            <div className="space-y-3">
              {completed.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  doc={doc}
                  showDelegateButton={false}
                  onOpenBankConnect={undefined}
                  onOpenAccountingConnect={undefined}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {hasBankDoc && (
        <BankConnectModal isOpen={bankOpen} onClose={() => setBankOpen(false)} />
      )}
      {hasAccountingDoc && (
        <AccountingConnectModal isOpen={accountingOpen} onClose={() => setAccountingOpen(false)} />
      )}
    </>
  )
}
