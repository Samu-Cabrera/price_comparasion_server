export function cleanPrice(price) {
  if (!price) return 0;
  // Acepta Gs, ₲, espacios y puntos
  return parseInt(price.replace(/(Gs\.?|₲)/i, '').replace(/[.\s]/g, '')) || 0;
} 