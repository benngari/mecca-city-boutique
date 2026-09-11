import { getSettings } from '@/lib/settings';

// A product's effective low-stock threshold: its own override if set,
// otherwise the site-wide default for its unit type (pieces vs millilitres -
// e.g. a perfume refilled in ml should alert at "100ml left", not "3 left").
export async function getEffectiveThreshold(product) {
  if (product.lowStockThreshold != null) return product.lowStockThreshold;
  const settings = await getSettings();
  return product.unitType === 'ml' ? settings.defaultLowStockThresholdMl : settings.defaultLowStockThresholdPiece;
}

export async function computeStockStatus(product, quantity) {
  if (quantity <= 0) return 'sold_out';
  const threshold = await getEffectiveThreshold(product);
  if (quantity <= threshold) return 'low_stock';
  return 'in_stock';
}
