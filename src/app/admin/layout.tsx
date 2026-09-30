'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  Users,
  Gift,
  LayoutTemplate,
  Settings,
  Menu,
  X,
  Sparkles,
  ExternalLink,
  ImageIcon,
  LogOut,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // If we are on the login page, render only the login view without admin chrome
  const isLoginPage = pathname === '/admin/login';
  const [isAuthorized, setIsAuthorized] = useState<boolean>(isLoginPage);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(!isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setCheckingAuth(false);
      setIsAuthorized(true);
      return;
    }

    // Defense-in-depth: verify session state on client transitions
    fetch('/api/admin/me')
      .then((res) => {
        if (!res.ok) {
          window.location.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          return;
        }
        return res.json().then((data) => {
          if (data && data.authenticated) {
            setIsAuthorized(true);
            setCheckingAuth(false);
          } else {
            window.location.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
          }
        });
      })
      .catch(() => {
        window.location.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      });
  }, [pathname, isLoginPage]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checkingAuth || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#FAF5F7] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white border border-[#F8D7E3] flex items-center justify-center shadow-xs mb-4">
          <Sparkles className="w-7 h-7 text-[#D66B8B] animate-pulse" />
        </div>
        <h2 className="font-serif-luxury text-lg font-bold text-[#3A3034]">
          Verifying Administrator Privileges...
        </h2>
        <p className="text-xs text-[#6E6266] mt-1">Secured Khushi & Gohar Administrative Portal</p>
      </div>
    );
  }

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    }
    // Prevent browser back navigation by replacing history entry
    window.location.replace('/admin/login');
  };

  const adminNav = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Categories & Media', href: '/admin/categories', icon: ImageIcon },
    { name: 'Products & Variants', href: '/admin/products', icon: Package },
    { name: 'Live Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Customer CRM', href: '/admin/customers', icon: Users },
    { name: 'Today’s Gift Offers', href: '/admin/offers', icon: Gift },
    { name: 'Homepage CMS', href: '/admin/homepage', icon: LayoutTemplate },
    { name: 'Store Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF5F7] flex flex-col lg:flex-row text-[#3A3034]">
      {/* Mobile Admin Header */}
      <div className="lg:hidden bg-white border-b border-[#F8D7E3] p-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-[#3A3034] hover:text-[#D66B8B]"
            aria-label="Toggle admin sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-serif-luxury font-bold text-base text-[#3A3034]">
            Khushi & Gohar Admin
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-semibold text-[#D66B8B] flex items-center gap-1 bg-[#FFF4F7] px-2.5 py-1 rounded-full border border-[#F8D7E3]"
          >
            <span>Live Store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs font-semibold text-rose-600 flex items-center gap-1 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 transition-colors"
            title="Sign out from admin panel"
          >
            <LogOut className="w-3 h-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-[#F8D7E3] flex flex-col justify-between p-5 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#F8D7E3]">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-[#F8D7E3] bg-white p-1">
              <Image src="/images/brand/kg_logo.jpg" alt="Khushi & Gohar" fill className="object-contain" />
            </div>
            <div>
              <h2 className="font-serif-luxury font-bold text-sm text-[#3A3034]">Khushi & Gohar</h2>
              <span className="text-[10px] font-bold text-[#D66B8B] uppercase tracking-wider bg-[#FFF4F7] px-2 py-0.5 rounded-md inline-block">
                Store Admin
              </span>
            </div>
          </div>

          {/* Nav items */}
          <nav className="space-y-1">
            {adminNav.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#D66B8B] text-white shadow-pink-soft'
                      : 'text-[#3A3034] hover:bg-[#FFF4F7] hover:text-[#D66B8B]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Live Store & Admin Logout */}
        <div className="pt-4 border-t border-[#F8D7E3] space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between p-2.5 bg-[#FFF4F7] hover:bg-[#F8D7E3] rounded-2xl text-xs font-bold text-[#3A3034] transition-colors border border-[#F8D7E3]"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#D66B8B]" />
              <span>View Live Store</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D66B8B]" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-between p-2.5 bg-rose-50/80 hover:bg-rose-100 text-rose-700 rounded-2xl text-xs font-bold transition-colors border border-rose-200"
          >
            <span className="flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>{loggingOut ? 'Signing out...' : 'Admin Logout'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-rose-500 bg-white px-2 py-0.5 rounded-full border border-rose-200">
              Exit
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
