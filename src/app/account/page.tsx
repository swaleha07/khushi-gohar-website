'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  ShoppingBag,
  Heart,
  ShieldCheck,
  Plus,
  Trash2,
  CheckCircle2,
  Phone,
  MapPin,
  LogOut,
  Edit2,
  ArrowRight,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useWishlist } from '@/context/WishlistContext';
import { formatPrice, formatDate } from '@/lib/utils';
import { SavedAddress } from '@/types';

export default function AccountPage() {
  const {
    user,
    isAuthenticated,
    openAuthModal,
    updateName,
    addSavedAddress,
    deleteSavedAddress,
    setDefaultSavedAddress,
    logout,
  } = useAuth();

  const { orders, getCustomerOrders } = useStore();
  const { wishlist } = useWishlist();

  // Edit Name Modal State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  // Add Address Modal State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, 'id'>>({
    fullName: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    country: 'India',
    isDefault: false,
  });

  const indianStates = [
    'Andhra Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Delhi NCR', 'Goa',
    'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu & Kashmir', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan',
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  ];

  // User orders by verified mobile number
  const userOrders = user ? getCustomerOrders(user.phone) : [];

  // Logged-out state
  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] bg-gradient-to-b from-[#FFF4F7]/60 via-white to-white py-16 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#F8D7E3] shadow-pink-card text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center text-[#D66B8B] mx-auto shadow-xs">
            <User className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF4F7] text-[10px] font-bold uppercase tracking-wider text-[#D66B8B] border border-[#F8D7E3]">
              <Sparkles className="w-3 h-3" />
              <span>Khushi VIP Lounge</span>
            </div>
            <h1 className="font-serif-luxury text-2xl font-bold text-[#3A3034]">
              Access Your Account
            </h1>
            <p className="text-xs text-[#6E6266]">
              Sign in with your mobile phone number to view your orders, saved addresses, and radiant rewards.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => openAuthModal('login', '/account')}
              className="w-full py-4 px-6 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-2xl font-bold text-xs uppercase tracking-wider shadow-pink-soft flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Login with Mobile OTP</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => openAuthModal('signup', '/account')}
              className="w-full py-3.5 px-6 bg-white hover:bg-[#FFF4F7] text-[#3A3034] rounded-2xl font-bold text-xs border border-[#F8D7E3] transition-all"
            >
              <span>New to Khushi? Create an Account</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-[#6E6266]">
            <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
            <span>Instant 6-Digit OTP • No Password Required</span>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    setIsSavingName(true);
    await updateName(nameInput.trim());
    setIsSavingName(false);
    setIsEditingName(false);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.address || !addressForm.city || !addressForm.pincode) {
      alert('Please fill all required address fields.');
      return;
    }

    setIsSavingAddress(true);
    await addSavedAddress(addressForm);
    setIsSavingAddress(false);
    setIsAddingAddress(false);
    setAddressForm({
      fullName: user?.name || '',
      phone: user?.nationalNumber || '',
      address: '',
      landmark: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      country: 'India',
      isDefault: false,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF4F7]/40 via-white to-white py-10 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8D7E3] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#D66B8B] to-[#F8D7E3] text-white flex items-center justify-center text-2xl font-serif-luxury font-bold shadow-pink-soft shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : '✦'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3A3034]">
                  Hey, Gorgeous {user?.name || 'Radiant Star'}!
                </h1>
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(user?.name || '');
                    setIsEditingName(true);
                  }}
                  className="p-1.5 text-[#D66B8B] hover:bg-[#FFF4F7] rounded-lg transition-colors"
                  aria-label="Edit Name"
                  title="Edit Profile Name"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {/* Verified Mobile Badge */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D32]" />
                  <span className="font-mono">{user?.phone}</span>
                  <span>(Verified)</span>
                </span>
                <span className="text-[11px] text-[#6E6266]">
                  Member since {formatDate(user?.createdAt || new Date().toISOString())}
                </span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            href="/account/orders"
            className="p-6 bg-white rounded-3xl border border-[#F8D7E3] hover:border-[#D66B8B] shadow-xs hover:shadow-pink-card transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-[#6E6266] uppercase tracking-wider">
                My Orders
              </span>
              <p className="font-serif-luxury font-bold text-2xl text-[#3A3034] mt-1">
                {userOrders.length}
              </p>
              <span className="text-[11px] text-[#D66B8B] group-hover:underline">View dispatch tracking →</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center text-[#D66B8B]">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </Link>

          <Link
            href="/account/wishlist"
            className="p-6 bg-white rounded-3xl border border-[#F8D7E3] hover:border-[#D66B8B] shadow-xs hover:shadow-pink-card transition-all group flex items-center justify-between"
          >
            <div>
              <span className="text-xs font-semibold text-[#6E6266] uppercase tracking-wider">
                Saved Wishlist
              </span>
              <p className="font-serif-luxury font-bold text-2xl text-[#3A3034] mt-1">
                {wishlist.length}
              </p>
              <span className="text-[11px] text-[#D66B8B] group-hover:underline">View saved creams →</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center text-[#D66B8B]">
              <Heart className="w-6 h-6" />
            </div>
          </Link>

          <div className="p-6 bg-white rounded-3xl border border-[#F8D7E3] shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#6E6266] uppercase tracking-wider">
                Saved Addresses
              </span>
              <p className="font-serif-luxury font-bold text-2xl text-[#3A3034] mt-1">
                {user?.savedAddresses?.length || 0}
              </p>
              <span className="text-[11px] text-[#2E7D32] font-semibold">1-Click Fast Checkout Ready</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFF4F7] border border-[#F8D7E3] flex items-center justify-center text-[#D66B8B]">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Section: Saved Addresses */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8D7E3] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F8D7E3] gap-3">
            <div>
              <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">Saved Addresses</h2>
              <p className="text-xs text-[#6E6266]">
                Manage doorstep delivery addresses for fast 1-click checkout.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAddressForm({
                  fullName: user?.name || '',
                  phone: user?.nationalNumber || '',
                  address: '',
                  landmark: '',
                  city: '',
                  state: 'Maharashtra',
                  pincode: '',
                  country: 'India',
                  isDefault: (user?.savedAddresses?.length || 0) === 0,
                });
                setIsAddingAddress(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFF4F7] border border-[#F8D7E3] hover:bg-[#F8D7E3] text-[#3A3034] rounded-xl text-xs font-bold transition-all self-start"
            >
              <Plus className="w-4 h-4 text-[#D66B8B]" />
              <span>Add New Address</span>
            </button>
          </div>

          {(!user?.savedAddresses || user.savedAddresses.length === 0) ? (
            <div className="p-8 text-center bg-[#FFF4F7]/40 rounded-2xl border border-dashed border-[#F8D7E3] space-y-2">
              <MapPin className="w-8 h-8 text-[#D66B8B] mx-auto" />
              <h3 className="font-bold text-sm text-[#3A3034]">No Saved Addresses Yet</h3>
              <p className="text-xs text-[#6E6266] max-w-sm mx-auto">
                Add your home or office address to enjoy instant express delivery during checkout.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.savedAddresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`p-5 rounded-2xl border-2 transition-all space-y-2 relative ${
                    addr.isDefault
                      ? 'border-[#D66B8B] bg-[#FFF4F7]/40'
                      : 'border-[#F8D7E3] bg-white hover:border-[#D66B8B]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#3A3034]">{addr.fullName}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D66B8B] text-white uppercase tracking-wider">
                          Default
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteSavedAddress(addr.id)}
                      className="text-gray-400 hover:text-rose-600 p-1 transition-colors"
                      title="Delete address"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-[#6E6266] leading-relaxed">
                    {addr.address}
                    {addr.landmark ? `, ${addr.landmark}` : ''}, {addr.city}, {addr.state} -{' '}
                    <strong className="text-[#3A3034]">{addr.pincode}</strong>
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[#F8D7E3]/60 text-xs">
                    <span className="font-mono text-[11px] text-[#3A3034] flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#D66B8B]" />
                      {addr.phone}
                    </span>

                    {!addr.isDefault && (
                      <button
                        type="button"
                        onClick={() => setDefaultSavedAddress(addr.id)}
                        className="text-[11px] font-bold text-[#D66B8B] hover:underline"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: My Orders */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#F8D7E3] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F8D7E3]">
            <h2 className="font-serif-luxury text-xl font-bold text-[#3A3034]">Recent Orders</h2>
            <Link
              href="/account/orders"
              className="text-xs font-bold text-[#D66B8B] hover:underline flex items-center gap-1"
            >
              <span>View All ({userOrders.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {userOrders.length === 0 ? (
            <div className="p-8 text-center bg-[#FFF4F7]/40 rounded-2xl border border-dashed border-[#F8D7E3] space-y-2">
              <ShoppingBag className="w-8 h-8 text-[#D66B8B] mx-auto" />
              <h3 className="font-bold text-sm text-[#3A3034]">No Orders Placed Yet</h3>
              <p className="text-xs text-[#6E6266] max-w-sm mx-auto">
                Explore authentic 7-day glow creams, bridal combos, and luxury night creams.
              </p>
              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex px-6 py-2.5 bg-[#D66B8B] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-pink-soft"
                >
                  Start Shopping
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#F8D7E3]/60">
              {userOrders.slice(0, 3).map((ord) => (
                <div key={ord.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-xs text-[#3A3034]">
                        {ord.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          ord.orderStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.orderStatus === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E6266]">
                      {ord.items.map((i) => i.productName).join(', ')} • {formatDate(ord.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="font-bold text-sm text-[#3A3034]">{formatPrice(ord.total)}</span>
                    <Link
                      href={`/account/orders?id=${ord.id}`}
                      className="px-4 py-2 bg-[#FFF4F7] border border-[#F8D7E3] hover:bg-[#F8D7E3] text-[#3A3034] rounded-xl text-xs font-bold transition-colors"
                    >
                      Track & Invoice
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#F8D7E3] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]">
              <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">Update Name</h3>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="p-1.5 text-[#6E6266] hover:text-[#D66B8B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3A3034] mb-1">Full Name</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Pooja Sharma"
                  autoFocus
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-[#F8D7E3] text-sm focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="py-2.5 rounded-xl border border-[#F8D7E3] text-xs font-bold text-[#6E6266]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="py-2.5 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  {isSavingName ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Address Modal */}
      {isAddingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#F8D7E3] space-y-4 my-8 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-[#F8D7E3]">
              <h3 className="font-serif-luxury font-bold text-base text-[#3A3034]">Add New Address</h3>
              <button
                type="button"
                onClick={() => setIsAddingAddress(false)}
                className="p-1.5 text-[#6E6266] hover:text-[#D66B8B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    required
                    placeholder="Recipient's Name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    required
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#3A3034] mb-1">Street Address *</label>
                <input
                  type="text"
                  value={addressForm.address}
                  onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                  required
                  placeholder="Flat, House #, Building, Street"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#3A3034] mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={addressForm.landmark}
                  onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                  placeholder="Nearby hospital, mall, or school"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">City *</label>
                  <input
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    required
                    placeholder="City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">State *</label>
                  <select
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B] bg-white cursor-pointer"
                  >
                    {indianStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#3A3034] mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={addressForm.pincode}
                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                    required
                    maxLength={6}
                    placeholder="6-digit PIN"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#F8D7E3] focus:outline-none focus:ring-1 focus:ring-[#D66B8B]"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded text-[#D66B8B] focus:ring-[#D66B8B]"
                />
                <span className="text-xs text-[#3A3034]">Make this my default shipping address</span>
              </label>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="py-3 rounded-xl border border-[#F8D7E3] font-bold text-[#6E6266]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="py-3 bg-[#D66B8B] hover:bg-[#c25877] text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center"
                >
                  {isSavingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Address</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
