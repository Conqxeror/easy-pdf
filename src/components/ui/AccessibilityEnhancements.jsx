// Accessibility and Performance Enhancement Component
import React from 'react';

// Accessible heading component with proper hierarchy
export const AccessibleHeading = ({ level = 1, children, className = '', id, ...props }) => {
  // Ensure heading level is within valid HTML range
  const safeLevel = Math.min(6, Math.max(1, Number(level) || 1));
  const Tag = `h${safeLevel}`;
  
  return (
    <Tag
      id={id}
      className={`font-bold ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
};

// Loading component with proper accessibility
export const AccessibleLoader = ({ message = "Loading...", size = "medium" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className="flex items-center justify-center" role="status" aria-live="polite">
      <div
        className={`animate-spin border-2 border-border border-t-blue-400 ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{message}</span>
    </div>
  );
};

// Enhanced button with proper accessibility
export const AccessibleButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = "primary", 
  size = "medium",
  ariaLabel,
  className = "",
  ...props 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200";
  
  const variantClasses = {
    primary: "bg-background hover:bg-background text-foreground focus:ring-gray-600",
    secondary: "bg-background hover:bg-background text-foreground focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 text-foreground focus:ring-green-500",
    danger: "bg-red-600 hover:bg-red-700 text-foreground focus:ring-red-500"
  };
  
  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-6 py-3 text-lg"
  };
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Accessible form input with proper labeling
export const AccessibleInput = ({ 
  label, 
  id, 
  error, 
  required = false, 
  type = "text",
  className = "",
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1">
      <label 
        htmlFor={inputId}
        className="block text-sm font-medium text-foreground dark:text-foreground"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
      </label>
      <input
        id={inputId}
        type={type}
        required={required}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
        className={`block w-full px-3 py-2 border border-border shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-border bg-background text-foreground ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

// Accessible modal with focus management
export const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className = "" 
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus management would go here
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-background bg-opacity-75"
          aria-hidden="true"
          onClick={onClose}
        />
        
        <div className={`inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-background shadow-xl ${className}`}>
          <h3 id="modal-title" className="text-lg font-medium leading-6 text-foreground dark:text-foreground">
            {title}
          </h3>
          <div className="mt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Progress indicator with accessibility
export const AccessibleProgress = ({ 
  value, 
  max = 100, 
  label, 
  className = "" 
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div 
        className="w-full bg-background h-2 dark:bg-background"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || "Progress"}
      >
        <div 
          className="bg-background h-2 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Accessible alert component
export const AccessibleAlert = ({ 
  type = "info", 
  title, 
  children, 
  onClose,
  className = "" 
}) => {
  const typeClasses = {
    info: "bg-background border-border text-foreground dark:bg-background dark:border-border dark:text-foreground",
    success: "bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200",
    error: "bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200"
  };

  return (
    <div 
      className={`border p-4 ${typeClasses[type]} ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex">
        <div className="flex-1">
          {title && (
            <h4 className="font-medium mb-1">{title}</h4>
          )}
          <div>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-current"
            aria-label="Close alert"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  React.useEffect(() => {
    // Monitor Core Web Vitals
    if (typeof window !== 'undefined' && 'performance' in window) {
      // LCP monitoring
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            if (process.env.NODE_ENV === 'development') {
              console.log('LCP:', entry.startTime);
            }
          }
        }
      });
      
      try {
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // Fallback for older browsers
      }
      
      return () => observer.disconnect();
    }
  }, []);
};

export default {
  AccessibleHeading,
  AccessibleLoader,
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleProgress,
  AccessibleAlert,
  usePerformanceMonitoring
};