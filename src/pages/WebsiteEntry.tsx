import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useApplicationStore } from '../store/useApplicationStore'
import { runIntakeSearch } from '../lib/claudeIntakeSearch'

const DEMO_BUSINESSES = [
  {
    label: 'ProvenCrown Builders LLC',
    businessPhone: '(773) 490-8442',
    businessCity: 'Chicago',
    businessState: 'IL',
    websiteUrl: 'https://provencrown.com/',
  },
  {
    label: 'Wee Folk Childcare',
    businessPhone: '(701) 220-4921',
    businessCity: 'Bismarck',
    businessState: 'ND',
    websiteUrl: 'https://weefolkbismarck.com/',
  },
  {
    label: 'Thompson Rock Landscaping',
    businessPhone: '(801) 688-3058',
    businessCity: 'Murray',
    businessState: 'UT',
    websiteUrl: 'https://www.landscapingmurray.com/',
  },
]

const websiteSchema = z.object({
  websiteUrl: z.string().min(1, 'Website URL is required'),
})

const phoneSchema = z.object({
  businessPhone: z.string().min(1, 'Phone number is required'),
})

type WebsiteValues = z.infer<typeof websiteSchema>
type PhoneValues = z.infer<typeof phoneSchema>

export default function WebsiteEntry() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'website' | 'phone'>('website')
  const [isSearching, setIsSearching] = useState(false)
  const [loadProgress, setLoadProgress] = useState(0)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const { setWebsiteEntry, resetApplication } = useApplicationStore()

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    }
  }, [])

  const websiteForm = useForm<WebsiteValues>({
    resolver: zodResolver(websiteSchema),
  })

  const phoneForm = useForm<PhoneValues>({
    resolver: zodResolver(phoneSchema),
  })

  const startSearch = async (input: { websiteUrl?: string; phoneNumber?: string }) => {
    setIsSearching(true)
    setLoadProgress(0)
    const startTime = Date.now()
    // Asymptotic easing: fast start, slow crawl toward 95% max
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const pct = 95 * (1 - Math.exp(-elapsed / 12000))
      setLoadProgress(pct)
    }, 100)

    await runIntakeSearch(input, useApplicationStore.getState())

    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    setLoadProgress(100)
    // Brief pause so the bar visually completes before navigating
    await new Promise((r) => setTimeout(r, 300))
    navigate('/business-info')
  }

  const onSubmitWebsite = async (data: WebsiteValues) => {
    resetApplication()
    setWebsiteEntry({ type: 'website', value: data.websiteUrl })
    await startSearch({ websiteUrl: data.websiteUrl })
  }

  const onSubmitPhone = async (data: PhoneValues) => {
    resetApplication()
    setWebsiteEntry({ type: 'phone', value: data.businessPhone })
    await startSearch({ phoneNumber: data.businessPhone })
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

  if (isSearching) {
    return (
      <div className="flex justify-center py-8">
        <div
          className="w-full bg-white rounded-2xl shadow-sm border p-8"
          style={{ maxWidth: '560px', borderColor: '#DADFE3' }}
        >
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-2" style={{ color: '#192526' }}>
              Looking up your business…
            </h1>
            <p className="text-sm" style={{ color: '#6B717A' }}>
              We're searching public sources to find your business information.
            </p>
          </div>
          <div className="mb-6">
            <div
              className="w-full rounded-full overflow-hidden"
              style={{ height: '8px', backgroundColor: '#EAEBEB' }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${loadProgress}%`,
                  backgroundColor: '#0800A6',
                  transition: 'width 80ms linear',
                }}
              />
            </div>
          </div>
          <p className="text-xs text-center" style={{ color: '#9CA3AF' }}>
            This takes just a few seconds…
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 items-start justify-center py-8">
      <div
        className="w-full bg-white rounded-2xl shadow-sm border p-8"
        style={{ maxWidth: '560px', borderColor: '#DADFE3' }}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2" style={{ color: '#192526' }}>
            Let's find your business
          </h1>
          <p className="text-sm" style={{ color: '#6B717A' }}>
            {mode === 'website'
              ? "Enter your business website and we'll look up your business details automatically."
              : "Enter your business phone number and we'll search for your business information."}
          </p>
        </div>

        {mode === 'website' ? (
          <form onSubmit={websiteForm.handleSubmit(onSubmitWebsite)} noValidate>
            <div className="space-y-5">
              <div>
                <label className={labelClass} style={labelStyle}>
                  Business Website <span style={{ color: '#d9534f' }}>*</span>
                </label>
                <input
                  {...websiteForm.register('websiteUrl')}
                  type="url"
                  placeholder="https://www.yourbusiness.com"
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    borderColor: websiteForm.formState.errors.websiteUrl ? '#d9534f' : '#DADFE3',
                  }}
                />
                {websiteForm.formState.errors.websiteUrl && (
                  <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                    {websiteForm.formState.errors.websiteUrl.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('phone')
                    websiteForm.reset()
                  }}
                  className="text-sm underline"
                  style={{ color: '#4338CA', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  I don't have a website
                </button>
              </div>

              <button
                type="submit"
                disabled={websiteForm.formState.isSubmitting}
                className="w-full py-3 px-6 rounded-lg text-white font-semibold text-sm transition-all duration-150 mt-2"
                style={{
                  backgroundColor: '#192526',
                  cursor: websiteForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: websiteForm.formState.isSubmitting ? 0.7 : 1,
                }}
              >
                {websiteForm.formState.isSubmitting ? 'Searching...' : 'Find My Business →'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={phoneForm.handleSubmit(onSubmitPhone)} noValidate>
            <div className="space-y-5">
              <div>
                <label className={labelClass} style={labelStyle}>
                  Business Phone Number <span style={{ color: '#d9534f' }}>*</span>
                </label>
                <input
                  {...phoneForm.register('businessPhone')}
                  type="tel"
                  placeholder="(801) 555-1234"
                  className={inputClass}
                  style={{
                    ...inputStyle,
                    borderColor: phoneForm.formState.errors.businessPhone ? '#d9534f' : '#DADFE3',
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
                    phoneForm.register('businessPhone').onChange(e)
                  }}
                />
                {phoneForm.formState.errors.businessPhone && (
                  <p className="text-xs mt-1" style={{ color: '#d9534f' }}>
                    {phoneForm.formState.errors.businessPhone.message}
                  </p>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => {
                    setMode('website')
                    phoneForm.reset()
                  }}
                  className="text-sm underline"
                  style={{ color: '#4338CA', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  I have a website
                </button>
              </div>

              <button
                type="submit"
                disabled={phoneForm.formState.isSubmitting}
                className="w-full py-3 px-6 rounded-lg text-white font-semibold text-sm transition-all duration-150 mt-2"
                style={{
                  backgroundColor: '#192526',
                  cursor: phoneForm.formState.isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: phoneForm.formState.isSubmitting ? 0.7 : 1,
                }}
              >
                {phoneForm.formState.isSubmitting ? 'Searching...' : 'Find My Business →'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Demo business cards */}
      <div className="flex flex-col gap-3 pt-1" style={{ width: '220px', flexShrink: 0 }}>
        <p className="text-xs font-medium" style={{ color: '#6B717A' }}>Demo businesses</p>
        {DEMO_BUSINESSES.map((biz) => (
          <button
            key={biz.label}
            type="button"
            onClick={() => {
              if (mode === 'website') {
                websiteForm.setValue('websiteUrl', biz.websiteUrl)
              } else {
                phoneForm.setValue('businessPhone', biz.businessPhone)
              }
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
