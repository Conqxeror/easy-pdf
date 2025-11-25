import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { label: 'Files Processed', value: '1M+' },
  { label: 'Users Trusted', value: '50k+' },
  { label: 'Privacy Score', value: '100%' },
  { label: 'Server Uploads', value: '0' },
];

export default function StatsSection() {
  return (
    <section className="w-full border-y border-border bg-background">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
        {stats.map((stat, index) => (
          <div key={index} className="p-6 md:p-8 flex flex-col items-center justify-center text-center group hover:bg-foreground hover:text-background transition-colors duration-300">
            <motion.span 
              className="text-3xl md:text-4xl font-bold tracking-tighter mb-1"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              {stat.value}
            </motion.span>
            <span className="text-xs uppercase tracking-widest opacity-70 font-mono">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
