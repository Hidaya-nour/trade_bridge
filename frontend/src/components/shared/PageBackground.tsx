// src/components/landing/shared/PageBackground.tsx
'use client';

import { motion } from 'framer-motion';

interface ConfettiDot {
  color: string;
  top: string;
  left: string;
  w: number;
  h: number;
}

const confettiDots: ConfettiDot[] = [
  { color: '#FF6B6B', top: '7%', left: '82%', w: 14, h: 14 },
  { color: '#FFD166', top: '10%', left: '18%', w: 10, h: 10 },
  { color: '#4D96FF', top: '22%', left: '92%', w: 8, h: 8 },
  { color: '#6BCB77', top: '80%', left: '8%', w: 12, h: 12 },
  { color: '#FF6FB5', top: '86%', left: '90%', w: 16, h: 16 },
  { color: '#FFD166', top: '60%', left: '4%', w: 8, h: 8 },
  { color: '#6BCB77', top: '35%', left: '96%', w: 10, h: 6 },
];

export function PageBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Soft blobs */}
      <div className="absolute left-[-96px] top-24 h-[360px] w-[360px] rounded-full bg-[#DDEAFB] blur-[2px]" />
      <div className="absolute right-[-120px] top-[-80px] h-[420px] w-[420px] rounded-full bg-[#E2EEFF] blur-[2px]" />
      <div className="absolute bottom-[-160px] left-[35%] h-[420px] w-[420px] rounded-full bg-[#E6F0FF] blur-[2px]" />

      {/* Confetti dots */}
      {confettiDots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            top: d.top,
            left: d.left,
            width: d.w,
            height: d.h,
            background: d.color,
            opacity: 0.9,
          }}
          animate={{ y: [0, -6, 0], rotate: [0, 6, 0] }}
          transition={{ duration: 4 + i * 0.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}