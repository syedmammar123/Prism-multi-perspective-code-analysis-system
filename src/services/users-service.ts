// Fixture file for Task 25 final live re-verification (padding for
// multi-batch chunking — see orders-service.ts for the primary fixture
// and the intentional error-handling guideline violation).

interface UserRecord {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'guest';
  createdAt: Date;
  lastLoginAt: Date | null;
}

const users: UserRecord[] = [];

export function createUser(email: string, name: string, role: UserRecord['role'] = 'member'): UserRecord {
  const user: UserRecord = {
    id: Math.random().toString(36).slice(2),
    email,
    name,
    role,
    createdAt: new Date(),
    lastLoginAt: null,
  };
  users.push(user);
  return user;
}

export function getUserById(id: string): UserRecord | undefined {
  return users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): UserRecord | undefined {
  return users.find((u) => u.email === email);
}

export function listUsers(): UserRecord[] {
  return [...users];
}

export function listUsersByRole(role: UserRecord['role']): UserRecord[] {
  return users.filter((u) => u.role === role);
}

export function updateUserName(id: string, name: string): UserRecord | undefined {
  const user = getUserById(id);
  if (user) user.name = name;
  return user;
}

export function updateUserRole(id: string, role: UserRecord['role']): UserRecord | undefined {
  const user = getUserById(id);
  if (user) user.role = role;
  return user;
}

export function recordLogin(id: string): UserRecord | undefined {
  const user = getUserById(id);
  if (user) user.lastLoginAt = new Date();
  return user;
}

export function deleteUser(id: string): boolean {
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return false;
  users.splice(idx, 1);
  return true;
}

export function countUsers(): number {
  return users.length;
}

export function countUsersByRole(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const user of users) {
    counts[user.role] = (counts[user.role] ?? 0) + 1;
  }
  return counts;
}

export function usersInactiveSince(date: Date): UserRecord[] {
  return users.filter((u) => !u.lastLoginAt || u.lastLoginAt < date);
}

export function usersCreatedAfter(date: Date): UserRecord[] {
  return users.filter((u) => u.createdAt > date);
}

export function findDuplicateEmails(candidates: UserRecord[]): string[] {
  // Same O(n^2) shape as the other two fixture files — the performance
  // agent should flag this pattern across multiple files, not just once.
  const dupes: string[] = [];
  for (let i = 0; i < candidates.length; i++) {
    for (let j = 0; j < candidates.length; j++) {
      if (i !== j && candidates[i].email === candidates[j].email) {
        dupes.push(candidates[i].email);
      }
    }
  }
  return dupes;
}

export function promoteToAdmin(id: string): UserRecord | undefined {
  return updateUserRole(id, 'admin');
}

export function demoteToMember(id: string): UserRecord | undefined {
  return updateUserRole(id, 'member');
}

export function isAdmin(id: string): boolean {
  return getUserById(id)?.role === 'admin';
}

export function isGuest(id: string): boolean {
  return getUserById(id)?.role === 'guest';
}

export function sortUsersByCreatedAt(): UserRecord[] {
  return [...users].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export function sortUsersByLastLogin(): UserRecord[] {
  return [...users].sort((a, b) => {
    const aTime = a.lastLoginAt?.getTime() ?? 0;
    const bTime = b.lastLoginAt?.getTime() ?? 0;
    return bTime - aTime;
  });
}

export function resetUsers(): void {
  users.length = 0;
}

export function seedUsers(count: number): void {
  for (let i = 0; i < count; i++) {
    createUser(`user${i}@example.com`, `User ${i}`, i % 10 === 0 ? 'admin' : 'member');
  }
}

export function mergeUserRecords(a: UserRecord, b: UserRecord): UserRecord {
  return {
    ...a,
    lastLoginAt:
      (a.lastLoginAt?.getTime() ?? 0) > (b.lastLoginAt?.getTime() ?? 0)
        ? a.lastLoginAt
        : b.lastLoginAt,
  };
}

export function exportUsersAsCsv(): string {
  const header = 'id,email,name,role,createdAt';
  const rows = users.map(
    (u) => `${u.id},${u.email},${u.name},${u.role},${u.createdAt.toISOString()}`
  );
  return [header, ...rows].join('\n');
}

export function validateEmail(email: string): boolean {
  return email.includes('@') && email.includes('.');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function usersMatchingNamePrefix(prefix: string): UserRecord[] {
  const lower = prefix.toLowerCase();
  return users.filter((u) => u.name.toLowerCase().startsWith(lower));
}

export function bulkDeleteUsers(ids: string[]): number {
  let deleted = 0;
  for (const id of ids) {
    if (deleteUser(id)) deleted++;
  }
  return deleted;
}

export function userSummary(user: UserRecord): string {
  return `${user.name} <${user.email}> (${user.role})`;
}

export function allUserSummaries(): string[] {
  return users.map(userSummary);
}
