
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatProduct = ( product ) => {
  return {
    ...product,
    price: parseFloat(product.price),
    sale_price: parseFloat(product.sale_price),
    variations: product.variations.map(v => ({
      ...v,
      price: parseFloat(v.price),
      sale_price: parseFloat(v.sale_price),
    }))
  };
}
export const formatVeriationProduct = ( product, variation ) => {
  return {
    ...product,
    ...variation
  };
}