import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-xs sm:text-sm text-[#6E6266] leading-relaxed">
        <h1 className="font-serif-luxury text-3xl font-bold text-[#3A3034] pb-4 border-b border-[#F8D7E3]">
          Privacy Policy
        </h1>
        <p>
          At <strong>Khushi & Gohar</strong>, accessible from khushigohar.com, we prioritize the privacy of our visitors and customers. This Privacy Policy document contains types of information that is collected and recorded by our platform and how we use it.
        </p>
        <h3 className="font-serif-luxury text-base font-bold text-[#3A3034]">Information We Collect</h3>
        <p>
          When you place an order, we collect essential details such as your name, delivery address, phone number, and email address solely to fulfill your order and provide delivery tracking updates.
        </p>
        <h3 className="font-serif-luxury text-base font-bold text-[#3A3034]">Data Security</h3>
        <p>
          All payment transactions are encrypted using industry-standard 256-bit SSL technology. We never store credit/debit card numbers or UPI PINs on our servers.
        </p>
      </div>
    </div>
  );
}
