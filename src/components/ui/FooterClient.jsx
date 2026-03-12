"use client";

import React from 'react';

export default function FooterClient() {
  return (
    <div className="flex justify-start">
      <a href="https://www.buymeacoffee.com/kadriwalimt" target="_blank" rel="noopener noreferrer" className="preserve-color">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="preserve-color" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="43" width="157" loading="lazy" decoding="async" style={{ width: '157px', height: 'auto' }} />
      </a>
    </div>
  );
}
