import React from 'react';
import { useApp } from '../context/AppContext';
import { MapPin, Search, ShoppingBag, Store, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    userLocation,
    setIsLocationModalOpen,
    cartItemCount,
    setCurrentTab,
    currentTab,
    userRole,
    setUserRole,
    setActiveShopId,
    setActiveOrderId,
    setIsCheckingOut,
  } = useApp();

  const handleLogoClick = () => {
    setActiveShopId(null);
    setActiveOrderId(null);
    setIsCheckingOut(false);
    setCurrentTab('home');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand & Delivery Location */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-1.5 focus:outline-none group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-emerald-200">
              D
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-stone-900 text-lg tracking-tight">Daily</span>
              <span className="font-extrabold text-emerald-600 text-lg tracking-tight">Mart</span>
            </div>
          </button>

          {/* Location Selector */}
          <button
            onClick={() => setIsLocationModalOpen(true)}
            className="flex items-start gap-1 text-left min-w-0 p-1 rounded-md hover:bg-stone-100 transition-colors cursor-pointer"
            title="Change Delivery Location"
          >
            <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                  Deliver to
                </span>
                <ChevronDown className="w-3 h-3 text-stone-400" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-stone-900 truncate max-w-[140px] sm:max-w-[220px]">
                {userLocation.area || userLocation.address}
              </p>
            </div>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Trigger */}
          <button
            onClick={() => {
              setActiveShopId(null);
              setIsCheckingOut(false);
              setCurrentTab('home');
              const searchInput = document.getElementById('marketplace-search-input');
              if (searchInput) searchInput.focus();
            }}
            className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart Icon */}
          <button
            onClick={() => {
              setActiveShopId(null);
              setIsCheckingOut(false);
              setCurrentTab('cart');
            }}
            className={`relative p-2 rounded-lg transition-colors cursor-pointer ${
              currentTab === 'cart'
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-700 hover:bg-stone-100'
            }`}
            aria-label="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-emerald-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartItemCount > 9 ? '9+' : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
