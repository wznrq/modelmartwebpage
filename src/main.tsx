import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { ExchangeRateProvider } from './contexts/ExchangeRateContext'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <LanguageProvider>
        <ExchangeRateProvider>
          <App />
        </ExchangeRateProvider>
      </LanguageProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
