import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-[#0a0e17] text-[#94a3b8] overflow-x-hidden scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#0a0e17]/70 backdrop-blur-md border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <img src="/tally-aero-favicon.png" alt="TallyAero" className="h-6 w-6 object-contain" />
            <span className="text-sm font-semibold text-white/80">TallyAero</span>
          </div>
          <button
            onClick={() => navigate('/dashtwo')}
            className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            Try DashTwo
          </button>
        </div>
      </header>

      {/* ═══ ACT 1: The hook ═══ */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 relative">
        <FadeIn delay={300}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white text-center leading-[1.1] tracking-tight">
            If it's not in the logbook,<br />it didn't happen.
          </h1>
        </FadeIn>
        <FadeIn delay={1400}>
          <p className="mt-6 text-lg sm:text-xl text-white/40 text-center max-w-lg">
            Every pilot knows this. But what if the logbook knew it too?
          </p>
        </FadeIn>
        <FadeIn delay={2400}>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="w-5 h-8 rounded-full border-2 border-white/15 flex justify-center pt-1.5">
              <div className="w-1 h-2 rounded-full bg-white/25 animate-bounce" />
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══ ACT 2: The dead logbook ═══ */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <p className="text-center text-white/30 text-xs uppercase tracking-[0.2em] mb-8">
              Every pilot knows this view
            </p>
          </ScrollReveal>

          <ScrollReveal>
            <LogbookTable />
          </ScrollReveal>

          <ScrollReveal>
            <p className="text-center text-white/40 text-sm mt-8">
              Rows. Numbers. Proof it happened. Nothing more.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ ACT 3: The turn ═══ */}
      <section className="min-h-[60vh] flex items-center justify-center px-6">
        <ScrollReveal>
          <div className="text-center">
            <div className="w-12 h-px bg-blue-500/30 mx-auto mb-8" />
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
              What if the rows could think?
            </p>
            <div className="w-12 h-px bg-blue-500/30 mx-auto mt-8" />
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ ACT 4: The logbook wakes up ═══ */}
      <section className="py-20 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <LogbookAlive />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ ACT 5: The insights — visual, not verbal ═══ */}
      <section className="py-20 sm:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-32">

          {/* Cross-referencing intelligence — full width */}
          <ScrollReveal>
            <div className="text-center mb-10">
              <p className="text-xl sm:text-2xl font-semibold text-white leading-snug">
                It cross-references everything.
              </p>
              <p className="text-sm text-white/50 mt-2">Your entries. The regs. The calendar. The weather. The aircraft. All at once.</p>
            </div>
            <CrossRefViz />
          </ScrollReveal>

          {/* Trend */}
          <ScrollReveal>
            <div className="flex flex-col md:flex-row-reverse items-center gap-10 max-w-4xl mx-auto">
              <TrendViz />
              <div className="flex-1 min-w-0">
                <p className="text-xl sm:text-2xl font-semibold text-white leading-snug">
                  It sees the trend, not just the hours.
                </p>
                <p className="text-sm text-white/50 mt-2">Improving, plateauing, or decaying.</p>
              </div>
            </div>
          </ScrollReveal>

          {/* DashTwo conversation */}
          <ScrollReveal>
            <div className="flex flex-col md:flex-row items-start gap-10 max-w-4xl mx-auto">
              <DashTwoConversation />
              <div className="flex-1 min-w-0 pt-4">
                <p className="text-xl sm:text-2xl font-semibold text-white leading-snug">
                  When you ask, it doesn't guess.
                </p>
                <p className="text-sm text-white/50 mt-2">It knows your logbook. It knows the regs. It gives you <em>your</em> answer.</p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ═══ ACT 6: "We gave your logbook a voice" ═══ */}
      <section className="min-h-[60vh] flex items-center justify-center px-6">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight">
              Give your logbook a voice.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* ═══ ACT 7: DashTwo — live now ═══ */}
      <section className="py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-semibold mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live now
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Meet DashTwo — your AI-powered wingman.
            </h2>
            <p className="text-white/55 leading-relaxed max-w-md mx-auto mb-3">
              515K+ FAA documents. Source citations on every answer.
              Your logbook, the regs, your aircraft — connected.
              The AI wingman that makes every row count.
            </p>
            <p className="text-white/35 text-xs mb-8">Free. No account required.</p>
            <button
              onClick={() => navigate('/dashtwo')}
              className="inline-flex items-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Try DashTwo
              <IconArrowRight size={18} />
            </button>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Platform — whisper ═══ */}
      <section className="border-t border-white/[0.06] py-20">
        <div className="max-w-xl mx-auto px-6">
          <ScrollReveal>
            <p className="text-center text-white/25 text-xs uppercase tracking-[0.2em] mb-10">
              The logbook is just the beginning
            </p>
          </ScrollReveal>
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
              <ScrollReveal key={label}>
                <div className={`flex items-baseline gap-5 py-3 ${i > 0 ? 'border-t border-white/[0.05]' : ''}`}>
                  <span className="text-[11px] font-semibold text-blue-400/60 uppercase tracking-wider w-28 shrink-0 text-right">
                    {label}
                  </span>
                  <p className="text-sm text-white/45">{text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <ScrollReveal>
            <p className="text-center text-white/25 text-xs mt-8">
              Platform in development. DashTwo is live.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="min-h-[50vh] flex items-center justify-center px-6">
        <ScrollReveal>
          <div className="text-center">
            <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
              It happened. You logged it.
            </p>
            <p className="text-xl text-white/40 mb-10">
              Now listen.
            </p>
            <button
              onClick={() => navigate('/dashtwo')}
              className="px-8 py-3.5 text-base font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
            >
              Try DashTwo — It's Free
            </button>
          </div>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] py-8">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-40">
            <img src="/tally-aero-favicon.png" alt="TallyAero" className="h-4 w-4 object-contain" />
            <span className="text-xs font-semibold text-white/60">TallyAero</span>
          </div>
          <div className="text-[11px] text-white/25">
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
          <tr className="border-b border-white/[0.08] text-white/35 uppercase tracking-wider">
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
            <tr key={i} className="border-b border-white/[0.04] text-white/45 hover:bg-white/[0.02] transition-colors">
              <td className="px-3 py-2">{row.date}</td>
              <td className="px-3 py-2">{row.aircraft}</td>
              <td className="px-3 py-2 text-white/35">{row.ident}</td>
              <td className="px-3 py-2">{row.from}</td>
              <td className="px-3 py-2">{row.to}</td>
              <td className="px-3 py-2 text-right">{row.pic}</td>
              <td className="px-3 py-2 text-right text-white/30">{row.xc || '—'}</td>
              <td className="px-3 py-2 text-right text-white/30 hidden sm:table-cell">{row.landings}</td>
              <td className="px-3 py-2 text-right text-white/30 hidden md:table-cell">{row.approaches || '—'}</td>
              <td className="px-3 py-2 text-white/30 hidden lg:table-cell truncate max-w-[200px]">{row.remarks}</td>
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
          setTimeout(() => setPhase(1), 400);
          setTimeout(() => setPhase(2), 1200);
          setTimeout(() => setPhase(3), 2000);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative">
      <div className="overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0d1220]">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-white/[0.08] text-white/35 uppercase tracking-wider">
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
                  phase >= 1 && i === 0 ? 'text-white/70' : 'text-white/45'
                }`}>{row.date}</td>
                <td className="px-3 py-2.5 text-white/45">{row.aircraft}</td>
                <td className={`px-3 py-2.5 transition-colors duration-700 ${
                  phase >= 3 ? 'text-blue-400/70' : 'text-white/35'
                }`}>{row.ident}</td>
                <td className="px-3 py-2.5 text-white/45">{row.from}→{row.to}</td>
                <td className={`px-3 py-2.5 text-right transition-colors duration-700 ${
                  phase >= 2 ? 'text-white/70' : 'text-white/45'
                }`}>{row.pic}</td>
                <td className="px-3 py-2.5 text-right text-white/30 hidden sm:table-cell">{row.landings}</td>
                <td className={`px-3 py-2.5 text-right hidden md:table-cell transition-colors duration-700 ${
                  phase >= 1 && row.approaches ? 'text-amber-400/80' : 'text-white/30'
                }`}>{row.approaches || '—'}</td>
                <td className="px-3 py-2.5 text-white/30 hidden lg:table-cell truncate max-w-[200px]">{row.remarks}</td>
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

      {/* Annotation: Trend */}
      <div className={`absolute -left-2 bottom-[60px] sm:left-2 transition-all duration-700 z-10 ${
        phase >= 2 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}>
        <div className="bg-[#0a1220] border border-blue-500/30 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-2 whitespace-nowrap shadow-lg shadow-black/40">
          <MiniTrend active={phase >= 2} />
          <span className="text-blue-300">Landings trending ↑ last 6 flights</span>
        </div>
      </div>

      {/* Annotation: Reg reference */}
      <div className={`absolute -left-2 top-[90px] sm:left-2 transition-all duration-700 z-10 ${
        phase >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      }`}>
        <div className="bg-[#120a1a] border border-purple-500/30 rounded-lg px-3 py-1.5 text-xs font-mono whitespace-nowrap shadow-lg shadow-black/40">
          <span className="text-purple-400">§</span>
          <span className="text-purple-300 ml-1.5">61.51(e) PIC — sole manipulator</span>
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
          setTimeout(() => setPhase(1), 300);
          setTimeout(() => setPhase(2), 900);
          setTimeout(() => setPhase(3), 1500);
          setTimeout(() => setPhase(4), 2100);
          setTimeout(() => setPhase(5), 2700);
          setTimeout(() => setPhase(6), 3400);
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">

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
              <span className="text-blue-400/80 font-semibold">Feb 1</span>
              <span className="text-white/35">N737SP</span>
            </div>
            <div className="text-white/50">KPAO → KSCK</div>
            <div className="flex gap-3">
              <span className="text-white/40">2.1 PIC</span>
              <span className="text-white/60 font-medium">3 night ldg</span>
            </div>
            <div className="text-white/30 text-[11px]">Full stop, night XC</div>
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
            <div className="text-white/50 leading-snug">
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
            <div className="text-white/50">90-day window</div>
            <div className="flex items-center gap-2">
              <span className="text-white/40">Feb 1</span>
              <span className="text-white/20">→</span>
              <span className="text-amber-400 font-semibold">May 2</span>
            </div>
            <div className="mt-1 text-white/50">
              Next night flight booked:
            </div>
            <div className="text-white/60 font-medium">May 8</div>
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
                { day: 'May 7', icon: '🌧', color: 'text-amber-400/80', wx: 'MVFR' },
                { day: 'May 8', icon: '☁', color: 'text-amber-400/70', wx: 'MVFR' },
              ].map(d => (
                <div key={d.day} className="space-y-0.5">
                  <div className="text-[10px] text-white/35">{d.day.split(' ')[1]}</div>
                  <div className="text-sm">{d.icon}</div>
                  <div className={`text-[10px] font-mono font-medium ${d.color}`}>{d.wx}</div>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-white/35 pt-1">TAF KPAO extended outlook</div>
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
              <span className="text-green-400/80 font-semibold">N737SP</span>
              <span className="text-white/35">C172S</span>
            </div>
            <div className="text-white/50">
              100-hr inspection due in
            </div>
            <div className="text-amber-400 font-medium">2.3 hrs</div>
            <div className="text-white/40 text-[11px]">
              Scheduled maint: May 3–5
            </div>
          </div>
        </SourceCard>
      </div>

      {/* Connection lines — animated pulse */}
      <div
        className="flex justify-center py-3 transition-all duration-500"
        style={{ opacity: phase >= 5 ? 1 : 0 }}
      >
        <div className="flex items-center gap-1">
          {[0,1,2].map(i => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-500/50"
              style={{
                animation: phase >= 5 ? `pulse 1.5s ease-in-out ${i * 0.2}s infinite` : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Conclusion */}
      <div
        className="transition-all duration-700"
        style={{ opacity: phase >= 6 ? 1 : 0, transform: phase >= 6 ? 'translateY(0)' : 'translateY(12px)' }}
      >
        <div className="bg-[#1a0a0a] border border-red-500/25 rounded-xl px-5 py-4 max-w-xl mx-auto">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg mt-0.5">⚠</span>
            <div className="space-y-1">
              <div className="text-red-400 font-semibold text-sm">3 conflicts detected</div>
              <div className="text-red-200/70 text-sm leading-relaxed">
                Night currency lapses <span className="text-red-300 font-medium">May 2</span>.
                Aircraft down for maintenance <span className="text-red-300 font-medium">May 3–5</span>.
                Weather goes IFR <span className="text-red-300 font-medium">May 6–7</span>.
                Your next night flight is <span className="text-white/70 font-medium">May 8</span>.
              </div>
              <div className="text-amber-400/90 text-sm font-medium pt-1">
                → You need to fly night before May 2, or reschedule.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Reusable animated source card */
function SourceCard({ phase, showAt, label, borderColor, bgColor, children }: {
  phase: number;
  showAt: number;
  label: string;
  borderColor: string;
  bgColor: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-3 transition-all duration-600`}
      style={{
        opacity: phase >= showAt ? 1 : 0,
        transform: phase >= showAt ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.97)',
        transitionDelay: `${(showAt - 1) * 50}ms`,
      }}
    >
      <div className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-2">{label}</div>
      <div className="text-xs font-mono">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TREND VIZ — SVG line drawing itself
   ═══════════════════════════════════════════════════════════════ */

function TrendViz() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.unobserve(el); } },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Landing scores over 8 flights — improvement trend with realistic variation
  const points = [45, 38, 52, 48, 60, 55, 68, 72];
  const w = 240, h = 100, px = 8, py = 8;
  const xStep = (w - px * 2) / (points.length - 1);
  const yMin = 20, yMax = 90;

  const pathD = points.map((p, i) => {
    const x = px + i * xStep;
    const y = h - py - ((p - yMin) / (yMax - yMin)) * (h - py * 2);
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');

  const pathLength = 600; // approximate

  return (
    <div ref={ref} className="w-full md:w-72 shrink-0 bg-[#0d1220] border border-white/[0.08] rounded-xl p-4">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-[11px] text-white/35 uppercase tracking-widest">Landing Proficiency</span>
        <span className={`text-xs font-mono transition-all duration-700 ${active ? 'text-green-400/80' : 'text-white/20'}`}>
          ↑ trending up
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 100 }}>
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map(f => (
          <line key={f} x1={px} x2={w - px} y1={h * f} y2={h * f} stroke="white" strokeOpacity={0.05} />
        ))}
        {/* Trend line */}
        <path
          d={pathD}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={pathLength}
          strokeDashoffset={active ? 0 : pathLength}
          style={{ transition: 'stroke-dashoffset 2s ease-out', opacity: 0.8 }}
        />
        {/* Data points */}
        {points.map((p, i) => {
          const x = px + i * xStep;
          const y = h - py - ((p - yMin) / (yMax - yMin)) * (h - py * 2);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={3}
              fill="#3b82f6"
              className="transition-all duration-500"
              style={{
                opacity: active ? 0.8 : 0,
                transitionDelay: `${1500 + i * 100}ms`,
              }}
            />
          );
        })}
      </svg>
      {/* Flight labels */}
      <div className="flex justify-between mt-1">
        {points.map((_, i) => (
          <span key={i} className="text-[10px] text-white/25 font-mono">
            {i === 0 ? 'Jan' : i === points.length - 1 ? 'Now' : ''}
          </span>
        ))}
      </div>
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
        stroke="#3b82f6"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={40}
        strokeDashoffset={active ? 0 : 40}
        style={{ transition: 'stroke-dashoffset 1s ease-out 0.5s', opacity: 0.7 }}
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
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full md:w-80 shrink-0 bg-[#0d1220] border border-white/[0.08] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-2">
        <img src="/dashtwo-icon.png" alt="DashTwo" className="h-4 w-4 object-contain" />
        <span className="text-xs text-white/50 font-medium">DashTwo</span>
      </div>

      {/* User message */}
      <div className={`transition-all duration-500 ${phase >= 1 ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
        <div className="bg-blue-600/15 border border-blue-500/15 rounded-lg px-3 py-2 text-sm text-white/70 ml-8">
          Am I current to fly at night with passengers?
        </div>
      </div>

      {/* DashTwo response — contextual */}
      <div className={`transition-all duration-700 ${phase >= 2 ? 'opacity-100' : 'opacity-0 translate-y-2'}`}>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2.5 text-xs text-white/60 leading-relaxed space-y-2">
          <p>
            Based on your logbook, your last 3 night landings to a full stop
            in <span className="text-blue-400/80">N737SP</span> were on <span className="text-white/80">Feb 1</span>.
          </p>
          <p>
            Under <span className="text-purple-400/80">14 CFR 61.57(b)</span>,
            you need 3 takeoffs and landings to a full stop within the
            preceding 90 days.
          </p>
          <p>
            <span className="text-amber-400">You have 12 days remaining.</span> After
            May 2, you'll need to fly at least 3 night full-stops before carrying passengers.
          </p>
          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-[11px] text-white/40">Sources:</span>
            <span className="text-[11px] text-blue-400/60">§61.57(b)</span>
            <span className="text-[11px] text-blue-400/60">Your logbook</span>
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

function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate3d(0,0,0)' : 'translate3d(0,20px,0)',
        transition: 'opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1), transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: visible ? 'auto' : 'transform, opacity',
      }}
    >
      {children}
    </div>
  );
}
