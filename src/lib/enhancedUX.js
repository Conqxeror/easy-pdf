// Enhanced User Experience Utilities
import React, { useState, useEffect, useCallback  } from 'react';
import { toast } from 'sonner';

// Enhanced file validation with better error messages
export const validateFiles = (files, options = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    maxFiles = 10,
    allowedTypes = ['application/pdf'],
    requireSameType = false
  } = options;

  const errors = [];
  const validFiles = [];

  if (files.length === 0) {
    return { isValid: false, errors: ['Please select at least one file'], validFiles: [] };
  }

  if (files.length > maxFiles) {
    return { 
      isValid: false, 
      errors: [`Too many files selected. Maximum allowed: ${maxFiles}`], 
      validFiles: [] 
    };
  }

  // Check file types
  const fileTypes = new Set();
  files.forEach(file => fileTypes.add(file.type));

  if (requireSameType && fileTypes.size > 1) {
    errors.push('All files must be of the same type');
  }

  files.forEach((file, index) => {
    const fileErrors = [];

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      fileErrors.push(`File ${index + 1}: Invalid file type. Expected: ${allowedTypes.join(', ')}`);
    }

    // Check file size
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      const fileSizeMB = Math.round(file.size / (1024 * 1024));
      fileErrors.push(`File ${index + 1}: Too large (${fileSizeMB}MB). Maximum: ${maxSizeMB}MB`);
    }

    // Check for empty files
    if (file.size === 0) {
      fileErrors.push(`File ${index + 1}: Empty file not allowed`);
    }

    if (fileErrors.length === 0) {
      validFiles.push(file);
    } else {
      errors.push(...fileErrors);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    validFiles
  };
};

// Enhanced progress tracking
export class ProgressTracker {
  constructor(onUpdate = () => {}) {
    this.onUpdate = onUpdate;
    this.reset();
  }

  reset() {
    this.total = 0;
    this.completed = 0;
    this.current = '';
    this.startTime = null;
    this.errors = [];
    this.update();
  }

  start(total, initialMessage = 'Starting...') {
    this.total = total;
    this.completed = 0;
    this.current = initialMessage;
    this.startTime = Date.now();
    this.errors = [];
    this.update();
  }

  increment(message = '', errorMessage = null) {
    this.completed++;
    this.current = message;
    
    if (errorMessage) {
      this.errors.push(errorMessage);
    }
    
    this.update();
  }

  update() {
    const progress = this.total > 0 ? (this.completed / this.total) * 100 : 0;
    const elapsed = this.startTime ? Date.now() - this.startTime : 0;
    const eta = this.completed > 0 && this.total > this.completed 
      ? (elapsed / this.completed) * (this.total - this.completed)
      : 0;

    this.onUpdate({
      progress: Math.round(progress),
      completed: this.completed,
      total: this.total,
      current: this.current,
      elapsed,
      eta: Math.round(eta / 1000), // ETA in seconds
      errors: this.errors,
      isComplete: this.completed >= this.total
    });
  }

  getStats() {
    return {
      progress: this.total > 0 ? (this.completed / this.total) * 100 : 0,
      completed: this.completed,
      total: this.total,
      hasErrors: this.errors.length > 0,
      errorCount: this.errors.length
    };
  }
}

