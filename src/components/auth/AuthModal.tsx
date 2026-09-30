'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Phone,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const COUNTRY_CODES = [
  { code: '+91', country: 'India', flag: '🇮🇳' },
  { code: '+1', country: 'USA / Canada', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+61', country: 'Australia', flag: '🇦🇺' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
];

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalView,
    redirectUrl,
    closeAuthModal,
    sendOtp,
    verifyOtp,
    updateName,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Countdown timer for Resend OTP
  const [countdown, setCountdown] = useState(0);

  // Input refs for 6 OTP boxes
  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthModalOpen) {
      setActiveTab(authModalView);
      setStep('phone');
      setOtpDigits(['', '', '', '', '', '']);
      setErrorMessage(null);
    }
  }, [isAuthModalOpen, authModalView]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (countryCode === '+91' && cleanNumber.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      setErrorMessage('Please enter a valid mobile number.');
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(cleanNumber, countryCode, activeTab);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to send OTP.');
      return;
    }

    setMaskedPhone(res.maskedPhone || `${countryCode} ${cleanNumber.slice(0, 3)}••••${cleanNumber.slice(-2)}`);
    setCountdown(res.cooldownSeconds || 60);
    setStep('otp');

    // Auto focus first OTP input after render
    setTimeout(() => {
      otpInputsRef.current[0]?.focus();
    }, 100);
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    setErrorMessage(null);

    // Auto advance to next box
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto submit if all 6 digits entered
    if (digit && index === 5 && newDigits.every((d) => d !== '')) {
      triggerVerify(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      const splitDigits = pasted.split('');
      setOtpDigits(splitDigits);
      otpInputsRef.current[5]?.focus();
      triggerVerify(pasted);
    }
  };

  const triggerVerify = async (fullCode?: string) => {
    const otp = fullCode || otpDigits.join('');
    if (otp.length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const res = await verifyOtp(cleanNumber, countryCode, otp);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Incorrect OTP code.');
      return;
    }

    // If new user and name not yet provided, transition to name step
    if (res.isNewUser && !res.user?.name) {
      setStep('name');
      return;
    }

    finishAuthFlow();
  };

  const handleNameSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (fullName.trim()) {
      setIsLoading(true);
      await updateName(fullName.trim());
      setIsLoading(false);
    }
    finishAuthFlow();
  };

  const finishAuthFlow = () => {
    closeAuthModal();
    if (redirectUrl) {
      router.push(redirectUrl);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    setErrorMessage(null);

    const cleanNumber = phoneNumber.replace(/\D/g, '');
    const res = await sendOtp(cleanNumber, countryCode, activeTab);
    setIsLoading(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to resend OTP.');
      return;
    }

    setCountdown(res.cooldownSeconds || 60);
    setOtpDigits(['', '', '', '', '', '']);
    otpInputsRef.current[0]?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 md:p-8 border border-[#F8D7E3] shadow-2xl space-y-5 sm:space-y-6 text-[#3A3034]">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 text-[#6E6266] hover:text-[#D66B8B] rounded-full hover:bg-[#FFF4F7] transition-colors focus:outline-none"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-[11px] font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3] mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Khushi & Gohar VIP Portal</span>
          </div>

          <h2 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">
            {step === 'phone'
              ? activeTab === 'login'
                ? 'Welcome Back'
                : 'Create Account'
              : step === 'otp'
              ? 'Verify Mobile Number'
              : 'One Last Step ✨'}
          </h2>

          <p className="text-xs text-[#6E6266]">
            {step === 'phone'
              ? 'Enter your mobile number to receive a secure instant OTP.'
              : step === 'otp'
              ? `We sent a 6-digit verification code to ${maskedPhone}`
              : 'Tell us your name so we can personalize your luxury skincare experience.'}
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <p>{errorMessage}</p>
              {errorMessage.includes('not registered') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setErrorMessage(null);
                  }}
                  className="mt-1.5 font-bold text-[#D66B8B] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Click here to create a new account</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
              {errorMessage.includes('already exists') && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage(null);
                  }}
                  className="mt-1.5 font-bold text-[#D66B8B] hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Click here to log in</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 1: Phone Number Input */}
        {step === 'phone' && (
          <div className="space-y-4">
            {/* Tab Toggle: Login vs Sign Up */}
            <div className="grid grid-cols-2 p-1 bg-[#FFF4F7] rounded-2xl border border-[#F8D7E3]">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-[#D66B8B] shadow-xs'
                    : 'text-[#6E6266] hover:text-[#3A3034]'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('signup');
                  setErrorMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'signup'
                    ? 'bg-white text-[#D66B8B] shadow-xs'
                    : 'text-[#6E6266] hover:text-[#3A3034]'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3A3034] mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="flex rounded-2xl border border-[#F8D7E3] bg-white focus-within:ring-2 focus-within:ring-[#D66B8B] focus-within:border-transparent transition-all overflow-hidden shadow-xs">
                  {/* Country Code Dropdown */}
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="bg-[#FFF4F7]/60 text-xs font-semibold text-[#3A3034] px-3 py-3.5 border-r border-[#F8D7E3] focus:outline-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>

                  {/* Phone Input */}
                  <div className="relative flex-1 flex items-center">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder={countryCode === '+91' ? '98765 43210' : 'Mobile number'}
                      maxLength={15}
                      autoFocus
                      className="w-full px-3.5 py-3.5 text-sm font-medium text-[#3A3034] placeholder:text-[#6E6266]/50 focus:outline-none bg-transparent"
                    />
                    <Phone className="w-4 h-4 text-[#D66B8B] mr-3 shrink-0" />
                  </div>
                </div>
                <p className="text-[10px] text-[#6E6266] mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#2E7D32]" />
                  <span>No password or email required. Fast & secure 256-bit mobile OTP.</span>
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-pink-soft flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: 6-Digit OTP Input */}
        {step === 'otp' && (
          <div className="space-y-5">
            {/* Number recap & edit action */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF4F7] border border-[#F8D7E3] text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
                <span className="font-semibold text-[#3A3034]">{maskedPhone}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setErrorMessage(null);
                }}
                className="text-[11px] font-bold text-[#D66B8B] hover:underline"
              >
                Edit Number
              </button>
            </div>

            {/* 6 Individual OTP Boxes */}
            <div>
              <label className="block text-center text-xs font-bold text-[#3A3034] mb-3">
                Enter 6-Digit Code
              </label>
              <div className="flex items-center justify-center gap-1.5 xs:gap-2 sm:gap-2.5 max-w-full overflow-hidden px-1" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-9 h-11 xs:w-10 xs:h-12 sm:w-11 sm:h-13 md:w-12 md:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl border-2 border-[#F8D7E3] focus:border-[#D66B8B] focus:ring-2 focus:ring-[#D66B8B]/20 focus:outline-none transition-all bg-white text-[#3A3034] shadow-xs shrink-0"
                  />
                ))}
              </div>
            </div>

            {/* Verify CTA */}
            <button
              type="button"
              onClick={() => triggerVerify()}
              disabled={isLoading || otpDigits.some((d) => d === '')}
              className="w-full py-4 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-pink-soft flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Code...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify & Access Account</span>
                </>
              )}
            </button>

            {/* Resend OTP & Countdown */}
            <div className="text-center pt-1">
              {countdown > 0 ? (
                <p className="text-xs text-[#6E6266]">
                  Resend code in{' '}
                  <span className="font-mono font-bold text-[#D66B8B]">
                    00:{countdown.toString().padStart(2, '0')}
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D66B8B] hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP Code</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: Optional Name Input for New Users */}
        {step === 'name' && (
          <form onSubmit={handleNameSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#3A3034]">
                Your Name <span className="font-normal text-[#6E6266]">(Optional)</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Pooja Sharma"
                autoFocus
                className="w-full px-4 py-3.5 text-sm rounded-2xl border border-[#F8D7E3] focus:border-[#D66B8B] focus:ring-2 focus:ring-[#D66B8B]/20 focus:outline-none transition-all shadow-xs"
              />
              <p className="text-[11px] text-[#6E6266]">
                We use your name for order invoices and special birthday glow gifts!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => finishAuthFlow()}
                className="py-3.5 px-4 rounded-2xl border border-[#F8D7E3] text-xs font-bold text-[#6E6266] hover:bg-[#FFF4F7] transition-all text-center"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="py-3.5 px-4 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-pink-soft flex items-center justify-center gap-1.5 transition-all"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Continue</span>}
              </button>
            </div>
          </form>
        )}

        {/* Luxury Trust Footer */}
        <div className="pt-2 border-t border-[#F8D7E3]/60 flex items-center justify-center gap-2 text-[10px] text-[#6E6266]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>100% Secure Official Khushi & Gohar Member Protection</span>
        </div>
      </div>
    </div>
  );
};
