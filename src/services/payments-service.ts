// Fixture file for Task 25 final live re-verification (padding for
// multi-batch chunking — see orders-service.ts for the primary fixture
// and the intentional error-handling guideline violation). This file is
// intentionally larger than the others so the total diff across all four
// fixture files clears the 8000-token batching threshold in src/lib/chunk.ts,
// exercising the multi-batch merge/dedupe/sort path end-to-end rather than
// the single-file oversized-chunk split path (already covered in Task 21).

interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  method: 'card' | 'bank_transfer' | 'wallet';
  status: 'pending' | 'authorized' | 'captured' | 'refunded' | 'failed';
  createdAt: Date;
}

interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  createdAt: Date;
}

const payments: Payment[] = [];
const refunds: Refund[] = [];

export function createPayment(
  orderId: string,
  amount: number,
  currency: string,
  method: Payment['method']
): Payment {
  const payment: Payment = {
    id: Math.random().toString(36).slice(2),
    orderId,
    amount,
    currency,
    method,
    status: 'pending',
    createdAt: new Date(),
  };
  payments.push(payment);
  return payment;
}

export function getPayment(id: string): Payment | undefined {
  return payments.find((p) => p.id === id);
}

export function getPaymentsForOrder(orderId: string): Payment[] {
  return payments.filter((p) => p.orderId === orderId);
}

export function authorizePayment(id: string): Payment | undefined {
  const payment = getPayment(id);
  if (payment) payment.status = 'authorized';
  return payment;
}

export function capturePayment(id: string): Payment | undefined {
  const payment = getPayment(id);
  if (payment) payment.status = 'captured';
  return payment;
}

export function failPayment(id: string): Payment | undefined {
  const payment = getPayment(id);
  if (payment) payment.status = 'failed';
  return payment;
}

export function refundPayment(paymentId: string, amount: number, reason: string): Refund {
  const refund: Refund = {
    id: Math.random().toString(36).slice(2),
    paymentId,
    amount,
    reason,
    createdAt: new Date(),
  };
  refunds.push(refund);
  const payment = getPayment(paymentId);
  if (payment) payment.status = 'refunded';
  return refund;
}

export function getRefundsForPayment(paymentId: string): Refund[] {
  return refunds.filter((r) => r.paymentId === paymentId);
}

export function totalRefundedForPayment(paymentId: string): number {
  return getRefundsForPayment(paymentId).reduce((sum, r) => sum + r.amount, 0);
}

export function isFullyRefunded(paymentId: string): boolean {
  const payment = getPayment(paymentId);
  if (!payment) return false;
  return totalRefundedForPayment(paymentId) >= payment.amount;
}

export function totalCapturedRevenue(): number {
  return payments.filter((p) => p.status === 'captured').reduce((sum, p) => sum + p.amount, 0);
}

export function totalPendingAmount(): number {
  return payments.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
}

export function totalFailedAmount(): number {
  return payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0);
}

export function totalRefundedAmount(): number {
  return refunds.reduce((sum, r) => sum + r.amount, 0);
}

export function paymentsByMethod(method: Payment['method']): Payment[] {
  return payments.filter((p) => p.method === method);
}

export function paymentsByStatus(status: Payment['status']): Payment[] {
  return payments.filter((p) => p.status === status);
}

export function paymentsByCurrency(currency: string): Payment[] {
  return payments.filter((p) => p.currency === currency);
}

export function averagePaymentAmount(): number {
  if (payments.length === 0) return 0;
  return payments.reduce((sum, p) => sum + p.amount, 0) / payments.length;
}

export function largestPayment(): Payment | undefined {
  return [...payments].sort((a, b) => b.amount - a.amount)[0];
}

export function smallestPayment(): Payment | undefined {
  return [...payments].sort((a, b) => a.amount - b.amount)[0];
}

export function paymentsCreatedAfter(date: Date): Payment[] {
  return payments.filter((p) => p.createdAt > date);
}

export function paymentsCreatedBefore(date: Date): Payment[] {
  return payments.filter((p) => p.createdAt < date);
}

export function findDuplicatePaymentAmounts(candidates: Payment[]): Payment[] {
  // Same O(n^2) shape repeated across all four fixture files — the
  // performance agent should flag this pattern consistently, not just in
  // one isolated spot, once it's spread across a real multi-file PR.
  const dupes: Payment[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = 0; j < candidates.length; j++) {
      if (i !== j && candidates[i].amount === candidates[j].amount && candidates[i].currency === candidates[j].currency) {
        dupes.push(candidates[i]);
      }
    }
  }
  return dupes;
}

export function bulkCapture(ids: string[]): number {
  let captured = 0;
  for (const id of ids) {
    const payment = capturePayment(id);
    if (payment) captured++;
  }
  return captured;
}

