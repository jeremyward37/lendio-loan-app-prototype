import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useApplicationStore } from '../store/useApplicationStore'
import { runProfileSearch } from '../lib/claudeProfileSearch'
import type { IntakeFormData } from '../types'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  businessPhone: z.string().min(1, 'Phone number is required'),
  businessCity: z.string().min(1, 'City is required'),
  businessState: z.string().min(1, 'State is required'),
  businessZip: z.string().min(5, 'ZIP code is required'),
  ein: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>
type IntakeField = keyof Omit<FormValues, 'ein'>

export default function IntakeForm() {
  const navigate = useNavigate()
  const setIntake = useApplicationStore((s) => s.setIntake)
  const setCurrentScreen = useApplicationStore((s) => s.setCurrentScreen)
  const intakeSearchStatus = useApplicationStore((s) => s.intakeSearchStatus)
  const intakeSearchResult = useApplicationStore((s) => s.intakeSearchResult)
  const websiteEntry = useApplicationStore((s) => s.websiteEntry)

  // Track which fields were AI-populated and haven't been edited
  const [aiFields, setAiFields] = useState<Set<IntakeField>>(new Set())

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const watchedValues = watch()

  // Pre-fill form from AI results when search completes
  useEffect(() => {
    if (intakeSearchStatus !== 'complete' || !intakeSearchResult) return

    const newAiFields = new Set<IntakeField>()
    const fieldMap: { result: keyof typeof intakeSearchResult; form: IntakeField }[] = [
      { result: 'businessName', form: 'businessName' },
      { result: 'ownerName', form: 'ownerName' },
      { result: 'businessPhone', form: 'businessPhone' },
      { result: 'businessCity', form: 'businessCity' },
      { result: 'businessState', form: 'businessState' },
      { result: 'businessZip', form: 'businessZip' },
    ]

    for (const { result, form } of fieldMap) {
      const field = intakeSearchResult[result]
      if (field.found && field.value) {
        setValue(form, field.value)
        newAiFields.add(form)
      }
    }
    setAiFields(newAiFields)
  }, [intakeSearchStatus, intakeSearchResult, setValue])

  const onSubmit = (data: FormValues) => {
    const intake: IntakeFormData = {
      businessName: data.businessName,
      ownerName: data.ownerName,
      businessPhone: data.businessPhone,
      businessCity: data.businessCity,
      businessState: data.businessState,
      businessZip: data.businessZip,
      websiteUrl: websiteEntry?.type === 'website' ? websiteEntry.value : undefined,
      ein: data.ein || undefined,
    }

    setIntake(intake)
    runProfileSearch(intake, useApplicationStore.getState())
    setCurrentScreen(2)
    navigate('/funding-questions')
  }

  const isAiField = (field: IntakeField): boolean => {
    if (!aiFields.has(field)) return false
    const currentValue = watchedValues[field]
    const originalValue = intakeSearchResult?.[field]?.value
    return currentValue === originalValue
  }

  const handleFieldChange = (field: IntakeField) => {
    setAiFields((prev) => {
      const next = new Set(prev)
      next.delete(field)
      return next
    })
  }

  const inputClass = `
    w-full px-3 py-2.5 rounded-lg border text-sm
    focus:outline-none focus:ring-2
    transition-colors duration-150
  `

  const getInputStyle = (field: IntakeField, hasError: boolean): React.CSSProperties => {
    if (hasError) return { borderColor: '#d9534f', color: '#2F3637', backgroundColor: '#ffffff' }
    if (isAiField(field)) return { borderColor: '#818CF8', borderLeftWidth: '3px', color: '#2F3637', backgroundColor: '#ffffff' }
    return { borderColor: '#DADFE3', color: '#2F3637', backgroundColor: '#ffffff' }
  }

  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: '#2F3637' }

  const AiBadge = ({ field }: { field: IntakeField }) =>
    isAiField(field) ? (
      <span
        className="inline-flex items-center ml-1.5 text-xs font-medium"
        style={{ color: '#4338CA', fontSize: '10px' }}
      >
        ✦ AI
      </span>
    ) : null

  const hasAnyAiField = (Object.keys(watchedValues) as IntakeField[]).some((f) => isAiField(f))

  return (
    <div className="flex gap-6 items-start justify-center py-8">
      <div
        className="w-full bg-white rounded-2xl shadow-sm border p-8"
        style={{ maxWidth: '560px', borderColor: '#DADFE3' }}
      >
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#192526' }}>
            Tell us about your business
          </h1>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            Confirm the details below and fill in anything we weren't able to find.
          </p>
        </div>

        {/* AI banner */}
        {hasAnyAiField && (
          <div
            className="flex items-start gap-2 rounded-lg px-4 py-3 mb-6 text-sm"
            style={{ backgroundColor: '#EEF2FF', color: '#3730A3' }}
          >
            <span style={{ fontSize: '14px', marginTop: '1px' }}>✦</span>
            <span>
              Fields marked <strong>✦ AI</strong> were pre-filled using public sources. Please confirm they're accurate.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5">
            {/* Business Name */}
            <div>
              <label className={labelClass} style={labelStyle}>
                Business Name <span style={{ color: '#d9534f' }}>*</span>
                <AiBadge field="businessName" />
              </label>
              <input
                {...register('businessName')}
                type="text"
                placeholder="e.g. Acme Corp"
                className={inputClass}
                style={getInputStyle('businessName', !!errors.businessName)}
                onChange={(e) => {
                  handleFieldChange('businessName')
                  register('businessName').onChange(e)
                }}
              />
              {errors.businessName && (
                <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Owner Name */}
            <div>
              <label className={labelClass} style={labelStyle}>
                Owner Name <span style={{ color: '#d9534f' }}>*</span>
                <AiBadge field="ownerName" />
              </label>
              <input
                {...register('ownerName')}
                type="text"
                placeholder="e.g. Jane Smith"
                className={inputClass}
                style={getInputStyle('ownerName', !!errors.ownerName)}
                onChange={(e) => {
                  handleFieldChange('ownerName')
                  register('ownerName').onChange(e)
                }}
              />
              {errors.ownerName && (
                <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                  {errors.ownerName.message}
                </p>
              )}
            </div>

            {/* Business Phone */}
            <div>
              <label className={labelClass} style={labelStyle}>
                Business Phone <span style={{ color: '#d9534f' }}>*</span>
                <AiBadge field="businessPhone" />
              </label>
              <input
                {...register('businessPhone')}
                type="tel"
                placeholder="(801) 555-1234"
                className={inputClass}
                style={getInputStyle('businessPhone', !!errors.businessPhone)}
                onChange={(e) => {
                  handleFieldChange('businessPhone')
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                  let formatted = digits
                  if (digits.length > 6) {
                    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
                  } else if (digits.length > 3) {
                    formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`
                  } else if (digits.length > 0) {
                    formatted = `(${digits}`
                  }
                  e.target.value = formatted
                  register('businessPhone').onChange(e)
                }}
              />
              {errors.businessPhone && (
                <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                  {errors.businessPhone.message}
                </p>
              )}
            </div>

            {/* City + State + ZIP row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className={labelClass} style={labelStyle}>
                  City <span style={{ color: '#d9534f' }}>*</span>
                  <AiBadge field="businessCity" />
                </label>
                <input
                  {...register('businessCity')}
                  type="text"
                  placeholder="e.g. Provo"
                  className={inputClass}
                  style={getInputStyle('businessCity', !!errors.businessCity)}
                  onChange={(e) => {
                    handleFieldChange('businessCity')
                    register('businessCity').onChange(e)
                  }}
                />
                {errors.businessCity && (
                  <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                    {errors.businessCity.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className={labelClass} style={labelStyle}>
                  State <span style={{ color: '#d9534f' }}>*</span>
                  <AiBadge field="businessState" />
                </label>
                <select
                  {...register('businessState')}
                  className={inputClass}
                  style={{
                    ...getInputStyle('businessState', !!errors.businessState),
                    cursor: 'pointer',
                  }}
                  onChange={(e) => {
                    handleFieldChange('businessState')
                    register('businessState').onChange(e)
                  }}
                >
                  <option value="">Select</option>
                  {US_STATES.map((abbr) => (
                    <option key={abbr} value={abbr}>
                      {abbr}
                    </option>
                  ))}
                </select>
                {errors.businessState && (
                  <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                    {errors.businessState.message}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className={labelClass} style={labelStyle}>
                  ZIP <span style={{ color: '#d9534f' }}>*</span>
                  <AiBadge field="businessZip" />
                </label>
                <input
                  {...register('businessZip')}
                  type="text"
                  placeholder="e.g. 84601"
                  className={inputClass}
                  style={getInputStyle('businessZip', !!errors.businessZip)}
                  onChange={(e) => {
                    handleFieldChange('businessZip')
                    register('businessZip').onChange(e)
                  }}
                />
                {errors.businessZip && (
                  <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                    {errors.businessZip.message}
                  </p>
                )}
              </div>
            </div>

            {/* EIN (optional) */}
            <div>
              <label className={labelClass} style={labelStyle}>
                EIN{' '}
                <span className="font-normal text-xs" style={{ color: '#6B717A' }}>
                  (optional)
                </span>
              </label>
              <input
                {...register('ein')}
                type="text"
                placeholder="XX-XXXXXXX"
                className={inputClass}
                style={{ borderColor: '#DADFE3', color: '#2F3637', backgroundColor: '#ffffff' }}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-lg text-white font-semibold text-sm transition-all duration-150 mt-2"
              style={{
                backgroundColor: '#192526',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Starting...' : 'Get Started →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
