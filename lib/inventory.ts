export const LOW_STOCK_THRESHOLD = 5;

export type InventoryStatus = 'out-of-stock' | 'low-stock' | 'in-stock';

export function getInventoryStatus(stock: number, threshold = LOW_STOCK_THRESHOLD): InventoryStatus {
  if (stock <= 0) {
    return 'out-of-stock';
  }

  if (stock <= threshold) {
    return 'low-stock';
  }

  return 'in-stock';
}

export function getInventoryStatusLabel(stock: number, threshold = LOW_STOCK_THRESHOLD): string {
  const status = getInventoryStatus(stock, threshold);

  if (status === 'out-of-stock') {
    return 'Out of stock';
  }

  if (status === 'low-stock') {
    return 'Low stock';
  }

  return 'In stock';
}

export function getInventoryBadgeClass(stock: number, threshold = LOW_STOCK_THRESHOLD): string {
  const status = getInventoryStatus(stock, threshold);

  if (status === 'out-of-stock') {
    return 'border-red-200 bg-red-50 text-red-700';
  }

  if (status === 'low-stock') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }

  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

export function normalizeStockValue(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || !Number.isInteger(numberValue) || numberValue < 0) {
    return null;
  }

  return numberValue;
}
