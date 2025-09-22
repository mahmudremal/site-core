import { Helmet } from "react-helmet";

const ErrorPageHelmet = ({ error: currentError = {} }) => {
  const error = currentError || {
    id: 500,
    label: "500 Demo",
    title: "500 - Internal Server Error",
    message: "Something went wrong on our end.",
    description: "Please try again later or contact support if the problem persists.",
    icon: "⚠️",
  };

  // Compose a concise description for SEO and social tags
  const seoDescription = `${error.message} ${error.description}`;

  return (
    <Helmet>
      <title>{error.title} | Your Store Name</title>
      <meta name="description" content={seoDescription} />
      <meta name="robots" content="noindex, nofollow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={`https://www.yourstore.com/error/${error.id}`} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={`${error.title} | Your Store Name`} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={`https://www.yourstore.com/error/${error.id}`} />
      {/* You can replace this with a generic error image or specific per error */}
      <meta property="og:image" content="https://www.yourstore.com/images/error-og-image.jpg" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${error.title} | Your Store Name`} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content="https://www.yourstore.com/images/error-twitter-image.jpg" />
    </Helmet>
  );
};

export default ErrorPageHelmet;
