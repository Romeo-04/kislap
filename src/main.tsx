import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { registerServiceWorker } from './pwa/register'
import './styles/fonts.css'
import './styles/tokens.css'
import './styles/base.css'

registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
