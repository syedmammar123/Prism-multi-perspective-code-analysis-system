// Fixture file for Task 25 final live re-verification (padding for
// multi-batch chunking — see orders-service.ts for the primary fixture
// and the intentional error-handling guideline violation).

interface StockItem {
  sku: string;
  quantity: number;
  warehouse: string;
  reorderThreshold: number;
}

const stock: StockItem[] = [];

export function addStock(sku: string, quantity: number, warehouse: string): StockItem {
  const item: StockItem = { sku, quantity, warehouse, reorderThreshold: 10 };
  stock.push(item);
  return item;
}

export function getStock(sku: string): StockItem[] {
  return stock.filter((s) => s.sku === sku);
}

export function totalQuantityForSku(sku: string): number {
  return getStock(sku).reduce((sum, s) => sum + s.quantity, 0);
}

export function reduceStock(sku: string, warehouse: string, amount: number): boolean {
  const item = stock.find((s) => s.sku === sku && s.warehouse === warehouse);
  if (!item || item.quantity < amount) return false;
  item.quantity -= amount;
  return true;
}

export function increaseStock(sku: string, warehouse: string, amount: number): void {
  const item = stock.find((s) => s.sku === sku && s.warehouse === warehouse);
  if (item) {
    item.quantity += amount;
  } else {
    addStock(sku, amount, warehouse);
  }
}

export function itemsBelowThreshold(): StockItem[] {
  return stock.filter((s) => s.quantity < s.reorderThreshold);
}

export function warehousesForSku(sku: string): string[] {
  return [...new Set(getStock(sku).map((s) => s.warehouse))];
}

export function skusInWarehouse(warehouse: string): string[] {
  return [...new Set(stock.filter((s) => s.warehouse === warehouse).map((s) => s.sku))];
}

export function findLowStockDuplicates(items: StockItem[]): StockItem[] {
  // Intentional O(n^2) pattern, mirrors orders-service.ts's findDuplicateSkus,
  // gives the performance agent a second thing to catch in a different file.
  const dupes: StockItem[] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (i !== j && items[i].sku === items[j].sku && items[i].warehouse === items[j].warehouse) {
        dupes.push(items[i]);
      }
    }
  }
  return dupes;
}

export function transferStock(sku: string, from: string, to: string, amount: number): boolean {
  const ok = reduceStock(sku, from, amount);
  if (!ok) return false;
  increaseStock(sku, to, amount);
  return true;
}

export function totalStockValue(prices: Record<string, number>): number {
  return stock.reduce((sum, s) => sum + s.quantity * (prices[s.sku] ?? 0), 0);
}

export function setReorderThreshold(sku: string, warehouse: string, threshold: number): void {
  const item = stock.find((s) => s.sku === sku && s.warehouse === warehouse);
  if (item) item.reorderThreshold = threshold;
}

export function resetStock(): void {
  stock.length = 0;
}

export function seedStock(count: number): void {
  for (let i = 0; i < count; i++) {
    addStock(`sku-${i % 5}`, (i % 20) + 1, `warehouse-${i % 3}`);
  }
}

export function stockCount(): number {
  return stock.length;
}

export function warehouseCount(): number {
  return new Set(stock.map((s) => s.warehouse)).size;
}

export function skuCount(): number {
  return new Set(stock.map((s) => s.sku)).size;
}

export function averageQuantityPerSku(): number {
  const skus = new Set(stock.map((s) => s.sku));
  if (skus.size === 0) return 0;
  const total = stock.reduce((sum, s) => sum + s.quantity, 0);
  return total / skus.size;
}

export function itemsSortedByQuantity(): StockItem[] {
  return [...stock].sort((a, b) => b.quantity - a.quantity);
}

export function itemsSortedByThreshold(): StockItem[] {
  return [...stock].sort((a, b) => a.reorderThreshold - b.reorderThreshold);
}

export function mergeWarehouses(from: string, to: string): void {
  for (const item of stock) {
    if (item.warehouse === from) {
      item.warehouse = to;
    }
  }
}

export function exportStockAsCsv(): string {
  const header = 'sku,quantity,warehouse,reorderThreshold';
  const rows = stock.map((s) => `${s.sku},${s.quantity},${s.warehouse},${s.reorderThreshold}`);
  return [header, ...rows].join('\n');
}

export function stockNeedingReorder(): { sku: string; warehouse: string; shortfall: number }[] {
  return itemsBelowThreshold().map((s) => ({
    sku: s.sku,
    warehouse: s.warehouse,
    shortfall: s.reorderThreshold - s.quantity,
  }));
}

export function bulkAdjustQuantity(skus: string[], delta: number): number {
  let adjusted = 0;
  for (const sku of skus) {
    for (const item of getStock(sku)) {
      item.quantity = Math.max(0, item.quantity + delta);
      adjusted++;
    }
  }
  return adjusted;
}

export function isSkuKnown(sku: string): boolean {
  return stock.some((s) => s.sku === sku);
}

export function removeWarehouse(warehouse: string): number {
  const before = stock.length;
  const remaining = stock.filter((s) => s.warehouse !== warehouse);
  stock.length = 0;
  stock.push(...remaining);
  return before - remaining.length;
}
