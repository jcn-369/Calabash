import { createClient } from '@supabase/supabase-js';

export function admin() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

// Checks the signed-in user's token and role. Returns null if not allowed.
export async function authUser(req, roles) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  if (!token) return null;
  const db = admin();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) return null;
  const { data: p } = await db.from('profiles').select('role,full_name').eq('id', data.user.id).single();
  if (!p) return null;
  if (roles && !roles.includes(p.role)) return null;
  return { id: data.user.id, email: data.user.email, role: p.role, name: p.full_name };
}

export async function audit(db, user, action, target) {
  await db.from('audit_log').insert({ actor: user ? user.email : 'student', action, target: target || null });
}

export const json = (d, s = 200) => Response.json(d, { status: s });
export const deny = () => json({ error: 'Not allowed' }, 403);
export const one = (x) => (Array.isArray(x) ? x[0] : x);

export function baseUrl(req) {
  return process.env.NEXT_PUBLIC_APP_URL || (req.headers.get('x-forwarded-proto') || 'https') + '://' + req.headers.get('host');
}
