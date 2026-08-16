// Fixture file for Task 25 final live re-verification (padding for
// multi-batch chunking — see orders-service.ts for the primary fixture
// and the intentional error-handling guideline violation).

interface Shipment {
  id: string;
  orderId: string;
  carrier: 'ups' | 'fedex' | 'usps' | 'dhl';
  trackingNumber: string;
  status: 'label_created' | 'in_transit' | 'delivered' | 'lost';
  createdAt: Date;
  deliveredAt: Date | null;
}

const shipments: Shipment[] = [];

export function createShipment(orderId: string, carrier: Shipment['carrier']): Shipment {
  const shipment: Shipment = {
    id: Math.random().toString(36).slice(2),
    orderId,
    carrier,
    trackingNumber: Math.random().toString(36).slice(2).toUpperCase(),
    status: 'label_created',
    createdAt: new Date(),
    deliveredAt: null,
  };
  shipments.push(shipment);
  return shipment;
}

export function getShipment(id: string): Shipment | undefined {
  return shipments.find((s) => s.id === id);
}

export function getShipmentsForOrder(orderId: string): Shipment[] {
  return shipments.filter((s) => s.orderId === orderId);
}

export function markInTransit(id: string): Shipment | undefined {
  const shipment = getShipment(id);
  if (shipment) shipment.status = 'in_transit';
  return shipment;
}

export function markDelivered(id: string): Shipment | undefined {
  const shipment = getShipment(id);
  if (shipment) {
    shipment.status = 'delivered';
    shipment.deliveredAt = new Date();
  }
  return shipment;
}

export function markLost(id: string): Shipment | undefined {
  const shipment = getShipment(id);
  if (shipment) shipment.status = 'lost';
  return shipment;
}

export function shipmentsByCarrier(carrier: Shipment['carrier']): Shipment[] {
  return shipments.filter((s) => s.carrier === carrier);
}

export function shipmentsByStatus(status: Shipment['status']): Shipment[] {
  return shipments.filter((s) => s.status === status);
}

export function averageDeliveryTimeMs(): number {
  const delivered = shipments.filter((s) => s.deliveredAt);
  if (delivered.length === 0) return 0;
  const total = delivered.reduce(
    (sum, s) => sum + (s.deliveredAt!.getTime() - s.createdAt.getTime()),
    0
  );
  return total / delivered.length;
}

export function lostShipmentRate(): number {
  if (shipments.length === 0) return 0;
  return shipments.filter((s) => s.status === 'lost').length / shipments.length;
}

export function findDuplicateTrackingNumbers(candidates: Shipment[]): Shipment[] {
  // Same O(n^2) pattern as the other fixture files.
  const dupes: Shipment[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = 0; j < candidates.length; j++) {
      if (i !== j && candidates[i].trackingNumber === candidates[j].trackingNumber) {
        dupes.push(candidates[i]);
      }
    }
  }
  return dupes;
}

export function bulkMarkInTransit(ids: string[]): number {
  let updated = 0;
  for (const id of ids) {
    if (markInTransit(id)) updated++;
  }
  return updated;
}

export function shipmentsCreatedAfter(date: Date): Shipment[] {
  return shipments.filter((s) => s.createdAt > date);
}

export function shipmentsDeliveredAfter(date: Date): Shipment[] {
  return shipments.filter((s) => s.deliveredAt && s.deliveredAt > date);
}

export function resetShipments(): void {
  shipments.length = 0;
}

export function seedShipments(count: number): void {
  const carriers: Shipment['carrier'][] = ['ups', 'fedex', 'usps', 'dhl'];
  for (let i = 0; i < count; i++) {
    const shipment = createShipment(`order-${i % 7}`, carriers[i % 4]);
    if (i % 3 === 0) markInTransit(shipment.id);
    if (i % 5 === 0) markDelivered(shipment.id);
  }
}

export function shipmentCount(): number {
  return shipments.length;
}

export function shipmentCountByCarrier(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const shipment of shipments) {
    counts[shipment.carrier] = (counts[shipment.carrier] ?? 0) + 1;
  }
  return counts;
}

export function exportShipmentsAsCsv(): string {
  const header = 'id,orderId,carrier,trackingNumber,status,createdAt,deliveredAt';
  const rows = shipments.map(
    (s) =>
      `${s.id},${s.orderId},${s.carrier},${s.trackingNumber},${s.status},${s.createdAt.toISOString()},${s.deliveredAt?.toISOString() ?? ''}`
  );
  return [header, ...rows].join('\n');
}

export function shipmentSummary(shipment: Shipment): string {
  return `Shipment ${shipment.id} for order ${shipment.orderId} via ${shipment.carrier}: ${shipment.status}`;
}

export function allShipmentSummaries(): string[] {
  return shipments.map(shipmentSummary);
}
