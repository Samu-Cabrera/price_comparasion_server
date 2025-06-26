export function filterUniqueByPrice(products) {
  const seenPrices = new Set();
  return products.filter(product => {
    if (seenPrices.has(product.price)) return false;
    seenPrices.add(product.price);
    return true;
  });
} 