import { useRef, useState } from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { useDocumentStore } from '../../store/useDocumentStore'
import { DOCUMENT_DETAILS } from '../../data/documentDetails'
import type { DocumentRecord, DocumentChecks } from '../../types'
import DelegationModal from './DelegationModal'

interface Props {
  doc: DocumentRecord
  showDelegateButton?: boolean
  onOpenBankConnect?: () => void
  onOpenAccountingConnect?: () => void
}

const PRODUCT_SHORT_LABELS: Record<string, string> = {
  rbf: 'RBF',
  loc: 'Line of Credit',
  term: 'Term Loan',
  sba: 'SBA',
  equipment: 'Equipment',
}

const BANK_NAMES = ['bank statement', 'bank statements']
const ACCOUNTING_NAMES = ['balance sheet', 'profit & loss', 'p&l']

function isBankDoc(name: string) {
  return BANK_NAMES.some((n) => name.toLowerCase().includes(n))
}

function isAccountingDoc(name: string) {
  return ACCOUNTING_NAMES.some((n) => name.toLowerCase().includes(n))
}

const CHECK_LABELS: { key: keyof DocumentChecks; label: string }[] = [
  { key: 'type', label: 'Correct document type' },
  { key: 'time', label: 'Valid time period' },
  { key: 'association', label: 'Belongs to this business' },
]

function VerificationPills({ checks }: { checks: DocumentChecks }) {
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {CHECK_LABELS.map(({ key, label }) => {
        const passed = checks[key]
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full"
            style={
              passed
                ? { background: '#DCFCE7', color: '#166534' }
                : { background: '#FEE2E2', color: '#991B1B' }
            }
          >
            {passed ? '✓' : '☐'} {label}
          </span>
        )
      })}
    </div>
  )
}

function StatusBadge({ status }: { status: DocumentRecord['status'] }) {
  if (status === 'outstanding') {
    return (
      <span
        className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: '#FEF9C3', color: '#854D0E' }}
      >
        Outstanding
      </span>
    )
  }
  if (status === 'verifying') {
    return (
      <span
        className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: '#DBEAFE', color: '#1D4ED8' }}
      >
        <span className="animate-pulse">●</span> Verifying...
      </span>
    )
  }
  if (status === 'complete') {
    return (
      <span
        className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: '#DCFCE7', color: '#166534' }}
      >
        Complete ✓
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span
        className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full"
        style={{ background: '#FEE2E2', color: '#991B1B' }}
      >
        Failed ✗
      </span>
    )
  }
  return null
}

export default function DocumentRow({
  doc,
  showDelegateButton = true,
  onOpenBankConnect,
  onOpenAccountingConnect,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [delegateOpen, setDelegateOpen] = useState(false)
  const { updateDocument } = useDocumentStore()

  const details = DOCUMENT_DETAILS[doc.name]
  const showBankConnect = isBankDoc(doc.name) && onOpenBankConnect
  const showAccountingConnect = isAccountingDoc(doc.name) && onOpenAccountingConnect

  function simulateVerification(fileName: string): Promise<{ checks: DocumentChecks }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const lower = fileName.toLowerCase()
        resolve({
          checks: {
            type: !lower.includes('issue-type'),
            time: !lower.includes('issue-time'),
            association: !lower.includes('issue-association'),
          },
        })
      }, 2000)
    })
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ''

    updateDocument(doc.id, { status: 'verifying', errorMessage: undefined, checks: undefined, fileName: file.name })

    const { checks } = await simulateVerification(file.name)
    const allPassed = checks.type && checks.time && checks.association

    if (allPassed) {
      updateDocument(doc.id, { status: 'complete', checks, fileName: file.name, completedAt: Date.now() })
    } else {
      updateDocument(doc.id, { status: 'failed', checks, errorMessage: 'One or more verification checks failed. Please review and upload a different file.' })
    }
  }

  return (
    <>
      <div
        className="bg-white rounded-xl border p-4 shadow-sm"
        style={{ borderColor: '#DADFE3' }}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug mb-1" style={{ color: '#192526' }}>
              {doc.name}
            </p>
            {doc.drivingProducts?.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1.5">
                {doc.drivingProducts.map((pid) => (
                  <span
                    key={pid}
                    className="inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: '#F1F0FF', color: '#4B45A1', border: '1px solid #D4D2F7' }}
                  >
                    {PRODUCT_SHORT_LABELS[pid] ?? pid}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={doc.status} />
              {doc.delegatedTo && doc.status !== 'complete' && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#F3F4F6', color: '#6B717A' }}
                >
                  🕐 Requested from {doc.delegatedTo}
                </span>
              )}
            </div>

            {doc.checks && <VerificationPills checks={doc.checks} />}

            {doc.status === 'failed' && (
              <div className="mt-2">
                <button
                  className="text-xs underline mt-0.5"
                  style={{ color: '#192526' }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload a different file
                </button>
              </div>
            )}

            {doc.status === 'complete' && doc.fileName && (
              <p className="text-xs mt-1" style={{ color: '#6B717A' }}>
                {doc.fileName}
              </p>
            )}
          </div>

          {/* Right — action buttons */}
          <div className="flex flex-col gap-1.5 flex-shrink-0 items-end">
            {doc.status !== 'complete' && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                  style={{ borderColor: '#DADFE3', color: '#192526' }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path
                      d="M6.5 1v8M3 5l3.5-4 3.5 4M2 11h9"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Upload
                </button>

                {showBankConnect && (
                  <button
                    onClick={onOpenBankConnect}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#DADFE3', color: '#192526' }}
                  >
                    Connect
                  </button>
                )}

                {showAccountingConnect && (
                  <button
                    onClick={onOpenAccountingConnect}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#DADFE3', color: '#192526' }}
                  >
                    Connect
                  </button>
                )}

                {showDelegateButton && !doc.delegatedTo && (
                  <button
                    onClick={() => setDelegateOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-gray-50"
                    style={{ borderColor: '#DADFE3', color: '#6B717A' }}
                  >
                    Assign to someone else
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Learn more disclosure */}
        {details && (
          <Disclosure>
            {({ open }) => (
              <div className="mt-3">
                <DisclosureButton
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: '#192526' }}
                >
                  Learn more {open ? '↑' : '↓'}
                </DisclosureButton>
                <DisclosurePanel className="mt-2 space-y-2">
                  <p className="text-xs leading-relaxed" style={{ color: '#6B717A' }}>
                    {details.description}
                  </p>
                  <div>
                    <p className="text-xs font-medium mb-0.5" style={{ color: '#192526' }}>
                      Where to get it:
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: '#6B717A' }}>
                      {details.whereToGet}
                    </p>
                  </div>
                  {details.example && (
                    <p className="text-xs italic" style={{ color: '#6B717A' }}>
                      Example: {details.example}
                    </p>
                  )}
                  {showBankConnect && onOpenBankConnect && (
                    <button
                      onClick={onOpenBankConnect}
                      className="text-xs font-medium underline mt-1"
                      style={{ color: '#192526' }}
                    >
                      Connect your bank account instead →
                    </button>
                  )}
                </DisclosurePanel>
              </div>
            )}
          </Disclosure>
        )}

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
      </div>

      <DelegationModal
        documentId={doc.id}
        documentName={doc.name}
        isOpen={delegateOpen}
        onClose={() => setDelegateOpen(false)}
      />
    </>
  )
}
