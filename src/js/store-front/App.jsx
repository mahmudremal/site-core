import { Route, Routes } from "react-router-dom";
import ErrorPage from "./pages/Error";
import Home from "./pages/Home";
import CartPage from "./pages/Cart";
import Product from "./pages/Product";
import LoginPage from "./pages/Login";
import CheckoutPage from "./pages/Checkout";
import ReviewServay from "./pages/ReviewServay";
import CollectionsPage from "./pages/Collections";
import OrderConfirmation from "./pages/OrderConfirmation";
import DeliveryManTracker from "./pages/DeliveryManTracker";
import OrderTracking from "./pages/OrderTracking";
import AppInstallPage from "./pages/AppsInstall";
import ReturnsOrdersPage from "./pages/Orders";
import WishlistPage from "./pages/Wishlist";
import AccountPage from "./pages/Account";
import VendorPage from "./pages/Vendor";
import Location from "./pages/Location";

function App() {
  return (
    <div>
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
    </div>
  );
}

export default App;
