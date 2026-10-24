// Transparent rules plus a simple trend forecast. No black box: every flag shows its reasons.
export const DEFAULT_RULES = { login_days: 7, missed: 2, mark_below: 50, conc: 2, attend_below: 60 };

const level = (x) => (x >= 55 ? 'High' : x >= 25 ? 'Medium' : 'Low');
const rank = (l) => ({ Low: 0, Medium: 1, High: 2 })[l];

export function assess(s, r) {
  const reasons = [];
  let score = 0;
  const marks = (s.test_marks || []).map(Number).filter((n) => !isNaN(n));
  const last = marks.length ? marks[marks.length - 1] : null;
  const missed = Math.max(0, (s.submissions_due || 0) - (s.submissions_done || 0));
  const att = s.classes_held > 0 ? Math.round((100 * s.classes_attended) / s.classes_held) : null;

  if (s.days_since_login >= r.login_days) { score += 25; reasons.push(`No login for ${s.days_since_login} days`); }
  if (missed >= r.missed) { score += 30; reasons.push(`${missed} missed submissions`); }
  if (last !== null && last <= r.mark_below) { score += 25; reasons.push(`Latest test ${last}%`); }
  if (s.concessions >= r.conc) { score += 10; reasons.push(`${s.concessions} concessions used`); }
  if (att !== null && att <= r.attend_below) { score += 10; reasons.push(`Attendance ${att}%`); }

  // Forecast: where is this student heading in about two weeks?
  let add = 0;
  const why = [];
  if (marks.length >= 2) {
    const slope = (marks[marks.length - 1] - marks[0]) / (marks.length - 1);
    if (slope <= -4) { add += 20; why.push(`marks falling about ${Math.round(Math.abs(slope))} points per test`); }
  }
  if (s.days_since_login >= Math.ceil(r.login_days * 0.6) && s.days_since_login < r.login_days) { add += 15; why.push('logins are drifting'); }
  if (missed > 0 && missed < r.missed) { add += 15; why.push('a submission has been missed'); }
  const fscore = Math.min(100, score + add);
  const lvl = level(score);
  const flevel = level(fscore);
  const note = rank(flevel) > rank(lvl) ? `Likely to reach ${flevel} concern within about 2 weeks: ${why.join(', ')}` : '';
  return { score, level: lvl, reasons, fscore, flevel, forecast_note: note };
}
