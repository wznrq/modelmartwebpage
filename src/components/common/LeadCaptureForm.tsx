import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Mail, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useLanguage } from '@/i18n/LanguageContext'

const LEAD_STORAGE_KEY = 'modelmart-business-leads'
type LeadIntent = 'tco' | 'procurement' | 'alerts' | 'partnership'

interface LeadCaptureFormProps {
  source?: string | null
}

interface LeadPayload {
  company: string
  contact: string
  spendRange: string
  intent: string
  message: string
  source: string
  createdAt: string
}

function getDefaultIntent(source?: string | null): LeadIntent {
  if (source === 'partnership') return 'partnership'
  if (source === 'alerts') return 'alerts'
  if (source?.startsWith('provider:')) return 'procurement'
  return 'tco'
}

export function LeadCaptureForm({ source }: LeadCaptureFormProps) {
  const { t } = useLanguage()
  const salesEmail = import.meta.env.VITE_SALES_EMAIL || 'contact@modelmart.ai'
  const [company, setCompany] = useState('')
  const [contact, setContact] = useState('')
  const [spendRange, setSpendRange] = useState('1k-10k')
  const [intent, setIntent] = useState<LeadIntent>(getDefaultIntent(source))
  const [message, setMessage] = useState(source ? t('business.form.prefill', { source }) : '')
  const [errors, setErrors] = useState<{ company?: string; contact?: string }>({})
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    setIntent(getDefaultIntent(source))
    setMessage(source ? t('business.form.prefill', { source }) : '')
  }, [source, t])

  const spendOptions = useMemo(
    () => [
      { value: '1k-10k', label: t('business.form.spend.1k10k') },
      { value: '10k-50k', label: t('business.form.spend.10k50k') },
      { value: '50k-100k', label: t('business.form.spend.50k100k') },
      { value: '100k+', label: t('business.form.spend.100k') },
    ],
    [t],
  )

  const intentOptions = useMemo(
    () => [
      { value: 'tco', label: t('business.form.intent.tco') },
      { value: 'procurement', label: t('business.form.intent.procurement') },
      { value: 'alerts', label: t('business.form.intent.alerts') },
      { value: 'partnership', label: t('business.form.intent.partnership') },
    ],
    [t],
  )

  const saveLead = (lead: LeadPayload) => {
    const raw = localStorage.getItem(LEAD_STORAGE_KEY)
    let existing: LeadPayload[] = []

    if (raw) {
      try {
        existing = JSON.parse(raw)
      } catch {
        existing = []
      }
    }

    localStorage.setItem(LEAD_STORAGE_KEY, JSON.stringify([lead, ...existing].slice(0, 50)))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: typeof errors = {}

    if (!company.trim()) nextErrors.company = t('business.form.error.company')
    if (!contact.trim()) nextErrors.contact = t('business.form.error.contact')

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    const lead: LeadPayload = {
      company: company.trim(),
      contact: contact.trim(),
      spendRange,
      intent,
      message: message.trim(),
      source: source || 'business',
      createdAt: new Date().toISOString(),
    }

    saveLead(lead)
    setSubmitted(true)

    const subject = encodeURIComponent(`[ModelMart] ${t('business.form.mailSubject')} - ${lead.company}`)
    const body = encodeURIComponent(
      [
        `${t('business.form.company')}: ${lead.company}`,
        `${t('business.form.contact')}: ${lead.contact}`,
        `${t('business.form.spend')}: ${spendOptions.find((option) => option.value === spendRange)?.label || spendRange}`,
        `${t('business.form.intent')}: ${intentOptions.find((option) => option.value === intent)?.label || intent}`,
        `${t('business.form.source')}: ${lead.source}`,
        '',
        lead.message || t('business.form.noMessage'),
      ].join('\n'),
    )

    window.location.href = `mailto:${salesEmail}?subject=${subject}&body=${body}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        value={company}
        onChange={(event) => setCompany(event.target.value)}
        placeholder={t('business.form.companyPlaceholder')}
        error={errors.company}
        className="font-mono"
      />
      <Input
        value={contact}
        onChange={(event) => setContact(event.target.value)}
        placeholder={t('business.form.contactPlaceholder')}
        icon={<Mail className="h-4 w-4" />}
        error={errors.contact}
        className="font-mono"
      />
      <div className="grid sm:grid-cols-2 gap-3">
        <Select value={spendRange} onChange={(event) => setSpendRange(event.target.value)} className="font-mono">
          {spendOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select value={intent} onChange={(event) => setIntent(event.target.value as LeadIntent)} className="font-mono">
          {intentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder={t('business.form.messagePlaceholder')}
        rows={4}
        className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      />
      <Button type="submit" className="w-full gap-2 font-mono">
        <Send className="h-4 w-4" />
        {t('business.form.submit')}
      </Button>
      {submitted && (
        <p className="text-xs text-primary font-mono">
          {t('business.form.saved')}
        </p>
      )}
      <p className="text-[11px] text-muted-foreground font-mono">
        {t('business.form.storageNote', { email: salesEmail })}
      </p>
    </form>
  )
}
