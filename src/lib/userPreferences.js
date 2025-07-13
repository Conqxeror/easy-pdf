// User Preferences System
// Manages user settings, theme, and personalization

import React, { useState, useEffect, createContext, useContext  } from 'react';
import { getUserPreference, setUserPreference, trackEvent } from '@/lib/analytics';

const UserPreferencesContext = createContext();

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error('useUserPreferences must be used within UserPreferencesProvider');
  }
  return context;
};

const DEFAULT_PREFERENCES = {
  theme: 'dark',
  language: 'en',
  autoDownload: true,
  defaultQuality: 'high',
  showTips: true,
  recentTools: [],
  favoriteTools: [],
  compressionLevel: 'balanced',
  ocrLanguage: 'eng',
  notifications: {
    processing: true,
    completion: true,
    errors: true,
    tips: true
  },
  privacy: {
    analytics: true,
    crashReporting: true,
    usageStats: true
  },
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: 'normal'
  }
};

export const UserPreferencesProvider = ({ children }) => {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const savedPreferences = getUserPreference('userPreferences');
      if (savedPreferences) {
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...savedPreferences
        });
      }
    } catch (err) {
      console.warn('Failed to load user preferences:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  const updatePreference = (key, value) => {
    const newPreferences = {
      ...preferences,
      [key]: value
    };

    setPreferences(newPreferences);
    setUserPreference('userPreferences', newPreferences);
    
    trackEvent('preference_updated', {
      preference: key,
      value: typeof value === 'object' ? JSON.stringify(value) : value
    });
  };

  const updateNestedPreference = (category, key, value) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: value
      }
    };

    setPreferences(newPreferences);
    setUserPreference('userPreferences', newPreferences);
    
    trackEvent('preference_updated', {
      preference: `${category}.${key}`,
      value: typeof value === 'object' ? JSON.stringify(value) : value
    });
  };

  const addRecentTool = (toolName) => {
    const recentTools = preferences.recentTools || [];
    const updatedRecent = [
      toolName,
      ...recentTools.filter(tool => tool !== toolName)
    ].slice(0, 10); // Keep only last 10

    updatePreference('recentTools', updatedRecent);
  };

  const addFavoriteTool = (toolName) => {
    const favoriteTools = preferences.favoriteTools || [];
    if (!favoriteTools.includes(toolName)) {
      updatePreference('favoriteTools', [...favoriteTools, toolName]);
    }
  };

  const removeFavoriteTool = (toolName) => {
    const favoriteTools = preferences.favoriteTools || [];
    updatePreference('favoriteTools', favoriteTools.filter(tool => tool !== toolName));
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setUserPreference('userPreferences', DEFAULT_PREFERENCES);
    trackEvent('preferences_reset');
  };

  const exportPreferences = () => {
    const exportData = {
      preferences,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'easy-pdf-preferences.json';
    link.click();
    URL.revokeObjectURL(url);

    trackEvent('preferences_exported');
  };

  const importPreferences = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const importData = JSON.parse(event.target.result);
          
          if (importData.preferences) {
            const mergedPreferences = {
              ...DEFAULT_PREFERENCES,
              ...importData.preferences
            };
            
            setPreferences(mergedPreferences);
            setUserPreference('userPreferences', mergedPreferences);
            
            trackEvent('preferences_imported');
            resolve(mergedPreferences);
          } else {
            reject(new Error('Invalid preferences file format'));
          }
        } catch {
          reject(new Error('Failed to parse preferences file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read preferences file'));
      reader.readAsText(file);
    });
  };

  const getThemeClasses = () => {
    const { theme, accessibility } = preferences;
    let classes = theme === 'dark' ? 'dark' : '';
    
    if (accessibility.highContrast) classes += ' high-contrast';
    if (accessibility.reducedMotion) classes += ' reduced-motion';
    if (accessibility.fontSize !== 'normal') classes += ` font-${accessibility.fontSize}`;
    
    return classes;
  };

  const contextValue = {
    preferences,
    isLoaded,
    updatePreference,
    updateNestedPreference,
    addRecentTool,
    addFavoriteTool,
    removeFavoriteTool,
    resetPreferences,
    exportPreferences,
    importPreferences,
    getThemeClasses
  };

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

// Hook for theme management
export const useTheme = () => {
  const { preferences, updatePreference } = useUserPreferences();
  
  const setTheme = (theme) => {
    updatePreference('theme', theme);
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.className = theme === 'dark' ? 'dark' : '';
    }
  };

  return {
    theme: preferences.theme,
    setTheme,
    isDark: preferences.theme === 'dark'
  };
};

// Hook for accessibility preferences
export const useAccessibility = () => {
  const { preferences, updateNestedPreference } = useUserPreferences();
  
  const updateAccessibility = (key, value) => {
    updateNestedPreference('accessibility', key, value);
  };

  return {
    accessibility: preferences.accessibility,
    updateAccessibility
  };
};

// Hook for notification preferences
export const useNotifications = () => {
  const { preferences, updateNestedPreference } = useUserPreferences();
  
  const updateNotifications = (key, value) => {
    updateNestedPreference('notifications', key, value);
  };

  const shouldShowNotification = (type) => {
    return preferences.notifications[type] !== false;
  };

  return {
    notifications: preferences.notifications,
    updateNotifications,
    shouldShowNotification
  };
};

export default UserPreferencesProvider;