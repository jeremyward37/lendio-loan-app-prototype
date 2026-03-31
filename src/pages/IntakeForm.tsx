import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useApplicationStore } from '../store/useApplicationStore'
import { useAgentStore } from '../store/useAgentStore'
import { runAgentSimulation } from '../lib/agentSimulator'
import type { IntakeFormData } from '../types'

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas',
  CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho',
  IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas',
  KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi',
  MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada',
  NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York',
  NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma',
  OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah',
  VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia',
  WI: 'Wisconsin', WY: 'Wyoming',
}

const schema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  businessCity: z.string().min(1, 'City is required'),
  businessState: z.string().min(1, 'State is required'),
  websiteUrl: z.string().optional().or(z.literal('')),
  ein: z.string().optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

export default function IntakeForm() {
  const navigate = useNavigate()
  const setIntake = useApplicationStore((s) => s.setIntake)
  const setCurrentScreen = useApplicationStore((s) => s.setCurrentScreen)
  const resetApplication = useApplicationStore((s) => s.resetApplication)
  const initAgents = useAgentStore((s) => s.initAgents)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormValues) => {
    const intake: IntakeFormData = {
      businessName: data.businessName,
      ownerName: data.ownerName,
      businessCity: data.businessCity,
      businessState: data.businessState,
      websiteUrl: data.websiteUrl || undefined,
      ein: data.ein || undefined,
    }

    // Reset all application state before starting fresh
    resetApplication()

    // Initialize agents fresh
    initAgents()

    // Save intake
    setIntake(intake)

    // Fire agent simulation (fire and forget)
    runAgentSimulation(intake, useAgentStore.getState(), useApplicationStore.getState())

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
    <div className="flex flex-col items-center py-8">
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

            {/* City + State row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={labelStyle}>
                  Business City <span style={{ color: '#d9534f' }}>*</span>
                </label>
                <input
                  {...register('businessCity')}
                  type="text"
                  placeholder="e.g. Salt Lake City"
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

              <div>
                <label className={labelClass} style={labelStyle}>
                  Business State <span style={{ color: '#d9534f' }}>*</span>
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
                  <option value="">Select state</option>
                  {US_STATES.map((abbr) => (
                    <option key={abbr} value={abbr}>
                      {abbr} — {STATE_NAMES[abbr]}
                    </option>
                  ))}
                </select>
                {errors.businessState && (
                  <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                    {errors.businessState.message}
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
    </div>
  )
}
