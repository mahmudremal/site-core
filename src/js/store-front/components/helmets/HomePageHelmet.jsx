import { Helmet } from "react-helmet";

const HomePageHelmet = () => (
  <Helmet>
    <title>Your Store Name | Quality Products & Great Deals</title>
    <meta
      name="description"
      content="Welcome to Your Store Name – your one-stop shop for quality products, great deals, and fast shipping. Discover our latest collections and exclusive offers."
    />
    <meta name="robots" content="index, follow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="canonical" href="https://www.yourstore.com/" />

    {/* Open Graph / Facebook */}
    <meta property="og:title" content="Your Store Name | Quality Products & Great Deals" />
    <meta
      property="og:description"
      content="Welcome to Your Store Name – your one-stop shop for quality products, great deals, and fast shipping. Discover our latest collections and exclusive offers."
    />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.yourstore.com/" />
    <meta property="og:image" content="https://www.yourstore.com/images/homepage-og-image.jpg" />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Your Store Name | Quality Products & Great Deals" />
    <meta
      name="twitter:description"
      content="Welcome to Your Store Name – your one-stop shop for quality products, great deals, and fast shipping. Discover our latest collections and exclusive offers."
    />
    <meta name="twitter:image" content="https://www.yourstore.com/images/homepage-twitter-image.jpg" />
  </Helmet>
);

export default HomePageHelmet;
