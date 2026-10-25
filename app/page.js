import Link from 'next/link';

const I = {
  upload: 'M12 16V4m0 0l-4 4m4-4l4 4M4 20h16',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  send: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
  chat: 'M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z',
  book: 'M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5zm2 14h13',
  lock: 'M6 11V8a6 6 0 1112 0v3M5 11h14v10H5z',
  heart: 'M12 21s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6-8 11-8 11z',
  link: 'M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1',
  spark: 'M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z',
};
const Icon = ({ n }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={I[n]} /></svg>
);

const steps = [
  ['upload', 'Connect the course data', 'Staff upload a spreadsheet from the learning portal. Students are scored straight away.'],
  ['chart', 'See who needs a call today', 'A ranked list with plain reasons, like no login for 12 days or three missed submissions, plus a forecast of who is heading into trouble.'],
  ['send', 'Reach out with care', 'Gentle messages go out automatically for medium concern. High concern waits for a person to approve.'],
  ['chat', 'The student chooses', 'A private link lets them book a wellness time and say what is in the way, or skip it.'],
];
const features = [
  ['chart', 'Rules you can read', 'No black box. Staff see and adjust what counts as a warning sign.'],
  ['spark', 'Forecast', 'Falling marks and drifting logins lift a student’s projected concern before a crisis.'],
  ['send', 'AI-drafted, human-approved', 'AI helps write warm messages. It never decides who is at risk.'],
  ['book', 'Proof of follow-up', 'An intervention log records who reached out and what happened.'],
  ['lock', 'Privacy first', 'Wellness replies are visible only to wellness staff. Concession reasons are never collected.'],
  ['link', 'Built to connect', 'Next: automatic sync with learning portals and marks systems.'],
];

export default function Landing() {
  return (
    <div className="lp">
      <header className="lp-nav">
        <a href="#top" className="lp-brand">Cala<b>bash</b></a>
        <nav>
          <a href="#how">How it works</a>
          <a href="#story">Our story</a>
          <a href="#privacy">Privacy</a>
          <Link href="/staff" className="lp-btn sm">Staff sign in</Link>
        </nav>
      </header>

      <section id="top" className="lp-hero">
        <div className="lp-hero-in">
          <p className="lp-eyebrow">Student success and wellbeing</p>
          <h1>Catch it early.<br /><span>Care for every student.</span></h1>
          <p className="lp-lead">Calabash spots the warning signs weeks before a student fails, then makes sure a real person reaches out, with privacy built in.</p>
          <div className="lp-cta">
            <Link href="/staff" className="lp-btn">Try the live demo</Link>
            <a href="#how" className="lp-btn ghost">See how it works</a>
          </div>
        </div>
        <div className="lp-card" aria-hidden="true">
          <div className="lp-card-row"><b>Lwazi M.</b><span className="pill hi">High</span></div>
          <div className="lp-card-sub">12 days without login · 4 missed submissions</div>
          <div className="lp-card-row" style={{ marginTop: 18 }}><b>Ayesha R.</b><span className="pill md">Medium</span></div>
          <div className="lp-card-sub">Marks falling about 5 points per test</div>
          <div className="lp-card-row" style={{ marginTop: 18 }}><b>Thabo N.</b><span className="pill lo">Low</span></div>
          <div className="lp-card-sub">On track</div>
          <div className="lp-card-note">Sample data</div>
        </div>
      </section>

      <section className="lp-stats">
        <div><b>29%</b><p>of the 2012 cohort finished a three-year degree in minimum time (Council on Higher Education)</p></div>
        <div><b>32.1%</b><p>of black first-years left in their first year, reported to a 2017 commission (Universities South Africa)</p></div>
        <div><b>+8%</b><p>higher marks for flagged students who joined tutorials (University of Pretoria study)</p></div>
      </section>

      <section id="story" className="lp-sec">
        <div className="lp-two">
          <div>
            <p className="lp-eyebrow dark">Our story</p>
            <h2>Students fail quietly. We make sure someone notices.</h2>
          </div>
          <div className="lp-text">
            <p>The warning signs are always there: assignments not handed in, a portal nobody opens, marks sliding, classes missed. But they sit in different systems, and support teams are stretched. Help often arrives after the student has already failed.</p>
            <p>Calabash is built by Celokuhle, a medical student at the University of Cape Town, for the FNB App of the Year Hackathon 2026. We chose the name because a calabash is a gourd used across Africa to carry and share water. It stands for holding something precious and sharing care.</p>
          </div>
        </div>
      </section>

      <section id="how" className="lp-sec alt">
        <p className="lp-eyebrow dark">How it works</p>
        <h2 className="center">From warning sign to conversation</h2>
        <div className="lp-steps">
          {steps.map(([ic, t, d], i) => (
            <div className="lp-step" key={t}>
              <div className="lp-ic"><Icon n={ic} /></div>
              <p className="lp-num">Step {i + 1}</p>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lp-sec">
        <p className="lp-eyebrow dark">What makes it different</p>
        <h2 className="center">Intelligence you can explain</h2>
        <div className="lp-grid">
          {features.map(([ic, t, d]) => (
            <div className="lp-feat" key={t}>
              <div className="lp-ic sm"><Icon n={ic} /></div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="privacy" className="lp-dark">
        <div className="lp-two">
          <div>
            <p className="lp-eyebrow">Privacy and trust</p>
            <h2>Support, not surveillance.</h2>
            <p className="lp-lead">Students are told what is looked at, support is always optional, and wellbeing information never leaves the university.</p>
          </div>
          <ul className="lp-list">
            <li><Icon n="lock" /> Wellness replies are visible only to wellness staff</li>
            <li><Icon n="heart" /> Messages are warm, optional and never judgemental</li>
            <li><Icon n="book" /> Only counts are collected for concessions, never the reasons</li>
            <li><Icon n="send" /> A person approves every high-concern message</li>
          </ul>
        </div>
      </section>

      <section className="lp-sec center-block">
        <h2 className="center">See Calabash in action</h2>
        <p className="lp-text center">Sign in with the demo account, load the sample data and run the check.</p>
        <div className="lp-cta mid"><Link href="/staff" className="lp-btn">Open the staff dashboard</Link></div>
      </section>

      <footer className="lp-foot">
        <span className="lp-brand">Cala<b>bash</b></span>
        <span>FNB App of the Year Hackathon 2026 · Access to higher education · Demo uses sample data</span>
      </footer>
    </div>
  );
}
