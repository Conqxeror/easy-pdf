import React from 'react';
import { motion } from 'framer-motion';

const supporters = [
  'Vercel', 'Next.js', 'React', 'Tailwind CSS', 'Framer Motion', 'Lucide', 'PDF-Lib', 'PDF.js'
];

export default function SupportersMarquee() {
  return (
    <section className="w-full py-12 border-b border-border overflow-hidden bg-background">
      <div className="flex whitespace-nowrap">
        <motion.div 
          className="flex gap-16 items-center"
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        >
          {[...supporters, ...supporters, ...supporters, ...supporters].map((supporter, index) => (
            <span key={index} className="text-2xl md:text-4xl font-bold text-foreground/20 uppercase tracking-tighter hover:text-foreground transition-colors duration-300 cursor-default">
              {supporter}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
