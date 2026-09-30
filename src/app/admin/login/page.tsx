'use client';

import React, { useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter both Admin ID and Password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setError(data.error || 'Invalid credentials. Please verify your Admin ID and Password.');
        setLoading(false);
        return;
      }

      // Successful login -> navigate to protected admin area
      router.replace(redirectPath);
      router.refresh();
    } catch {
      setError('Unable to reach the authentication server. Please check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF5F7] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#F8D7E3] selection:text-[#3A3034]">
      {/* Background ambient luxury blush glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F8D7E3]/60 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#FFEBF0]/70 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Card */}
        <div className="bg-white rounded-3xl border border-[#F8D7E3] shadow-[0_12px_40px_rgba(214,107,139,0.08)] p-7 sm:p-9 relative">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-[#F8D7E3] bg-white p-1 shadow-sm mb-3.5">
              <Image
                src="/images/brand/kg_logo.jpg"
                alt="Khushi & Gohar"
                fill
                className="object-contain"
                priority
              />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] border border-[#F8D7E3] text-[#D66B8B] text-[10px] font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Administrative Portal</span>
            </div>

            <h1 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">
              Khushi & Gohar
            </h1>
            <p className="text-xs text-[#6E6266] mt-1">
              Sign in with your administrator credentials
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-username"
                className="block text-xs font-bold uppercase tracking-wider text-[#3A3034] mb-1.5"
              >
                Admin ID / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E6266]/70">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="admin-username"
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. khushi_admin"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF5F7] border border-[#F8D7E3] rounded-2xl text-xs font-medium text-[#3A3034] placeholder-[#6E6266]/50 focus:outline-none focus:ring-2 focus:ring-[#D66B8B]/30 focus:border-[#D66B8B] transition-all"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold uppercase tracking-wider text-[#3A3034] mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6E6266]/70">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#FAF5F7] border border-[#F8D7E3] rounded-2xl text-xs font-medium text-[#3A3034] placeholder-[#6E6266]/50 focus:outline-none focus:ring-2 focus:ring-[#D66B8B]/30 focus:border-[#D66B8B] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6E6266]/70 hover:text-[#D66B8B] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-pink-soft flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Login to Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security notice badge */}
          <div className="mt-6 pt-5 border-t border-[#F8D7E3] flex items-center justify-center gap-2 text-[11px] text-[#6E6266]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Encrypted Session • Authorized Personnel Only</span>
          </div>
        </div>

        {/* Back to Live Store Link */}
        <div className="text-center mt-5">
          <Link
            href="/"
            className="text-xs font-semibold text-[#6E6266] hover:text-[#D66B8B] transition-colors inline-flex items-center gap-1.5"
          >
            <span>← Back to Live Store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF5F7] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#D66B8B]" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
