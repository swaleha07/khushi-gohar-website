'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export const LogoLoader: React.FC = () => {
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    // Only show on first page load or session
    const hasLoaded = sessionStorage.getItem('kg_loader_seen');
    if (hasLoaded) {
      setShowLoader(false);
      return;
    }

    const timer = setTimeout(() => {
      setShowLoader(false);
      sessionStorage.setItem('kg_loader_seen', 'true');
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {showLoader && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6, ease: 'easeInOut' } }}
          className="fixed inset-0 z-99999 flex flex-col items-center justify-center bg-white"
        >
          {/* Subtle soft pink background radial glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FFF4F7] via-white to-white pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{
              opacity: [0, 1, 1, 0.9],
              scale: [0.85, 1.02, 1, 1.05],
              transition: { duration: 1.8, ease: 'easeOut' },
            }}
            className="relative z-10 flex flex-col items-center text-center px-4"
          >
            <div className="relative w-40 h-40 md:w-48 md:h-48 mb-4 drop-shadow-sm rounded-full overflow-hidden p-2 bg-white/80 border border-[#F8D7E3]/60 shadow-pink-soft">
              <Image
                src="/images/brand/kg_logo.jpg"
                alt="Khushi & Gohar"
                fill
                className="object-contain p-2"
                priority
              />
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.6 } }}
              className="text-2xl md:text-3xl font-serif-luxury tracking-widest text-[#3A3034] uppercase"
            >
              Khushi & Gohar
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5, duration: 0.6 } }}
              className="text-xs md:text-sm tracking-[0.25em] text-[#D66B8B] uppercase font-medium mt-1"
            >
              Extra Whitening & Luxury Care
            </motion.p>

            {/* Subtle luxury pulse bar */}
            <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-[#EFAFC3] to-transparent mt-6 overflow-hidden relative">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                className="w-full h-full bg-[#D66B8B]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
