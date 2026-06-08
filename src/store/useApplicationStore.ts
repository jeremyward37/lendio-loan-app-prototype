import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  IntakeFormData,
  FundingAnswers,
  ProfileData,
  IntakeSearchResult,
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
  profileSearchStatus: 'idle' | 'searching' | 'complete'
  websiteEntry: { type: 'website' | 'phone'; value: string } | null
  intakeSearchStatus: 'idle' | 'searching' | 'complete'
  intakeSearchResult: IntakeSearchResult | null

  setIntake: (intake: IntakeFormData) => void
  setFundingAnswer: (key: keyof FundingAnswers, value: FundingAnswers[keyof FundingAnswers]) => void
  nextFundingStep: () => void
  setResolvedProfile: (profile: ProfileData) => void
  setConfirmedProfile: (profile: ProfileData) => void
  setSelectedProductIds: (ids: LoanProductId[]) => void
  setCurrentScreen: (screen: AppScreen) => void
  setProfileSearchStatus: (status: 'idle' | 'searching' | 'complete') => void
  setWebsiteEntry: (entry: { type: 'website' | 'phone'; value: string }) => void
  setIntakeSearchStatus: (status: 'idle' | 'searching' | 'complete') => void
  setIntakeSearchResult: (result: IntakeSearchResult | null) => void
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
  profileSearchStatus: 'idle' as const,
  websiteEntry: null,
  intakeSearchStatus: 'idle' as const,
  intakeSearchResult: null,
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

      setProfileSearchStatus: (status) => set({ profileSearchStatus: status }),

      setWebsiteEntry: (entry) => set({ websiteEntry: entry }),

      setIntakeSearchStatus: (status) => set({ intakeSearchStatus: status }),

      setIntakeSearchResult: (result) => set({ intakeSearchResult: result }),

      resetApplication: () => set(initialState),
    }),
    {
      name: 'lendio-application-storage',
    }
  )
)
