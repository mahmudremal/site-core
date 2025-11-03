import { Route, Routes } from "react-router-dom";
import { Suspense, lazy } from 'react';
import { useLocale } from "./hooks/useLocale";

const Home = lazy(() => import("./pages/Home"));
const CartPage = lazy(() => import("./pages/Cart"));
const Product = lazy(() => import("./pages/Product"));
const LoginPage = lazy(() => import("./pages/Login"));
const CheckoutPage = lazy(() => import("./pages/Checkout"));
const ReviewServay = lazy(() => import("./pages/ReviewServay"));
const CollectionsPage = lazy(() => import("./pages/Collections"));
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"));
const DeliveryManTracker = lazy(() => import("./pages/DeliveryManTracker"));
const OrderTracking = lazy(() => import("./pages/OrderTracking"));
const AppInstallPage = lazy(() => import("./pages/AppsInstall"));
const ReturnsOrdersPage = lazy(() => import("./pages/Orders"));
const WishlistPage = lazy(() => import("./pages/Wishlist"));
const AccountPage = lazy(() => import("./pages/Account"));
const VendorPage = lazy(() => import("./pages/Vendor"));
const Location = lazy(() => import("./pages/Location"));
const ErrorPage = lazy(() => import('./pages/Error'));

function App() {
  const { __ } = useLocale();
  return (
    <div>
      <Suspense fallback={<div className="xpo_text-center xpo_p-4">{__('Loading...', 'site-core')}</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="carry" element={<CartPage />} />
          <Route path="apps" element={<AppInstallPage />} />
          <Route path="products/:id" element={<Product />} />
          <Route path="auth/:type" element={<LoginPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="my-bookmark" element={<WishlistPage />} />
          <Route path="clients-portal/my/:section" element={<AccountPage />} />
          <Route path="/auth/:type/:user_id/:verifyMethod/:token" element={<LoginPage />} />
          <Route path="orders/:purpose" element={<ReturnsOrdersPage />} />
          <Route path="order-confirmation/:order_id" element={<OrderConfirmation />} />
          <Route path="collections/:type" element={<CollectionsPage />} />
          <Route path="collections-tags/:type" element={<CollectionsPage />} />
          <Route path="vendors/:vendor_slug" element={<VendorPage />} />
          <Route path="reviews/:order_id" element={<ReviewServay />} />
          <Route path="orders/:order_id/tracking" element={<OrderTracking />} />
          <Route path="location" element={<Location />} />
          <Route path="delivery-boy-tracker" element={<DeliveryManTracker />} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
