import { Helmet } from "react-helmet";
import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../hooks/useLocale";
import { sprintf } from "sprintf-js";
import { site_url } from "@functions";

const OrdersPageHelmet = () => {
  const { loggedin } = useAuth();
  const { __ } = useLocale();

  const siteName = "Moonlit Meadow";
  const canonicalUrl = site_url(`/orders`);
  const ogImage = site_url(`/images/orders-og-image.jpg`);

  const pageTitle = loggedin
    ? sprintf(__(`Your Orders | %s`, 'site-core'), siteName)
    : sprintf(__(`Track Your Order | %s`, 'site-core'), siteName);

  const pageDescription = loggedin
    ? __('View your order history, track shipments, request refunds, and leave reviews for your purchases. Enjoy enterprise-grade shopping with Moonlit Meadow in Bangladesh.', 'site-core')
    : __('Track your Moonlit Meadow orders easily. Enter your Order ID to see the latest status of your purchase and shipment.', 'site-core');

  // Auth pages or order tracking form shouldn't be indexed if user is not logged in
  const robotsContent = loggedin ? "index, follow" : "noindex, nofollow";

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content={robotsContent} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_BD" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@MoonlitMeadow" />
    </Helmet>
  );
};

export default OrdersPageHelmet;
