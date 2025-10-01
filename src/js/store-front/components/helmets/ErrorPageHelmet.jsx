import { Helmet } from "react-helmet";
import { site_url } from "@functions";

const ErrorPageHelmet = ({ error: currentError = {} }) => {
  const siteName = "Moonlit Meadow";

  const error = currentError || {
    id: 500,
    label: __('500 Demo', 'site-core'),
    title: __('500 - Internal Server Error', 'site-core'),
    message: __('Something went wrong on our end.', 'site-core'),
    description: __('Please try again later or contact support if the problem persists.', 'site-core'),
    icon: '⚠️',
  };

  const seoTitle = `${error.title} | ${siteName}`;
  const seoDescription = `${error.message} ${error.description}`.trim();

  const canonicalUrl = site_url(`/error/${error.id}`);

  const ogImage = site_url(`/images/error-og-image.jpg`);

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_BD" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@MoonlitMeadow" />
    </Helmet>
  );
};

export default ErrorPageHelmet;
