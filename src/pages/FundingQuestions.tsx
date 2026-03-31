import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NumericFormat } from 'react-number-format'
import { useApplicationStore } from '../store/useApplicationStore'
import ProgressBar from '../components/ui/ProgressBar'

const CREDIT_SCORE_OPTIONS = [
  'Below 500',
  '500–599',
  '600–649',
  '650–699',
  '700–749',
  '750+',
]

const USE_OF_FUNDS_OPTIONS = [
  { label: 'Working Capital', emoji: '💼' },
  { label: 'Equipment Purchase', emoji: '🔧' },
  { label: 'Business Expansion', emoji: '📈' },
  { label: 'Real Estate', emoji: '🏢' },
  { label: 'Inventory', emoji: '📦' },
  { label: 'Hiring / Payroll', emoji: '👥' },
  { label: 'Debt Refinancing', emoji: '🔄' },
  { label: 'Other', emoji: '✨' },
]

export default function FundingQuestions() {
  const navigate = useNavigate()
  const fundingStep = useApplicationStore((s) => s.fundingStep)
  const fundingAnswers = useApplicationStore((s) => s.fundingAnswers)
  const setFundingAnswer = useApplicationStore((s) => s.setFundingAnswer)
  const nextFundingStep = useApplicationStore((s) => s.nextFundingStep)
  const setCurrentScreen = useApplicationStore((s) => s.setCurrentScreen)

  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(
    fundingAnswers.monthlyRevenue ?? 0
  )
  const [loanAmount, setLoanAmount] = useState<number>(
    fundingAnswers.loanAmount ?? 0
  )
  const [selectedFunds, setSelectedFunds] = useState<string[]>(
    fundingAnswers.useOfFunds ?? []
  )
  const [revenueError, setRevenueError] = useState('')
  const [loanError, setLoanError] = useState('')
  const [fundsError, setFundsError] = useState('')

  const advanceToNext = () => {
    if (fundingStep < 3) {
      nextFundingStep()
    } else {
      setCurrentScreen(3)
      navigate('/profile-review')
    }
  }

  // Q1 — Credit Score
  const handleCreditScore = (score: string) => {
    setFundingAnswer('creditScore', score)
    setTimeout(() => advanceToNext(), 200)
  }

  // Q2 — Monthly Revenue
  const handleRevenue = () => {
    if (!monthlyRevenue || monthlyRevenue <= 0) {
      setRevenueError('Please enter your average monthly revenue.')
      return
    }
    setRevenueError('')
    setFundingAnswer('monthlyRevenue', monthlyRevenue)
    advanceToNext()
  }

  // Q3 — Loan Amount
  const handleLoanAmount = () => {
    if (!loanAmount || loanAmount <= 0) {
      setLoanError('Please enter the amount of funding you need.')
      return
    }
    setLoanError('')
    setFundingAnswer('loanAmount', loanAmount)
    advanceToNext()
  }

  // Q4 — Use of Funds
  const toggleFund = (label: string) => {
    setSelectedFunds((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    )
    setFundsError('')
  }

  const handleUseFunds = () => {
    if (selectedFunds.length === 0) {
      setFundsError('Please select at least one option.')
      return
    }
    setFundsError('')
    setFundingAnswer('useOfFunds', selectedFunds)
    advanceToNext()
  }

  const cardStyle: React.CSSProperties = {
    maxWidth: '560px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #DADFE3',
    padding: '32px',
  }

  const inputClass = `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors`
  const inputStyle: React.CSSProperties = {
    borderColor: '#DADFE3',
    color: '#2F3637',
  }

  const nextBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 24px',
    borderRadius: '8px',
    backgroundColor: '#192526',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '16px',
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div style={cardStyle} className="w-full">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium" style={{ color: '#727879' }}>
              Step {fundingStep + 1} of 4
            </span>
          </div>
          <ProgressBar current={fundingStep + 1} total={4} />
        </div>

        {/* Q1: Credit Score */}
        {fundingStep === 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#192526' }}>
              What's your approximate credit score?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B717A' }}>
              This helps us match you with the right loan options.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {CREDIT_SCORE_OPTIONS.map((score) => {
                const isSelected = fundingAnswers.creditScore === score
                return (
                  <button
                    key={score}
                    onClick={() => handleCreditScore(score)}
                    className="py-3 px-4 rounded-lg border text-sm font-medium text-left transition-all duration-150"
                    style={{
                      borderColor: isSelected ? '#192526' : '#DADFE3',
                      backgroundColor: isSelected ? '#f0efff' : '#ffffff',
                      color: isSelected ? '#192526' : '#2F3637',
                      cursor: 'pointer',
                    }}
                  >
                    {score}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Q2: Monthly Revenue */}
        {fundingStep === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#192526' }}>
              What's your average monthly revenue?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B717A' }}>
              Enter your typical monthly gross revenue.
            </p>
            <div>
              <NumericFormat
                value={monthlyRevenue || ''}
                onValueChange={(vals) => {
                  setMonthlyRevenue(vals.floatValue ?? 0)
                  setRevenueError('')
                }}
                thousandSeparator=","
                prefix="$"
                placeholder="$0"
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: revenueError ? '#d9534f' : '#DADFE3',
                  fontSize: '18px',
                  fontWeight: 600,
                }}
                allowNegative={false}
              />
              {revenueError && (
                <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                  {revenueError}
                </p>
              )}
            </div>
            <button style={nextBtnStyle} onClick={handleRevenue}>
              Next →
            </button>
          </div>
        )}

        {/* Q3: Loan Amount */}
        {fundingStep === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#192526' }}>
              How much funding are you looking for?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B717A' }}>
              Enter the total amount you'd like to borrow.
            </p>
            <div>
              <NumericFormat
                value={loanAmount || ''}
                onValueChange={(vals) => {
                  setLoanAmount(vals.floatValue ?? 0)
                  setLoanError('')
                }}
                thousandSeparator=","
                prefix="$"
                placeholder="$0"
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: loanError ? '#d9534f' : '#DADFE3',
                  fontSize: '18px',
                  fontWeight: 600,
                }}
                allowNegative={false}
              />
              {loanError && (
                <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                  {loanError}
                </p>
              )}
            </div>
            <button style={nextBtnStyle} onClick={handleLoanAmount}>
              Next →
            </button>
          </div>
        )}

        {/* Q4: Use of Funds */}
        {fundingStep === 3 && (
          <div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#192526' }}>
              How do you plan to use the funds?
            </h2>
            <p className="text-sm mb-6" style={{ color: '#6B717A' }}>
              Select all that apply.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {USE_OF_FUNDS_OPTIONS.map(({ label, emoji }) => {
                const isSelected = selectedFunds.includes(label)
                return (
                  <button
                    key={label}
                    onClick={() => toggleFund(label)}
                    className="py-3 px-4 rounded-lg border text-sm font-medium text-left transition-all duration-150"
                    style={{
                      borderColor: isSelected ? '#192526' : '#DADFE3',
                      backgroundColor: isSelected ? '#f0efff' : '#ffffff',
                      color: isSelected ? '#192526' : '#2F3637',
                      cursor: 'pointer',
                    }}
                  >
                    <span className="mr-2">{emoji}</span>
                    {label}
                  </button>
                )
              })}
            </div>
            {fundsError && (
              <p className="text-xs mt-2" style={{ color: '#d9534f' }}>
                {fundsError}
              </p>
            )}
            <button style={nextBtnStyle} onClick={handleUseFunds}>
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
