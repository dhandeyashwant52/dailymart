import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import {
  Package,
  Clock,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  Bike,
  Store,
  Banknote,
  CreditCard,
  AlertCircle,
  Eye,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '../../../types';

interface MerchantOrdersViewProps {
  selectedOrderId?: string | null;
  onClearSelectedOrder?: () => void;
}

export const MerchantOrdersView: React.FC<MerchantOrdersViewProps> = ({
  selectedOrderId,
  onClearSelectedOrder,
}) => {
  const {
    shopOwnerOrders,
    updateOrderStatus,
    markCodPaymentCollected,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'ALL' | 'NEW' | 'ACCEPTED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED'
  >('ALL');

  const [detailModalOrder, setDetailModalOrder] = useState<Order | null>(() => {
    if (selectedOrderId) {
      return shopOwnerOrders.find((o) => o.id === selectedOrderId) || null;
    }
    return null;
  });

  const [rejectModalOrder, setRejectModalOrder] = useState<Order | null>(null);
  const [rejectReason, setRejectReason] = useState('Out of stock or high store volume');

  // Filter orders by tab
  const filteredOrders = shopOwnerOrders.filter((order) => {
    if (activeTab === 'NEW') return order.orderStatus === 'PENDING';
    if (activeTab === 'ACCEPTED') return order.orderStatus === 'SHOP_ACCEPTED';
    if (activeTab === 'PREPARING') return order.orderStatus === 'PREPARING';
    if (activeTab === 'OUT_FOR_DELIVERY') return order.orderStatus === 'OUT_FOR_DELIVERY';
    if (activeTab === 'COMPLETED') return order.orderStatus === 'DELIVERED';
    if (activeTab === 'CANCELLED') return order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED';
    return true;
  });

  const counts = {
    all: shopOwnerOrders.length,
    new: shopOwnerOrders.filter((o) => o.orderStatus === 'PENDING').length,
    accepted: shopOwnerOrders.filter((o) => o.orderStatus === 'SHOP_ACCEPTED').length,
    preparing: shopOwnerOrders.filter((o) => o.orderStatus === 'PREPARING').length,
    out: shopOwnerOrders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length,
    completed: shopOwnerOrders.filter((o) => o.orderStatus === 'DELIVERED').length,
    cancelled: shopOwnerOrders.filter((o) => o.orderStatus === 'CANCELLED' || o.orderStatus === 'REJECTED').length,
  };

  const handleConfirmReject = async () => {
    if (rejectModalOrder) {
      await updateOrderStatus(rejectModalOrder.id, 'REJECTED', rejectReason);
      setRejectModalOrder(null);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-stone-900 tracking-tight">
          Merchant Order Fulfillment
        </h2>
        <p className="text-xs text-stone-500">
          Manage live orders, packing, delivery, and cash collections
        </p>
      </div>

      {/* Tabs Horizontal Scroll */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
            activeTab === 'ALL'
              ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          All ({counts.all})
        </button>

        <button
          onClick={() => setActiveTab('NEW')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
            activeTab === 'NEW'
              ? 'bg-amber-500 text-amber-950 border-amber-600 shadow-xs'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          New ({counts.new})
        </button>

        <button
          onClick={() => setActiveTab('ACCEPTED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
            activeTab === 'ACCEPTED'
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Accepted ({counts.accepted})
        </button>

        <button
          onClick={() => setActiveTab('PREPARING')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
            activeTab === 'PREPARING'
              ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Preparing ({counts.preparing})
        </button>

        <button
          onClick={() => setActiveTab('OUT_FOR_DELIVERY')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
            activeTab === 'OUT_FOR_DELIVERY'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Out for Delivery ({counts.out})
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
            activeTab === 'COMPLETED'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Delivered ({counts.completed})
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${
            activeTab === 'CANCELLED'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          Cancelled ({counts.cancelled})
        </button>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-xs text-stone-500 space-y-1">
          <p className="font-bold text-stone-700">No orders in this tab</p>
          <p>Orders will show here as customers place and update orders.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredOrders.map((order) => {
            const isPending = order.orderStatus === 'PENDING';
            const isAccepted = order.orderStatus === 'SHOP_ACCEPTED';
            const isPreparing = order.orderStatus === 'PREPARING';
            const isOut = order.orderStatus === 'OUT_FOR_DELIVERY';
            const isDelivered = order.orderStatus === 'DELIVERED';
            const isCancelled = order.orderStatus === 'CANCELLED' || order.orderStatus === 'REJECTED';

            const isOnlinePaid = order.paymentMethod === 'ONLINE' && order.paymentStatus === 'PAID';
            const isCodPending = order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING';
            const isCodCollected = order.paymentMethod === 'COD' && order.paymentStatus === 'COLLECTED';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all space-y-3 ${
                  isPending ? 'border-amber-400 ring-2 ring-amber-100' : 'border-stone-200'
                }`}
              >
                {/* Header: ID, Time, Payment Pill, Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-stone-900">
                        Order #{order.orderId}
                      </span>
                      {isOnlinePaid ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>ONLINE — PAID</span>
                        </span>
                      ) : isCodCollected ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          COD — CASH COLLECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          COD — COLLECT ON DELIVERY
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-400 mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ·{' '}
                        {new Date(order.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-stone-900">
                      ₹{order.totalAmount}
                    </span>
                    <p className="text-[10px] text-stone-400">
                      {order.items.length} items
                    </p>
                  </div>
                </div>

                {/* Customer Information & Address */}
                <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-stone-900">
                        {order.customerName}
                        {order.customerPhone && (
                          <span className="text-stone-500 font-normal"> ({order.customerPhone})</span>
                        )}
                      </p>
                      <p className="text-stone-600 mt-0.5">{order.deliveryAddress}</p>
                    </div>
                  </div>

                  {order.customerPhone && (
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-bold text-[11px] flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>Call Customer</span>
                    </a>
                  )}
                </div>

                {/* Items preview list */}
                <div className="text-xs text-stone-700 space-y-1 py-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        <strong className="text-stone-900">{item.quantity}x</strong> {item.name}{' '}
                        <span className="text-stone-400">({item.unit})</span>
                      </span>
                      <span className="font-semibold text-stone-900">₹{item.subtotal}</span>
                    </div>
                  ))}
                  {order.notes && (
                    <p className="text-[11px] text-amber-700 bg-amber-50/70 p-2 rounded-lg mt-1">
                      Note from customer: {order.notes}
                    </p>
                  )}
                </div>

                {/* Order Workflow Progression Actions */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailModalOrder(order)}
                      className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>
                  </div>

                  {/* Dynamic Workflow Actions */}
                  <div className="flex items-center gap-2">
                    {/* Status 1: PENDING -> ACCEPT / REJECT */}
                    {isPending && (
                      <>
                        <button
                          onClick={() => setRejectModalOrder(order)}
                          className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs cursor-pointer"
                        >
                          REJECT
                        </button>
                        <button
                          onClick={() => updateOrderStatus(order.id, 'SHOP_ACCEPTED')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ACCEPT ORDER</span>
                        </button>
                      </>
                    )}

                    {/* Status 2: SHOP_ACCEPTED -> START PREPARING */}
                    {isAccepted && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'PREPARING')}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Clock className="w-4 h-4" />
                        <span>START PREPARING</span>
                      </button>
                    )}

                    {/* Status 3: PREPARING -> READY / OUT FOR DELIVERY */}
                    {isPreparing && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Bike className="w-4 h-4" />
                        <span>DISPATCH / OUT FOR DELIVERY</span>
                      </button>
                    )}

                    {/* Status 4: OUT FOR DELIVERY -> MARK DELIVERED */}
                    {isOut && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>MARK DELIVERED</span>
                      </button>
                    )}

                    {/* COD Payment collection button */}
                    {order.paymentMethod === 'COD' && order.paymentStatus === 'PENDING' && (
                      <button
                        onClick={() => markCodPaymentCollected(order.id)}
                        className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 font-bold text-xs cursor-pointer flex items-center gap-1"
                        title="Mark cash received from customer upon delivery"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Mark Cash Collected</span>
                      </button>
                    )}

                    {/* Completed / Cancelled Badge */}
                    {isDelivered && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        ✓ Delivered
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                        ✕ {order.orderStatus}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Order Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-stone-900">
              Reject Order #{rejectModalOrder.orderId}?
            </h3>
            <p className="text-xs text-stone-600">
              The customer will receive an immediate cancellation alert. Please select a reason:
            </p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full text-xs p-2.5 border border-stone-300 rounded-lg bg-stone-50"
            >
              <option value="Items out of stock">Items out of stock</option>
              <option value="Shop is currently overloaded">Shop is currently overloaded</option>
              <option value="Delivery partner not available in area">Delivery partner not available in area</option>
              <option value="Store closing for the day">Store closing for the day</option>
            </select>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setRejectModalOrder(null)}
                className="flex-1 py-2 text-xs font-bold text-stone-600 border border-stone-300 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Order Modal */}
      {detailModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Order #{detailModalOrder.orderId}
                </h3>
                <p className="text-xs text-stone-500">
                  {new Date(detailModalOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setDetailModalOrder(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Status & Payment */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Status</span>
                <span className="font-extrabold text-stone-900">{detailModalOrder.orderStatus}</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <span className="text-[10px] text-stone-400 font-bold uppercase block">Payment</span>
                <span className="font-extrabold text-stone-900">
                  {detailModalOrder.paymentMethod} ({detailModalOrder.paymentStatus})
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs space-y-1">
              <span className="text-[10px] text-stone-400 font-bold uppercase block">Customer</span>
              <p className="font-extrabold text-stone-900">{detailModalOrder.customerName}</p>
              <p className="text-stone-600">{detailModalOrder.customerPhone}</p>
              <p className="text-stone-700 pt-1">{detailModalOrder.deliveryAddress}</p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-stone-900 uppercase tracking-wider block">
                Order Items ({detailModalOrder.items.length})
              </span>
              <div className="divide-y divide-stone-100 border rounded-xl overflow-hidden">
                {detailModalOrder.items.map((i, idx) => (
                  <div key={idx} className="p-2.5 flex justify-between text-xs">
                    <div>
                      <p className="font-bold text-stone-900">
                        {i.quantity}x {i.name}
                      </p>
                      <p className="text-[11px] text-stone-400">
                        {i.unit} · ₹{i.price} each
                      </p>
                    </div>
                    <span className="font-bold text-stone-900">₹{i.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bill breakdown */}
            <div className="space-y-1 text-xs border-t pt-2">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span>
                <span>₹{detailModalOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-500">
                <span>Delivery Fee</span>
                <span>₹{detailModalOrder.deliveryFee}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-stone-900 pt-1 border-t">
                <span>Total Amount</span>
                <span className="text-emerald-700">₹{detailModalOrder.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => setDetailModalOrder(null)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
