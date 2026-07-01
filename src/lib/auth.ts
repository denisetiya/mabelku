import { hash, compare } from 'bcryptjs';
import { db, schema } from './db';
import { eq } from 'drizzle-orm';
import type { AstroCookies } from 'astro';

const SESSION_COOKIE = 'mabelku_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return compare(password, hash);
}

export async function createSession(
  cookies: AstroCookies,
  adminId: string,
): Promise<void> {
  const token = `${adminId}:${crypto.randomUUID()}`;
  cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function destroySession(cookies: AstroCookies): void {
  cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function getSessionAdminId(cookies: AstroCookies): string | null {
  const token = cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const parts = token.split(':');
  return parts[0] ?? null;
}

export async function isAuthenticated(cookies: AstroCookies): Promise<boolean> {
  const adminId = getSessionAdminId(cookies);
  if (!adminId) return false;
  const admin = db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, adminId))
    .get();
  return !!admin;
}

export async function getAuthenticatedAdmin(cookies: AstroCookies) {
  const adminId = getSessionAdminId(cookies);
  if (!adminId) return null;
  const admin = db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.id, adminId))
    .get();
  return admin ?? null;
}

export async function loginAdmin(
  email: string,
  password: string,
  cookies: AstroCookies,
): Promise<boolean> {
  const admin = db
    .select()
    .from(schema.adminUsers)
    .where(eq(schema.adminUsers.email, email))
    .get();

  if (!admin) return false;

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return false;

  await createSession(cookies, admin.id);
  return true;
}
