import { admin, authUser, json, deny, one } from '@/lib/server';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const user = await authUser(req, ['coordinator', 'wellness', 'admin']);
  if (!user) return deny();
  const db = admin();
  const { data, error } = await db
    .from('students')
    .select('id,name,email,student_number,course,signals(*),risk_records(*),messages(id,kind,status,created_at),form_responses(id)');
  if (error) return json({ error: error.message }, 500);
  const list = (data || []).map((s) => {
    const msgs = (s.messages || []).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    let status = 'Not contacted';
    if ((s.form_responses || []).length) status = 'Meeting booked';
    else if (msgs[0]) status = msgs[0].status === 'pending' ? 'Awaiting approval' : 'Contacted';
    return { id: s.id, name: s.name, email: s.email, student_number: s.student_number, course: s.course, signals: one(s.signals), risk: one(s.risk_records), status, pending_id: (msgs.find((m) => m.status === 'pending') || {}).id };
  });
  const w = (x) => ((x.risk && x.risk.score) || 0) * 2 + ((x.risk && x.risk.fscore) || 0);
  list.sort((a, b) => w(b) - w(a));
  return json({ students: list });
}
