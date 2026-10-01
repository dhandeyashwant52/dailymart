import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Store,
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  MapPin,
  Phone,
  Building,
  User,
  Mail,
  AlertCircle,
} from 'lucide-react';

interface BecomeSellerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationSubmitted: () => void;
}

export const BecomeSellerModal: React.FC<BecomeSellerModalProps> = ({
  isOpen,
  onClose,
  onApplicationSubmitted,
}) => {
  const {
    currentUser,
    userLocation,
    submitSellerApplication,
    updateCustomerProfile,
  } = useApp();

  // Multi-step: 1 = Value prop, 2 = Contact / Account verification (if needed), 3 = Shop Registration form, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Contact info
  const [applicantName, setApplicantName] = useState(currentUser?.name || '');
  const [applicantPhone, setApplicantPhone] = useState(currentUser?.phone || '');
  const [applicantEmail, setApplicantEmail] = useState(currentUser?.email || '');

  // Shop info
  const [shopName, setShopName] = useState('');
  const [shopCategory, setShopCategory] = useState('Groceries & Daily Staples');
  const [shopAddress, setShopAddress] = useState(userLocation.address || '');
  const [shopCity, setShopCity] = useState(userLocation.city || 'Bengaluru');
  const [shopPincode, setShopPincode] = useState(userLocation.pincode || '');
  const [deliveryRadius, setDeliveryRadius] = useState<number>(12);
  const [gstin, setGstin] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleStartApplication = () => {
    // If user has not provided permanent name and phone, prompt them on step 2
    if (!currentUser?.name || !currentUser?.phone || currentUser.name === 'Guest Shopper') {
      setStep(2);
    } else {
      setApplicantName(currentUser.name);
      setApplicantPhone(currentUser.phone);
      setApplicantEmail(currentUser.email || '');
      setStep(3);
    }
  };

  const handleSaveContactAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !applicantPhone.trim()) {
      setErrorMsg('Please enter your name and primary contact phone number.');
      return;
    }
    setErrorMsg(null);
    setIsSubmitting(true);
    await updateCustomerProfile({
      name: applicantName.trim(),
      phone: applicantPhone.trim(),
      email: applicantEmail.trim() || `${applicantPhone.trim()}@customer.dailymart.in`,
    });
    setIsSubmitting(false);
    setStep(3);
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !shopAddress.trim()) {
      setErrorMsg('Please enter your shop name and complete physical address.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const res = await submitSellerApplication({
        applicantName: applicantName || currentUser?.name || 'Store Owner',
        applicantPhone: applicantPhone || currentUser?.phone || 'Phone',
        applicantEmail: applicantEmail || currentUser?.email || '',
        shopName: shopName.trim(),
        category: shopCategory,
        address: shopAddress.trim(),
        city: shopCity.trim(),
        pincode: shopPincode.trim(),
        deliveryRadius,
        gstin: gstin.trim() || undefined,
      });

      if (res) {
        onApplicationSubmitted();
        onClose();
      } else {
        setErrorMsg('Failed to submit application. Please check details and retry.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error submitting application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 my-auto text-stone-900 font-sans">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-amber-950 flex items-center justify-center font-black text-base shadow-sm">
              🏪
            </div>
            <div>
              <h2 className="text-base font-extrabold text-stone-900">
                Sell on DailyMart
              </h2>
              <p className="text-[11px] text-stone-500">
                Partner with DailyMart to digitize your local shop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Overview & Value Props */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100 space-y-2">
              <h3 className="text-sm font-extrabold text-amber-950">
                Turn your local shop into an online store with DailyMart.
              </h3>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Connect with thousands of households within 12 km of your storefront. We provide the technology, payments, and order tracking while you serve your loyal neighborhood customers.
              </p>
            </div>

            <div className="space-y-2.5 text-xs text-stone-700">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Reach nearby customers:</strong> Appear on the map for shoppers within 12 km</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Manage products online:</strong> Easily update prices and stock availability</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Receive real-time orders:</strong> Audio alerts and streamlined packing pipeline</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Flexible payments:</strong> Accept Instant UPI or Cash on Delivery</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Manage from your phone:</strong> Mobile-friendly merchant control portal</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Track sales & customers:</strong> Weekly automated bank settlements</span>
              </div>
            </div>

            <button
              onClick={handleStartApplication}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl font-extrabold text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Register My Shop</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Identity & Contact info (for guest/anonymous users) */}
        {step === 2 && (
          <form onSubmit={handleSaveContactAndContinue} className="space-y-4 text-xs">
            <div className="p-3 bg-stone-50 rounded-xl text-stone-600 space-y-1">
              <p className="font-bold text-stone-900">
                Create an account identity to register your shop
              </p>
              <p className="text-[11px] text-stone-500">
                Your shop application will be permanently tied to this profile so you can manage your store and customer orders with one login.
              </p>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Your Full Name (Proprietor / Partner) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Primary Mobile / WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={applicantPhone}
                onChange={(e) => setApplicantPhone(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Business Email (Optional)
              </label>
              <input
                type="email"
                placeholder="shop@example.com"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !applicantName.trim() || !applicantPhone.trim()}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Continue to Shop Info'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Shop Registration Details */}
        {step === 3 && (
          <form onSubmit={handleSubmitRegistration} className="space-y-3.5 text-xs max-h-[70vh] overflow-y-auto pr-1">
            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Store / Business Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Sri Balaji Supermarket & Provisions"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Primary Category *
                </label>
                <select
                  value={shopCategory}
                  onChange={(e) => setShopCategory(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium cursor-pointer"
                >
                  <option value="Groceries & Daily Staples">Groceries & Daily Staples</option>
                  <option value="Fresh Fruits & Vegetables">Fresh Fruits & Vegetables</option>
                  <option value="Dairy, Bread & Bakery">Dairy, Bread & Bakery</option>
                  <option value="Organic & Health Foods">Organic & Health Foods</option>
                  <option value="Snacks, Drinks & Confectionery">Snacks, Drinks & Confectionery</option>
                  <option value="General Supermarket">General Supermarket</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Delivery Radius Limit
                </label>
                <select
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium cursor-pointer"
                >
                  <option value={5}>Within 5 km</option>
                  <option value={8}>Within 8 km</option>
                  <option value={12}>Within 12 km (Standard)</option>
                  <option value={15}>Within 15 km</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                Physical Store Address *
              </label>
              <input
                type="text"
                required
                placeholder="Shop number, street name, neighborhood..."
                value={shopAddress}
                onChange={(e) => setShopAddress(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shopCity}
                  onChange={(e) => setShopCity(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="560038"
                  value={shopPincode}
                  onChange={(e) => setShopPincode(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-700 font-bold mb-1">
                GSTIN / Trade License (Optional)
              </label>
              <input
                type="text"
                placeholder="29AAAAA0000A1Z5"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-[11px]"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                You can also provide registration or FSSAI certificates later during onboarding.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !shopName.trim() || !shopAddress.trim()}
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-amber-950 rounded-xl font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
