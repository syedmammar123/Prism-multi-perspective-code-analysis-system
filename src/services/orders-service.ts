// Fixture file for Task 25 final live re-verification.
// Deliberately padded with repetitive CRUD-style functions so the diff is
// large enough to trigger multi-batch chunking (Task 21), and includes one
// intentional violation of .codereview/error-handling.md (raw `throw new
// Error(...)` instead of the project's factory-function pattern) so a
// finding should cite that guideline (Task 23).

interface Order {
  id: string;
  customerId: string;
  items: { sku: string; qty: number; price: number }[];
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  createdAt: Date;
}

const orders: Order[] = [];

export function createOrder(customerId: string, items: Order['items']): Order {
  if (!customerId) {
    // Violates .codereview/error-handling.md: should throw one of the
    // factory functions from src/lib/errors.ts (e.g. ValidationError),
    // not a raw `new Error(...)`.
    throw new Error('customerId is required');
  }
  const order: Order = {
    id: Math.random().toString(36).slice(2),
    customerId,
    items,
    status: 'pending',
    createdAt: new Date(),
  };
  orders.push(order);
  return order;
}

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

export function listOrdersForCustomer(customerId: string): Order[] {
  return orders.filter((o) => o.customerId === customerId);
}

export function markOrderPaid(id: string): Order | undefined {
  const order = getOrder(id);
  if (order) order.status = 'paid';
  return order;
}

export function markOrderShipped(id: string): Order | undefined {
  const order = getOrder(id);
  if (order) order.status = 'shipped';
  return order;
}

export function cancelOrder(id: string): Order | undefined {
  const order = getOrder(id);
  if (order) order.status = 'cancelled';
  return order;
}

export function calculateOrderTotal(order: Order): number {
  let total = 0;
  for (const item of order.items) {
    total += item.qty * item.price;
  }
  return total;
}

export function calculateOrderTotalWithTax(order: Order, taxRate: number): number {
  return calculateOrderTotal(order) * (1 + taxRate);
}

export function findDuplicateSkus(order: Order): string[] {
  // Intentional O(n^2) pattern for the performance agent to flag.
  const dupes: string[] = [];
  for (let i = 0; i < order.items.length; i++) {
    for (let j = 0; j < order.items.length; j++) {
      if (i !== j && order.items[i].sku === order.items[j].sku) {
        dupes.push(order.items[i].sku);
      }
    }
  }
  return dupes;
}

export function summarizeOrder(order: Order): string {
  return `Order ${order.id} for ${order.customerId}: ${order.items.length} items, status=${order.status}`;
}

export function summarizeAllOrders(): string[] {
  return orders.map(summarizeOrder);
}

export function totalRevenue(): number {
  return orders
    .filter((o) => o.status === 'paid' || o.status === 'shipped')
    .reduce((sum, o) => sum + calculateOrderTotal(o), 0);
}

export function ordersByStatus(status: Order['status']): Order[] {
  return orders.filter((o) => o.status === status);
}

export function oldestPendingOrder(): Order | undefined {
  return orders
    .filter((o) => o.status === 'pending')
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())[0];
}

export function averageOrderValue(): number {
  const paidOrders = orders.filter((o) => o.status === 'paid' || o.status === 'shipped');
  if (paidOrders.length === 0) return 0;
  const total = paidOrders.reduce((sum, o) => sum + calculateOrderTotal(o), 0);
  return total / paidOrders.length;
}

export function itemsBySku(sku: string): { orderId: string; qty: number }[] {
  const result: { orderId: string; qty: number }[] = [];
  for (const order of orders) {
    for (const item of order.items) {
      if (item.sku === sku) {
        result.push({ orderId: order.id, qty: item.qty });
      }
    }
  }
  return result;
}

export function totalUnitsSoldForSku(sku: string): number {
  return itemsBySku(sku).reduce((sum, entry) => sum + entry.qty, 0);
}

export function resetOrders(): void {
  orders.length = 0;
}

export function seedOrders(count: number): void {
  for (let i = 0; i < count; i++) {
    createOrder(`customer-${i % 5}`, [
      { sku: `sku-${i % 3}`, qty: (i % 4) + 1, price: 9.99 + i },
    ]);
  }
}

export function orderCount(): number {
  return orders.length;
}

export function ordersCreatedAfter(date: Date): Order[] {
  return orders.filter((o) => o.createdAt > date);
}

export function ordersCreatedBefore(date: Date): Order[] {
  return orders.filter((o) => o.createdAt < date);
}

export function customerOrderCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const order of orders) {
    counts[order.customerId] = (counts[order.customerId] ?? 0) + 1;
  }
  return counts;
}

export function mostFrequentCustomer(): string | undefined {
  const counts = customerOrderCounts();
  let best: string | undefined;
  let bestCount = 0;
  for (const [customerId, count] of Object.entries(counts)) {
    if (count > bestCount) {
      best = customerId;
      bestCount = count;
    }
  }
  return best;
}

export function validateOrderItems(items: Order['items']): boolean {
  return items.every((item) => item.qty > 0 && item.price >= 0 && item.sku.length > 0);
}

export function mergeOrders(a: Order, b: Order): Order {
  return {
    ...a,
    items: [...a.items, ...b.items],
  };
}

export function splitOrder(order: Order, atIndex: number): [Order, Order] {
  const first: Order = { ...order, items: order.items.slice(0, atIndex) };
  const second: Order = { ...order, id: order.id + '-b', items: order.items.slice(atIndex) };
  return [first, second];
}

export function orderContainsSku(order: Order, sku: string): boolean {
  return order.items.some((item) => item.sku === sku);
}

export function removeSkuFromOrder(order: Order, sku: string): Order {
  return { ...order, items: order.items.filter((item) => item.sku !== sku) };
}

export function bulkUpdateStatus(ids: string[], status: Order['status']): number {
  let updated = 0;
  for (const id of ids) {
    const order = getOrder(id);
    if (order) {
      order.status = status;
      updated++;
    }
  }
  return updated;
}

export function exportOrdersAsCsv(): string {
  const header = 'id,customerId,status,total';
  const rows = orders.map(
    (o) => `${o.id},${o.customerId},${o.status},${calculateOrderTotal(o)}`
  );
  return [header, ...rows].join('\n');
}
