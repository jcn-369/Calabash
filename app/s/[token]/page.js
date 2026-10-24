'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

const SLOTS = ['Tue 10:00', 'Wed 14:00', 'Fri 09:30'];
const TAGS = ['Workload', 'Money', 'Health', 'Accommodation', 'Transport', 'Something else'];

export default function StudentPage() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [slot, setSlot] = useState('');
  const [tags, setTags] = useState([]);
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/student?token=' + token).then(async (r) => {
      const d = await r.json();
      if (!r.ok) setError(d.error); else setInfo(d);
    });
  }, [token]);

  const toggle = (t) => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  const submit = async () => {
    setBusy(true); setError('');
    const r = await fetch('/api/student', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token, slot, tags, note }) });
    const d = await r.json();
    if (!r.ok) setError(d.error); else setDone(true);
    setBusy(false);
  };

  return (
    <div className="app" style={{ maxWidth: 560 }}>
      <div className="top"><span className="brand">Cala<b>bash</b></span></div>
      {error && !info && <div className="card">{error}</div>}
      {info && (done || info.used) && <div className="card"><h2>Thank you, {info.name}</h2><p>We have your reply. Student Wellness will be in touch about your chosen time. If you need urgent help before then, please contact the university's 24-hour crisis line.</p></div>}
      {info && !done && !info.used && (
        <>
          <div className="card">
            <h2>Hi {info.name}</h2>
            <p>Your Student Support team would like to check in. Everything on this page is optional.</p>
            <div className="note">What we look at: course activity such as logins, submissions, marks, attendance and the number of concessions. What you write here is seen only by Student Wellness staff, never by lecturers, funders or parents.</div>
          </div>
          <div className="card">
            <h3>Pick a time to chat with Student Wellness</h3>
            <div className="chips">{SLOTS.map((s) => <button key={s} className={'chip' + (slot === s ? ' on' : '')} onClick={() => setSlot(s)}>{s}</button>)}</div>
            <h3 style={{ marginTop: 16 }}>What is getting in the way? (optional)</h3>
            <div className="chips">{TAGS.map((t) => <button key={t} className={'chip' + (tags.includes(t) ? ' on' : '')} onClick={() => toggle(t)}>{t}</button>)}</div>
            <label>Anything else you would like us to know? (optional)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
            {error && <div className="note warn">{error}</div>}
            <div style={{ marginTop: 12 }}><button className="btn" disabled={!slot || busy} onClick={submit}>{busy ? 'Sending...' : 'Book and send'}</button></div>
            <p className="mut" style={{ marginTop: 10 }}>If you are in crisis, please contact the university's 24-hour crisis line or your local emergency number straight away.</p>
          </div>
        </>
      )}
    </div>
  );
}
