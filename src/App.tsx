import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { useThemeStore } from './stores/themeStore'
import { SEO_LANGUAGES } from './utils/routes'

const About = lazy(() => import('./pages/About').then((module) => ({ default: module.About })))
const Benchmarks = lazy(() => import('./pages/Benchmarks').then((module) => ({ default: module.Benchmarks })))
const Business = lazy(() => import('./pages/Business').then((module) => ({ default: module.Business })))
const CodePlan = lazy(() => import('./pages/CodePlan').then((module) => ({ default: module.CodePlan })))
const Compare = lazy(() => import('./pages/Compare').then((module) => ({ default: module.Compare })))
const CostCalculator = lazy(() => import('./pages/CostCalculator').then((module) => ({ default: module.CostCalculator })))
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })))
const ModelDetail = lazy(() => import('./pages/ModelDetail').then((module) => ({ default: module.ModelDetail })))
const Models = lazy(() => import('./pages/Models').then((module) => ({ default: module.Models })))
const NotFound = lazy(() => import('./pages/NotFound').then((module) => ({ default: module.NotFound })))
const ProviderDetail = lazy(() => import('./pages/ProviderDetail').then((module) => ({ default: module.ProviderDetail })))

function App() {
  const isDark = useThemeStore((state) => state.isDark)

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Suspense fallback={<div className="min-h-screen bg-background pt-24 text-center font-mono text-primary">Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/models" element={<Models />} />
              <Route path="/models/:providerId/:modelId" element={<ModelDetail />} />
              <Route path="/providers/:providerId" element={<ProviderDetail />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/codeplan" element={<CodePlan />} />
              <Route path="/calculator" element={<CostCalculator />} />
              <Route path="/business" element={<Business />} />
              <Route path="/benchmarks" element={<Benchmarks />} />
              <Route path="/about" element={<About />} />
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-home`} path={`/${locale}`} element={<Home />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-models`} path={`/${locale}/models`} element={<Models />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-model-detail`} path={`/${locale}/models/:providerId/:modelId`} element={<ModelDetail />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-provider-detail`} path={`/${locale}/providers/:providerId`} element={<ProviderDetail />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-compare`} path={`/${locale}/compare`} element={<Compare />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-codeplan`} path={`/${locale}/codeplan`} element={<CodePlan />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-calculator`} path={`/${locale}/calculator`} element={<CostCalculator />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-business`} path={`/${locale}/business`} element={<Business />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-benchmarks`} path={`/${locale}/benchmarks`} element={<Benchmarks />} />
              ))}
              {SEO_LANGUAGES.map((locale) => (
                <Route key={`${locale}-about`} path={`/${locale}/about`} element={<About />} />
              ))}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
