'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Heart, ShoppingBag, User, Menu, Sparkles, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { MobileNav } from './MobileNav';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { cartCount, setIsDrawerOpen } = useCart();
  const { wishlist } = useWishlist();
  const { setSearchOpen } = useStore();
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [skincareDropdownOpen, setSkincareDropdownOpen] = useState(false);

  // Exact Main Navigation order:
  // Home | Shop | Skincare (with Facewash & Soaps, Lipcare submenu) | Bodycare | Haircare | Combos
  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/shop' },
    {
      name: 'Skincare',
      href: '/category/skincare',
      hasDropdown: true,
      dropdownItems: [
        { name: 'Facewash & Soaps', href: '/category/facewash' },
        { name: 'Lipcare', href: '/category/lipcare' },
      ],
    },
    { name: 'Bodycare', href: '/category/bodycare' },
    { name: 'Haircare', href: '/category/haircare' },
    { name: 'Combos', href: '/category/combos' },
  ];

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F8D7E3] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Mobile Hamburger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 sm:p-2 text-[#3A3034] hover:text-[#D66B8B] rounded-lg transition-colors focus:outline-none"
                aria-label="Open mobile menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Brand Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden border border-[#F8D7E3] p-0.5 sm:p-1 bg-white shadow-sm group-hover:scale-105 transition-transform shrink-0">
                  <Image
                    src="/images/brand/kg_logo.jpg"
                    alt="Khushi & Gohar"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif-luxury text-base sm:text-lg md:text-xl font-bold tracking-wider text-[#3A3034] group-hover:text-[#D66B8B] transition-colors leading-tight whitespace-nowrap">
                    Khushi & Gohar
                  </span>
                  <span className="hidden xs:inline text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.2em] text-[#D66B8B] font-medium">
                    Whitening Cream
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navItems.map((item) => {
                if (item.hasDropdown) {
                  const isDropdownItemActive =
                    pathname === '/category/facewash' || pathname === '/category/lipcare';
                  const isSkincareActive = pathname === '/category/skincare';

                  return (
                    <div
                      key={item.name}
                      className="relative group/skincare py-2"
                      onMouseEnter={() => setSkincareDropdownOpen(true)}
                      onMouseLeave={() => setSkincareDropdownOpen(false)}
                    >
                      <Link
                        href={item.href}
                        className={`text-sm font-medium tracking-wide transition-colors relative py-1 flex items-center gap-1 hover:text-[#D66B8B] ${
                          isSkincareActive || isDropdownItemActive
                            ? 'text-[#D66B8B] font-semibold'
                            : 'text-[#3A3034]'
                        }`}
                      >
                        <span>{item.name}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform duration-200 ${
                            skincareDropdownOpen ? 'rotate-180 text-[#D66B8B]' : 'text-[#6E6266]'
                          }`}
                        />
                        {(isSkincareActive || isDropdownItemActive) && (
                          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D66B8B] rounded-full" />
                        )}
                      </Link>

                      {/* Dropdown Menu */}
                      <div
                        className={`absolute top-full left-0 pt-1.5 w-56 transition-all duration-200 z-50 ${
                          skincareDropdownOpen
                            ? 'opacity-100 translate-y-0 pointer-events-auto visible'
                            : 'opacity-0 -translate-y-2 pointer-events-none invisible'
                        }`}
                      >
                        <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-[#F8D7E3] shadow-pink-card p-2 space-y-1">
                          {item.dropdownItems?.map((drop) => {
                            const isDropActive = pathname === drop.href;
                            return (
                              <Link
                                key={drop.name}
                                href={drop.href}
                                onClick={() => setSkincareDropdownOpen(false)}
                                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors group/item ${
                                  isDropActive
                                    ? 'bg-[#FFF4F7] text-[#D66B8B]'
                                    : 'text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7]'
                                }`}
                              >
                                <span>{drop.name}</span>
                                <span
                                  className={`text-[11px] text-[#D66B8B] transition-opacity ${
                                    isDropActive
                                      ? 'opacity-100'
                                      : 'opacity-0 group-hover/item:opacity-100'
                                  }`}
                                >
                                  →
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium tracking-wide transition-colors relative py-1 hover:text-[#D66B8B] whitespace-nowrap ${
                      isActive ? 'text-[#D66B8B] font-semibold' : 'text-[#3A3034]'
                    }`}
                  >
                    {item.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D66B8B] rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
              {/* Search */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="p-1.5 sm:p-2.5 text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] rounded-full transition-colors"
                aria-label="Search catalog"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/account/wishlist"
                className="relative p-2.5 text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#EFAFC3] text-[#3A3034] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User Auth Action */}
              {!isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#3A3034] bg-white border border-[#F8D7E3] hover:border-[#D66B8B] hover:text-[#D66B8B] hover:bg-[#FFF4F7] transition-all shadow-xs active:scale-95"
                  >
                    <User className="w-3.5 h-3.5 text-[#D66B8B]" />
                    <span>Login / Create Account</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="md:hidden p-2.5 text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] rounded-full transition-colors"
                    aria-label="Login or Create Account"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <div className="relative group/account py-1">
                  <Link
                    href="/account"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] hover:border-[#D66B8B] transition-all shadow-xs"
                    aria-label="Customer Account Profile"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#D66B8B] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {user?.name ? user.name.charAt(0).toUpperCase() : '✦'}
                    </div>
                    <span className="hidden sm:inline text-xs font-bold text-[#3A3034] truncate max-w-[150px]">
                      Hey, Gorgeous {user?.name ? user.name.split(' ')[0] : ''}
                    </span>
                    <ChevronDown className="hidden sm:inline w-3 h-3 text-[#6E6266] group-hover/account:rotate-180 transition-transform" />
                  </Link>

                  {/* Account Quick Dropdown */}
                  <div className="absolute right-0 top-full pt-2 w-52 transition-all duration-200 z-50 opacity-0 -translate-y-2 pointer-events-none invisible group-hover/account:opacity-100 group-hover/account:translate-y-0 group-hover/account:pointer-events-auto group-hover/account:visible">
                    <div className="bg-white/98 backdrop-blur-md rounded-2xl border border-[#F8D7E3] shadow-pink-card p-2 space-y-1 text-xs">
                      <div className="px-3 py-2 border-b border-[#F8D7E3]/60 mb-1">
                        <p className="font-bold text-[#3A3034] truncate">{user?.name || 'Gorgeous Member'}</p>
                        <p className="text-[10px] text-[#6E6266] font-mono">{user?.phone}</p>
                      </div>
                      <Link
                        href="/account"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] font-semibold transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[#D66B8B]" />
                        <span>Account & Addresses</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] font-semibold transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#D66B8B]" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/account/wishlist"
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#3A3034] hover:text-[#D66B8B] hover:bg-[#FFF4F7] font-semibold transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-[#D66B8B]" />
                        <span>Wishlist</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}


              {/* Shopping Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="relative flex items-center gap-2 bg-[#F8D7E3] hover:bg-[#EFAFC3] text-[#3A3034] font-medium text-xs md:text-sm px-3.5 py-2 rounded-full transition-all shadow-sm active:scale-95"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-[#D66B8B]" />
                <span className="hidden sm:inline">Cart</span>
                <span className="w-5 h-5 bg-[#D66B8B] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navItems={navItems}
      />
    </>
  );
};
