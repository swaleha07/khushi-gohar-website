'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, Gift, Truck } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const pathname = usePathname();
  const { activeOffer } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const messages = [
    {
      icon: <Sparkles className="w-3.5 h-3.5 text-[#D66B8B]" />,
      text: '✨ 100% Authentic Khushi & Gohar Formulations | Visible Glow in 7 Days!',
      link: '/shop',
    },
    {
      icon: <Truck className="w-3.5 h-3.5 text-[#D66B8B]" />,
      text: '🚚 FREE Express Delivery across India on orders above ₹999 + COD Available',
      link: '/shipping',
    },
    ...(activeOffer
      ? [
          {
            icon: <Gift className="w-3.5 h-3.5 text-[#D66B8B]" />,
            text: `🎁 ${activeOffer.title}: ${activeOffer.subtitle}`,
            link: activeOffer.ctaLink || '/shop',
          },
        ]
      : []),
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % messages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="bg-[#FFF4F7] border-b border-[#F8D7E3] py-2 px-4 text-center transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-xs md:text-sm font-medium text-[#3A3034]">
        <Link
          href={messages[currentIdx].link}
          className="flex items-center gap-2 hover:text-[#D66B8B] transition-colors"
        >
          {messages[currentIdx].icon}
          <span>{messages[currentIdx].text}</span>
        </Link>
      </div>
    </div>
  );
};
