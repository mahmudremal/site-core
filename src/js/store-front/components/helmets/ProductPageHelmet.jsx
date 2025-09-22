import { Helmet } from "react-helmet";

const ProductPageHelmet = ({ product }) => {
  // Fallback values if product data is missing
  const {
    name = "Product Name",
    category = "Category",
    description = "A detailed description of the product, its features, and benefits.",
    url = "https://www.yourstore.com/product/product-slug",
    image = "https://www.yourstore.com/images/product-default.jpg",
    price = null,
    currency = "USD",
    availability = "in stock", // e.g., "in stock", "out of stock"
  } = product || {};

  // Compose price meta tag if price is available
  const priceMeta = price
    ? <meta property="product:price:amount" content={price.toString()} />
    : null;

  const currencyMeta = price
    ? <meta property="product:price:currency" content={currency} />
    : null;

  return (
    <Helmet>
      <title>{`${name} | ${category} | Your Store Name`}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={name} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />

      {/* Product-specific Open Graph tags */}
      {priceMeta}
      {currencyMeta}
      <meta property="product:availability" content={availability} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={name} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default ProductPageHelmet;
