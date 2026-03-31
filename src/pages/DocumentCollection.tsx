import { useState } from 'react'
import { useDocumentStore } from '../store/useDocumentStore'
import { useApplicationStore } from '../store/useApplicationStore'
import DocumentChecklist from '../components/documents/DocumentChecklist'
import CompletionScreen from '../components/documents/CompletionScreen'
import { DOCUMENT_MATRIX } from '../data/documentMatrix'
import { LOAN_PRODUCTS } from '../data/loanProducts'
import type { LoanProductId, DocumentRecord } from '../types'

function getProductProgress(
  productId: LoanProductId,
  selectedProductIds: LoanProductId[],
  documents: DocumentRecord[]
) {
  const hasSBA = selectedProductIds.includes('sba')
  const docNames = DOCUMENT_MATRIX
    .filter((entry) => entry[productId] !== null)
    .map((entry) => {
      if (hasSBA && entry.name === '3 months business bank statements') {
        return '6 months business bank statements'
      }
      return entry.name
    })
    .filter((name, i, arr) => arr.indexOf(name) === i)

  const relevant = documents.filter((d) => docNames.includes(d.name))
  const complete = relevant.filter((d) => d.status === 'complete').length
  return { total: relevant.length, complete }
}

export default function DocumentCollection() {
  const { documents } = useDocumentStore()
  const { intake, selectedProductIds } = useApplicationStore()
  const [submitted, setSubmitted] = useState(false)

  const docList = Object.values(documents)

  const requiredDocs = docList.filter((d) => d.requirement === 'required')
  const requiredRemaining = requiredDocs.filter(
    (d) => d.status === 'outstanding' || d.status === 'failed' || d.status === 'verifying'
  )
  const allRequiredComplete = requiredRemaining.length === 0 && requiredDocs.length > 0

  const ownerName = intake?.ownerName ?? 'there'

  if (submitted) {
    return <CompletionScreen ownerName={ownerName} />
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold mb-1" style={{ color: '#192526' }}>
              Upload Your Documents
            </h1>
            <p className="text-sm" style={{ color: '#6B717A' }}>
              Upload the required documents to complete your application.
            </p>
          </div>

          <div className="flex-shrink-0 mt-1">
            {requiredRemaining.length > 0 ? (
              <span
                className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: '#FEE2E2', color: '#991B1B' }}
              >
                {requiredRemaining.length} required document
                {requiredRemaining.length === 1 ? '' : 's'} remaining
              </span>
            ) : requiredDocs.length > 0 ? (
              <span
                className="inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: '#DCFCE7', color: '#166534' }}
              >
                All required documents complete ✓
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Per-product progress */}
      {selectedProductIds.length > 0 && docList.length > 0 && (
        <div
          className="grid gap-3 mb-6"
          style={{ gridTemplateColumns: `repeat(${Math.min(selectedProductIds.length, 3)}, 1fr)` }}
        >
          {selectedProductIds.map((pid) => {
            const product = LOAN_PRODUCTS.find((p) => p.id === pid)
            const { total, complete } = getProductProgress(pid, selectedProductIds, docList)
            const pct = total === 0 ? 0 : Math.round((complete / total) * 100)
            const allDone = complete === total && total > 0
            return (
              <div
                key={pid}
                className="rounded-xl border px-4 py-3"
                style={{ borderColor: '#DADFE3', background: '#fff' }}
              >
                <p className="text-xs font-semibold mb-0.5 truncate" style={{ color: '#192526' }}>
                  {product?.name ?? pid}
                </p>
                <p className="text-xs mb-2" style={{ color: allDone ? '#166534' : '#6B717A' }}>
                  {complete} of {total} document{total === 1 ? '' : 's'} provided
                  {allDone ? ' ✓' : ''}
                </p>
                <div className="w-full rounded-full h-1.5" style={{ background: '#EAEBEB' }}>
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: allDone ? '#166534' : '#0800A6',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {docList.length === 0 ? (
        <div
          className="text-center py-12 rounded-2xl border"
          style={{ borderColor: '#DADFE3', color: '#6B717A' }}
        >
          <p className="text-sm">No documents required yet.</p>
          <p className="text-xs mt-1">Go back and select your loan products first.</p>
        </div>
      ) : (
        <DocumentChecklist documents={docList} showDelegateButton={true} />
      )}

      {/* Submit CTA */}
      {docList.length > 0 && (
        <div className="mt-8 pt-6 border-t" style={{ borderColor: '#DADFE3' }}>
          <button
            onClick={() => setSubmitted(true)}
            disabled={!allRequiredComplete}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#192526', color: '#fff' }}
          >
            Complete &amp; Submit
          </button>
          {!allRequiredComplete && requiredDocs.length > 0 && (
            <p className="text-center text-sm mt-2" style={{ color: '#6B717A' }}>
              {requiredRemaining.length} required document
              {requiredRemaining.length === 1 ? '' : 's'} still needed
            </p>
          )}
        </div>
      )}
    </div>
  )
}
