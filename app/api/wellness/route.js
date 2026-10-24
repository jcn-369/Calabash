import { admin, authUser, audit, json, deny } from '@/lib/server';
export const dynamic = 'force-dynamic';

// Only wellness staff (and the admin) can read what students write in the form.
export async function GET(req) {
  const user = await authUser(req, ['wellness', 'admin']);
  if (!user) return deny();
  const db = admin();
  const { data, error } = await db.from('form_responses').select('id,slot,tags,note,created_at,students(name,student_number)').order('created_at', { ascending: false });
  if (error) return json({ error: error.message }, 500);
  await audit(db, user, 'view_wellness_responses', `${(data || []).length} responses`);
  return json({ responses: data || [] });
}
