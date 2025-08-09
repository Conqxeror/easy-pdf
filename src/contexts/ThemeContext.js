//src\contexts\ThemeContext.js

"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme('dark'); // Always set to dark
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('theme', theme); // Still store 'dark'
      document.documentElement.classList.add('dark'); // Only add dark
      document.documentElement.classList.remove('light'); // Ensure light is removed
    }
  }, [theme, mounted]);

  const setDarkTheme = () => setTheme('dark');

  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setDarkTheme,
      isDark: true,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};