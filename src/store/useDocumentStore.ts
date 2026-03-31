import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { DocumentRecord, DelegationRecord, LoanProductId } from '../types'
import { getRequiredDocuments } from '../data/documentMatrix'

interface DocumentState {
  documents: Record<string, DocumentRecord>
  delegations: Record<string, DelegationRecord>

  initDocuments: (selectedProductIds: LoanProductId[]) => void
  updateDocument: (id: string, update: Partial<DocumentRecord>) => void
  addDelegation: (delegation: DelegationRecord) => void
  markDelegationComplete: (sessionId: string) => void
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set) => ({
      documents: {},
      delegations: {},

      initDocuments: (selectedProductIds) => {
        const docs = getRequiredDocuments(selectedProductIds)
        const docMap: Record<string, DocumentRecord> = {}
        for (const doc of docs) {
          docMap[doc.id] = doc
        }
        set({ documents: docMap })
      },

      updateDocument: (id, update) =>
        set((state) => ({
          documents: {
            ...state.documents,
            [id]: { ...state.documents[id], ...update },
          },
        })),

      addDelegation: (delegation) =>
        set((state) => ({
          delegations: {
            ...state.delegations,
            [delegation.sessionId]: delegation,
          },
        })),

      markDelegationComplete: (sessionId) =>
        set((state) => ({
          delegations: {
            ...state.delegations,
            [sessionId]: { ...state.delegations[sessionId], completed: true },
          },
        })),
    }),
    {
      name: 'lendio-document-storage',
    }
  )
)
