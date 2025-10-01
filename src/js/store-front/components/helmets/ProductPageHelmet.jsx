import { Helmet } from "react-helmet";
import { useLocale } from "../../hooks/useLocale";
import { sprintf } from "sprintf-js";
import { site_url } from "@functions";

const ProductPageHelmet = ({ product }) => {
  const { __ } = useLocale();
  if (!product) return null;

  const siteName = "Moonlit Meadow";

  // Metadata from product or fallback
  const meta = product.metadata || {};
  const title = meta.seo_title || `${product.title} | ${siteName}`;
  const description = meta.seo_description || meta.short_description || product.excerpt || sprintf(__('Buy %s at %s. Best deals and fast delivery in Bangladesh.', 'site-core'), product.title, siteName);

  const keywords = meta.seo_keywords || "";
  
  const url = meta.canonical_url || product.link || site_url(`/products/${product.slug}`);

  const image = meta.og_image || product.featured_image || (meta.gallery?.[0]?.url ?? "");

  const ogTitle = meta.og_title || title;
  const ogDescription = meta.og_description || description;

  const price = meta.sale_price || meta.price || null;
  const currency = "BDT";
  const availability = "in stock";

  return (
    <Helmet>
      {/* Basic SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content="product" />
      <meta property="og:url" content={url} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:locale" content="en_BD" />

      {/* Product-specific Open Graph tags */}
      {price && <meta property="product:price:amount" content={price.toString()} />}
      {price && <meta property="product:price:currency" content={currency} />}
      <meta property="product:availability" content={availability} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      {image && <meta name="twitter:image" content={image} />}
      <meta name="twitter:site" content="@MoonlitMeadow" />
    </Helmet>
  );
};

export default ProductPageHelmet;
