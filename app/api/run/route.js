import { admin, authUser, audit, json, deny, one, baseUrl } from '@/lib/server';
import { assess, DEFAULT_RULES } from '@/lib/risk';
import { draft, sendEmail } from '@/lib/messages';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// The "nightly check". In production this runs on a schedule; here staff can also run it on demand.
export async function POST(req) {
  const user = await authUser(req, ['coordinator', 'admin']);
  if (!user) return deny();
  const db = admin();
  const { data: rules } = await db.from('rules').select('*').eq('id', 1).single();
  const R = rules || DEFAULT_RULES;
  const { data: students } = await db.from('students').select('id,name,email,signals(*),messages(id)');
  const now = new Date().toISOString();

  const scored = [];
  for (const s of students || []) {
    const sig = one(s.signals);
    if (!sig) continue;
    scored.push({ s, a: assess(sig, R) });
  }
  if (scored.length) {
    await db.from('risk_records').upsert(scored.map(({ s, a }) => ({ student_id: s.id, ...a, computed_at: now })), { onConflict: 'student_id' });
  }

  const out = { checked: scored.length, nudges: 0, pending: 0 };
  const todo = scored.filter(({ s, a }) => a.level !== 'Low' && !(s.messages || []).length);
  await Promise.all(todo.map(async ({ s, a }) => {
    const token = crypto.randomUUID();
    const link = `${baseUrl(req)}/s/${token}`;
    const d = await draft(s.name.split(' ')[0], a.level, link);
    const high = a.level === 'High';
    const row = { student_id: s.id, kind: high ? 'approval' : 'nudge', subject: d.subject, body: d.body, to_email: s.email, token, status: high ? 'pending' : 'sent', delivery: 'Waiting for staff approval' };
    if (!high) {
      const r = await sendEmail(s.email, d.subject, d.body);
      row.delivery = r.info; row.to_email = r.to; row.sent_at = new Date().toISOString();
      out.nudges++;
    } else out.pending++;
    await db.from('messages').insert(row);
    await db.from('interventions').insert({ student_id: s.id, action: high ? 'Queued for staff approval' : 'Automatic gentle nudge sent', actor: 'system' });
  }));

  await audit(db, user, 'run_check', `${out.checked} checked`);
  return json(out);
}
