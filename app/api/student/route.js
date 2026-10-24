import { admin, json, audit, one } from '@/lib/server';
export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TAGS = ['Workload', 'Money', 'Health', 'Accommodation', 'Transport', 'Something else'];

async function find(token) {
  if (!UUID.test(token || '')) return { status: 404, error: 'This link is not valid.' };
  const { data } = await admin().from('messages').select('id,student_id,expires_at,used_at,students(name)').eq('token', token).single();
  if (!data) return { status: 404, error: 'This link is not valid.' };
  if (new Date(data.expires_at) < new Date()) return { status: 410, error: 'This link has expired. Please contact Student Support.' };
  return { data };
}

export async function GET(req) {
  const token = new URL(req.url).searchParams.get('token');
  const f = await find(token);
  if (f.error) return json({ error: f.error }, f.status);
  return json({ name: one(f.data.students).name.split(' ')[0], used: !!f.data.used_at });
}

// The student's private page: they choose a time and, if they wish, tell us what is getting in the way.
export async function POST(req) {
  const b = await req.json();
  const f = await find(b.token);
  if (f.error) return json({ error: f.error }, f.status);
  if (f.data.used_at) return json({ error: 'You have already replied. Thank you.' }, 400);
  const slot = String(b.slot || '').slice(0, 40);
  if (!slot) return json({ error: 'Please choose a time.' }, 400);
  const tags = (Array.isArray(b.tags) ? b.tags : []).filter((t) => TAGS.includes(t));
  const note = String(b.note || '').slice(0, 1000);
  const db = admin();
  await db.from('form_responses').insert({ student_id: f.data.student_id, slot, tags, note });
  await db.from('messages').update({ used_at: new Date().toISOString() }).eq('id', f.data.id);
  await db.from('interventions').insert({ student_id: f.data.student_id, action: 'Student booked a wellness meeting and replied to the form', actor: 'student' });
  await audit(db, null, 'student_form_submitted', f.data.student_id);
  return json({ ok: true });
}
