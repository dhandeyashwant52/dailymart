import React from 'react';
import { useApp } from '../../context/AppContext';
import { BecomeSellerModal } from './BecomeSellerModal';
import {
  User,
  MapPin,
  Store,
  Phone,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { userLocation, setIsLocationModalOpen, canAccessSellerDashboard, setUserRole, isBecomeSellerModalOpen, setIsBecomeSellerModalOpen } = useApp();

  return (
    <div className="pb-28 max-w-md mx-auto px-4 pt-3 space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 font-black text-xl flex items-center justify-center border-2 border-emerald-200">
          Y
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-stone-900">Yashwant</h2>
          <p className="text-xs text-stone-500">+91 98765 43210</p>
          <span className="inline-block mt-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Verified Customer
          </span>
        </div>
      </div>

      {/* Seller onboarding / authorized portal switcher */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-amber-100" />
          <h3 className="font-extrabold text-sm tracking-tight">Sell on DailyMart</h3>
        </div>
        <p className="text-xs text-amber-100 leading-relaxed">
          {canAccessSellerDashboard ? 'Your approved shop is ready to manage orders and products.' : 'Apply to list your local shop. Approval is completed by DailyMart operations.'}
        </p>
        <button
          onClick={() => canAccessSellerDashboard ? setUserRole('shop_owner') : setIsBecomeSellerModalOpen(true)}
          className="w-full py-2.5 px-4 bg-white text-amber-900 rounded-xl font-bold text-xs hover:bg-amber-50 transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>{canAccessSellerDashboard ? 'Open My Shop' : 'Become a Seller'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <BecomeSellerModal isOpen={isBecomeSellerModalOpen} onClose={() => setIsBecomeSellerModalOpen(false)} onApplicationSubmitted={() => setIsBecomeSellerModalOpen(false)} />

      {/* Saved Delivery Addresses */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
          Delivery Address
        </h3>

        <div className="p-3 bg-stone-50 rounded-xl flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-stone-900">{userLocation.area}</p>
              <p className="text-xs text-stone-500 mt-0.5">{userLocation.address}, {userLocation.city}</p>
            </div>
          </div>
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs font-bold text-emerald-700 hover:underline shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>
      </div>

      {/* App Info & Policies */}
      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 shadow-xs overflow-hidden">
        <div className="p-3.5 flex items-center justify-between text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-stone-400" />
            <span>12 km Hyper-Local Policy</span>
          </div>
          <span className="text-[11px] text-stone-400">Active</span>
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="w-4 h-4 text-stone-400" />
            <span>Help & Support</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300" />
        </div>

        <div className="p-3.5 flex items-center justify-between text-xs text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <FileText className="w-4 h-4 text-stone-400" />
            <span>Terms of Service</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-300" />
        </div>
      </div>

      <div className="text-center text-[11px] text-stone-400 pt-2">
        DailyMart v2.4 · Hyper-Local Grocery Marketplace
      </div>
    </div>
  );
};
