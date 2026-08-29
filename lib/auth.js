import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);
export const SESSION_COOKIE = 'mcb_admin_session';

export async function createSessionToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());
}

export async function verifySessionToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const store = cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
