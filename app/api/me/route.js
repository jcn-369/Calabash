import { authUser, json, deny } from '@/lib/server';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const user = await authUser(req);
  if (!user) return deny();
  return json({ email: user.email, role: user.role, name: user.name });
}
