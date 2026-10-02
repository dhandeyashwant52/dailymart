import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { LocationModal } from './components/LocationModal';
import { ShopConflictModal } from './components/ShopConflictModal';
import { HomeView } from './components/views/HomeView';
import { ShopsView } from './components/views/ShopsView';
import { ShopDetailView } from './components/views/ShopDetailView';
import { CartView } from './components/views/CartView';
import { CheckoutView } from './components/views/CheckoutView';
import { OrderTrackingView } from './components/views/OrderTrackingView';
import { OrdersListView } from './components/views/OrdersListView';
import { ProfileView } from './components/views/ProfileView';
import { ShopOwnerDashboard } from './components/views/ShopOwnerDashboard';
import { AdminDashboard } from './components/views/AdminDashboard';
import { AuthenticationScreen } from './components/auth/AuthenticationScreen';
import { auth } from './lib/firebase';

const MainContent: React.FC = () => {
  const {
    userRole,
    activeOrderId,
    isCheckingOut,
    activeShop,
    currentTab,
  } = useApp();

  // If in admin mode, display the Admin Control Center
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  // If in shop-owner / merchant mode, display the merchant order management portal
  if (userRole === 'shop_owner') {
    return <ShopOwnerDashboard />;
  }

  // Customer Mode Views
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
      <Header />

      <main className="w-full">
        {activeOrderId ? (
          <OrderTrackingView />
        ) : isCheckingOut ? (
          <CheckoutView />
        ) : activeShop ? (
          <ShopDetailView />
        ) : currentTab === 'cart' ? (
          <CartView />
        ) : currentTab === 'orders' ? (
          <OrdersListView />
        ) : currentTab === 'shops' ? (
          <ShopsView />
        ) : currentTab === 'profile' ? (
          <ProfileView />
        ) : (
          <HomeView />
        )}
      </main>

      <BottomNav />
      <LocationModal />
      <ShopConflictModal />
    </div>
  );
};

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  useEffect(() => onAuthStateChanged(auth, (user) => setAuthenticated(!!user)), []);
  if (authenticated === null) return null;
  if (!authenticated) return <AuthenticationScreen />;
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
