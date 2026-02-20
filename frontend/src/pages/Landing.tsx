import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Brain, Network, TrendingUp, ChevronDown, LayoutDashboard } from 'lucide-react';
import LandingBackground from '../components/LandingBackground';
import { useAuthStore } from '../store/authStore';

// ─── Constants ─────────────────────────────────────────────────────────────────
const ORANGE = '#F15A24';

const TAGLINES = ['Think Deeper.', 'Question Everything.', 'Reason Better.', 'Grow Faster.'];

const FEATURES = [
  {
    num: '01',
    icon: Brain,
    title: 'Reviewer Agent',
    body: 'Every submission is dissected for learning signals — not correctness. Concept gaps, reasoning patterns, and mistake tendencies all feed a live cognitive map.',
    tag: 'Cognitive profiling',
  },
  {
    num: '02',
    icon: Network,
    title: 'Tutor Agent',
    body: 'A Socratic engine. It never hands you the answer. Instead, it asks the right question at the right moment, tailored entirely to how you think.',
    tag: 'Adaptive guidance',
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Background Agent',
    body: 'Runs silently after every 5 submissions. Detects regressions, marks mastery, and re-routes your learning path before you realise you\'re stuck.',
    tag: 'Async intelligence',
  },
];

const STEPS = [
  { title: 'Onboard in 60 seconds.', body: 'Five quick questions. We build your initial profile. No cold-start grinding.' },
  { title: 'Solve curated problems.', body: 'Our graph-linked DSA set. Every problem selected for your current gaps.' },
  { title: 'Get Socratic feedback.', body: 'Not what you did wrong — why. The tutor questions your reasoning.' },
  { title: 'Watch your map grow.', body: 'The Knowledge Graph renders your conceptual mastery in real time.' },
];

