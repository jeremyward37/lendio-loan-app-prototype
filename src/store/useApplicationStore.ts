import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  IntakeFormData,
  FundingAnswers,
  ProfileData,
  LoanProductId,
  AppScreen,
} from '../types'

interface ApplicationState {
  intake: IntakeFormData | null
  fundingAnswers: Partial<FundingAnswers>
  fundingStep: number
  resolvedProfile: ProfileData | null
  confirmedProfile: ProfileData | null
  selectedProductIds: LoanProductId[]
  currentScreen: AppScreen

  setIntake: (intake: IntakeFormData) => void
  setFundingAnswer: (key: keyof FundingAnswers, value: FundingAnswers[keyof FundingAnswers]) => void
  nextFundingStep: () => void
  setResolvedProfile: (profile: ProfileData) => void
  setConfirmedProfile: (profile: ProfileData) => void
  setSelectedProductIds: (ids: LoanProductId[]) => void
  setCurrentScreen: (screen: AppScreen) => void
  resetApplication: () => void
}

const initialState = {
  intake: null,
  fundingAnswers: {},
  fundingStep: 0,
  resolvedProfile: null,
  confirmedProfile: null,
  selectedProductIds: [],
  currentScreen: 1 as AppScreen,
}

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set) => ({
      ...initialState,

      setIntake: (intake) => set({ intake }),

      setFundingAnswer: (key, value) =>
        set((state) => ({
          fundingAnswers: { ...state.fundingAnswers, [key]: value },
        })),

      nextFundingStep: () =>
        set((state) => ({ fundingStep: state.fundingStep + 1 })),

      setResolvedProfile: (profile) => set({ resolvedProfile: profile }),

      setConfirmedProfile: (profile) => set({ confirmedProfile: profile }),

      setSelectedProductIds: (ids) => set({ selectedProductIds: ids }),

      setCurrentScreen: (screen) => set({ currentScreen: screen }),

      resetApplication: () => set(initialState),
    }),
    {
      name: 'lendio-application-storage',
    }
  )
)
