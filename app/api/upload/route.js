import Papa from 'papaparse';
import { admin, authUser, audit, json, deny } from '@/lib/server';
import { assess, DEFAULT_RULES } from '@/lib/risk';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Spreadsheet formula injection guard: cells that start with = + - @ are neutralised.
const clean = (v) => { v = String(v ?? '').trim(); return /^[=+\-@]/.test(v) ? "'" + v : v; };
const num = (v) => { const n = parseInt(v, 10); return isNaN(n) ? 0 : Math.max(0, n); };

export async function POST(req) {
  const user = await authUser(req, ['coordinator', 'admin']);
  if (!user) return deny();
  const { csv } = await req.json();
  if (!csv || csv.length > 2000000) return json({ error: 'CSV is missing or too large' }, 400);

  const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase() });
  const rows = [];
  const errors = [];
  parsed.data.forEach((r, i) => {
    const sn = clean(r.student_number), name = clean(r.name), course = clean(r.course) || 'COURSE';
    const email = String(r.email || '').trim().toLowerCase();
    if (!sn || !name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      errors.push(`Row ${i + 2}: missing or invalid student number, name or email`);
      return;
    }
    rows.push({ sn, name, email, course, r });
  });
  if (!rows.length) return json({ error: 'No valid rows found', errors: errors.slice(0, 5) }, 400);

  const db = admin();
  const { data: students, error: e1 } = await db
    .from('students')
    .upsert(rows.map((x) => ({ course: x.course, student_number: x.sn, name: x.name, email: x.email })), { onConflict: 'course,student_number' })
    .select('id,course,student_number');
  if (e1) return json({ error: e1.message }, 500);
  const idOf = {};
  students.forEach((s) => { idOf[s.course + '|' + s.student_number] = s.id; });

  const now = new Date().toISOString();
  const sigs = rows.map((x) => ({
    student_id: idOf[x.course + '|' + x.sn],
    days_since_login: num(x.r.days_since_login),
    submissions_due: num(x.r.submissions_due),
    submissions_done: num(x.r.submissions_done),
    test_marks: String(x.r.test_marks || '').split(/[;|]/).map((s) => parseFloat(s)).filter((n) => !isNaN(n)),
    classes_held: num(x.r.classes_held),
    classes_attended: num(x.r.classes_attended),
    concessions: num(x.r.concessions), // a count only: the reasons are never collected
    updated_at: now,
  }));
  const { error: e2 } = await db.from('signals').upsert(sigs, { onConflict: 'student_id' });
  if (e2) return json({ error: e2.message }, 500);

  const { data: rules } = await db.from('rules').select('*').eq('id', 1).single();
  const R = rules || DEFAULT_RULES;
  const risks = sigs.map((s) => ({ student_id: s.student_id, ...assess(s, R), computed_at: now }));
  const { error: e3 } = await db.from('risk_records').upsert(risks, { onConflict: 'student_id' });
  if (e3) return json({ error: e3.message }, 500);

  await audit(db, user, 'upload', `${rows.length} students`);
  return json({ loaded: rows.length, skipped: errors.length, errors: errors.slice(0, 5) });
}
