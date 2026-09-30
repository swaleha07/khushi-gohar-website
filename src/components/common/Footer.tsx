'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Lock, ShieldCheck, Heart, Sparkles, Phone, Mail } from 'lucide-react';
import { InstagramIcon } from '@/components/common/InstagramIcon';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide storefront footer on admin panel pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#FFF4F7] border-t border-[#F8D7E3] text-[#3A3034] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[#F8D7E3]">
          {/* Brand Info (Cols 1-5) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative w-14 h-14 rounded-full overflow-hidden border border-[#F8D7E3] bg-white p-1 shadow-sm group-hover:scale-105 transition-transform shrink-0">
                <Image
                  src="/images/brand/kg_logo.jpg"
                  alt="Khushi & Gohar"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-wider text-[#3A3034]">
                  Khushi & Gohar
                </h3>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#D66B8B] font-semibold">
                  EXTRA WHITENING & GLOW
                </p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-[#6E6266] leading-relaxed max-w-sm">
              India&apos;s trusted luxury beauty brand delivering authentic Ayurvedic and modern clinical
              skincare. Crafted with saffron, 24K gold, pure rose extracts, and active whitening peptides
              for guaranteed visible radiance.
            </p>

            <div className="pt-2">
              <a
                href="https://www.instagram.com/khushi_skinwhitening_cream_/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#F8D7E3] rounded-full text-xs font-semibold text-[#D66B8B] hover:bg-[#F8D7E3] transition-all shadow-xs group"
              >
                <InstagramIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Follow @khushi_skinwhitening_cream_</span>
              </a>
            </div>
          </div>

          {/* Quick Links (Cols 6-8) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-[#3A3034] tracking-wide">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs text-[#6E6266]">
              <li>
                <Link href="/shop" className="hover:text-[#D66B8B] transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/category/skincare" className="hover:text-[#D66B8B] transition-colors">
                  Whitening Creams & Care
                </Link>
              </li>
              <li>
                <Link href="/category/combos" className="hover:text-[#D66B8B] transition-colors">
                  Combos & Kits
                </Link>
              </li>
              <li>
                <Link href="/category/facewash" className="hover:text-[#D66B8B] transition-colors">
                  Face Wash & Cleansers
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#D66B8B] transition-colors">
                  Our Brand Heritage
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care & Policies (Cols 9-12) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-serif-luxury font-bold text-sm text-[#3A3034] tracking-wide">
              Customer Support & Policies
            </h4>
            <ul className="space-y-2 text-xs text-[#6E6266]">
              <li>
                <Link href="/shipping" className="hover:text-[#D66B8B] transition-colors">
                  Shipping & Express Delivery
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-[#D66B8B] transition-colors">
                  Returns & Refunds Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#D66B8B] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#D66B8B] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#D66B8B] transition-colors">
                  Contact Customer Care
                </Link>
              </li>
            </ul>

            <div className="pt-2 flex items-center gap-2 text-xs text-[#2E7D32] font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
              <span>100% Genuine Ayurvedic & Clinical Guarantee</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Policies & Subtle Admin Login */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6E6266]">
          <div className="text-center sm:text-left">
            <p>© {new Date().getFullYear()} Khushi & Gohar. All rights reserved.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs">
            <Link href="/privacy" className="hover:text-[#D66B8B] transition-colors">
              Privacy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#D66B8B] transition-colors">
              Terms
            </Link>
            <span>•</span>
            {/* Subtle Professional Admin Login Link */}
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-[#6E6266]/80 hover:text-[#D66B8B] transition-colors font-medium group"
              title="Store Administrator Login Portal"
            >
              <Lock className="w-3.5 h-3.5 group-hover:text-[#D66B8B] transition-colors" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