// Enhanced keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts = {}) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const modifiers = {
        ctrl: event.ctrlKey,
        alt: event.altKey,
        shift: event.shiftKey,
        meta: event.metaKey
      };

      Object.entries(shortcuts).forEach(([shortcut, handler]) => {
        const [modifierStr, keyStr] = shortcut.toLowerCase().split('+').reverse();
        
        if (keyStr && key === keyStr) {
          const requiredModifiers = modifierStr ? modifierStr.split('') : [];
          const hasRequiredModifiers = requiredModifiers.every(mod => {
            switch (mod) {
              case 'c': return modifiers.ctrl;
              case 'a': return modifiers.alt;
              case 's': return modifiers.shift;
              case 'm': return modifiers.meta;
              default: return false;
            }
          });

          if (hasRequiredModifiers) {
            event.preventDefault();
            handler(event);
          }
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Enhanced accessibility helpers
export const announceToScreenReader = (message, priority = 'polite') => {
  if (typeof window === 'undefined') return;

  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Enhanced error handling with user-friendly messages
export const handleError = (error, context = '') => {
  console.error(`Error in ${context}:`, error);
  
  let userMessage = 'An unexpected error occurred. Please try again.';
  
  // Provide specific error messages for common issues
  if (error.name === 'QuotaExceededError') {
    userMessage = 'Not enough storage space. Please free up some space and try again.';
  } else if (error.message?.includes('network')) {
    userMessage = 'Network error. Please check your connection and try again.';
  } else if (error.message?.includes('memory')) {
    userMessage = 'File too large for processing. Please try a smaller file.';
  } else if (error.message?.includes('format')) {
    userMessage = 'Invalid file format. Please check your file and try again.';
  } else if (error.message?.includes('corrupted')) {
    userMessage = 'File appears to be corrupted. Please try a different file.';
  }

  toast.error(userMessage);
  announceToScreenReader(`Error: ${userMessage}`, 'assertive');
  
  return userMessage;
};

// Enhanced file download with better UX
export const downloadFile = (blob, filename, options = {}) => {
  const {
    showProgress = true,
    onStart = () => {},
    onComplete = () => {},
    onError = () => {}
  } = options;

  try {
    onStart();
    
    if (showProgress) {
      toast.loading('Preparing download...', { id: 'download' });
    }

    // Use safe helpers to create/revoke object URLs (handles SSR and browsers)
    let url = null;
    try {
      // safeCreateObjectURL defined below
      url = safeCreateObjectURL(blob);
    } catch {
      url = null;
    }

    const link = document.createElement('a');
    if (url) {
      try {
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        } finally {
          // Cleanup (delay to allow download to start)
          setTimeout(() => {
            try { safeRevokeObjectURL(url); } catch { /* ignore */ }
          }, 500);
        }
    } else {
      // fallback: data URL via FileReader (avoid async/await here)
      const reader = new FileReader();
      reader.onload = () => {
        try {
          link.href = reader.result;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch {
          /* ignore */
        }
      };
      reader.onerror = () => {
        /* ignore */
      };
      reader.readAsDataURL(blob);
    }

    if (showProgress) {
      toast.success('Download started!', { id: 'download' });
    }

    announceToScreenReader(`Download started: ${filename}`);
    onComplete();
    
  } catch (err) {
    handleError(err, 'file download');
    onError(err);
  }
};

// Minimal filename sanitizer used across the app
export const sanitizeFileName = (name) => {
  if (!name) return 'download';
  try {
    return String(name).replace(/\.[^/.]+$/, '').replace(/\s+/g,'-').replace(/[^a-zA-Z0-9\-_.]/g,'');
  } catch {
    return 'download';
  }
};

// Safe Object URL helpers
export const safeCreateObjectURL = (blob) => {
  if (typeof window === 'undefined' || typeof URL === 'undefined') return null;
  try {
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('safeCreateObjectURL failed:', err);
    return null;
  }
};

export const safeRevokeObjectURL = (url) => {
  if (!url) return;
  if (typeof window === 'undefined' || typeof URL === 'undefined') return;
  try {
    if (!String(url).startsWith('data:')) URL.revokeObjectURL(url);
  } catch {
    // ignore
  }
};

// Enhanced copy to clipboard with feedback
export const copyToClipboard = async (text, successMessage = 'Copied to clipboard!') => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(successMessage);
    announceToScreenReader(successMessage);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
      toast.success(successMessage);
      announceToScreenReader(successMessage);
      return true;
    } catch {
      toast.error('Failed to copy to clipboard');
      return false;
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

// Enhanced drag and drop utilities
export const useDragAndDrop = (onDrop, options = {}) => {
  const {
    accept = ['application/pdf'],
    maxFiles = 10,
    onDragEnter = () => {},
    onDragLeave = () => {},
    onError = () => {}
  } = options;

  const [isDragActive, setIsDragActive] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    if (dragCounter === 0) {
      setIsDragActive(true);
      onDragEnter();
    }
  }, [dragCounter, onDragEnter]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev - 1);
    if (dragCounter === 1) {
      setIsDragActive(false);
      onDragLeave();
    }
  }, [dragCounter, onDragLeave]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragActive(false);
    setDragCounter(0);
    
    const files = Array.from(e.dataTransfer.files);
    const validation = validateFiles(files, { allowedTypes: accept, maxFiles });
    
    if (validation.isValid) {
      onDrop(validation.validFiles);
    } else {
      validation.errors.forEach(error => toast.error(error));
      onError(validation.errors);
    }
  }, [accept, maxFiles, onDrop, onError]);

  return {
    isDragActive,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop
    }
  };
};

const enhancedUXUtils = {
  validateFiles,
  ProgressTracker,
  useKeyboardShortcuts,
  announceToScreenReader,
  handleError,
  downloadFile,
  copyToClipboard,
  useDragAndDrop
};

export default enhancedUXUtils;