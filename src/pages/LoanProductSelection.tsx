import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOAN_PRODUCTS } from '../data/loanProducts'
import { useApplicationStore } from '../store/useApplicationStore'
import { useDocumentStore } from '../store/useDocumentStore'
import type { LoanProductId } from '../types'
import LoanAdvisorChat from '../components/chat/LoanAdvisorChat'

export default function LoanProductSelection() {
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState<LoanProductId[]>([])
  const { setSelectedProductIds } = useApplicationStore()
  const { initDocuments } = useDocumentStore()

  function toggleProduct(id: LoanProductId) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function handleContinue() {
    if (selectedIds.length === 0) return
    setSelectedProductIds(selectedIds)
    initDocuments(selectedIds)
    navigate('/documents')
  }

  const n = selectedIds.length

  return (
    <div className="flex gap-6 items-start">
      {/* Left: product cards */}
      <div className="flex-[3] min-w-0">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: '#192526' }}>
          Choose Your Loan Products
        </h1>
        <p className="text-sm mb-6" style={{ color: '#6B717A' }}>
          Select one or more loan products you'd like to apply for. You can ask the Loan Advisor on the right any questions.
        </p>

        <div className="space-y-4">
          {LOAN_PRODUCTS.map((product) => {
            const selected = selectedIds.includes(product.id)
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-sm p-5 transition-all"
                style={{
                  border: selected
                    ? '1px solid #DADFE3'
                    : '1px solid #DADFE3',
                  borderLeft: selected ? '4px solid #0800A6' : '4px solid transparent',
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-base mb-1" style={{ color: '#192526' }}>
                      {product.name}
                    </h2>
                    <p className="text-sm mb-3 leading-relaxed" style={{ color: '#6B717A' }}>
                      {product.description}
                    </p>

                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 mb-3">
                      <div>
                        <span className="text-xs font-medium" style={{ color: '#6B717A' }}>
                          Typical Amount:{' '}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: '#192526' }}>
                          {product.typicalAmounts}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs font-medium" style={{ color: '#6B717A' }}>
                          Typical Terms:{' '}
                        </span>
                        <span className="text-xs font-semibold" style={{ color: '#192526' }}>
                          {product.typicalTerms}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ background: '#EEF2FF', color: '#3730A3' }}
                      >
                        Best For: {product.bestFor}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: '#192526' }}>
                        Key Requirements
                      </p>
                      <ul className="space-y-1">
                        {product.keyRequirements.map((req) => (
                          <li key={req} className="flex items-start gap-1.5 text-xs" style={{ color: '#6B717A' }}>
                            <span className="mt-0.5 flex-shrink-0">•</span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={
                      selected
                        ? { background: '#192526', color: '#fff' }
                        : {
                            background: '#F5F5F4',
                            color: '#192526',
                            border: '1px solid #DADFE3',
                          }
                    }
                  >
                    {selected ? 'Selected ✓' : 'Select'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-6">
          <button
            onClick={handleContinue}
            disabled={n === 0}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#192526', color: '#fff' }}
          >
            {n === 0
              ? 'Continue →'
              : `Continue with ${n} selected product${n === 1 ? '' : 's'} →`}
          </button>
        </div>
      </div>

      {/* Right: AI chat */}
      <div className="flex-[2] min-w-0">
        <LoanAdvisorChat />
      </div>
    </div>
  )
}
