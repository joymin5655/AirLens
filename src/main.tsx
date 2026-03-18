import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import './logic/i18n'
import App from './App.tsx'
import { loadRemoteConfig } from './logic/config'
import { Toaster } from 'sonner'

// 앱 초기화 및 원격 설정 로드
const initApp = async () => {
  try {
    // 1. Load remote config
    await loadRemoteConfig();
    console.log('✅ Remote Config Loaded');
  } catch (err) {
    console.warn('Config load failed, continuing with defaults', err);
  }
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <App />
          <Toaster richColors position="bottom-right" />
        </BrowserRouter>
      </HelmetProvider>
    </StrictMode>
  );
};

initApp();