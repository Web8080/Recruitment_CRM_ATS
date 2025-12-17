import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { webLightTheme, webDarkTheme, FluentProvider } from '@fluentui/react-components'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme')
    return (saved as Theme) || 'light'
  })

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const currentTheme = theme === 'dark' ? webDarkTheme : webLightTheme

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <FluentProvider theme={currentTheme}>
        {children}
      </FluentProvider>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}


