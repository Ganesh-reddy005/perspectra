import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, ChevronRight } from 'lucide-react';
import { problemsAPI, reviewAPI } from '../lib/api';
import LandingBackground from '../components/LandingBackground';
import toast from 'react-hot-toast';

// ─── Design tokens ────────────────────────────────────────────────────────────
const ORANGE = '#F15A24';
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Problem {
  id: string;
  title: string;
  difficulty: number;
  concept_ids: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIFF_LABELS: Record<number, string> = {
  1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Master',
};

const DIFF_STYLES: Record<number, { color: string; bg: string; border: string }> = {
  1: { color: '#15803d', bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.22)' },
  2: { color: '#92400e', bg: 'rgba(245,158,11,0.09)', border: 'rgba(245,158,11,0.28)' },
  3: { color: '#b83010', bg: `${ORANGE}12`, border: `${ORANGE}35` },
  4: { color: '#7c3aed', bg: 'rgba(124,58,237,0.09)', border: 'rgba(124,58,237,0.28)' },
  5: { color: '#be123c', bg: 'rgba(190,18,60,0.09)', border: 'rgba(190,18,60,0.28)' },
};

// ─── Loading spinner ──────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}
    >
      <LandingBackground />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <span
          className="w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: `${ORANGE}40`, borderTopColor: ORANGE }}
        />
        <p className="text-[13px] text-black/35 font-light">Loading problems…</p>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedIds, setSolvedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<number | null>(null);
  const [solvedFilter, setSolvedFilter] = useState<'all' | 'unsolved' | 'solved'>('all');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [probRes, histRes] = await Promise.all([
        problemsAPI.list(),
        reviewAPI.history(100).catch(() => ({ data: { reviews: [] } })),
      ]);
      setProblems(probRes.data.problems ?? []);
      const ids = new Set<string>(
        (histRes.data.reviews ?? []).map((r: any) => r.problem_id as string)
      );
      setSolvedIds(ids);
    } catch {
      toast.error('Failed to load problems');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (diffFilter !== null && p.difficulty !== diffFilter) return false;
      if (solvedFilter === 'solved' && !solvedIds.has(p.id)) return false;
      if (solvedFilter === 'unsolved' && solvedIds.has(p.id)) return false;
      return true;
    });
  }, [problems, search, diffFilter, solvedFilter, solvedIds]);

  if (loading) return <Spinner />;

  const solvedCount = problems.filter((p) => solvedIds.has(p.id)).length;

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif", color: '#0A0A0A' }}
    >
      <LandingBackground />

      <div className="relative z-10 max-w-[900px] mx-auto px-6 py-10 space-y-6">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-black/30 mb-2">
            Problems
          </p>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <h1
              className="leading-tight tracking-[-0.03em]"
              style={{
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: 'clamp(28px, 4vw, 42px)',
              }}
            >
              Practice Problems
            </h1>
            <div className="flex items-center gap-3 pb-1">
              <span className="text-[12px] text-black/35 font-light">
                {problems.length} total
              </span>
              {solvedCount > 0 && (
                <span
                  className="flex items-center gap-1 text-[12px] font-mono px-3 py-1 rounded-full border"
                  style={{ color: '#15803d', background: 'rgba(34,197,94,0.09)', borderColor: 'rgba(34,197,94,0.22)' }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {solvedCount} solved
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Filters ────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease }}
          className="rounded-2xl border border-black/[0.08] px-5 py-4 space-y-4"
          style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)' }}
        >
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black/30"
              strokeWidth={1.6}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems…"
              className="w-full pl-10 pr-4 py-2.5 text-[13.5px] rounded-xl outline-none transition-all duration-150"
              style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
                color: '#0A0A0A',
              }}
              onFocus={(e) => (e.target.style.borderColor = ORANGE)}
              onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Difficulty pills */}
            {[null, 1, 2, 3, 4, 5].map((d) => {
              const active = diffFilter === d;
              const ds = d !== null ? DIFF_STYLES[d] : null;
              return (
                <button
                  key={d ?? 'all'}
                  onClick={() => setDiffFilter(d)}
                  className="text-[11.5px] font-mono px-3.5 py-1.5 rounded-full border transition-all duration-150"
                  style={
                    active
                      ? {
                        background: d === null ? '#0A0A0A' : ds!.bg,
                        color: d === null ? '#fff' : ds!.color,
                        borderColor: d === null ? '#0A0A0A' : ds!.border,
                        fontWeight: 500,
                      }
                      : {
                        background: 'transparent',
                        color: 'rgba(0,0,0,0.45)',
                        borderColor: 'rgba(0,0,0,0.10)',
                      }
                  }
                >
                  {d === null ? 'All' : DIFF_LABELS[d]}
                </button>
              );
            })}

            {/* Separator */}
            <div className="w-px bg-black/[0.08] mx-1 self-stretch" />

            {/* Solved status pills */}
            {(['all', 'unsolved', 'solved'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSolvedFilter(s)}
                className="text-[11.5px] font-mono px-3.5 py-1.5 rounded-full border transition-all duration-150 capitalize"
                style={
                  solvedFilter === s
                    ? { background: '#0A0A0A', color: '#fff', borderColor: '#0A0A0A', fontWeight: 500 }
                    : { background: 'transparent', color: 'rgba(0,0,0,0.45)', borderColor: 'rgba(0,0,0,0.10)' }
                }
              >
                {s}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Problem list ────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16, duration: 0.5, ease }}
          className="rounded-2xl border border-black/[0.08] overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)' }}
        >
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-[13px] text-black/35 font-light">No problems match your filters.</p>
              <button
                onClick={() => { setSearch(''); setDiffFilter(null); setSolvedFilter('all'); }}
                className="mt-3 text-[12.5px] font-medium transition-colors duration-150"
                style={{ color: ORANGE }}
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="divide-y divide-black/[0.055]">
              {filtered.map((problem, i) => {
                const solved = solvedIds.has(problem.id);
                const ds = DIFF_STYLES[problem.difficulty] ?? DIFF_STYLES[3];
                const label = DIFF_LABELS[problem.difficulty] ?? 'Hard';

                return (
                  <Link
                    key={problem.id}
                    to={`/problem/${problem.id}`}
                    className="group flex items-center gap-4 px-6 py-4 transition-colors duration-130 hover:bg-black/[0.025]"
                  >
                    {/* Index */}
                    <span className="text-[12px] font-mono text-black/20 w-7 shrink-0 text-right">
                      {i + 1}
                    </span>

                    {/* Solved indicator */}
                    <div className="w-5 shrink-0 flex items-center justify-center">
                      {solved ? (
                        <CheckCircle2
                          className="w-4 h-4"
                          strokeWidth={1.8}
                          style={{ color: '#22c55e' }}
                        />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-black/15" />
                      )}
                    </div>

                    {/* Title + concepts */}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[14px] font-medium truncate transition-colors duration-130"
                        style={{ color: solved ? 'rgba(0,0,0,0.45)' : '#0A0A0A' }}
                      >
                        {problem.title}
                      </p>
                      {problem.concept_ids.length > 0 && (
                        <div className="flex gap-1.5 mt-1 flex-wrap">
                          {problem.concept_ids.slice(0, 2).map((cid) => (
                            <span
                              key={cid}
                              className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                              style={{
                                color: 'rgba(0,0,0,0.38)',
                                borderColor: 'rgba(0,0,0,0.08)',
                                background: 'rgba(0,0,0,0.03)',
                              }}
                            >
                              {cid}
                            </span>
                          ))}
                          {problem.concept_ids.length > 2 && (
                            <span className="text-[10px] font-mono text-black/25">
                              +{problem.concept_ids.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Difficulty badge */}
                    <span
                      className="text-[10.5px] font-mono px-2.5 py-0.5 rounded-full border shrink-0"
                      style={{ color: ds.color, background: ds.bg, borderColor: ds.border }}
                    >
                      {label}
                    </span>

                    {/* Arrow */}
                    <ChevronRight
                      className="w-4 h-4 text-black/15 group-hover:text-black/40 group-hover:translate-x-0.5 transition-all duration-150 shrink-0"
                      strokeWidth={1.6}
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Result count */}
        {filtered.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-center text-[11px] font-mono text-black/20 tracking-widest uppercase pb-4"
          >
            Showing {filtered.length} of {problems.length} problems
          </motion.p>
        )}

      </div>
    </div>
  );
}
