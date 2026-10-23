import { Link, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowRight, Building2, Check, Handshake, LineChart, ShieldCheck, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LeadCaptureForm } from '@/components/common/LeadCaptureForm'
import { SEO } from '@/components/SEO'
import { providers } from '@/data/models'
import {
  commercialPlans,
  goToMarketMilestones,
  providerPartnerships,
  targetSegments,
  type PartnershipRiskLevel,
} from '@/data/commercialization'
import { useLanguage } from '@/i18n/LanguageContext'
import { getProviderDisplayName } from '@/utils/modelTranslations'
import { localizePath } from '@/utils/routes'

const riskTone: Record<PartnershipRiskLevel, string> = {
  low: 'bg-green-500/10 text-green-400 border-green-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
}

export function Business() {
  const [searchParams] = useSearchParams()
  const providerParam = searchParams.get('provider')
  const intentParam = searchParams.get('intent')
  const { t, language } = useLanguage()
  const selectedProvider = providerParam ? providers.find((provider) => provider.id === providerParam) : null
  const leadSource = selectedProvider ? `provider:${selectedProvider.id}` : intentParam || 'business'

  return (
    <div className="min-h-screen bg-background text-green-400 pt-24 pb-20">
      <SEO
        title={t('business.seoTitle')}
        description={t('business.seoDesc')}
        path="/business"
      />
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 0, 0.03) 2px, rgba(0, 255, 0, 0.03) 4px)`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="grid lg:grid-cols-[1fr_420px] gap-8 items-start mb-14">
          <div className="font-mono">
            <div className="text-sm text-cyan-400 mb-3">
              <span className="text-green-400">$</span> modelmart business --cost-governance
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight mb-5">
              <span className="text-primary">&lt;</span>
              {t('business.title')}
              <span className="text-primary">/&gt;</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-3xl leading-relaxed">
              <span className="text-cyan-400">→</span> {t('business.subtitle')}
            </p>

            <div className="grid md:grid-cols-3 gap-3 mt-8">
              {[
                { icon: LineChart, label: t('business.hero.metric1'), value: '¥1k-100k' },
                { icon: ShieldCheck, label: t('business.hero.metric2'), value: 'BYOK' },
                { icon: Handshake, label: t('business.hero.metric3'), value: '90d' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border border-border bg-secondary/60 p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </div>
                  <div className="text-2xl font-bold text-foreground">{value}</div>
                </div>
              ))}
            </div>

            {selectedProvider && (
              <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-400">
                <img src={selectedProvider.logo} alt="" className="h-5 w-5 object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                {t('business.context.provider', {
                  provider: getProviderDisplayName(selectedProvider.id, selectedProvider.name, language),
                })}
              </div>
            )}
          </div>

          <Card className="bg-card/80 border border-primary/30">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-foreground font-mono font-semibold mb-2">
                <Target className="h-4 w-4 text-primary" />
                {t('business.form.title')}
              </div>
              <p className="text-xs text-muted-foreground font-mono mb-5">{t('business.form.desc')}</p>
              <LeadCaptureForm source={leadSource} />
            </CardContent>
          </Card>
        </section>

        <section className="mb-14">
          <div className="flex items-center gap-2 font-mono mb-5">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{t('business.segments.title')}</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {targetSegments.map((segment) => (
              <Card key={segment.id} className="bg-card/70 border border-border">
                <CardContent className="p-5 font-mono">
                  <div className="text-xs text-cyan-400 mb-2">{t(segment.monthlySpendKey)}</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(segment.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t(segment.descriptionKey)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2 font-mono">
              <LineChart className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{t('business.plans.title')}</h2>
            </div>
            <Link to={localizePath('/calculator', language)} className="hidden sm:inline-flex text-sm text-cyan-400 hover:text-primary font-mono">
              {t('business.goCalculator')} →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            {commercialPlans.map((plan) => (
              <Card key={plan.id} className={`border ${plan.highlighted ? 'border-primary/50 bg-primary/5' : 'border-border bg-card/70'}`}>
                <CardContent className="p-5 font-mono">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{t(plan.nameKey)}</h3>
                  <div className="text-2xl font-bold text-primary mb-2">{t(plan.priceKey)}</div>
                  <p className="text-sm text-muted-foreground mb-4 min-h-[3rem]">{t(plan.descriptionKey)}</p>
                  <div className="space-y-2">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{t(feature)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="flex items-center gap-2 font-mono mb-5">
            <Handshake className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">{t('business.partners.title')}</h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-border bg-card/70">
            <table className="w-full min-w-[880px] font-mono text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/50 text-muted-foreground">
                  <th className="text-left p-4">{t('business.partners.provider')}</th>
                  <th className="text-left p-4">{t('business.partners.route')}</th>
                  <th className="text-left p-4">{t('business.partners.status')}</th>
                  <th className="text-left p-4">{t('business.partners.risk')}</th>
                  <th className="text-left p-4">{t('business.partners.notes')}</th>
                  <th className="text-left p-4">{t('business.partners.action')}</th>
                </tr>
              </thead>
              <tbody>
                {providerPartnerships.map((partnership) => {
                  const provider = providers.find((item) => item.id === partnership.providerId)

                  return (
                    <tr key={partnership.providerId} className="border-b border-border/50 last:border-b-0 hover:bg-primary/5">
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-foreground">
                          <img src={provider?.logo} alt="" className="h-6 w-6 object-contain" onError={(event) => { event.currentTarget.style.display = 'none' }} />
                          {getProviderDisplayName(partnership.providerId, provider?.name || partnership.providerId, language)}
                        </div>
                      </td>
                      <td className="p-4 text-cyan-400">{t(`business.route.${partnership.route}`)}</td>
                      <td className="p-4 text-muted-foreground">{t(`business.status.${partnership.status}`)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-md border text-xs ${riskTone[partnership.riskLevel]}`}>
                          {t(`business.risk.${partnership.riskLevel}`)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground max-w-[320px]">{t(partnership.notes)}</td>
                      <td className="p-4">
                        <a href={partnership.partnerUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-cyan-400">
                          {t(partnership.ctaLabel)} →
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_360px] gap-6">
          <div>
            <div className="flex items-center gap-2 font-mono mb-5">
              <Target className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">{t('business.milestones.title')}</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {goToMarketMilestones.map((milestone) => (
                <div key={milestone.day} className="rounded-lg border border-border bg-secondary/60 p-5 font-mono">
                  <div className="text-primary text-sm mb-2">D+{milestone.day}</div>
                  <h3 className="text-foreground font-semibold mb-2">{t(milestone.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{t(milestone.descriptionKey)}</p>
                  <div className="text-xs text-cyan-400">{t(milestone.metricKey)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-5 font-mono h-fit">
            <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-3">
              <AlertTriangle className="h-5 w-5" />
              {t('business.legal.title')}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t('business.legal.desc')}</p>
            <Link to={localizePath('/business?intent=partnership', language)}>
              <Button variant="outline" className="w-full gap-2 font-mono">
                {t('business.legal.cta')}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