// ─── Ease ───────────────────────────────────────────────────────────────────── 
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Tagline Cycle ─────────────────────────────────────────────────────────────
function CyclingTagline() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI(n => (n + 1) % TAGLINES.length), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative h-8 sm:h-10 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ y: 32, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ duration: 0.46, ease }}
          className="absolute inset-0 flex items-center text-xl sm:text-2xl font-light tracking-tight"
          style={{ color: ORANGE }}
        >
          {TAGLINES[i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// ─── Reveal paragraph ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay, duration: 0.65, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Divider ───────────────────────────────────────────────────────────────────
function Rule() {
  return <div className="w-full border-t border-black/[0.09]" />;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div
      className="w-full min-h-screen overflow-x-hidden"
      style={{ backgroundColor: '#FAFAFA', color: '#0A0A0A', fontFamily: "'Inter', sans-serif" }}
    >
      <LandingBackground />
      {/* ─── NAV ─── */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        className="sticky top-0 z-50 w-full border-b border-black/[0.07] bg-[#FAFAFA]/90 backdrop-blur-md"
      >
        <div className="max-w-[1160px] mx-auto px-6 h-[62px] flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-[7px] select-none">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect width="10" height="10" rx="2" fill="#0A0A0A" />
              <rect x="12" width="10" height="10" rx="2" fill={ORANGE} />
              <rect y="12" width="10" height="10" rx="2" fill={ORANGE} opacity="0.35" />
              <rect x="12" y="12" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.18" />
            </svg>
            <span className="text-[17px] font-semibold tracking-[-0.03em] text-[#0A0A0A]">
              Perspectra
            </span>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-7">
            {['#philosophy', '#features', '#how-it-works'].map((href, i) => (
              <a
                key={i}
                href={href}
                className="text-[13.5px] text-black/50 hover:text-black/80 transition-colors duration-150 capitalize"
              >
                {href.replace('#', '').replace('-', ' ')}
              </a>
            ))}
          </nav>

          {/* CTA */}
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium px-4 py-2 rounded-full border border-black/15 hover:border-black/30 text-black/70 hover:text-black transition-all duration-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="group inline-flex items-center gap-1.5 text-[13.5px] font-medium px-4 py-2 rounded-full border border-black/15 hover:border-black/30 text-black/70 hover:text-black transition-all duration-200"
            >
              Sign in
              <ArrowRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200" />
            </Link>
          )}
        </div>
      </motion.header>

      {/* ─── HERO ─── */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 text-center pt-16 pb-28"
      >
        {/* very subtle orange glow behind headline */}
        <div
          className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full opacity-[0.07]"
          style={{ background: `radial-gradient(ellipse, ${ORANGE} 0%, transparent 70%)` }}
        />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="max-w-[820px] mx-auto flex flex-col items-center"
        >
          {/* Status pill */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05, duration: 0.4, ease }}
            className="mb-9 inline-flex items-center gap-2 text-[11.5px] font-mono tracking-widest uppercase text-black/40 border border-black/10 rounded-full px-4 py-1.5 bg-white"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Beta · Socratic · Hyper-Adaptive
          </motion.div>

          {/* Headline — Instrument Serif */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.75, ease }}
            className="mb-4 leading-[1.06] tracking-[-0.035em]"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(52px, 8vw, 88px)',
              color: '#0A0A0A',
            }}
          >
            Built to make<br />
            <span style={{ color: ORANGE, fontStyle: 'italic' }}>you think better.</span>
          </motion.h1>

          {/* Cycling sub-line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-6"
          >
            <CyclingTagline />
          </motion.div>

          {/* Sub-description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42, duration: 0.6, ease }}
            className="text-[16px] sm:text-[17px] text-black/45 font-light leading-[1.7] max-w-[520px] mb-12"
          >
            A Socratic engine that never gives you the answer — it asks the
            right question. A hyper-adaptive system that rebuilds your path around{' '}
            <em className="not-italic font-normal text-black/65">how you reason</em>, not what you memorise.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5, ease }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 text-[14px] font-medium px-7 py-3.5 rounded-full text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0"
                style={{ backgroundColor: '#0A0A0A' }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 text-[14px] font-medium px-7 py-3.5 rounded-full text-white shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0"
                  style={{ backgroundColor: '#0A0A0A' }}
                >
                  Start for free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-1.5 text-[14px] text-black/45 hover:text-black/70 transition-colors duration-150"
                >
                  See how it works
                </a>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll nudge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-black/20"
        >
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </section>

      <Rule />

      {/* ─── STATS ─── */}
      <section className="max-w-[1160px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-black/[0.09]">
        {[
          { val: '3×', label: 'Faster concept retention' },
          { val: '91%', label: 'Break tutorial hell' },
          { val: '500+', label: 'Engineers on waitlist' },
          { val: '∞', label: 'Adaptive paths' },
        ].map((s, i) => (
          <Reveal key={i} delay={i * 0.08} className="flex flex-col items-start md:px-10 first:pl-0">
            <span
              className="text-[40px] font-semibold tracking-tight mb-1"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {s.val}
            </span>
            <span className="text-[13px] text-black/40 font-light">{s.label}</span>
          </Reveal>
        ))}
      </section>

      <Rule />

      {/* ─── PHILOSOPHY ─── */}
      <section id="philosophy" className="max-w-[1160px] mx-auto px-6 py-28">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <Reveal>
            <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-black/30 mb-6">
              Philosophy
            </p>
            <h2
              className="leading-[1.1] tracking-[-0.03em] mb-6"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(34px, 4vw, 50px)',
                color: '#0A0A0A',
              }}
            >
              Wrong answers are more{' '}
              <span style={{ color: ORANGE, fontStyle: 'italic' }}>valuable</span>{' '}
              than correct ones.
            </h2>
            <p className="text-[15.5px] text-black/45 font-light leading-[1.75]">
              Every mistake is a signal. Perspectra extracts the <em>why</em> behind your
              errors to build an ever-evolving cognitive map — so the system teaches to{' '}
              <em>you</em>, not around you.
            </p>
          </Reveal>

          <div className="space-y-0">
            {[
              { n: '01', t: 'You memorise a solution to pass the test.' },
              { n: '02', t: 'You forget the core logic exactly 48 hours later.' },
              { n: '03', t: 'The interviewer shifts one constraint. Panic ensues.' },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="flex items-start gap-6 py-7 border-b border-black/[0.08] group">
                  <span className="text-[11px] font-mono text-black/20 mt-1 w-6 shrink-0">{item.n}</span>
                  <p className="text-[16px] text-black/55 font-light leading-snug group-hover:text-black/80 transition-colors duration-200">
                    {item.t}
                  </p>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.35}>
              <div className="pt-8">
                <p className="text-[13px] text-black/30 font-mono italic">
                  ↳ Perspectra interrupts this loop at step 01.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Rule />

      {/* ─── FEATURES ─── */}
      <section id="features" className="max-w-[1160px] mx-auto px-6 py-28">
        <Reveal className="mb-16">
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-black/30 mb-6">Features</p>
          <h2
            className="leading-[1.1] tracking-[-0.03em]"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(34px, 4vw, 50px)',
            }}
          >
            Three agents.<br />
            <span style={{ color: ORANGE, fontStyle: 'italic' }}>One unified mind.</span>
          </h2>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-px bg-black/[0.07] border border-black/[0.07]">
          {FEATURES.map((f, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="group bg-[#FAFAFA] hover:bg-white p-9 transition-colors duration-200 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[11px] font-mono text-black/25">{f.num}</span>
                  <f.icon
                    className="w-[18px] h-[18px]"
                    strokeWidth={1.5}
                    style={{ color: ORANGE, opacity: 0.7 }}
                  />
                </div>
                <h3 className="text-[16.5px] font-semibold tracking-[-0.02em] text-black mb-3">{f.title}</h3>
                <p className="text-[14px] text-black/45 font-light leading-[1.75] flex-1">{f.body}</p>
                <div className="mt-8 text-[11px] font-mono text-black/25 group-hover:text-black/40 transition-colors">
                  ↳ {f.tag}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Rule />

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="max-w-[1160px] mx-auto px-6 py-28">
        <Reveal className="mb-16">
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-black/30 mb-6">How it works</p>
          <h2
            className="leading-[1.1] tracking-[-0.03em]"
            style={{
              fontFamily: "'Instrument Serif', Georgia, serif",
              fontSize: 'clamp(34px, 4vw, 50px)',
            }}
          >
            Your path, not theirs.
          </h2>
        </Reveal>

        <div>
          {STEPS.map((step, i) => (
            <Reveal key={i} delay={i * 0.09}>
              <div className="group grid md:grid-cols-[80px_1fr_auto] items-start gap-6 py-9 border-b border-black/[0.08] cursor-default">
                <span className="text-[11px] font-mono text-black/20 pt-1">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3
                    className="text-[18px] tracking-[-0.025em] mb-2 group-hover:text-black text-black/75 transition-colors duration-200"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[14px] text-black/40 font-light leading-relaxed max-w-xl">{step.body}</p>
                </div>
                <ArrowRight
                  className="w-4 h-4 mt-1 text-black/10 group-hover:text-black/30 group-hover:translate-x-1 transition-all duration-200 hidden md:block"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <Rule />

      {/* ─── CTA BANNER ─── */}
      <section className="max-w-[1160px] mx-auto px-6 py-28">
        <Reveal>
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-10">
            <div className="max-w-[560px]">
              <h2
                className="leading-[1.08] tracking-[-0.035em] mb-5"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 'clamp(36px, 5vw, 60px)',
                }}
              >
                Stop memorising.<br />
                <span style={{ color: ORANGE, fontStyle: 'italic' }}>Start understanding.</span>
              </h2>
              <p className="text-[15px] text-black/40 font-light leading-relaxed">
                Join engineers who've replaced blind grinding with genuine, lasting understanding.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 text-[14px] font-medium px-7 py-3.5 rounded-full text-white shadow-md transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg"
                style={{ backgroundColor: '#0A0A0A' }}
              >
                Join for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[14px] font-medium px-7 py-3.5 rounded-full border border-black/15 text-black/50 hover:text-black hover:border-black/30 transition-all duration-200"
              >
                Sign in
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Rule />

      {/* ─── FOOTER ─── */}
      <footer className="max-w-[1160px] mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-[7px] select-none">
          <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
            <rect width="10" height="10" rx="2" fill="#0A0A0A" />
            <rect x="12" width="10" height="10" rx="2" fill={ORANGE} />
            <rect y="12" width="10" height="10" rx="2" fill={ORANGE} opacity="0.35" />
            <rect x="12" y="12" width="10" height="10" rx="2" fill="#0A0A0A" opacity="0.18" />
          </svg>
          <span className="text-[14px] font-semibold tracking-[-0.03em] text-black/60">Perspectra</span>
        </Link>
        <p className="text-[12px] font-mono text-black/25 tracking-widest uppercase">
          © 2025 · Built for learners who think differently.
        </p>
      </footer>
    </div>
  );
}