'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key');
const cls = { High: 'hi', Medium: 'md', Low: 'lo' };
const fmt = (t) => new Date(t).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' });

export default function Home() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState('students');
  const [students, setStudents] = useState([]);
  const [msgs, setMsgs] = useState([]);
  const [rules, setRules] = useState(null);
  const [log, setLog] = useState({ interventions: [], audit: [] });
  const [well, setWell] = useState([]);
  const [open, setOpen] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: l } = sb.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);

  const api = useCallback(async (path, body) => {
    const r = await fetch(path, {
      method: body ? 'POST' : 'GET',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + ((session && session.access_token) || '') },
      body: body ? JSON.stringify(body) : undefined,
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(d.error || 'Something went wrong');
    return d;
  }, [session]);

  const refresh = useCallback(async (role) => {
    try {
      const s = await api('/api/students'); setStudents(s.students);
      if (role !== 'wellness') {
        setMsgs((await api('/api/messages')).messages);
        setRules((await api('/api/rules')).rules);
        setLog(await api('/api/log'));
      }
      if (role !== 'coordinator') setWell((await api('/api/wellness')).responses);
    } catch (e) { setNote(e.message); }
  }, [api]);

  useEffect(() => {
    if (!session) { setMe(null); return; }
    api('/api/me').then((m) => { setMe(m); setTab(m.role === 'wellness' ? 'wellness' : 'students'); refresh(m.role); }).catch((e) => setNote(e.message));
  }, [session]); // eslint-disable-line

  const act = async (fn, ok) => {
    setBusy(true); setNote('');
    try { const r = await fn(); setNote(typeof ok === 'function' ? ok(r) : ok); await refresh(me.role); } catch (e) { setNote(e.message); }
    setBusy(false);
  };
  const upload = (csv) => act(() => api('/api/upload', { csv }), (r) => `Loaded ${r.loaded} students${r.skipped ? `, skipped ${r.skipped} invalid rows` : ''}.`);
  const onFile = async (e) => { const f = e.target.files[0]; if (f) upload(await f.text()); e.target.value = ''; };
  const sample = async () => upload(await (await fetch('/sample.csv')).text());
  const run = () => act(() => api('/api/run', {}), (r) => `Checked ${r.checked} students. ${r.nudges} gentle nudges sent, ${r.pending} waiting for your approval.`);
  const approve = (id) => act(() => api('/api/messages', { id }), 'Message approved and sent.');
  const saveRules = () => act(() => api('/api/rules', rules), 'Rules saved. Press "Run check" to apply them.');
  const login = async (e) => { e.preventDefault(); setErr(''); const { error } = await sb.auth.signInWithPassword({ email, password: pw }); if (error) setErr(error.message); };

  if (!ready) return <div className="app">Loading...</div>;
  if (!session) return (
    <div className="app" style={{ maxWidth: 420 }}>
      <div className="top"><span className="brand">Cala<b>bash</b></span></div>
      <form className="card" onSubmit={login}>
        <h2>Staff sign in</h2>
        <p className="mut">Catch it early. Care for every student.</p>
        <label>Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label><input type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
        {err && <div className="note warn">{err}</div>}
        <div style={{ marginTop: 12 }}><button className="btn" type="submit">Sign in</button></div>
      </form>
    </div>
  );
  if (!me) return <div className="app">{note || 'Loading your account...'}</div>;

  const staff = me.role !== 'wellness';
  const n = { High: 0, Medium: 0, Low: 0 };
  students.forEach((s) => { if (s.risk) n[s.risk.level]++; });
  const tabs = [['students', 'Students'], ...(staff ? [['outbox', 'Outbox'], ['log', 'Log']] : []), ...(me.role !== 'coordinator' ? [['wellness', 'Wellness']] : [])];

  return (
    <div className="app">
      <div className="top">
        <span className="brand">Cala<b>bash</b></span>
        <span className="mut">{me.email} · {me.role} · <a href="#" onClick={(e) => { e.preventDefault(); sb.auth.signOut(); }}>Sign out</a></span>
      </div>
      <div className="tabs">{tabs.map(([k, l]) => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>)}</div>
      {note && <div className="note">{note}</div>}

      {tab === 'students' && (
        <>
          {staff && (
            <>
              <div className="card">
                <h2>1. Add course data</h2>
                <p className="mut">Upload a CSV exported from the learning portal and records. Students are scored straight away. Concession reasons are never collected.</p>
                <div className="row">
                  <input type="file" accept=".csv" onChange={onFile} disabled={busy} />
                  <button className="btn sec sm" onClick={sample} disabled={busy}>Load sample data</button>
                  <a className="mut" href="/sample.csv" download>Download template</a>
                </div>
              </div>
              {rules && (
                <div className="card">
                  <h2>2. Set your rules</h2>
                  <p className="mut">Staff can see and change what counts as a warning sign.</p>
                  <div className="grid">
                    {[['login_days', 'Days without login (or more)'], ['missed', 'Missed submissions (or more)'], ['mark_below', 'Latest test at or below (%)'], ['conc', 'Concessions (or more)'], ['attend_below', 'Attendance at or below (%)']].map(([k, l]) => (
                      <div key={k}><label>{l}</label><input type="number" min="0" max="100" value={rules[k]} onChange={(e) => setRules({ ...rules, [k]: e.target.value })} /></div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10 }}><button className="btn sec sm" onClick={saveRules} disabled={busy}>Save rules</button></div>
                </div>
              )}
              <div className="card row">
                <div><h2>3. Run the check</h2><p className="mut" style={{ margin: 0 }}>Scores everyone, sends gentle nudges for medium concern, and queues high concern for your approval. In production this runs every night.</p></div>
                <button className="btn" onClick={run} disabled={busy || !students.length}>{busy ? 'Working...' : 'Run check'}</button>
              </div>
            </>
          )}
          <div className="sum">
            <div className="hi"><b>{n.High}</b><span>High concern</span></div>
            <div className="md"><b>{n.Medium}</b><span>Medium</span></div>
            <div className="lo"><b>{n.Low}</b><span>Low</span></div>
          </div>
          <div className="card">
            <h2>Students</h2>
            <p className="mut">Ranked by concern and forecast. Tap a student for the reasons.</p>
            {!students.length && <div className="note">No students yet. Upload a CSV or load the sample data.</div>}
            {students.map((s) => {
              const r = s.risk, g = s.signals;
              return (
                <div className="s" key={s.id} onClick={() => setOpen(open === s.id ? null : s.id)}>
                  <div className="row"><b>{s.name}</b><span>{r && <span className={'pill ' + cls[r.level]}>{r.level}</span>}</span></div>
                  <div className="st">{s.status}{r && r.forecast_note ? ' · Forecast: ' + r.forecast_note : ''}</div>
                  {open === s.id && r && g && (
                    <div>
                      <div className="chips">{r.reasons.length ? r.reasons.map((x) => <span className="chip" key={x}>{x}</span>) : <span className="chip">No warning signs</span>}</div>
                      <p className="mut" style={{ marginTop: 8 }}>{s.student_number} · {s.course} · Logged in {g.days_since_login} days ago · Submissions {g.submissions_done}/{g.submissions_due} · Marks {(g.test_marks || []).join(', ')}% · Attendance {g.classes_attended}/{g.classes_held} · Concessions {g.concessions}</p>
                      {s.pending_id && staff && <button className="btn sm" onClick={(e) => { e.stopPropagation(); approve(s.pending_id); }} disabled={busy}>Approve and send supportive email</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'outbox' && (
        <div className="card">
          <h2>Outbox</h2>
          <p className="mut">Every message Calabash drafts. High-concern messages wait here for a person to approve them. In the demo, emails go to one test address.</p>
          {!msgs.length && <div className="note">Nothing yet. Run the check first.</div>}
          {msgs.map((m) => (
            <div className="mail" key={m.id}>
              <div className="row"><b>{m.students && m.students.name}</b><span className={'pill ' + (m.status === 'pending' ? 'md' : 'lo')}>{m.status === 'pending' ? 'Awaiting approval' : 'Sent'}</span></div>
              <div className="mut">To: {m.to_email} · {m.delivery}</div>
              <div style={{ marginTop: 8 }}>{m.body}</div>
              {m.status === 'pending' && staff && <div style={{ marginTop: 8 }}><button className="btn sm" onClick={() => approve(m.id)} disabled={busy}>Approve and send</button></div>}
            </div>
          ))}
        </div>
      )}

      {tab === 'log' && (
        <>
          <div className="card log"><h2>Intervention log</h2>{!log.interventions.length && <p className="mut">Nothing yet.</p>}{log.interventions.map((x, i) => <div key={i}><b>{x.students && x.students.name}</b>: {x.action} <span className="mut">· {x.actor} · {fmt(x.created_at)}</span></div>)}</div>
          <div className="card log"><h2>Audit log</h2>{log.audit.map((x, i) => <div key={i}>{x.action} {x.target ? '(' + x.target + ')' : ''} <span className="mut">· {x.actor} · {fmt(x.created_at)}</span></div>)}</div>
        </>
      )}

      {tab === 'wellness' && (
        <div className="card">
          <h2>Wellness replies</h2>
          <p className="mut">Only wellness staff can see this page. Coordinators cannot open it.</p>
          {!well.length && <div className="note">No replies yet.</div>}
          {well.map((w) => (
            <div className="mail" key={w.id}>
              <b>{w.students && w.students.name}</b> <span className="mut">· {fmt(w.created_at)}</span>
              <div>Meeting: {w.slot}</div>
              {w.tags && w.tags.length > 0 && <div className="chips">{w.tags.map((t) => <span className="chip" key={t}>{t}</span>)}</div>}
              {w.note && <div style={{ marginTop: 6 }}>{w.note}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
