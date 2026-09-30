'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { InstagramIcon } from '@/components/common/InstagramIcon';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h1 className="font-serif-luxury text-3xl sm:text-4xl font-bold text-[#3A3034]">
            Get In Touch
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6266]">
            Have questions regarding your order, ingredients, or need personalized glow guidance? We&apos;re here to assist you!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Support Channels */}
          <div className="md:col-span-5 space-y-4">
            <div className="p-6 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs space-y-4 text-xs">
              <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">
                Customer Care Channels
              </h3>

              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl font-semibold hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <p className="text-xs font-bold">WhatsApp Support</p>
                  <p className="text-[10px] font-normal text-emerald-700">Chat with a beauty consultant</p>
                </div>
              </a>

              <div className="flex items-center gap-3 p-3 bg-[#FFF4F7] rounded-2xl border border-[#F8D7E3]">
                <Phone className="w-4 h-4 text-[#D66B8B]" />
                <div>
                  <p className="font-bold text-[#3A3034]">Helpline Number</p>
                  <p className="text-[#6E6266]">+91 98765 43210 (Mon-Sat, 10 AM - 7 PM)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#FFF4F7] rounded-2xl border border-[#F8D7E3]">
                <Mail className="w-4 h-4 text-[#D66B8B]" />
                <div>
                  <p className="font-bold text-[#3A3034]">Email Support</p>
                  <p className="text-[#6E6266]">care@khushigohar.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-[#FFF4F7] rounded-2xl border border-[#F8D7E3]">
                <InstagramIcon className="w-4 h-4 text-[#D66B8B]" />
                <div>
                  <p className="font-bold text-[#3A3034]">Official Instagram</p>
                  <a
                    href="https://www.instagram.com/khushi_skinwhitening_cream_/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D66B8B] hover:underline"
                  >
                    @khushi_skinwhitening_cream_
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Message Form */}
          <div className="md:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#F8D7E3] shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-[#2E7D32] mx-auto" />
                <h3 className="font-serif-luxury font-bold text-lg text-[#3A3034]">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-[#6E6266]">
                  Thank you for reaching out. Our support specialist will respond within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-6 py-2 bg-[#FFF4F7] border border-[#F8D7E3] text-[#3A3034] rounded-full text-xs font-bold mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <h3 className="font-serif-luxury font-bold text-base text-[#3A3034] mb-2">
                  Send Us a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pooja Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-[#3A3034] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. pooja@gmail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">How Can We Help?</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Describe your inquiry or order details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FFF4F7]/60 rounded-xl border border-[#F8D7E3] text-[#3A3034] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-pink-soft flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
