import { useParams } from 'react-router-dom'
import { useDocumentStore } from '../store/useDocumentStore'
import DocumentChecklist from '../components/documents/DocumentChecklist'

export default function DelegateUpload() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const { documents, delegations, markDelegationComplete } = useDocumentStore()

  if (!sessionId) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: '#FAFAF9' }}
      >
        <div
          className="w-full bg-white rounded-2xl shadow-sm border p-8 text-center"
          style={{ maxWidth: '560px', borderColor: '#DADFE3' }}
        >
          <p className="text-base font-semibold mb-2" style={{ color: '#192526' }}>
            Invalid link
          </p>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            This upload link doesn't appear to be valid.
          </p>
        </div>
      </div>
    )
  }

  const delegation = delegations[sessionId]

  if (!delegation) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: '#FAFAF9' }}
      >
        <div
          className="w-full bg-white rounded-2xl shadow-sm border p-8 text-center"
          style={{ maxWidth: '560px', borderColor: '#DADFE3' }}
        >
          <p className="text-base font-semibold mb-2" style={{ color: '#192526' }}>
            Invalid link
          </p>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            This upload link doesn't appear to be valid.
          </p>
        </div>
      </div>
    )
  }

  if (delegation.completed) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ background: '#FAFAF9' }}
      >
        <div
          className="w-full bg-white rounded-2xl shadow-sm border p-8 text-center"
          style={{ maxWidth: '560px', borderColor: '#DADFE3' }}
        >
          <div className="mb-4">
            <img src="/images/Lendio-Logo-2024.svg" alt="Lendio" height="28" style={{ height: '28px', margin: '0 auto' }} />
          </div>
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#DCFCE7' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M6 14l5.5 5.5L22 8"
                stroke="#16A34A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1 className="text-lg font-semibold mb-2" style={{ color: '#192526' }}>
            This upload link has expired
          </h1>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            All documents assigned to you have been successfully submitted. Thank you for your help!
          </p>
        </div>
      </div>
    )
  }

  // Active delegation
  const assignedDocs = delegation.documentIds
    .map((id) => documents[id])
    .filter(Boolean)

  const allDone = assignedDocs.length > 0 && assignedDocs.every((d) => d.status === 'complete')

  if (allDone && !delegation.completed) {
    markDelegationComplete(sessionId)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF9' }}>
      {/* Header */}
      <header
        className="bg-white flex items-center px-6"
        style={{
          height: '48px',
          borderBottom: '1px solid #DADFE3',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <img src="/images/Lendio-Logo-2024.svg" alt="Lendio" height="28" style={{ height: '28px' }} />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full" style={{ maxWidth: '640px' }}>
          {allDone ? (
            <div className="flex flex-col items-center text-center py-16">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                style={{ background: '#DCFCE7' }}
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path
                    d="M6 16l7 7L26 9"
                    stroke="#16A34A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: '#192526' }}>
                You're all done — thank you!
              </h2>
              <p className="text-sm" style={{ color: '#6B717A' }}>
                All documents have been submitted successfully.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-xl font-semibold mb-1" style={{ color: '#192526' }}>
                  Document Upload Request
                </h1>
                <p className="text-sm" style={{ color: '#6B717A' }}>
                  You've been asked to upload the following document
                  {assignedDocs.length === 1 ? '' : 's'} for a loan application.
                </p>

                {delegation.note && (
                  <div
                    className="mt-4 px-4 py-3 rounded-xl text-sm"
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#1E40AF',
                    }}
                  >
                    <span className="font-medium">Note: </span>
                    {delegation.note}
                  </div>
                )}
              </div>

              <DocumentChecklist
                documents={assignedDocs}
                showDelegateButton={false}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
