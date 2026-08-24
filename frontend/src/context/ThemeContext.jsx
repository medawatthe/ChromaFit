import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

function applyFontSize(fontSize) {
  document.documentElement.setAttribute('data-font-size', fontSize);
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem('chromafit_theme') || 'light');
  const [fontSize, setFontSizeState] = useState(() => localStorage.getItem('chromafit_font_size') || 'medium');

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyFontSize(fontSize);
  }, [fontSize]);

  const setTheme = useCallback((next) => {
    setThemeState(next);
    localStorage.setItem('chromafit_theme', next);
  }, []);

  const setFontSize = useCallback((next) => {
    setFontSizeState(next);
    localStorage.setItem('chromafit_font_size', next);
  }, []);

  const syncFromUser = useCallback((user) => {
    if (user?.theme && user.theme !== theme) setTheme(user.theme);
    if (user?.font_size && user.font_size !== fontSize) setFontSize(user.font_size);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setTheme, setFontSize]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, fontSize, setFontSize, syncFromUser }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
