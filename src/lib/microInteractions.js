// src/lib/microInteractions.js
"use client";

/**
 * Micro-interactions and animation utilities
 * Provides smooth, delightful interactions throughout the app
 */

/**
 * Trigger a success animation on an element
 * @param {HTMLElement} element - The element to animate
 */
export const triggerSuccessAnimation = (element) => {
  if (!element) return;
  
  element.classList.add('animate-in', 'zoom-in-95', 'duration-300');
  setTimeout(() => {
    element.classList.remove('animate-in', 'zoom-in-95', 'duration-300');
  }, 300);
};

/**
 * Trigger a shake animation (for errors)
 * @param {HTMLElement} element - The element to shake
 */
export const triggerShakeAnimation = (element) => {
  if (!element) return;
  
  element.classList.add('animate-shake');
  setTimeout(() => {
    element.classList.remove('animate-shake');
  }, 500);
};

/**
 * Trigger a pulse animation (for attention)
 * @param {HTMLElement} element - The element to pulse
 */
export const triggerPulseAnimation = (element) => {
  if (!element) return;
  
  element.classList.add('animate-pulse');
  setTimeout(() => {
    element.classList.remove('animate-pulse');
  }, 1000);
};

/**
 * Smooth scroll to element with offset
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Offset from the top (default: 80px for navbar)
 */
export const smoothScrollTo = (elementId, offset = 80) => {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - offset;
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
};

/**
 * Copy text to clipboard with visual feedback
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element to show feedback on
 * @returns {Promise<boolean>} - Success status
 */
export const copyToClipboard = async (text, button = null) => {
  try {
    await navigator.clipboard.writeText(text);
    
    if (button) {
      const originalText = button.textContent;
      button.textContent = '✓ Copied!';
      button.classList.add('animate-in', 'zoom-in-95');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('animate-in', 'zoom-in-95');
      }, 2000);
    }
    
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Add ripple effect to button clicks
 * @param {MouseEvent} event - The click event
 */
export const createRipple = (event) => {
  const button = event.currentTarget;
  const circle = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;
  
  const rect = button.getBoundingClientRect();
  circle.style.width = circle.style.height = `${diameter}px`;
  circle.style.left = `${event.clientX - rect.left - radius}px`;
  circle.style.top = `${event.clientY - rect.top - radius}px`;
  circle.classList.add('ripple');
  
  const ripple = button.getElementsByClassName('ripple')[0];
  if (ripple) {
    ripple.remove();
  }
  
  button.appendChild(circle);
};

/**
 * Intersection Observer for scroll-triggered animations
 * @param {string} selector - CSS selector for elements to observe
 * @param {Object} options - Intersection Observer options
 */
export const observeScrollAnimations = (selector = '.animate-on-scroll', options = {}) => {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in', 'fade-in-0', 'slide-in-from-bottom-4', 'duration-700');
        observer.unobserve(entry.target);
      }
    });
  }, defaultOptions);
  
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => observer.observe(el));
  
  return observer;
};

/**
 * Staggered animation for lists/grids
 * @param {string} containerSelector - CSS selector for container
 * @param {string} itemSelector - CSS selector for items
 * @param {number} delay - Delay between items in ms
 */
export const staggerAnimation = (containerSelector, itemSelector, delay = 100) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  
  const items = container.querySelectorAll(itemSelector);
  items.forEach((item, index) => {
    item.style.animationDelay = `${index * delay}ms`;
    item.classList.add('animate-in', 'fade-in-0', 'slide-in-from-bottom-2', 'duration-500');
  });
};

/**
 * Hover lift effect for cards
 * @param {HTMLElement} card - Card element
 */
export const addHoverLift = (card) => {
  if (!card) return;
  
  card.addEventListener('mouseenter', () => {
    card.style.transform = 'translateY(-4px)';
    card.style.transition = 'transform 200ms ease-out';
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0)';
  });
};

/**
 * Confetti effect for major successes
 * Note: Requires canvas-confetti library
 * Install: npm install canvas-confetti
 */
export const triggerConfetti = () => {
  // Dynamic import to avoid errors if library not installed
  if (typeof window !== 'undefined') {
    import('canvas-confetti').then((confetti) => {
      confetti.default({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981']
      });
    }).catch(() => {
      // Silently fail if canvas-confetti is not installed
      if (process.env.NODE_ENV === 'development') {
        console.warn('canvas-confetti not installed');
      }
    });
  }
};

/**
 * Number counter animation
 * @param {HTMLElement} element - Element containing the number
 * @param {number} target - Target number
 * @param {number} duration - Animation duration in ms
 */
export const animateCounter = (element, target, duration = 1000) => {
  if (!element) return;
  
  const start = parseInt(element.textContent) || 0;
  const increment = (target - start) / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      element.textContent = target.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current).toLocaleString();
    }
  }, 16);
};

/**
 * Add loading skeleton effect
 * @param {HTMLElement} element - Element to show skeleton in
 */
export const showLoadingSkeleton = (element) => {
  if (!element) return;
  
  element.classList.add('animate-pulse', 'bg-gray-200', 'dark:bg-black', 'rounded');
  element.style.minHeight = element.offsetHeight + 'px';
};

/**
 * Remove loading skeleton effect
 * @param {HTMLElement} element - Element to remove skeleton from
 */
export const hideLoadingSkeleton = (element) => {
  if (!element) return;
  
  element.classList.remove('animate-pulse', 'bg-gray-200', 'dark:bg-black');
  element.style.minHeight = '';
};

/**
 * Toast notification helper
 * @param {string} message - Message to show
 * @param {string} type - Type: success, error, info, warning
 * @param {number} duration - Duration in ms
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  const toast = document.createElement('div');
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-gray-950',
    warning: 'bg-yellow-500'
  };
  
  toast.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-6 py-3 shadow-lg z-50 animate-in slide-in-from-bottom-5 duration-300`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('animate-out', 'slide-out-to-bottom-5');
    setTimeout(() => toast.remove(), 300);
  }, duration);
};
