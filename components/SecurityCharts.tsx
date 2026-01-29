import React from 'react';
import { motion } from 'framer-motion';

const SecurityCharts: React.FC = () => {
  const data = [
    { label: '00:00', value: 20 },
    { label: '04:00', value: 35 },
    { label: '08:00', value: 50 },
    { label: '12:00', value: 75 },
    { label: '16:00', value: 60 },
    { label: '20:00', value: 40 },
  ];

  return (
    <div className="w-full h-32 flex items-end justify-between gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-2 flex-1">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${item.value}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className="w-full bg-gradient-to-t from-[var(--active-neon)] to-[var(--active-neon)]/50 rounded-t-sm"
          />
          <span className="text-[8px] font-mono text-zinc-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export default SecurityCharts;
