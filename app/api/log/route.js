import { admin, authUser, json, deny } from '@/lib/server';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const user = await authUser(req, ['coordinator', 'admin']);
  if (!user) return deny();
  const db = admin();
  const [a, b] = await Promise.all([
    db.from('interventions').select('action,actor,created_at,students(name)').order('created_at', { ascending: false }).limit(100),
    db.from('audit_log').select('actor,action,target,created_at').order('created_at', { ascending: false }).limit(50),
  ]);
  return json({ interventions: a.data || [], audit: b.data || [] });
}
