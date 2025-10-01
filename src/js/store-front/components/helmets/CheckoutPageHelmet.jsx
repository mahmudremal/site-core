import { sprintf } from "sprintf-js";
import { Helmet } from "react-helmet";
import { site_url } from "@functions";
import { useLocale } from "../../hooks/useLocale";

const CheckoutPageHelmet = () => {
  const { __ } = useLocale();
  const siteName = "Moonlit Meadow";
  const pageTitle = sprintf(__('Checkout | %s', 'site-core'), siteName);
  const pageDescription = __('Complete your purchase securely and quickly on Moonlit Meadow. Enter your payment and shipping details to finalize your order with enterprise-grade commerce in Bangladesh.', 'site-core');

  const canonicalUrl = site_url(`/checkout`);

  const ogImage = site_url(`/images/checkout-og-image.jpg`);

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content="noindex, nofollow" />
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

export default CheckoutPageHelmet;
