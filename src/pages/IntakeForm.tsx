const DEMO_BUSINESSES = [
  {
    label: 'ProvenCrown Builders LLC',
    businessName: 'ProvenCrown Builders LLC',
    ownerName: 'Damion Perry',
    businessPhone: '(773) 490-8442',
    businessCity: 'Chicago',
    businessState: 'IL',
    businessZip: '60646',
    websiteUrl: 'https://provencrown.com/',
  },
  {
    label: 'Wee Folk Childcare',
    businessName: 'Wee Folk Childcare',
    ownerName: 'Sheila Morris',
    businessPhone: '(701) 220-4921',
    businessCity: 'Bismarck',
    businessState: 'ND',
    businessZip: '58504',
    websiteUrl: 'https://weefolkbismarck.com/',
  },
  {
    label: 'Hoffmeister Security LLC',
    businessName: 'Hoffmeister Security LLC',
    ownerName: 'Corey Hoffmeister',
    businessPhone: '(502) 698-3114',
    businessCity: 'Clarksville',
    businessState: 'IN',
    businessZip: '47129',
    websiteUrl: '',
  },
  {
    label: 'Hartford Shell LLC',
    businessName: 'Hartford Shell LLC',
    ownerName: 'Baburam Sapkota',
    businessPhone: '(312) 961-0882',
    businessCity: 'Hartford',
    businessState: 'WI',
    businessZip: '53027',
    websiteUrl: '',
  },
  {
    label: 'Thompson Rock Landscaping',
    businessName: 'Thompson Rock Landscaping',
    ownerName: 'James Thompson',
    businessPhone: '(801) 688-3058',
    businessCity: 'Murray',
    businessState: 'UT',
    businessZip: '84123',
    websiteUrl: 'https://www.landscapingmurray.com/',
  },
  {
    label: 'AAA Marine Salvage LLC',
    businessName: 'AAA MARINE SALVAGE LLC',
    ownerName: 'Raquel Gonzalez',
    businessPhone: '(239) 850-9889',
    businessCity: 'Fort Myers',
    businessState: 'FL',
    businessZip: '33967',
    websiteUrl: '',
  },
]

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
  websiteUrl: z.string().optional().or(z.literal('')),
  ein: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function IntakeForm() {
  const navigate = useNavigate()
  const setIntake = useApplicationStore((s) => s.setIntake)
  const setCurrentScreen = useApplicationStore((s) => s.setCurrentScreen)
  const resetApplication = useApplicationStore((s) => s.resetApplication)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    const intake: IntakeFormData = {
      businessName: data.businessName,
      ownerName: data.ownerName,
      businessPhone: data.businessPhone,
      businessCity: data.businessCity,
      businessState: data.businessState,
      businessZip: data.businessZip,
      websiteUrl: data.websiteUrl || undefined,
      ein: data.ein || undefined,
    }

    // Reset all application state before starting fresh
    resetApplication()

    // Save intake
    setIntake(intake)

    // Fire profile search (fire and forget)
    runProfileSearch(intake, useApplicationStore.getState())

    // Navigate to funding questions
    setCurrentScreen(2)
    navigate('/funding-questions')
  }

  const inputClass = `
    w-full px-3 py-2.5 rounded-lg border text-sm
    focus:outline-none focus:ring-2
    transition-colors duration-150
  `
  const inputStyle = {
    borderColor: '#DADFE3',
    color: '#2F3637',
    backgroundColor: '#ffffff',
  }

  const labelClass = 'block text-sm font-medium mb-1.5'
  const labelStyle = { color: '#2F3637' }

  return (
    <div className="flex gap-6 items-start justify-center py-8">
      <div
        className="w-full bg-white rounded-2xl shadow-sm border p-8"
        style={{ maxWidth: '560px', borderColor: '#DADFE3' }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#192526' }}>
            Tell us about your business
          </h1>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            We'll use this to look up your business profile and match you with loan options.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-5">
            {/* Business Name */}
            <div>
              <label className={labelClass} style={labelStyle}>
                Business Name <span style={{ color: '#d9534f' }}>*</span>
              </label>
              <input
                {...register('businessName')}
                type="text"
                placeholder="e.g. Acme Corp"
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: errors.businessName ? '#d9534f' : '#DADFE3',
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
              </label>
              <input
                {...register('ownerName')}
                type="text"
                placeholder="e.g. Jane Smith"
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: errors.ownerName ? '#d9534f' : '#DADFE3',
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
              </label>
              <input
                {...register('businessPhone')}
                type="tel"
                placeholder="(801) 555-1234"
                className={inputClass}
                style={{
                  ...inputStyle,
                  borderColor: errors.businessPhone ? '#d9534f' : '#DADFE3',
                }}
                onChange={(e) => {
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
                </label>
                <input
                  {...register('businessCity')}
                  type="text"
                  placeholder="e.g. Provo"
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    borderColor: errors.businessCity ? '#d9534f' : '#DADFE3',
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
                </label>
                <select
                  {...register('businessState')}
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    borderColor: errors.businessState ? '#d9534f' : '#DADFE3',
                    cursor: 'pointer',
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
                </label>
                <input
                  {...register('businessZip')}
                  type="text"
                  placeholder="e.g. 84601"
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    borderColor: errors.businessZip ? '#d9534f' : '#DADFE3',
                  }}
                />
                {errors.businessZip && (
                  <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                    {errors.businessZip.message}
                  </p>
                )}
              </div>
            </div>

            {/* Website URL (optional) */}
            <div>
              <label className={labelClass} style={labelStyle}>
                Website URL{' '}
                <span className="font-normal text-xs" style={{ color: '#6B717A' }}>
                  (optional)
                </span>
              </label>
              <input
                {...register('websiteUrl')}
                type="url"
                placeholder="https://www.yourbusiness.com"
                className={inputClass}
                style={inputStyle}
              />
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
                style={inputStyle}
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

      {/* Demo business cards */}
      <div className="flex flex-col gap-3 pt-1" style={{ width: '220px', flexShrink: 0 }}>
        <p className="text-xs font-medium" style={{ color: '#6B717A' }}>Demo businesses</p>
        {DEMO_BUSINESSES.map((biz) => (
          <button
            key={biz.label}
            type="button"
            onClick={() => {
              setValue('businessName', biz.businessName)
              setValue('ownerName', biz.ownerName)
              setValue('businessPhone', biz.businessPhone)
              setValue('businessCity', biz.businessCity)
              setValue('businessState', biz.businessState)
              setValue('businessZip', biz.businessZip)
              setValue('websiteUrl', biz.websiteUrl)
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg border transition-colors hover:border-gray-400"
            style={{ borderColor: '#DADFE3', backgroundColor: '#ffffff', cursor: 'pointer' }}
          >
            <p className="font-medium text-xs leading-snug" style={{ color: '#192526' }}>{biz.label}</p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{biz.businessCity}, {biz.businessState}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
