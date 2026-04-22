import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useApplicationStore } from '../store/useApplicationStore'
import type { ProfileData } from '../types'

const ENTITY_TYPES = ['Sole Proprietor', 'LLC', 'S-Corp', 'C-Corp', 'Partnership', 'Nonprofit']
const BANKRUPTCY_STATUSES = ['Discharged', 'Active', 'Dismissed']
const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

type FormValues = {
  businessStreet: string
  businessCity: string
  businessState: string
  businessZip: string
  ownerStreet: string
  ownerCity: string
  ownerState: string
  ownerZip: string
  businessStartDate: string
  numberOfLocations: string
  entityType: string
  ein: string
  numberOfEmployees: string
  isFranchise: string
  isNonprofit: string
  hasBankruptcy: string
  bankruptcyStatus: string
  businessIndustry: string
  naicsCode: string
}

function profileToForm(profile: ProfileData): FormValues {
  return {
    businessStreet: profile.businessStreet.value,
    businessCity: profile.businessCity.value,
    businessState: profile.businessState.value,
    businessZip: profile.businessZip.value,
    ownerStreet: profile.ownerStreet.value,
    ownerCity: profile.ownerCity.value,
    ownerState: profile.ownerState.value,
    ownerZip: profile.ownerZip.value,
    businessStartDate: profile.businessStartDate.value,
    numberOfLocations: profile.numberOfLocations.value,
    entityType: profile.entityType.value,
    ein: profile.ein.value,
    numberOfEmployees: profile.numberOfEmployees.value,
    isFranchise: profile.isFranchise.value,
    isNonprofit: profile.isNonprofit.value,
    hasBankruptcy: profile.hasBankruptcy.value,
    bankruptcyStatus: profile.bankruptcyStatus.value,
    businessIndustry: profile.businessIndustry.value,
    naicsCode: profile.naicsCode.value,
  }
}

function formToProfile(values: FormValues, sourceProfile: ProfileData): ProfileData {
  const updated = { ...sourceProfile }
  for (const key of Object.keys(values) as (keyof FormValues)[]) {
    updated[key as keyof ProfileData] = {
      ...sourceProfile[key as keyof ProfileData],
      value: values[key],
    }
  }
  return updated
}

const inputClass = `w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 transition-colors`

function getInputStyle(isEmpty: boolean, isAi: boolean): React.CSSProperties {
  if (isEmpty) return { borderColor: '#E8A020', color: '#2F3637' }
  if (isAi) return { borderColor: '#818CF8', color: '#2F3637', borderLeftWidth: '3px' }
  return { borderColor: '#DADFE3', color: '#2F3637' }
}

interface FieldProps {
  label: string
  isAi?: boolean
  children: React.ReactNode
}

function FieldWrapper({ label, isAi, children }: FieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: '#2F3637' }}>
        {label}
        {isAi && (
          <span
            className="inline-flex items-center text-xs font-medium"
            style={{ color: '#4338CA', fontSize: '10px' }}
          >
            ✦ AI
          </span>
        )}
      </label>
      {children}
    </div>
  )
}

const SectionHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4 pb-2 border-b" style={{ borderColor: '#EAEBEB' }}>
    <h3 className="text-base font-semibold" style={{ color: '#2F3637' }}>{children}</h3>
  </div>
)

const LOADER_MESSAGES: [number, string][] = [
  [0, 'Searching web sources for your business...'],
  [20, 'Checking business registrations and directories...'],
  [45, 'Analyzing findings...'],
  [70, 'Finalizing your business profile...'],
]
const SEARCH_TIMEOUT_SECONDS = 90

