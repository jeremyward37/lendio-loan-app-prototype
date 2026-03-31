import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { useDocumentStore } from '../../store/useDocumentStore'

interface Props {
  isOpen: boolean
  onClose: () => void
}

const BANKS = [
  { id: 'chase', name: 'Chase Bank', color: '#117ACA' },
  { id: 'bofa', name: 'Bank of America', color: '#E31837' },
  { id: 'wells', name: 'Wells Fargo', color: '#D71E28' },
  { id: 'citi', name: 'Citibank', color: '#003B87' },
  { id: 'us-bank', name: 'US Bank', color: '#002F6C' },
]

type Stage = 'choose' | 'connecting' | 'success'

export default function BankConnectModal({ isOpen, onClose }: Props) {
  const [stage, setStage] = useState<Stage>('choose')
  const [selectedBank, setSelectedBank] = useState<string | null>(null)
  const { documents, updateDocument } = useDocumentStore()

  function handleSelectBank(bankName: string) {
    setSelectedBank(bankName)
    setStage('connecting')

    setTimeout(() => {
      setStage('success')
    }, 2000)
  }

  function handleDone() {
    // Mark bank statement documents complete
    Object.values(documents).forEach((doc) => {
      if (doc.name.toLowerCase().includes('bank statement')) {
        updateDocument(doc.id, { status: 'complete', completedAt: Date.now() })
      }
    })
    setStage('choose')
    setSelectedBank(null)
    onClose()
  }

  function handleClose() {
    setStage('choose')
    setSelectedBank(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
          {stage === 'choose' && (
            <>
              <DialogTitle
                className="text-lg font-semibold mb-1"
                style={{ color: '#192526' }}
              >
                Connect your bank account
              </DialogTitle>
              <p className="text-sm mb-5" style={{ color: '#6B717A' }}>
                We'll securely retrieve your bank statements automatically.
              </p>

              <div className="space-y-2">
                {BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => handleSelectBank(bank.name)}
                    className="w-full flex items-center gap-3 px-4 py-3 border rounded-xl text-left hover:bg-gray-50 transition-colors"
                    style={{ borderColor: '#DADFE3' }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                      style={{ background: bank.color }}
                    >
                      {bank.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium" style={{ color: '#192526' }}>
                      {bank.name}
                    </span>
                    <svg
                      className="ml-auto"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M6 12l4-4-4-4"
                        stroke="#6B717A"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ))}
              </div>

              <button
                onClick={handleClose}
                className="mt-4 w-full py-2 text-sm text-center"
                style={{ color: '#6B717A' }}
              >
                Cancel
              </button>
            </>
          )}

          {stage === 'connecting' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div
                  className="w-12 h-12 border-4 rounded-full animate-spin"
                  style={{ borderColor: '#DADFE3', borderTopColor: '#0800A6' }}
                />
              </div>
              <DialogTitle
                className="text-lg font-semibold mb-2"
                style={{ color: '#192526' }}
              >
                Connecting to {selectedBank}...
              </DialogTitle>
              <p className="text-sm" style={{ color: '#6B717A' }}>
                Securely retrieving your bank statements
              </p>
            </div>
          )}

          {stage === 'success' && (
            <div className="text-center py-8">
              <div className="flex justify-center mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
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
              </div>
              <DialogTitle
                className="text-lg font-semibold mb-2"
                style={{ color: '#192526' }}
              >
                Connected!
              </DialogTitle>
              <p className="text-sm mb-6" style={{ color: '#6B717A' }}>
                Your bank statements have been retrieved.
              </p>
              <button
                onClick={handleDone}
                className="px-6 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ background: '#192526' }}
              >
                Done
              </button>
            </div>
          )}
        </DialogPanel>
      </div>
    </Dialog>
  )
}
