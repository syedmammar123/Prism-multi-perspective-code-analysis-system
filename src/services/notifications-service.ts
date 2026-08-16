// Fixture file for Task 25 final live re-verification (padding for
// multi-batch chunking — see orders-service.ts for the primary fixture
// and the intentional error-handling guideline violation). Added as a
// sixth file specifically to push the combined diff comfortably past the
// 8000-token batching threshold in src/lib/chunk.ts, so the live run
// exercises the multi-batch merge/dedupe/sort path with margin to spare.

interface NotificationRecord {
  id: string;
  userId: string;
  channel: 'email' | 'sms' | 'push';
  subject: string;
  body: string;
  status: 'queued' | 'sent' | 'delivered' | 'failed';
  createdAt: Date;
  sentAt: Date | null;
}

const notifications: NotificationRecord[] = [];

export function queueNotification(
  userId: string,
  channel: NotificationRecord['channel'],
  subject: string,
  body: string
): NotificationRecord {
  const notification: NotificationRecord = {
    id: Math.random().toString(36).slice(2),
    userId,
    channel,
    subject,
    body,
    status: 'queued',
    createdAt: new Date(),
    sentAt: null,
  };
  notifications.push(notification);
  return notification;
}

export function getNotification(id: string): NotificationRecord | undefined {
  return notifications.find((n) => n.id === id);
}

export function getNotificationsForUser(userId: string): NotificationRecord[] {
  return notifications.filter((n) => n.userId === userId);
}

export function markSent(id: string): NotificationRecord | undefined {
  const notification = getNotification(id);
  if (notification) {
    notification.status = 'sent';
    notification.sentAt = new Date();
  }
  return notification;
}

export function markDelivered(id: string): NotificationRecord | undefined {
  const notification = getNotification(id);
  if (notification) notification.status = 'delivered';
  return notification;
}

export function markFailed(id: string): NotificationRecord | undefined {
  const notification = getNotification(id);
  if (notification) notification.status = 'failed';
  return notification;
}

export function notificationsByChannel(channel: NotificationRecord['channel']): NotificationRecord[] {
  return notifications.filter((n) => n.channel === channel);
}

export function notificationsByStatus(status: NotificationRecord['status']): NotificationRecord[] {
  return notifications.filter((n) => n.status === status);
}

export function pendingNotifications(): NotificationRecord[] {
  return notifications.filter((n) => n.status === 'queued');
}

export function failedNotificationRate(): number {
  if (notifications.length === 0) return 0;
  return notifications.filter((n) => n.status === 'failed').length / notifications.length;
}

export function averageDeliveryLatencyMs(): number {
  const sent = notifications.filter((n) => n.sentAt);
  if (sent.length === 0) return 0;
  const total = sent.reduce((sum, n) => sum + (n.sentAt!.getTime() - n.createdAt.getTime()), 0);
  return total / sent.length;
}

export function findDuplicateNotifications(candidates: NotificationRecord[]): NotificationRecord[] {
  // Same O(n^2) pattern as the other fixture files, for consistency in
  // what the performance agent should be flagging across the whole PR.
  const dupes: NotificationRecord[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = 0; j < candidates.length; j++) {
      if (
        i !== j &&
        candidates[i].userId === candidates[j].userId &&
        candidates[i].subject === candidates[j].subject
      ) {
        dupes.push(candidates[i]);
      }
    }
  }
  return dupes;
}

export function bulkMarkSent(ids: string[]): number {
  let updated = 0;
  for (const id of ids) {
    if (markSent(id)) updated++;
  }
  return updated;
}

export function bulkRetryFailed(): number {
  let retried = 0;
  for (const notification of notifications) {
    if (notification.status === 'failed') {
      notification.status = 'queued';
      retried++;
    }
  }
  return retried;
}

export function notificationsCreatedAfter(date: Date): NotificationRecord[] {
  return notifications.filter((n) => n.createdAt > date);
}

export function notificationsSentAfter(date: Date): NotificationRecord[] {
  return notifications.filter((n) => n.sentAt && n.sentAt > date);
}

export function resetNotifications(): void {
  notifications.length = 0;
}

export function seedNotifications(count: number): void {
  const channels: NotificationRecord['channel'][] = ['email', 'sms', 'push'];
  for (let i = 0; i < count; i++) {
    const notification = queueNotification(
      `user-${i % 6}`,
      channels[i % 3],
      `Subject ${i}`,
      `Body content for notification ${i}`
    );
    if (i % 2 === 0) markSent(notification.id);
    if (i % 3 === 0) markDelivered(notification.id);
  }
}

export function notificationCount(): number {
  return notifications.length;
}

export function notificationCountByChannel(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const notification of notifications) {
    counts[notification.channel] = (counts[notification.channel] ?? 0) + 1;
  }
  return counts;
}

export function notificationCountByStatus(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const notification of notifications) {
    counts[notification.status] = (counts[notification.status] ?? 0) + 1;
  }
  return counts;
}

export function exportNotificationsAsCsv(): string {
  const header = 'id,userId,channel,subject,status,createdAt,sentAt';
  const rows = notifications.map(
    (n) =>
      `${n.id},${n.userId},${n.channel},${n.subject},${n.status},${n.createdAt.toISOString()},${n.sentAt?.toISOString() ?? ''}`
  );
  return [header, ...rows].join('\n');
}

export function notificationSummary(notification: NotificationRecord): string {
  return `Notification ${notification.id} to ${notification.userId} via ${notification.channel}: ${notification.status}`;
}

export function allNotificationSummaries(): string[] {
  return notifications.map(notificationSummary);
}

export function usersWithFailedNotifications(): string[] {
  return [...new Set(notifications.filter((n) => n.status === 'failed').map((n) => n.userId))];
}

export function mostRecentNotificationForUser(userId: string): NotificationRecord | undefined {
  return getNotificationsForUser(userId).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  )[0];
}
