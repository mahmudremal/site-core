import React from 'react';
import { Helmet } from 'react-helmet';

const Category = () => {
  return (
    <div>
      <Helmet>
        <title>Product Name | Category</title>
        <meta name="description" content="A detailed description of the product, its features, and benefits." />
        <meta property="og:title" content="Product Name" />
        <meta property="og:description" content="A detailed description of the product, its features, and benefits." />
        <meta property="og:image" content="https://riseuplabs.com/blog/product-image/" />
        <meta property="og:type" content="product" />
        <meta property="og:url" content="https://www.shopify.com/blog/product-page" />
      </Helmet>
      <h1>Category Page</h1>
    </div>
  );
};

export default Category;
