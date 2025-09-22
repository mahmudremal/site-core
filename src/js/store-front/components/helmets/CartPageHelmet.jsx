import { Helmet } from "react-helmet";

const CartPageHelmet = () => (
  <Helmet>
    <title>Shopping Cart | Your Store Name</title>
    <meta name="description" content="Review the items in your shopping cart and proceed to secure checkout. Manage your selected products easily." />
    <meta name="robots" content="index, follow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="https://www.yourstore.com/cart" />

    {/* Open Graph / Facebook */}
    <meta property="og:title" content="Shopping Cart | Your Store Name" />
    <meta property="og:description" content="Review the items in your shopping cart and proceed to secure checkout. Manage your selected products easily." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.yourstore.com/cart" />
    <meta property="og:image" content="https://www.yourstore.com/images/cart-og-image.jpg" />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Shopping Cart | Your Store Name" />
    <meta name="twitter:description" content="Review the items in your shopping cart and proceed to secure checkout. Manage your selected products easily." />
    <meta name="twitter:image" content="https://www.yourstore.com/images/cart-twitter-image.jpg" />
  </Helmet>
);

export default CartPageHelmet;
