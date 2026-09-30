import React from 'react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs sm:text-sm text-[#6E6266] leading-relaxed">
        <h1 className="font-serif-luxury text-3xl font-bold text-[#3A3034] pb-4 border-b border-[#F8D7E3]">
          Terms & Conditions
        </h1>
        <p>
          Welcome to <strong>Khushi & Gohar</strong>. By accessing our website and purchasing our whitening creams and skincare products, you agree to comply with and be bound by the following terms and conditions.
        </p>
        <h3 className="font-serif-luxury text-base font-bold text-[#3A3034]">Product Usage & Patch Test</h3>
        <p>
          Our products are formulated with natural extracts and active botanicals. We recommend performing a 24-hour patch test behind the ear before full facial application to ensure individual skin compatibility.
        </p>
        <h3 className="font-serif-luxury text-base font-bold text-[#3A3034]">Pricing & Availability</h3>
        <p>
          All product prices listed on the website are in Indian Rupees (INR) and inclusive of applicable GST taxes.
        </p>
      </div>
    </div>
  );
}
