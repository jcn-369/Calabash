export function template(name, link) {
  return {
    subject: 'Checking in on how your semester is going',
    body:
`Hi ${name},

We noticed you may have had a tough few weeks in your course. That happens to many students, and support is available. You do not have to share anything you are not comfortable with.

You can book a time with Student Wellness and fill in a short optional form about what would help, using this private link:
${link}

If you need urgent help, please contact the university's 24-hour crisis line.

Student Support`,
  };
}

// AI only drafts the wording. It never decides who is at risk, and staff review high-concern messages first.
export async function draft(name, level, link) {
  const t = template(name, link);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return t;
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5',
        max_tokens: 400,
        system:
          'You write short, warm, non-judgemental emails from a university student support team to a student. Never mention monitoring data, risk levels, mental health or diagnoses. Do not promise outcomes. Plain text, under 110 words. Include the exact private link provided, say that sharing anything is optional, and mention that urgent help is available from the university crisis line. Sign off as Student Support.',
        messages: [{ role: 'user', content: `Student first name: ${name}. Tone: ${level === 'High' ? 'caring and a little more personal' : 'gentle and light'}. Private link: ${link}` }],
      }),
    });
    const d = await r.json();
    const text = d.content && d.content[0] && d.content[0].text;
    if (text && text.includes(link)) return { subject: t.subject, body: text };
  } catch (e) {}
  return t;
}

export async function sendEmail(to, subject, text) {
  const key = process.env.RESEND_API_KEY;
  const redirect = process.env.DEMO_REDIRECT_EMAIL; // in the demo, every email goes to this one address
  const real = redirect || to;
  if (!key) return { ok: false, to: real, info: 'No email key set: saved in the outbox only' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Calabash <onboarding@resend.dev>',
        to: [real],
        subject: redirect ? `[Demo for ${to}] ${subject}` : subject,
        text,
      }),
    });
    return { ok: r.ok, to: real, info: r.ok ? 'Email sent' : await r.text() };
  } catch (e) {
    return { ok: false, to: real, info: String(e) };
  }
}
