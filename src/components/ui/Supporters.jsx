import React from 'react';
import Image from 'next/image';

const sponsors = [
  { name: 'Adnan Shaikh', image: '/images/sponsors/adnann_.42.jpg', url: 'https://instagram.com/adnann_.42', tier: 'Bronze Supporter' }
];

export default function Supporters() {
  return (
    <section className="w-full py-12 border-b border-border bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold mb-8 text-foreground uppercase tracking-tight">Supported By</h2>
        <div className="flex flex-wrap justify-center gap-8 items-start">
          {sponsors.map((sponsor, index) => (
            <div key={sponsor.name} className="flex flex-col items-center gap-2">
              <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="group relative block w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-border hover:border-foreground transition-colors">
                 <Image 
                   src={sponsor.image} 
                   alt={sponsor.name} 
                   fill 
                   priority={index === 0}
                   sizes="(max-width: 768px) 80px, 96px"
                   className="object-cover transition-all duration-300"
                 />
              </a>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-sm text-foreground">{sponsor.name}</span>
                <span className="text-xs text-muted-foreground">{sponsor.tier}</span>
              </div>
            </div>
          ))}
           {/* Placeholder for "Become a sponsor" */}
           <div className="flex flex-col items-center gap-2">
             <a href="https://buymeacoffee.com/kadriwalimt" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full border-2 border-dashed border-border hover:border-foreground hover:text-foreground transition-colors text-muted-foreground">
                <span className="text-xs font-bold text-center px-2">YOUR LOGO HERE</span>
             </a>
             <span className="text-xs text-muted-foreground mt-1">Become a Sponsor</span>
           </div>
        </div>
      </div>
    </section>
  );
}
