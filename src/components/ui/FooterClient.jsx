"use client";

import React from 'react';
import Image from 'next/image';

export default function FooterClient() {
  return (
    <div className="flex justify-start">
      <a href="https://www.buymeacoffee.com/kadriwalimt" target="_blank" rel="noopener noreferrer" className="preserve-color">
        <Image className="preserve-color" src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height={43} width={157} priority={false} />
      </a>
    </div>
  );
}
