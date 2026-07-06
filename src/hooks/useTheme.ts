import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'dark' | 'light' | 'system'

function resolveTheme(theme: Theme): 'dark' | 'light' {
  if (theme !== 'system') return theme
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeClass(theme: Theme) {
  document.documentElement.classList.toggle('light', resolveTheme(theme) === 'light')
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('sc_theme', 'dark')

  useEffect(() => {
    applyThemeClass(theme)

    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyThemeClass('system')
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return { theme, setTheme }
}
