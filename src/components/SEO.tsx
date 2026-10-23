import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import {
  BASE_URL,
  DEFAULT_LANGUAGE,
  SEO_LANGUAGES,
  getAbsoluteUrl,
  getCanonicalPath,
  getLanguageFromPathname,
  localizePath,
} from '@/utils/routes'
import type { Language } from '@/i18n/translations'

interface SEOProps {
  title: string
  description: string
  path?: string
  type?: 'website' | 'article'
  image?: string
  noindex?: boolean
  schema?: Record<string, unknown> | Record<string, unknown>[]
}

const DEFAULT_IMAGE = `${BASE_URL}/hero-ai.png`

export function SEO({
  title,
  description,
  path = '/',
  type = 'website',
  image = DEFAULT_IMAGE,
  noindex = false,
  schema = [],
}: SEOProps) {
  const location = useLocation()
  const currentLanguage = getLanguageFromPathname(location.pathname) || DEFAULT_LANGUAGE
  const canonicalPath = getCanonicalPath(path, currentLanguage)
  const canonicalUrl = getAbsoluteUrl(canonicalPath)
  const fullTitle = title.includes('ModelMart') ? title : `${title} - ModelMart`
  const imageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`
  const schemaItems = Array.isArray(schema) ? schema : [schema]
  const alternateLinks = SEO_LANGUAGES.map((language: Language) => ({
    language,
    href: getAbsoluteUrl(localizePath(path, language).split('?')[0]),
  }))
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'ModelMart',
      url: BASE_URL,
      logo: `${BASE_URL}/logo.svg`,
      sameAs: ['https://modelmart.ai'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'ModelMart',
      url: BASE_URL,
      description,
      inLanguage: currentLanguage,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/zh-CN/models?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    ...schemaItems,
  ].filter(Boolean)

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
      <link rel="canonical" href={canonicalUrl} />
      {alternateLinks.map((alternate) => (
        <link
          key={alternate.language}
          rel="alternate"
          hrefLang={alternate.language}
          href={alternate.href}
        />
      ))}
      <link rel="alternate" hrefLang="x-default" href={getAbsoluteUrl(path === '/' ? '/' : path)} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content="ModelMart" />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:locale" content={currentLanguage.replace('-', '_')} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  )
}
