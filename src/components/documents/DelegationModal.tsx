import { useState } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { nanoid } from 'nanoid'
import toast from 'react-hot-toast'
import { useDocumentStore } from '../../store/useDocumentStore'

interface Props {
  documentId: string
  documentName: string
  isOpen: boolean
  onClose: () => void
}

export default function DelegationModal({ documentId, documentName, isOpen, onClose }: Props) {
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { addDelegation, updateDocument } = useDocumentStore()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)

    const sessionId = nanoid(12)
    addDelegation({
      sessionId,
      assigneeEmail: email.trim(),
      note: note.trim() || undefined,
      documentIds: [documentId],
      completed: false,
      createdAt: Date.now(),
    })
    updateDocument(documentId, {
      delegatedTo: email.trim(),
      delegationNote: note.trim() || undefined,
      delegationSessionId: sessionId,
    })

    toast.success(`Invitation sent to ${email.trim()}`)
    setEmail('')
    setNote('')
    setSubmitting(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel
          className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6"
          style={{ borderColor: '#DADFE3' }}
        >
          <DialogTitle className="text-lg font-semibold mb-1" style={{ color: '#192526' }}>
            Assign this document to someone else
          </DialogTitle>
          <p className="text-sm mb-5" style={{ color: '#6B717A' }}>
            {documentName}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="delegate-email"
                className="block text-sm font-medium mb-1"
                style={{ color: '#192526' }}
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="delegate-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2"
                style={{ borderColor: '#DADFE3', color: '#192526' }}
              />
            </div>

            <div>
              <label
                htmlFor="delegate-note"
                className="block text-sm font-medium mb-1"
                style={{ color: '#192526' }}
              >
                Note (optional)
              </label>
              <textarea
                id="delegate-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note for the assignee..."
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 resize-none"
                style={{ borderColor: '#DADFE3', color: '#192526' }}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium border"
                style={{ borderColor: '#DADFE3', color: '#6B717A' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-40"
                style={{ background: '#192526' }}
              >
                Send invitation
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
