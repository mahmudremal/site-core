import { Route, Routes } from "react-router-dom";
import ErrorPage from "./pages/Error";
import Home from "./pages/Home";
import Product from "./pages/Product";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import LoginPage from "./pages/Login";
import CollectionsPage from "./pages/Collections";
import ReviewServay from "./pages/ReviewServay";
import VendorPage from "./pages/Vendor";
import ReturnsOrdersPage from "./pages/Orders";
import WishlistPage from "./pages/Wishlist";
import AccountPage from "./pages/Account";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="carry" element={<CartPage />} />
        <Route path="products/:id" element={<Product />} />
        <Route path="auth/:type" element={<LoginPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="my-bookmark" element={<WishlistPage />} />
        <Route path="clients-portal/my/:section" element={<AccountPage />} />
        <Route path="/auth/:type/:user_id/:verifyMethod/:token" element={<LoginPage />} />
        <Route path="orders/:purpose" element={<ReturnsOrdersPage />} />
        <Route path="collections/:type" element={<CollectionsPage />} />
        <Route path="collections-tags/:type" element={<CollectionsPage />} />
        <Route path="vendors/:vendor_slug" element={<VendorPage />} />
        <Route path="reviews/:order_id" element={<ReviewServay />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
}

export default App;
