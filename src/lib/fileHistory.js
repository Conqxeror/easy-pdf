//src\lib\fileHistory.js

"use client";

import React from 'react';
import { trackEvent } from './analytics';

const MAX_HISTORY_ITEMS = 50;
const MAX_FAVORITES = 20;

export class FileHistoryManager {
  constructor() {
    this.history = [];
    this.favorites = [];
    // Only load from storage on client side
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const savedHistory = localStorage.getItem('file_history');
      const savedFavorites = localStorage.getItem('file_favorites');
      
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
      
      if (savedFavorites) {
        this.favorites = JSON.parse(savedFavorites);
      }
    } catch (error) {
      console.error('Error loading file history:', error);
      this.history = [];
      this.favorites = [];
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem('file_history', JSON.stringify(this.history));
      localStorage.setItem('file_favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.error('Error saving file history:', error);
    }
  }

  addToHistory(fileInfo) {
    const historyItem = {
      id: Date.now() + Math.random(),
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      tool: fileInfo.tool,
      timestamp: new Date().toISOString(),
      operation: fileInfo.operation || 'processed'
    };

    // Remove duplicate if exists
    this.history = this.history.filter(item => 
      !(item.fileName === historyItem.fileName && item.tool === historyItem.tool)
    );

    // Add to beginning
    this.history.unshift(historyItem);

    // Limit history size
    if (this.history.length > MAX_HISTORY_ITEMS) {
      this.history = this.history.slice(0, MAX_HISTORY_ITEMS);
    }

    this.saveToStorage();
    
    trackEvent('file_added_to_history', {
      tool: fileInfo.tool,
      file_size: fileInfo.size,
      operation: fileInfo.operation
    });

    return historyItem;
  }

  addToFavorites(fileInfo) {
    if (this.favorites.length >= MAX_FAVORITES) {
      throw new Error(`Maximum ${MAX_FAVORITES} favorites allowed`);
    }

    const favoriteItem = {
      id: Date.now() + Math.random(),
      fileName: fileInfo.name,
      fileSize: fileInfo.size,
      tool: fileInfo.tool,
      timestamp: new Date().toISOString(),
      operation: fileInfo.operation || 'processed'
    };

    // Check if already in favorites
    const exists = this.favorites.some(item => 
      item.fileName === favoriteItem.fileName && item.tool === favoriteItem.tool
    );

    if (exists) {
      throw new Error('File already in favorites');
    }

    this.favorites.unshift(favoriteItem);
    this.saveToStorage();

    trackEvent('file_added_to_favorites', {
      tool: fileInfo.tool,
      file_size: fileInfo.size
    });

    return favoriteItem;
  }

  removeFromHistory(itemId) {
    this.history = this.history.filter(item => item.id !== itemId);
    this.saveToStorage();
    
    trackEvent('file_removed_from_history');
  }

  removeFromFavorites(itemId) {
    this.favorites = this.favorites.filter(item => item.id !== itemId);
    this.saveToStorage();
    
    trackEvent('file_removed_from_favorites');
  }

  clearHistory() {
    this.history = [];
    this.saveToStorage();
    
    trackEvent('history_cleared');
  }

  clearFavorites() {
    this.favorites = [];
    this.saveToStorage();
    
    trackEvent('favorites_cleared');
  }

  getHistory() {
    return [...this.history];
  }

  getFavorites() {
    return [...this.favorites];
  }

  getRecentByTool(tool, limit = 5) {
    return this.history
      .filter(item => item.tool === tool)
      .slice(0, limit);
  }

  getStats() {
    const toolUsage = {};
    this.history.forEach(item => {
      toolUsage[item.tool] = (toolUsage[item.tool] || 0) + 1;
    });

    return {
      totalFiles: this.history.length,
      favoritesCount: this.favorites.length,
      toolUsage,
      mostUsedTool: Object.keys(toolUsage).reduce((a, b) => 
        toolUsage[a] > toolUsage[b] ? a : b, null
      )
    };
  }

  exportHistory() {
    const exportData = {
      history: this.history,
      favorites: this.favorites,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pdf-tools-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    trackEvent('history_exported');
  }

  importHistory(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.history && Array.isArray(data.history)) {
            this.history = [...data.history, ...this.history]
              .slice(0, MAX_HISTORY_ITEMS);
          }
          
          if (data.favorites && Array.isArray(data.favorites)) {
            this.favorites = [...data.favorites, ...this.favorites]
              .slice(0, MAX_FAVORITES);
          }
          
          this.saveToStorage();
          trackEvent('history_imported');
          resolve();
        } catch {
          reject(new Error('Invalid history file format'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Create singleton instance
export const fileHistoryManager = new FileHistoryManager();

// React hook for using file history
export const useFileHistory = () => {
  const [history, setHistory] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);

  React.useEffect(() => {
    const updateState = () => {
      setHistory(fileHistoryManager.getHistory());
      setFavorites(fileHistoryManager.getFavorites());
    };

    updateState();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'file_history' || e.key === 'file_favorites') {
        fileHistoryManager.loadFromStorage();
        updateState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return {
    history,
    favorites,
    addToHistory: (fileInfo) => {
      fileHistoryManager.addToHistory(fileInfo);
      setHistory(fileHistoryManager.getHistory());
    },
    addToFavorites: (fileInfo) => {
      fileHistoryManager.addToFavorites(fileInfo);
      setFavorites(fileHistoryManager.getFavorites());
    },
    removeFromHistory: (itemId) => {
      fileHistoryManager.removeFromHistory(itemId);
      setHistory(fileHistoryManager.getHistory());
    },
    removeFromFavorites: (itemId) => {
      fileHistoryManager.removeFromFavorites(itemId);
      setFavorites(fileHistoryManager.getFavorites());
    },
    clearHistory: () => {
      fileHistoryManager.clearHistory();
      setHistory([]);
    },
    clearFavorites: () => {
      fileHistoryManager.clearFavorites();
      setFavorites([]);
    },
    getStats: () => fileHistoryManager.getStats(),
    exportHistory: () => fileHistoryManager.exportHistory(),
    importHistory: (file) => fileHistoryManager.importHistory(file)
  };
};