'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Sparkles, ShieldCheck, Heart, ShoppingBag, ChevronDown, User, LogOut, Lock } from 'lucide-react';
import { InstagramIcon } from '@/components/common/InstagramIcon';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

export interface MobileNavItem {
  name: string;
  href: string;
  hasDropdown?: boolean;
  dropdownItems?: { name: string; href: string }[];
}

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  navItems?: MobileNavItem[];
  navLinks?: { name: string; href: string }[];
}

export const MobileNav: React.FC<MobileNavProps> = ({
  isOpen,
  onClose,
  navItems,
  navLinks,
}) => {
  const [expandedDropdown, setExpandedDropdown] = useState<string | null>('Skincare');
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  const items: MobileNavItem[] =
    navItems ||
    (navLinks || []).map((l) => ({
      name: l.name,
      href: l.href,
    }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col justify-between overflow-y-auto"
          >
            <div>
              {/* Header */}
              <div className="p-5 border-b border-[#F8D7E3] flex items-center justify-between bg-[#FFF4F7]">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#F8D7E3] bg-white">
                    <Image
                      src="/images/brand/kg_logo.jpg"
                      alt="Khushi & Gohar"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-serif-luxury font-bold text-[#3A3034] text-base">
                      Khushi & Gohar
                    </h3>
                    <p className="text-[10px] tracking-wider text-[#D66B8B] uppercase font-medium">
                      Whitening Cream
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-[#3A3034] hover:text-[#D66B8B] rounded-full hover:bg-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="py-4 px-3 space-y-1">
                {items.map((item) => {
                  if (item.hasDropdown && item.dropdownItems) {
                    const isExpanded = expandedDropdown === item.name;

                    return (
                      <div key={item.name} className="rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 rounded-xl text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] font-medium text-sm transition-all">
                          <Link href={item.href} onClick={onClose} className="flex-1">
                            <span>{item.name}</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => setExpandedDropdown(isExpanded ? null : item.name)}
                            className="p-1 text-[#6E6266] hover:text-[#D66B8B]"
                            aria-label={`Toggle ${item.name} submenu`}
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#D66B8B]' : ''
                              }`}
                            />
                          </button>
                        </div>

                        {/* Submenu Accordion */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-6 pr-2 py-1 space-y-1 bg-[#FFF4F7]/40 rounded-xl"
                            >
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold text-[#D66B8B] hover:bg-[#FFF4F7]"
                              >
                                <span>All {item.name}</span>
                                <span className="text-[10px]">→</span>
                              </Link>
                              {item.dropdownItems.map((sub) => (
                                <Link
                                  key={sub.name}
                                  href={sub.href}
                                  onClick={onClose}
                                  className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7]"
                                >
                                  <span>{sub.name}</span>
                                  <span className="text-[10px] text-[#EFAFC3]">→</span>
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] font-medium text-sm transition-all"
                    >
                      <span>{item.name}</span>
                      <span className="text-xs text-[#EFAFC3]">→</span>
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-[#F8D7E3]/60 mt-3 space-y-1">
                  {!isAuthenticated ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        openAuthModal('login');
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-pink-soft transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span>Login / Create Account</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-[#FFF4F7] rounded-2xl border border-[#F8D7E3] mb-2 space-y-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#D66B8B] text-white text-xs font-bold flex items-center justify-center">
                          {user?.name ? user.name.charAt(0).toUpperCase() : '✦'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#3A3034] truncate">
                            Hey, Gorgeous {user?.name || ''}
                          </p>
                          <p className="text-[10px] text-[#6E6266] font-mono">{user?.phone}</p>
                        </div>
                      </div>
                      <Link
                        href="/account"
                        onClick={onClose}
                        className="block text-center py-1.5 bg-white border border-[#F8D7E3] rounded-xl text-xs font-semibold text-[#D66B8B]"
                      >
                        Manage Account & Addresses
                      </Link>
                    </div>
                  )}

                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] rounded-xl font-medium"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#D66B8B]" />
                    <span>Track My Orders</span>
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] rounded-xl font-medium"
                  >
                    <Heart className="w-4 h-4 text-[#D66B8B]" />
                    <span>My Wishlist</span>
                  </Link>
                  {isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 rounded-xl font-medium text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Logout</span>
                    </button>
                  )}

                </div>
              </div>
            </div>

            {/* Bottom Support, Socials & Admin Login */}
            <div className="p-5 border-t border-[#F8D7E3] bg-[#FFF4F7]/60">
              <a
                href="https://www.instagram.com/khushi_skinwhitening_cream_/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-semibold text-[#D66B8B] mb-2 hover:underline"
              >
                <InstagramIcon className="w-4 h-4" />
                <span>@khushi_skinwhitening_cream_</span>
              </a>
              <p className="text-[11px] text-[#6E6266] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>100% Authentic Indian Skincare Formulations</span>
              </p>
              <div className="pt-3 mt-3 border-t border-[#F8D7E3]/60 flex items-center justify-between text-[11px] text-[#6E6266]">
                <span>Khushi & Gohar VIP</span>
                <Link
                  href="/admin/login"
                  onClick={onClose}
                  className="inline-flex items-center gap-1 text-[#6E6266] hover:text-[#D66B8B] font-medium transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  <span>Admin Login</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
