import { Helmet } from "react-helmet";
import { useLocale } from "../../hooks/useLocale";
import { sprintf } from "sprintf-js";
import { site_url } from "@functions";

const HomePageHelmet = () => {
  const { __ } = useLocale();
  const siteName = "Moonlit Meadow";
  const pageTitle = sprintf(__('%s | Quality Products, Great Deals & Fast Delivery in Bangladesh', 'site-core'), siteName);
  const pageDescription = __('Welcome to Moonlit Meadow - your one-stop shop for quality products, unbeatable deals, and fast shipping across Bangladesh. Shop confidently with enterprise-grade commerce.', 'site-core');

  const canonicalUrl = site_url('/');

  const ogImage = site_url(`/images/homepage-og-image.jpg`);

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={__('Moonlit Meadow, online shopping Bangladesh, ecommerce Bangladesh, best deals, fast shipping', 'site-core')} />
      <meta name="robots" content="index, follow" />
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

export default HomePageHelmet;