function SearchingLoader() {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setElapsed((s) => Math.min(s + 1, SEARCH_TIMEOUT_SECONDS))
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const msg = [...LOADER_MESSAGES].reverse().find(([t]) => elapsed >= t)![1]
  const progress = Math.min((elapsed / SEARCH_TIMEOUT_SECONDS) * 100, 100)

  return (
    <div className="flex flex-col items-center py-24">
      <div
        className="w-12 h-12 rounded-full border-4 animate-spin mb-6"
        style={{ borderColor: '#EAEBEB', borderTopColor: '#0800A6' }}
      />
      <h2 className="text-lg font-semibold mb-2" style={{ color: '#192526' }}>
        {msg}
      </h2>
      <p className="text-sm text-center mb-6" style={{ color: '#6B717A', maxWidth: '320px' }}>
        Our AI is pulling information from public sources about your business.
      </p>
      <div
        className="w-64 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: '#EAEBEB' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${progress}%`, backgroundColor: '#0800A6' }}
        />
      </div>
    </div>
  )
}

export default function ProfileReview() {
  const navigate = useNavigate()
  const resolvedProfile = useApplicationStore((s) => s.resolvedProfile)
  const confirmedProfile = useApplicationStore((s) => s.confirmedProfile)
  const profileSearchStatus = useApplicationStore((s) => s.profileSearchStatus)
  const intake = useApplicationStore((s) => s.intake)
  const setConfirmedProfile = useApplicationStore((s) => s.setConfirmedProfile)
  const setCurrentScreen = useApplicationStore((s) => s.setCurrentScreen)
  const [acknowledged, setAcknowledged] = useState(false)

  const sourceProfile = confirmedProfile ?? resolvedProfile

  const { register, handleSubmit, watch, reset } = useForm<FormValues>({
    defaultValues: sourceProfile ? profileToForm(sourceProfile) : undefined,
  })

  useEffect(() => {
    if (sourceProfile) reset(profileToForm(sourceProfile))
  }, [sourceProfile, reset])

  const watchedValues = watch()
  const hasBankruptcy = watchedValues.hasBankruptcy

  // A field is "AI" if it was found by AI AND the user hasn't changed it from the original value
  const isAiField = (key: keyof FormValues) => {
    const profileKey = key as keyof ProfileData
    if (!sourceProfile) return false
    if (!watchedValues[key]) return false
    const field = sourceProfile[profileKey]
    return field.found && watchedValues[key] === field.value
  }

  // A field is empty if the AI didn't find a value AND the user hasn't filled it in
  const isEmpty = (key: keyof FormValues) =>
    !!(sourceProfile && !sourceProfile[key as keyof ProfileData].found && !watchedValues[key])

  const fieldProps = (key: keyof FormValues) => ({
    isAi: isAiField(key),
    isEmpty: isEmpty(key),
  })

  const onSubmit = (data: FormValues) => {
    if (!sourceProfile || !acknowledged) return
    setConfirmedProfile(formToProfile(data, sourceProfile))
    setCurrentScreen(4)
    navigate('/loan-products')
  }

  if (!resolvedProfile || profileSearchStatus === 'searching') {
    return <SearchingLoader />
  }

  return (
    <div className="flex flex-col items-center py-8">
      <div
        className="w-full bg-white rounded-2xl shadow-sm border p-8"
        style={{ maxWidth: '720px', borderColor: '#DADFE3' }}
      >
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#192526' }}>
            Review your business profile
          </h1>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            Review the details below and correct anything that looks wrong before continuing.
          </p>
        </div>

        {/* AI banner */}
        <div
          className="flex items-start gap-3 p-4 rounded-xl mb-8 text-sm"
          style={{ background: '#EEF2FF', border: '1px solid #C7D2FE' }}
        >
          {/* <span style={{ color: '#4338CA', fontSize: '16px', lineHeight: 1.4 }}>✦</span> */}
          <p style={{ color: '#3730A3' }}>
            Fields marked <strong>✦ AI</strong> were collected from public sources using AI, please ensure they are accurate. 
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Business Details */}
          <div className="mb-8">
            <SectionHeader>Business Details</SectionHeader>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: '#2F3637' }}>
                  Business Name
                </label>
                <div
                  className={inputClass}
                  style={{ borderColor: '#DADFE3', color: '#2F3637', backgroundColor: '#F8FAFC' }}
                >
                  {intake?.businessName}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FieldWrapper label="Business Street" {...fieldProps('businessStreet')}>
                  <input
                    {...register('businessStreet')}
                    type="text"
                    placeholder="Street address"
                    className={inputClass}
                    style={getInputStyle(isEmpty('businessStreet'), isAiField('businessStreet'))}
                  />
                </FieldWrapper>
                <div className="grid grid-cols-3 gap-4">
                  <FieldWrapper label="City" {...fieldProps('businessCity')}>
                    <input
                      {...register('businessCity')}
                      type="text"
                      placeholder="City"
                      className={inputClass}
                      style={getInputStyle(isEmpty('businessCity'), isAiField('businessCity'))}
                    />
                  </FieldWrapper>
                  <FieldWrapper label="State" {...fieldProps('businessState')}>
                    <select {...register('businessState')} className={inputClass} style={getInputStyle(isEmpty('businessState'), isAiField('businessState'))}>
                      <option value="">Select</option>
                      {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </FieldWrapper>
                  <FieldWrapper label="ZIP Code" {...fieldProps('businessZip')}>
                    <input
                      {...register('businessZip')}
                      type="text"
                      placeholder="ZIP code"
                      className={inputClass}
                      style={getInputStyle(isEmpty('businessZip'), isAiField('businessZip'))}
                    />
                  </FieldWrapper>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FieldWrapper label="Business Start Date" {...fieldProps('businessStartDate')}>
                  <input
                    {...register('businessStartDate')}
                    type="date"
                    className={inputClass}
                    style={getInputStyle(isEmpty('businessStartDate'), isAiField('businessStartDate'))}
                  />
                </FieldWrapper>
                <FieldWrapper label="Number of Locations" {...fieldProps('numberOfLocations')}>
                  <input
                    {...register('numberOfLocations')}
                    type="number"
                    min="1"
                    placeholder="1"
                    className={inputClass}
                    style={getInputStyle(isEmpty('numberOfLocations'), isAiField('numberOfLocations'))}
                  />
                </FieldWrapper>
              </div>

              <FieldWrapper label="Entity Type" {...fieldProps('entityType')}>
                <select {...register('entityType')} className={inputClass} style={getInputStyle(isEmpty('entityType'), isAiField('entityType'))}>
                  <option value="">Select entity type</option>
                  {ENTITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </FieldWrapper>
            </div>
          </div>

          {/* Owner Details */}
          <div className="mb-8">
            <SectionHeader>Owner Details</SectionHeader>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium mb-1.5" style={{ color: '#2F3637' }}>
                  Owner Name
                </label>
                <div
                  className={inputClass}
                  style={{ borderColor: '#DADFE3', color: '#2F3637', backgroundColor: '#F8FAFC' }}
                >
                  {intake?.ownerName}
                </div>
              </div>
              <FieldWrapper label="Owner Street" {...fieldProps('ownerStreet')}>
                <input
                  {...register('ownerStreet')}
                  type="text"
                  placeholder="Street address"
                  className={inputClass}
                  style={getInputStyle(isEmpty('ownerStreet'), isAiField('ownerStreet'))}
                />
              </FieldWrapper>
              <div className="grid grid-cols-3 gap-4">
                <FieldWrapper label="City" {...fieldProps('ownerCity')}>
                  <input
                    {...register('ownerCity')}
                    type="text"
                    placeholder="City"
                    className={inputClass}
                    style={getInputStyle(isEmpty('ownerCity'), isAiField('ownerCity'))}
                  />
                </FieldWrapper>
                <FieldWrapper label="State" {...fieldProps('ownerState')}>
                  <select {...register('ownerState')} className={inputClass} style={getInputStyle(isEmpty('ownerState'), isAiField('ownerState'))}>
                    <option value="">Select</option>
                    {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldWrapper>
                <FieldWrapper label="ZIP Code" {...fieldProps('ownerZip')}>
                  <input
                    {...register('ownerZip')}
                    type="text"
                    placeholder="ZIP"
                    className={inputClass}
                    style={getInputStyle(isEmpty('ownerZip'), isAiField('ownerZip'))}
                  />
                </FieldWrapper>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="mb-8">
            <SectionHeader>Business Information</SectionHeader>
            <div className="grid grid-cols-2 gap-4">
              <FieldWrapper label="Industry" {...fieldProps('businessIndustry')}>
                <input
                  {...register('businessIndustry')}
                  type="text"
                  placeholder="e.g. Department Stores"
                  className={inputClass}
                  style={getInputStyle(isEmpty('businessIndustry'), isAiField('businessIndustry'))}
                />
              </FieldWrapper>
              <FieldWrapper label="NAICS Code" {...fieldProps('naicsCode')}>
                <input
                  {...register('naicsCode')}
                  type="text"
                  placeholder="e.g. 455110"
                  className={inputClass}
                  style={getInputStyle(isEmpty('naicsCode'), isAiField('naicsCode'))}
                />
              </FieldWrapper>
              <FieldWrapper label="EIN" {...fieldProps('ein')}>
                <input
                  {...register('ein')}
                  type="text"
                  placeholder="XX-XXXXXXX"
                  className={inputClass}
                  style={getInputStyle(isEmpty('ein'), isAiField('ein'))}
                />
              </FieldWrapper>
              <FieldWrapper label="Number of Employees" {...fieldProps('numberOfEmployees')}>
                <input
                  {...register('numberOfEmployees')}
                  type="number"
                  min="0"
                  placeholder="e.g. 12"
                  className={inputClass}
                  style={getInputStyle(isEmpty('numberOfEmployees'), isAiField('numberOfEmployees'))}
                />
              </FieldWrapper>
              <FieldWrapper label="Is the business a franchise?" {...fieldProps('isFranchise')}>
                <select {...register('isFranchise')} className={inputClass} style={getInputStyle(isEmpty('isFranchise'), isAiField('isFranchise'))}>
                  <option value="">Select</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </FieldWrapper>
              <FieldWrapper label="Is the business a nonprofit?" {...fieldProps('isNonprofit')}>
                <select {...register('isNonprofit')} className={inputClass} style={getInputStyle(isEmpty('isNonprofit'), isAiField('isNonprofit'))}>
                  <option value="">Select</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </FieldWrapper>
            </div>
          </div>

          {/* Legal & Financial History */}
          <div className="mb-8">
            <SectionHeader>Legal &amp; Financial History</SectionHeader>
            <div className="grid grid-cols-1 gap-4">
              <FieldWrapper label="Has the business or owner had a bankruptcy?" {...fieldProps('hasBankruptcy')}>
                <select {...register('hasBankruptcy')} className={inputClass} style={getInputStyle(isEmpty('hasBankruptcy'), isAiField('hasBankruptcy'))}>
                  <option value="">Select</option>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </FieldWrapper>
              {hasBankruptcy === 'Yes' && (
                <FieldWrapper label="Bankruptcy Status" {...fieldProps('bankruptcyStatus')}>
                  <select {...register('bankruptcyStatus')} className={inputClass} style={getInputStyle(isEmpty('bankruptcyStatus'), isAiField('bankruptcyStatus'))}>
                    <option value="">Select status</option>
                    {BANKRUPTCY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FieldWrapper>
              )}
            </div>
          </div>

          {/* Acknowledgment */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl mb-6"
            style={{ background: '#F8FAFC', border: '1px solid #DADFE3' }}
          >
            <input
              type="checkbox"
              id="ack"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              className="mt-0.5 w-4 h-4 flex-shrink-0"
              style={{ accentColor: '#192526', cursor: 'pointer' }}
            />
            <label htmlFor="ack" className="text-sm leading-relaxed" style={{ color: '#2F3637', cursor: 'pointer' }}>
              I've reviewed the AI-collected fields above and confirmed they're correct.
            </label>
          </div>

          <button
            type="submit"
            disabled={!acknowledged}
            className="w-full py-3 px-6 rounded-lg text-white font-semibold text-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#192526' }}
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
