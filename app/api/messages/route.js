import { admin, authUser, audit, json, deny } from '@/lib/server';
import { sendEmail } from '@/lib/messages';
export const dynamic = 'force-dynamic';

export async function GET(req) {
  const user = await authUser(req, ['coordinator', 'admin']);
  if (!user) return deny();
  const { data, error } = await admin().from('messages').select('id,kind,subject,body,to_email,status,delivery,created_at,sent_at,students(name)').order('created_at', { ascending: false }).limit(100);
  if (error) return json({ error: error.message }, 500);
  return json({ messages: data });
}

// A staff member approves a high-concern message before it is sent.
export async function POST(req) {
  const user = await authUser(req, ['coordinator', 'admin']);
  if (!user) return deny();
  const { id } = await req.json();
  const db = admin();
  const { data: m } = await db.from('messages').select('*,students(email)').eq('id', id).single();
  if (!m || m.status !== 'pending') return json({ error: 'Nothing to approve' }, 400);
  const r = await sendEmail(m.students.email, m.subject, m.body);
  await db.from('messages').update({ status: 'sent', delivery: r.info, to_email: r.to, sent_at: new Date().toISOString(), approved_by: user.email }).eq('id', id);
  await db.from('interventions').insert({ student_id: m.student_id, action: 'Staff approved and sent supportive email', actor: user.email });
  await audit(db, user, 'approve_message', id);
  return json({ ok: true, delivery: r.info });
}
