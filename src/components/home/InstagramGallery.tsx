'use client';

import React from 'react';
import Image from 'next/image';
import { Heart, Sparkles } from 'lucide-react';
import { InstagramIcon } from '@/components/common/InstagramIcon';

export const InstagramGallery: React.FC = () => {
  const posts = [
    {
      id: 1,
      image: '/images/products/extra_whitening_combo_poster.jpg',
      likes: '2.4k',
      caption: 'The 3-Step Routine everyone is raving about! Cleanse, Treat, Protect ✨ #KhushiGlow',
    },
    {
      id: 2,
      image: '/images/products/king_night_cream_poster.jpg',
      likes: '4.1k',
      caption: 'Night time glow essential: The King Night Cream 20g & 100g 👑 #OvernightRadiance',
    },
    {
      id: 3,
      image: '/images/products/coffee_whitening_set_poster.jpg',
      likes: '1.9k',
      caption: 'Weekend coffee facial glow at home! Scrub + Pack + Golden Gel ☕✨',
    },
    {
      id: 4,
      image: '/images/products/night_creams_100g_poster.jpg',
      likes: '3.8k',
      caption: 'Bridal Night Cream 100g luxury jar for photo-ready dewy skin 🌸 #KhushiAndGohar',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-xs font-bold uppercase tracking-wider text-[#D66B8B] mb-2 border border-[#F8D7E3]">
            <InstagramIcon className="w-3.5 h-3.5" />
            <span>@khushi_skinwhitening_cream_</span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl md:text-4xl font-bold text-[#3A3034]">
            Follow Our Instagram Community
          </h2>
          <p className="text-xs sm:text-sm text-[#6E6266] mt-2">
            Real customer transformations, unboxings, and glow tutorials posted daily.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/khushi_skinwhitening_cream_/"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-4/5 rounded-3xl overflow-hidden shadow-xs hover:shadow-pink-soft border border-[#F8D7E3] bg-[#FFF4F7] transition-all"
            >
              <Image
                src={post.image}
                alt="Khushi Instagram Post"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 text-white">
                <div className="flex justify-end">
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <InstagramIcon className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold mb-1 text-pink-200">
                    <Heart className="w-3.5 h-3.5 fill-pink-200" />
                    <span>{post.likes}</span>
                  </div>
                  <p className="text-[11px] text-white/90 line-clamp-2 leading-tight">
                    {post.caption}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/khushi_skinwhitening_cream_/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#D66B8B] to-[#EFAFC3] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-pink-soft hover:opacity-95 transition-all"
          >
            <InstagramIcon className="w-4 h-4" />
            <span>Join 50k+ Followers on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
};
