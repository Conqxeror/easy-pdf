"use client";

import { useEffect, useRef } from 'react';

export default function BmcButtonLoader({ slug = 'kadriwalimt', text = 'Sponsor this project.' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Avoid loading multiple times
    if (typeof window === 'undefined') return;
    if (window.__bmc_loaded) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js';
    script.setAttribute('data-name', 'bmc-button');
    script.setAttribute('data-slug', slug);
    script.setAttribute('data-color', '#FFDD00');
    script.setAttribute('data-emoji', '');
    script.setAttribute('data-font', 'Cookie');
    script.setAttribute('data-text', text);
    script.setAttribute('data-outline-color', '#000000');
    script.setAttribute('data-font-color', '#000000');
    script.setAttribute('data-coffee-color', '#ffffff');
    script.async = true;

    script.onload = () => {
      try {
        window.__bmc_loaded = true;
      } catch (e) {}
    };

    document.body.appendChild(script);

    return () => {
      // Do not remove the script on unmount; leave it for other components.
    };
  }, [slug, text]);

  return <div ref={containerRef} />;
}
