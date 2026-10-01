import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Store,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Sliders,
  X,
  ExternalLink,
  Power,
  RotateCw,
} from 'lucide-react';
import { Shop } from '../../../types';

export const AdminShopsView: React.FC = () => {
  const {
    shops,
    approveMerchant,
    rejectMerchant,
    suspendShop,
    activateShop,
    updateShopProfile,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'ALL' | 'PENDING' | 'VERIFIED' | 'SUSPENDED' | 'REJECTED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected shop for action modals
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [actionType, setActionType] = useState<
    'APPROVE' | 'REJECT' | 'SUSPEND' | 'EDIT' | null
  >(null);
  const [actionReason, setActionReason] = useState('');
  const [editCommissionRate, setEditCommissionRate] = useState<number>(5);
  const [editRadius, setEditRadius] = useState<number>(12);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filtered shops
  const filteredShops = useMemo(() => {
    return shops.filter((shop) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        shop.name.toLowerCase().includes(q) ||
        shop.category.toLowerCase().includes(q) ||
        (shop.city && shop.city.toLowerCase().includes(q)) ||
        (shop.phone && shop.phone.includes(q));

      const status = shop.verificationStatus || 'VERIFIED';
      const matchesTab = activeTab === 'ALL' || status === activeTab;

      return matchesSearch && matchesTab;
    });
  }, [shops, searchQuery, activeTab]);

  const pendingCount = shops.filter(
    (s) => s.verificationStatus === 'PENDING'
  ).length;

  const handleOpenAction = (
    shop: Shop,
    type: 'APPROVE' | 'REJECT' | 'SUSPEND' | 'EDIT'
  ) => {
    setSelectedShop(shop);
    setActionType(type);
    setActionReason('');
    setEditCommissionRate(5);
    setEditRadius(shop.deliveryRadius || 12);
  };

  const handleExecuteAction = async () => {
    if (!selectedShop || !actionType) return;
    setIsProcessing(true);

    if (actionType === 'APPROVE') {
      await approveMerchant(selectedShop.id, actionReason || 'Approved by Admin');
    } else if (actionType === 'REJECT') {
      await rejectMerchant(selectedShop.id, actionReason || 'Application rejected');
    } else if (actionType === 'SUSPEND') {
      await suspendShop(selectedShop.id, actionReason || 'Policy violation');
    } else if (actionType === 'EDIT') {
      await updateShopProfile(selectedShop.id, {
        deliveryRadius: editRadius,
      });
    }

    setIsProcessing(false);
    setSelectedShop(null);
    setActionType(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            Merchant Stores & Approvals
          </h1>
          <p className="text-xs sm:text-sm text-stone-500">
            Control shop onboarding, verification, commission rates, and status
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold border border-amber-200 animate-pulse">
              ⚠️ {pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Status Tabs */}
        <div className="inline-flex bg-white p-1 rounded-xl border border-stone-200 shadow-2xs overflow-x-auto max-w-full">
          {(
            [
              { id: 'ALL', label: `All (${shops.length})` },
              { id: 'PENDING', label: `Pending (${pendingCount})` },
              {
                id: 'VERIFIED',
                label: `Active (${
                  shops.filter(
                    (s) =>
                      s.verificationStatus === 'VERIFIED' ||
                      !s.verificationStatus
                  ).length
                })`,
              },
              {
                id: 'SUSPENDED',
                label: `Suspended (${
                  shops.filter((s) => s.verificationStatus === 'SUSPENDED')
                    .length
                })`,
              },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search shops, area, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredShops.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-2">
            <Store className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-600">No shops match criteria.</p>
          </div>
        ) : (
          filteredShops.map((shop) => {
            const status = shop.verificationStatus || 'VERIFIED';
            const isSuspended = status === 'SUSPENDED';
            const isPending = status === 'PENDING';

            return (
              <div
                key={shop.id}
                className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs hover:shadow-sm transition-shadow flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Top Bar with Status */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-sm text-stone-900 truncate">
                          {shop.name}
                        </h3>
                        <span className="text-[11px] font-bold text-stone-400">
                          {shop.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                        status === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Details info list */}
                  <div className="space-y-1.5 text-xs text-stone-600">
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>
                        {shop.address}, {shop.city}
                      </span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{shop.phone}</span>
                    </p>
                    <div className="pt-2 flex items-center justify-between text-[11px] text-stone-500 border-t border-stone-100">
                      <span>Delivery Radius: {shop.deliveryRadius || 12} km</span>
                      <span className="font-bold text-stone-700">
                        {shop.isOpen ? '🟢 Open Now' : '🔴 Closed'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions based on status */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                  {isPending ? (
                    <>
                      <button
                        onClick={() => handleOpenAction(shop, 'APPROVE')}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleOpenAction(shop, 'REJECT')}
                        className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  ) : isSuspended ? (
                    <button
                      onClick={() => activateShop(shop.id)}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Reactivate Store</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleOpenAction(shop, 'EDIT')}
                        className="py-1.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Configure
                      </button>
                      <button
                        onClick={() => handleOpenAction(shop, 'SUSPEND')}
                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Suspend
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation & Edit Modals */}
      {selectedShop && actionType && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-stone-900">
                {actionType === 'APPROVE' && 'Approve Store Onboarding'}
                {actionType === 'REJECT' && 'Reject Store Application'}
                {actionType === 'SUSPEND' && 'Suspend Merchant Store'}
                {actionType === 'EDIT' && 'Configure Store Settings'}
              </h3>
              <p className="text-xs text-stone-500 font-bold">
                {selectedShop.name}
              </p>
            </div>

            {actionType === 'EDIT' ? (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">
                    Delivery Radius Cap (km)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={editRadius}
                    onChange={(e) => setEditRadius(Number(e.target.value))}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl font-bold"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">
                    Max allowed hyper-local delivery radius (default 12 km)
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  Admin note / reason {actionType !== 'APPROVE' ? '*' : '(optional)'}
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Enter comments or verification details..."
                  rows={2}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedShop(null);
                  setActionType(null);
                }}
                className="flex-1 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={
                  isProcessing ||
                  (actionType !== 'APPROVE' &&
                    actionType !== 'EDIT' &&
                    !actionReason.trim())
                }
                className={`flex-1 py-2 text-xs font-bold text-white rounded-xl disabled:opacity-50 cursor-pointer shadow-xs ${
                  actionType === 'APPROVE' || actionType === 'EDIT'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