export function bulkFail(ids: string[]): number {
  let failed = 0;
  for (const id of ids) {
    const payment = failPayment(id);
    if (payment) failed++;
  }
  return failed;
}

export function exportPaymentsAsCsv(): string {
  const header = 'id,orderId,amount,currency,method,status,createdAt';
  const rows = payments.map(
    (p) =>
      `${p.id},${p.orderId},${p.amount},${p.currency},${p.method},${p.status},${p.createdAt.toISOString()}`
  );
  return [header, ...rows].join('\n');
}

export function exportRefundsAsCsv(): string {
  const header = 'id,paymentId,amount,reason,createdAt';
  const rows = refunds.map(
    (r) => `${r.id},${r.paymentId},${r.amount},${r.reason},${r.createdAt.toISOString()}`
  );
  return [header, ...rows].join('\n');
}

export function resetPayments(): void {
  payments.length = 0;
  refunds.length = 0;
}

export function seedPayments(count: number): void {
  const methods: Payment['method'][] = ['card', 'bank_transfer', 'wallet'];
  for (let i = 0; i < count; i++) {
    const payment = createPayment(`order-${i % 7}`, 9.99 + i, 'USD', methods[i % 3]);
    if (i % 4 === 0) authorizePayment(payment.id);
    if (i % 5 === 0) capturePayment(payment.id);
  }
}

export function paymentCount(): number {
  return payments.length;
}

export function refundCount(): number {
  return refunds.length;
}

export function paymentSuccessRate(): number {
  if (payments.length === 0) return 0;
  const succeeded = payments.filter((p) => p.status === 'captured').length;
  return succeeded / payments.length;
}

export function paymentFailureRate(): number {
  if (payments.length === 0) return 0;
  const failed = payments.filter((p) => p.status === 'failed').length;
  return failed / payments.length;
}

export function medianPaymentAmount(): number {
  if (payments.length === 0) return 0;
  const sorted = [...payments].map((p) => p.amount).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

export function paymentsGroupedByOrder(): Record<string, Payment[]> {
  const groups: Record<string, Payment[]> = {};
  for (const payment of payments) {
    if (!groups[payment.orderId]) groups[payment.orderId] = [];
    groups[payment.orderId].push(payment);
  }
  return groups;
}

export function ordersWithMultiplePayments(): string[] {
  const groups = paymentsGroupedByOrder();
  return Object.keys(groups).filter((orderId) => groups[orderId].length > 1);
}

export function retryFailedPayments(): number {
  let retried = 0;
  for (const payment of payments) {
    if (payment.status === 'failed') {
      payment.status = 'pending';
      retried++;
    }
  }
  return retried;
}

export function cancelPendingPayments(olderThan: Date): number {
  let cancelled = 0;
  for (const payment of payments) {
    if (payment.status === 'pending' && payment.createdAt < olderThan) {
      payment.status = 'failed';
      cancelled++;
    }
  }
  return cancelled;
}

export function paymentSummary(payment: Payment): string {
  return `Payment ${payment.id} for order ${payment.orderId}: ${payment.amount} ${payment.currency} (${payment.status})`;
}

export function allPaymentSummaries(): string[] {
  return payments.map(paymentSummary);
}

export function refundSummary(refund: Refund): string {
  return `Refund ${refund.id} for payment ${refund.paymentId}: ${refund.amount} (${refund.reason})`;
}

export function allRefundSummaries(): string[] {
  return refunds.map(refundSummary);
}

export function netRevenue(): number {
  return totalCapturedRevenue() - totalRefundedAmount();
}

export function paymentsRequiringReview(): Payment[] {
  return payments.filter((p) => p.amount > 1000 && p.status === 'pending');
}

export function highValuePaymentThreshold(threshold: number): Payment[] {
  return payments.filter((p) => p.amount >= threshold);
}

export function lowValuePaymentThreshold(threshold: number): Payment[] {
  return payments.filter((p) => p.amount <= threshold);
}

export function paymentsInCurrencyRange(min: number, max: number): Payment[] {
  return payments.filter((p) => p.amount >= min && p.amount <= max);
}

export function distinctCurrencies(): string[] {
  return [...new Set(payments.map((p) => p.currency))];
}

export function distinctMethods(): string[] {
  return [...new Set(payments.map((p) => p.method))];
}

export function paymentCountByCurrency(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const payment of payments) {
    counts[payment.currency] = (counts[payment.currency] ?? 0) + 1;
  }
  return counts;
}

export function paymentCountByMethod(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const payment of payments) {
    counts[payment.method] = (counts[payment.method] ?? 0) + 1;
  }
  return counts;
}
