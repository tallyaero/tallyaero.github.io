import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconArrowRight } from '@tabler/icons-react';

/* ═══════════════════════════════════════════════════════════════
   HOME PAGE — The logbook wakes up
   ═══════════════════════════════════════════════════════════════ */

export function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'TallyAero — If It\'s Not in the Logbook, It Didn\'t Happen';
  }, []);

  return (
    <div className="min-h-screen bg-aero-dark-900 text-muted overflow-x-hidden scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-aero-dark-900/70 backdrop-blur-md border-b border-edge/20">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <img src="/tally-aero-favicon.png" alt="TallyAero" className="h-6 w-6 object-contain" />
            <span className="text-sm font-semibold text-body">TallyAero</span>
          </div>
          <button
            onClick={() => navigate('/dashtwo')}
            className="px-4 py-1.5 text-xs font-medium text-aero-text-light bg-aero-blue hover:bg-aero-blue-light rounded-lg transition-colors"
          >
            Try DashTwo
          </button>
        </div>
      </header>

      {/* ═══ ACT 1: The hook ═══ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <FadeIn delay={300}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-aero-text-light text-center leading-[1.1] tracking-tight">
            If it's not in the logbook,<br />it didn't happen.
          </h1>
        </FadeIn>
        <FadeIn delay={1400}>
          <p className="mt-6 text-lg sm:text-xl text-muted text-center max-w-lg">
            Every pilot knows this. But what if the logbook knew it too?
          </p>
        </FadeIn>
      </section>

      {/* ═══ ACT 2: The dead logbook ═══ */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="scroll-reveal">
            <p className="text-center text-muted text-sm uppercase tracking-[0.2em] mb-8">
              Every pilot knows this view
            </p>
          </div>

          <div className="scroll-reveal">
            <LogbookTable />
          </div>

          <div className="scroll-reveal">
            <p className="text-center text-muted text-sm mt-8">
              Rows. Numbers. Proof it happened. Nothing more.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ ACT 3+4: The turn — logbook wakes up ═══ */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="scroll-reveal">
            <div className="text-center mb-10">
              <p className="text-xl sm:text-2xl font-semibold text-aero-text-light leading-snug">
                What if the rows could think?
              </p>
            </div>
          </div>
          <div className="scroll-reveal">
            <LogbookAlive />
          </div>
        </div>
      </section>

      {/* ═══ ACT 5: The platform — what the logbook does on its own ═══ */}
      <section className="py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-32">

          {/* Cross-referencing intelligence — full width */}
          <div className="scroll-reveal">
            <div className="text-center mb-10">
              <p className="text-xl sm:text-2xl font-semibold text-aero-text-light leading-snug">
                Your logbook cross-references everything.
              </p>
              <p className="text-sm text-body mt-2">Your entries. The regs. The calendar. The weather. The aircraft. Your flight school. All at once.</p>
            </div>
            <CrossRefViz />
          </div>

          {/* Insights */}
          <div className="scroll-reveal">
            <div className="flex flex-col md:flex-row-reverse items-center gap-10 max-w-4xl mx-auto">
              <InsightsViz />
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl font-semibold text-aero-text-light leading-snug">
                  It reads between the entries.
                </p>
                <p className="text-sm text-body mt-2">Currency gaps, stale maneuvers, lopsided experience. Your logbook connects what you've logged to what you're missing.</p>
              </div>
            </div>
          </div>


        </div>
      </section>

      {/* ═══ ACT 6: "Give your logbook a voice" — the bridge ═══ */}
      <section className="min-h-[60vh] flex items-center justify-center px-6">
        <div className="scroll-reveal">
          <div className="text-center">
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-aero-text-light tracking-tight">
              Give your logbook a voice.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ ACT 7: DashTwo conversation — AI enters ═══ */}
      <section className="py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="scroll-reveal">
            <div className="text-center mb-10">
              <p className="text-xl sm:text-2xl font-semibold text-aero-text-light leading-snug">
                And when you have a question, just ask.
              </p>
              <p className="text-sm text-body mt-2">DashTwo reads what your logbook already knows — and answers in plain English.</p>
            </div>
          </div>
          <div className="scroll-reveal">
            <div className="flex flex-col md:flex-row items-start gap-10 max-w-4xl mx-auto">
              <DashTwoConversation />
              <div className="flex-1 min-w-0 pt-4">
                <p className="text-lg font-semibold text-aero-text-light leading-snug">
                  It doesn't guess.
                </p>
                <p className="text-sm text-body mt-2">Your logbook tracked the currency. The platform found the conflict. DashTwo just tells you — with the reg citation attached.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ACT 8: DashTwo — live now ═══ */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="scroll-reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live now
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-aero-text-light mb-4">
              Meet DashTwo — your AI-powered wingman.
            </h2>
            <p className="text-body leading-relaxed max-w-md mx-auto mb-3">
              515K+ FAA documents. Source citations on every answer.
              Your logbook, the regs, your aircraft — connected.
              The AI wingman that makes every row count.
            </p>
            <p className="text-muted text-xs mb-8">Free. No account required.</p>
            <button
              onClick={() => navigate('/dashtwo')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-aero-text-light bg-aero-blue hover:bg-aero-blue-light rounded-xl transition-colors shadow-lg shadow-aero-blue/20"
            >
              Try DashTwo
              <IconArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* ═══ Platform — whisper ═══ */}
      <section className="border-t border-edge/20 py-20">
        <div className="max-w-xl mx-auto px-6">
          <div className="scroll-reveal">
            <p className="text-center text-muted text-sm uppercase tracking-[0.2em] mb-10">
              The logbook is just the beginning
            </p>
          </div>
          <div className="space-y-0">
            {[
              ['Logbook', 'Understands what you logged. Not fields — meaning.'],
              ['Currency', 'Knows what\'s expiring. Does the math.'],
              ['Training', 'Deliberate practice on the ground.'],
              ['Skill Tracking', 'What\'s improving. What\'s decaying.'],
              ['Career', 'Your logbook against every requirement.'],
              ['Checkride', 'Understanding the DPE can\'t crack.'],
              ['Aircraft', 'Your airplane. Your numbers. Not generic.'],
              ['Flight School', 'Same platform. Different view.'],
            ].map(([label, text], i) => (
              <div key={label} className="scroll-reveal">
                <div className={`flex items-baseline gap-5 py-3 ${i > 0 ? 'border-t border-edge/20' : ''}`}>
                  <span className="text-[11px] font-semibold text-aero-blue-light uppercase tracking-wider w-28 shrink-0 text-right">
                    {label}
                  </span>
                  <p className="text-sm text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="scroll-reveal">
            <p className="text-center text-muted text-xs mt-8">
              Platform in development. DashTwo is live.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="min-h-[50vh] flex items-center justify-center px-6">
        <div className="scroll-reveal">
          <div className="text-center">
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-aero-text-light mb-3 tracking-tight">
              It happened. You logged it.
            </p>
            <p className="text-xl text-muted mb-10">
              Now it knows.
            </p>
            <button
              onClick={() => navigate('/dashtwo')}
              className="px-8 py-3.5 text-base font-semibold text-aero-text-light bg-aero-blue hover:bg-aero-blue-light rounded-xl transition-colors shadow-lg shadow-aero-blue/20"
            >
              Try DashTwo — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-edge/20 py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-70">
            <img src="/tally-aero-favicon.png" alt="TallyAero" className="h-4 w-4 object-contain" />
            <span className="text-xs font-semibold text-muted">TallyAero</span>
          </div>
          <div className="text-[11px] text-muted">
            If it's not in the logbook, it didn't happen.
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MOCK LOGBOOK — Dead rows
   ═══════════════════════════════════════════════════════════════ */

const LOGBOOK_DATA = [
  { date: '02/14/26', aircraft: 'C172S', ident: 'N737SP', from: 'KPAO', to: 'KMOD', pic: '1.8', xc: '1.8', day: '1.8', landings: '2', approaches: '', remarks: 'XC dual — diversion practice' },
  { date: '02/09/26', aircraft: 'C172S', ident: 'N737SP', from: 'KPAO', to: 'KPAO', pic: '1.2', xc: '', day: '1.2', landings: '6', approaches: '', remarks: 'Pattern work, gusty xwind 12G18' },
  { date: '02/01/26', aircraft: 'C172S', ident: 'N737SP', from: 'KPAO', to: 'KSCK', pic: '2.1', xc: '2.1', day: '0.8', landings: '3', approaches: '2', remarks: 'Night XC — VOR-A, ILS 29R' },
  { date: '01/25/26', aircraft: 'PA28',  ident: 'N8425F', from: 'KRHV', to: 'KRHV', pic: '1.0', xc: '', day: '1.0', landings: '4', approaches: '', remarks: 'Steep turns, slow flight, stalls' },
  { date: '01/18/26', aircraft: 'C172S', ident: 'N737SP', from: 'KPAO', to: 'KWVI', pic: '1.5', xc: '1.5', day: '1.5', landings: '2', approaches: '1', remarks: 'XC — RNAV 20, soft field' },
  { date: '01/11/26', aircraft: 'C172S', ident: 'N737SP', from: 'KPAO', to: 'KPAO', pic: '0.9', xc: '', day: '0.9', landings: '5', approaches: '', remarks: 'Short field practice' },
];

function LogbookTable() {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0d1220]">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-white/[0.08] text-muted uppercase tracking-wider">
            <th className="text-left px-3 py-2.5 font-medium">Date</th>
            <th className="text-left px-3 py-2.5 font-medium">Type</th>
            <th className="text-left px-3 py-2.5 font-medium">Ident</th>
            <th className="text-left px-3 py-2.5 font-medium">From</th>
            <th className="text-left px-3 py-2.5 font-medium">To</th>
            <th className="text-right px-3 py-2.5 font-medium">PIC</th>
            <th className="text-right px-3 py-2.5 font-medium">XC</th>
            <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Ldg</th>
            <th className="text-right px-3 py-2.5 font-medium hidden md:table-cell">Appr</th>
            <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {LOGBOOK_DATA.map((row, i) => (
            <tr key={i} className="border-b border-white/[0.04] text-body hover:bg-white/[0.02] transition-colors">
              <td className="px-3 py-2">{row.date}</td>
              <td className="px-3 py-2">{row.aircraft}</td>
              <td className="px-3 py-2 text-muted">{row.ident}</td>
              <td className="px-3 py-2">{row.from}</td>
              <td className="px-3 py-2">{row.to}</td>
              <td className="px-3 py-2 text-right">{row.pic}</td>
              <td className="px-3 py-2 text-right text-muted">{row.xc || '—'}</td>
              <td className="px-3 py-2 text-right text-muted hidden sm:table-cell">{row.landings}</td>
              <td className="px-3 py-2 text-right text-muted hidden md:table-cell">{row.approaches || '—'}</td>
              <td className="px-3 py-2 text-muted hidden lg:table-cell truncate max-w-[200px]">{row.remarks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LOGBOOK ALIVE — Same rows, annotations appearing
   ═══════════════════════════════════════════════════════════════ */

function LogbookAlive() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0); // 0=dead, 1=currency, 2=trend, 3=regs

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase(1);
          setTimeout(() => setPhase(2), 250);
          setTimeout(() => setPhase(3), 500);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0d1220]">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.08] text-muted uppercase tracking-wider">
              <th className="text-left px-3 py-2.5 font-medium">Date</th>
              <th className="text-left px-3 py-2.5 font-medium">Type</th>
              <th className="text-left px-3 py-2.5 font-medium">Ident</th>
              <th className="text-left px-3 py-2.5 font-medium">Route</th>
              <th className="text-right px-3 py-2.5 font-medium">PIC</th>
              <th className="text-right px-3 py-2.5 font-medium hidden sm:table-cell">Ldg</th>
              <th className="text-right px-3 py-2.5 font-medium hidden md:table-cell">Appr</th>
              <th className="text-left px-3 py-2.5 font-medium hidden lg:table-cell">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {LOGBOOK_DATA.map((row, i) => (
              <tr key={i} className="border-b border-white/[0.04] relative group">
                <td className={`px-3 py-2.5 transition-colors duration-700 ${
                  phase >= 1 && i === 0 ? 'text-body' : 'text-muted'
                }`}>{row.date}</td>
                <td className="px-3 py-2.5 text-body">{row.aircraft}</td>
                <td className={`px-3 py-2.5 transition-colors duration-700 ${
                  phase >= 3 ? 'text-blue-400' : 'text-muted'
                }`}>{row.ident}</td>
                <td className="px-3 py-2.5 text-body">{row.from}→{row.to}</td>
                <td className={`px-3 py-2.5 text-right transition-colors duration-700 ${
                  phase >= 2 ? 'text-body' : 'text-muted'
                }`}>{row.pic}</td>
                <td className="px-3 py-2.5 text-right text-muted hidden sm:table-cell">{row.landings}</td>
                <td className={`px-3 py-2.5 text-right hidden md:table-cell transition-colors duration-700 ${
                  phase >= 1 && row.approaches ? 'text-amber-400' : 'text-muted'
                }`}>{row.approaches || '—'}</td>
                <td className="px-3 py-2.5 text-muted hidden lg:table-cell truncate max-w-[200px]">{row.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Annotation: Currency warning */}
      <div className={`absolute -right-2 top-[52px] sm:right-2 transition-all duration-700 z-10 ${
        phase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        <div className="bg-[#1a1408] border border-amber-500/30 rounded-lg px-3 py-1.5 text-xs font-mono whitespace-nowrap shadow-lg shadow-black/40">
          <span className="text-amber-400">▲</span>
          <span className="text-amber-300 ml-1.5">Night currency: 12 days</span>
        </div>
      </div>

      {/* Annotation: Approach count */}
      <div className={`absolute -right-2 top-[130px] sm:right-2 transition-all duration-700 delay-300 z-10 ${
        phase >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}>
        <div className="bg-[#1a0a0a] border border-red-500/30 rounded-lg px-3 py-1.5 text-xs font-mono whitespace-nowrap shadow-lg shadow-black/40">
          <span className="text-red-400">●</span>
          <span className="text-red-300 ml-1.5">IFR: 3 appr short of 61.57(c)</span>
        </div>
      </div>

      {/* Annotation: Recency / consistency */}
      <div className={`absolute -left-2 bottom-[60px] sm:left-2 transition-all duration-700 z-10 ${
        phase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}>
        <div className="bg-[#0a1220] border border-blue-500/30 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2 whitespace-nowrap shadow-lg shadow-black/40">
          <MiniTrend active={phase >= 2} />
          <span className="text-blue-300">4 flights in 28 days — most active since Oct</span>
        </div>
      </div>

      {/* Annotation: XC distance × reg cross-reference */}
      <div className={`absolute -left-2 top-[90px] sm:left-2 transition-all duration-700 z-10 ${
        phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}>
        <div className="bg-[#120a1a] border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs font-mono whitespace-nowrap shadow-lg shadow-black/40">
          <span className="text-purple-400">§</span>
          <span className="text-purple-300 ml-1.5">KPAO→KSCK: 58 nm — Cross Country, 14 CFR 61.1(b)(ii)</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   CROSS-REF VIZ — Visual cards for each data source
   ═══════════════════════════════════════════════════════════════ */

function CrossRefViz() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPhase(1);
          setTimeout(() => setPhase(2), 120);
          setTimeout(() => setPhase(3), 240);
          setTimeout(() => setPhase(4), 360);
          setTimeout(() => setPhase(5), 480);
          setTimeout(() => setPhase(6), 600);
          setTimeout(() => setPhase(7), 1000);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-3xl mx-auto">
      {/* Source cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

        {/* 1. Logbook Entry */}
        <SourceCard
          phase={phase}
          showAt={1}
          label="Your Logbook"
          borderColor="border-blue-500/30"
          bgColor="bg-[#0c1425]"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-semibold">Feb 1</span>
              <span className="text-faint">N737SP</span>
            </div>
            <div className="text-muted">KPAO → KSCK</div>
            <div className="flex gap-3">
              <span className="text-muted">2.1 PIC</span>
              <span className="text-body font-medium">3 night ldg</span>
            </div>
            <div className="text-muted text-[11px]">Full stop, night XC</div>
          </div>
        </SourceCard>

        {/* 2. Regulation */}
        <SourceCard
          phase={phase}
          showAt={2}
          label="14 CFR"
          borderColor="border-purple-500/30"
          bgColor="bg-[#130c20]"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-purple-400 font-semibold">§ 61.57(b)</span>
            </div>
            <div className="text-muted leading-snug">
              3 takeoffs and landings to a full stop within preceding <span className="text-purple-300 font-medium">90 days</span> to carry passengers at night.
            </div>
          </div>
        </SourceCard>

        {/* 3. Calendar */}
        <SourceCard
          phase={phase}
          showAt={3}
          label="Calendar"
          borderColor="border-amber-500/30"
          bgColor="bg-[#181208]"
        >
          <div className="space-y-1.5">
            <div className="text-muted">90-day window</div>
            <div className="flex items-center gap-2">
              <span className="text-muted">Feb 1</span>
              <span className="text-faint">→</span>
              <span className="text-amber-400 font-semibold">May 2</span>
            </div>
            <div className="mt-1 text-muted">
              Next night flight booked:
            </div>
            <div className="text-body font-medium">May 8</div>
          </div>
        </SourceCard>

        {/* 4. Weather */}
        <SourceCard
          phase={phase}
          showAt={4}
          label="Weather"
          borderColor="border-cyan-500/30"
          bgColor="bg-[#081418]"
        >
          <div className="space-y-1">
            <div className="grid grid-cols-4 gap-1 text-center">
              {[
                { day: 'May 5', icon: '☀', color: 'text-yellow-400/70', wx: 'VFR' },
                { day: 'May 6', icon: '⛈', color: 'text-red-400/80', wx: 'IFR' },
                { day: 'May 7', icon: '🌧', color: 'text-red-400/80', wx: 'IFR' },
                { day: 'May 8', icon: '☁', color: 'text-amber-400/80', wx: 'MVFR' },
              ].map(d => (
                <div key={d.day} className="space-y-0.5">
                  <div className="text-[10px] text-muted">{d.day.split(' ')[1]}</div>
                  <div className="text-sm">{d.icon}</div>
                  <div className={`text-[10px] font-mono font-medium ${d.color}`}>{d.wx}</div>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-muted pt-1">Forecast: IFR May 6–7</div>
          </div>
        </SourceCard>

        {/* 5. Aircraft */}
        <SourceCard
          phase={phase}
          showAt={5}
          label="Aircraft"
          borderColor="border-green-500/30"
          bgColor="bg-[#081408]"
        >
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-green-400 font-semibold">N737SP</span>
              <span className="text-faint">C172S</span>
            </div>
            <div className="text-muted text-[11px]">
              Squawk: position lights INOP
            </div>
            <div className="text-red-400 font-medium text-[11px]">
              No night ops
            </div>
            <div className="text-muted text-[11px]">
              100-hr due in <span className="text-amber-400 font-medium">2.3 hrs</span>
            </div>
          </div>
        </SourceCard>

        {/* 6. Flight School */}
        <SourceCard
          phase={phase}
          showAt={6}
          label="Flight School"
          borderColor="border-white/40"
          bgColor="bg-aero-orange"
          labelColor="text-orange-950"
          href="/flight-school"
        >
          <div className="space-y-2">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-green-600 ring-1 ring-white/30 shrink-0" />
                <span className="text-orange-950 font-semibold">N8425F</span>
              </div>
              <div className="text-orange-950/80 text-[11px] ml-3.5">May 8 — Student training</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-red-600 ring-1 ring-white/30 shrink-0" />
                <span className="text-orange-950 font-semibold">N737SP</span>
              </div>
              <div className="text-orange-950/80 text-[11px] ml-3.5">Down — pos lights (night)</div>
            </div>
          </div>
          <span className="block mt-2 text-[11px] text-white font-semibold">
            Click to learn more →
          </span>
        </SourceCard>
      </div>

      {/* Conclusion */}
      <div
        className="mt-6 transition-all duration-700"
        style={{ opacity: phase >= 7 ? 1 : 0, transform: phase >= 7 ? 'translateY(0)' : 'translateY(12px)' }}
      >
        <div className="bg-[#1a0a0a] border border-red-500/25 rounded-xl px-5 py-4 max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg mt-0.5">⚠</span>
            <div className="space-y-1">
              <div className="text-red-400 font-semibold text-sm">4 conflicts detected</div>
              <ul className="text-red-200 text-sm leading-relaxed space-y-0.5 list-none">
                <li>Night currency lapses <span className="text-red-300 font-medium">May 2</span></li>
                <li>N737SP position lights INOP — <span className="text-red-300 font-medium">no night ops</span></li>
                <li>Forecast IFR <span className="text-red-300 font-medium">May 6–7</span></li>
                <li>Student booked N737SP on <span className="text-red-300 font-medium">May 8</span></li>
              </ul>
              <div className="text-amber-400/90 text-sm font-medium pt-2">
                → Fix the squawk, fly night before May 2, or reschedule.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reusable animated source card */
function SourceCard({ phase, showAt, label, borderColor, bgColor, labelColor, href, children }: {
  phase: number;
  showAt: number;
  label: string;
  borderColor: string;
  bgColor: string;
  labelColor?: string;
  href?: string;
  children: ReactNode;
}) {
  const content = (
    <>
      <div className={`text-[11px] ${labelColor || 'text-muted'} uppercase tracking-widest font-medium mb-2`}>{label}</div>
      <div className="text-xs font-mono">{children}</div>
    </>
  );

  const classes = `${bgColor} border ${borderColor} rounded-lg p-3 transition-all duration-600 ${href ? 'cursor-pointer hover:brightness-110' : ''}`;
  const style = {
    opacity: phase >= showAt ? 1 : 0,
    transform: phase >= showAt ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
    transitionDelay: `${(showAt - 1) * 50}ms`,
  };

  if (href) {
    return (
      <Link to={href} className={`block ${classes}`} style={style}>
        {content}
      </Link>
    );
  }

  return (
    <div className={classes} style={style}>
      {content}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INSIGHTS VIZ — stacked insight nudges from a smart logbook
   ═══════════════════════════════════════════════════════════════ */

function InsightsViz() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.unobserve(el); } },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const insights = [
    { color: '#f59e0b', label: 'Currency', text: 'Night passenger currency expires in 12 days', icon: '○' },
    { color: '#0d59f2', label: 'Proficiency', text: 'No short-field landings in 5 months', icon: '○' },
    { color: '#8b5cf6', label: 'Pattern', text: '14 flights, same airport — no XC in 6 weeks', icon: '○' },
    { color: '#10b981', label: 'Progress', text: '1.8 hrs until CPL cross-country requirement', icon: '○' },
  ];

  return (
    <div ref={ref} className="w-full md:w-80 shrink-0 bg-[#0d1220] border border-white/[0.08] rounded-xl p-4 space-y-2">
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-[11px] text-muted uppercase tracking-widest">Logbook Insights</span>
        <span className={`text-[10px] font-mono transition-all duration-700 ${active ? 'text-body' : 'text-faint'}`}>
          4 items need attention
        </span>
      </div>
      {insights.map((item, i) => (
        <div
          key={i}
          className="flex items-start gap-3 rounded-lg px-3 py-2.5 border transition-all duration-500"
          style={{
            borderColor: active ? `${item.color}33` : 'rgba(255,255,255,0.04)',
            background: active ? `${item.color}08` : 'transparent',
            opacity: active ? 1 : 0,
            transform: active ? 'translateY(0)' : 'translateY(8px)',
            transitionDelay: `${i * 200}ms`,
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-all duration-500"
            style={{
              backgroundColor: item.color,
              opacity: active ? 1 : 0,
              transitionDelay: `${i * 200 + 300}ms`,
            }}
          />
          <div className="min-w-0">
            <span
              className="text-[10px] uppercase tracking-widest font-medium block transition-all duration-500"
              style={{
                color: item.color,
                opacity: active ? 0.7 : 0,
                transitionDelay: `${i * 200 + 100}ms`,
              }}
            >
              {item.label}
            </span>
            <span className="text-xs text-aero-text-light leading-snug">{item.text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MINI TREND — tiny sparkline for annotation
   ═══════════════════════════════════════════════════════════════ */

function MiniTrend({ active }: { active: boolean }) {
  return (
    <svg width="32" height="12" viewBox="0 0 32 12">
      <polyline
        points="2,10 8,8 14,9 20,6 26,4 30,2"
        fill="none"
        stroke="#0d59f2"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={40}
        strokeDashoffset={active ? 0 : 40}
        style={{ transition: 'stroke-dashoffset 0.3s ease-out', opacity: 0.7 }}
      />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHTWO CONVERSATION — contextual, not generic
   ═══════════════════════════════════════════════════════════════ */

function DashTwoConversation() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setPhase(1), 300);
          setTimeout(() => setPhase(2), 1000);
          observer.unobserve(el);
        }
      },
      { threshold: 0.7 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full md:w-80 shrink-0 bg-[#0d1220] border border-white/[0.08] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <img src="/dashtwo-icon.png" alt="DashTwo" className="h-4 w-4 object-contain" />
        <span className="text-xs text-muted font-medium">DashTwo</span>
      </div>

      {/* User message */}
      <div className={`transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
        <div className="bg-aero-blue/15 border border-aero-blue/15 rounded-lg px-3 py-2 text-sm text-body ml-8">
          Am I current to fly at night with passengers?
        </div>
      </div>

      {/* DashTwo response — contextual */}
      <div className={`transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-muted leading-relaxed space-y-2">
          <p>
            Based on your logbook, your last 3 night landings to a full stop
            in <span className="text-blue-400">N737SP</span> were on <span className="text-aero-text-light">Feb 1</span>.
          </p>
          <p>
            Under <span className="text-purple-400">14 CFR 61.57(b)</span>,
            you need 3 takeoffs and landings to a full stop within the
            preceding 90 days.
          </p>
          <p>
            <span className="text-amber-400">You have 12 days remaining.</span> After
            May 2, you'll need to fly at least 3 night full-stops before carrying passengers.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-[11px] text-faint">Sources:</span>
            <span className="text-[11px] text-blue-400/80">§61.57(b)</span>
            <span className="text-[11px] text-blue-400/80">Your logbook</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATION PRIMITIVES
   ═══════════════════════════════════════════════════════════════ */

function FadeIn({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : 'translate3d(0,12px,0)',
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: visible ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}

