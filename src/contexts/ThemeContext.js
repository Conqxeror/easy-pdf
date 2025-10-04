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

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const systemTheme = prefersDark ? 'dark' : 'light';
      setTheme(systemTheme);
      localStorage.setItem('theme', systemTheme);
    }
  }, []);

  // Apply theme changes to document
  useEffect(() => {
    if (mounted) {
      const root = document.documentElement;
      
      // Add transition class for smooth theme switching
      root.classList.add('transitioning');
      
      // Update theme class
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
      
      // Store preference
      localStorage.setItem('theme', theme);
      
      // Remove transition class after animation completes
      setTimeout(() => {
        root.classList.remove('transitioning');
      }, 300);
    }
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (!mounted) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const storedTheme = localStorage.getItem('theme');
      if (!storedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLightTheme = () => setTheme('light');
  const setDarkTheme = () => setTheme('dark');

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      setTheme,
      toggleTheme,
      setLightTheme,
      setDarkTheme,
      isDark: theme === 'dark',
      isLight: theme === 'light',
    }}>
      {children}
    </ThemeContext.Provider>
  );
};