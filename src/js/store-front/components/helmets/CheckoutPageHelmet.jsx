import { Helmet } from "react-helmet";

const CheckoutPageHelmet = () => (
  <Helmet>
    <title>Checkout | Your Store Name</title>
    <meta
      name="description"
      content="Complete your purchase securely and quickly. Enter your payment and shipping details to finalize your order."
    />
    <meta name="robots" content="noindex, nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="https://www.yourstore.com/checkout" />

    {/* Open Graph / Facebook */}
    <meta property="og:title" content="Checkout | Your Store Name" />
    <meta
      property="og:description"
      content="Complete your purchase securely and quickly. Enter your payment and shipping details to finalize your order."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.yourstore.com/checkout" />
    <meta property="og:image" content="https://www.yourstore.com/images/checkout-og-image.jpg" />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Checkout | Your Store Name" />
    <meta
      name="twitter:description"
      content="Complete your purchase securely and quickly. Enter your payment and shipping details to finalize your order."
    />
    <meta name="twitter:image" content="https://www.yourstore.com/images/checkout-twitter-image.jpg" />
  </Helmet>
);

export default CheckoutPageHelmet;
