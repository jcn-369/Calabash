import { admin, authUser, audit, json, deny } from '@/lib/server';
import { DEFAULT_RULES } from '@/lib/risk';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const user = await authUser(req, ['coordinator', 'admin']);
  if (!user) return deny();
  const { data } = await admin().from('rules').select('*').eq('id', 1).single();
  return json({ rules: data || DEFAULT_RULES });
}

export async function POST(req) {
  const user = await authUser(req, ['coordinator', 'admin']);
  if (!user) return deny();
  const b = await req.json();
  const v = (x, d) => { const n = parseInt(x, 10); return isNaN(n) ? d : Math.min(100, Math.max(0, n)); };
  const row = { id: 1, login_days: v(b.login_days, 7), missed: v(b.missed, 2), mark_below: v(b.mark_below, 50), conc: v(b.conc, 2), attend_below: v(b.attend_below, 60) };
  const db = admin();
  const { error } = await db.from('rules').upsert(row);
  if (error) return json({ error: error.message }, 500);
  await audit(db, user, 'change_rules', JSON.stringify(row));
  return json({ rules: row });
}
