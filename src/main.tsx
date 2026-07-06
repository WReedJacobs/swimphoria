import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ToastProvider, toast } from '@/context/ToastContext'
import { NotificationProvider } from '@/context/NotificationContext'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { applyThemeClass, type Theme } from '@/hooks/useTheme'
import App from './App'
import './index.css'

// Apply theme before first paint to avoid flash.
const _storedTheme = localStorage.getItem('sc_theme')
applyThemeClass((_storedTheme ? JSON.parse(_storedTheme) : 'dark') as Theme)

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (err) => {
      // QueuedErrors are silent — the time was saved to the offline outbox
      if (err instanceof Error && (err as Error & { queued?: boolean }).queued) return
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      refetchOnWindowFocus: false,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <NotificationProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </NotificationProvider>
        </ToastProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
