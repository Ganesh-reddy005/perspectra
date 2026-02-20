import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CheckCircle, ArrowUpRight, ChevronDown, Loader2, BarChart3,
} from 'lucide-react';
import { reviewAPI } from '../lib/api';
import LandingBackground from '../components/LandingBackground';
import toast from 'react-hot-toast';

const ORANGE = '#F15A24';
const ease = [0.16, 1, 0.3, 1] as const;

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={`rounded-2xl border border-black/[0.08] ${className}`}
            style={{ background: 'rgba(255,255,255,0.84)', backdropFilter: 'blur(20px)' }}
        >
            {children}
        </div>
    );
}

function Fade({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.55, ease }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// ─── Score ring ─────────────────────────────────────────────────────────────
// score is stored as 0-100 in DB; display as x/10
function ScoreRing({ score }: { score: number }) {
    const display = score / 10;                         // e.g. 60 → 6
    const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : ORANGE;
    const r = 22, circ = 2 * Math.PI * r;
    const pct = score;                                  // score IS already a 0-100 percentage
    return (
        <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="absolute inset-0 -rotate-90" width="56" height="56">
                <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="4.5" />
                <circle
                    cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeDasharray={`${(pct / 100) * circ} ${circ}`}
                />
            </svg>
            <div className="text-center z-10">
                <p className="text-[15px] font-bold leading-none" style={{ color }}>{display}</p>
                <p className="text-[8px] text-black/30 font-mono">/10</p>
            </div>
        </div>
    );
}

// ─── Review row (expandable) ──────────────────────────────────────────────────
function ReviewRow({ review, index }: { review: any; index: number }) {
    const [open, setOpen] = useState(false);
    const score = review.score ?? 0;      // raw 0-100 from DB
    const date = review.created_at
        ? new Date(review.created_at).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric',
        })
        : '—';
    const time = review.created_at
        ? new Date(review.created_at).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit',
        })
        : '';

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index, duration: 0.4, ease }}
            className="border-b border-black/[0.05] last:border-0"
        >
            {/* Main row */}
            <div
                className="flex items-center gap-4 py-4 cursor-pointer group"
                onClick={() => setOpen((v) => !v)}
            >
                <ScoreRing score={score} />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[14px] font-medium text-[#0A0A0A] truncate leading-snug">
                            {review.problem_title ?? review.problem_id}
                        </p>
                        <Link
                            to={`/problem/${review.problem_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        >
                            <ArrowUpRight className="w-3.5 h-3.5 text-black/30 hover:text-black/60 transition-colors" />
                        </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span
                            className="text-[10.5px] font-mono px-2 py-0.5 rounded-full border"
                            style={{ color: 'rgba(0,0,0,0.40)', borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.04)' }}
                        >
                            {review.language ?? 'python'}
                        </span>
                        {review.concept_gaps?.slice(0, 3).map((g: string) => (
                            <span
                                key={g}
                                className="text-[10.5px] px-2 py-0.5 rounded-full"
                                style={{ background: `${ORANGE}10`, color: '#b83010', border: `1px solid ${ORANGE}25` }}
                            >
                                {g}
                            </span>
                        ))}
                        {review.concept_gaps?.length > 3 && (
                            <span className="text-[10.5px] text-black/30 font-mono">
                                +{review.concept_gaps.length - 3} gaps
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                        <p className="text-[12px] text-black/50 font-mono">{date}</p>
                        <p className="text-[11px] text-black/25 font-mono">{time}</p>
                    </div>
                    <ChevronDown
                        className="w-4 h-4 text-black/25 transition-transform duration-200"
                        style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                </div>
            </div>

            {/* Expanded detail */}
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                    >
                        <div className="pb-5 space-y-4 pl-[70px] pr-2">

                            {/* Thinking style */}
                            {review.thinking_style && (
                                <div>
                                    <p className="text-[10.5px] font-mono uppercase tracking-widest text-black/30 mb-1.5">
                                        Thinking Style
                                    </p>
                                    <p className="text-[13px] text-black/55 font-light capitalize">{review.thinking_style}</p>
                                </div>
                            )}

                            {/* Strengths */}
                            {review.strengths?.length > 0 && (
                                <div>
                                    <p className="text-[10.5px] font-mono uppercase tracking-widest text-black/30 mb-2">Strengths</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {review.strengths.map((s: string) => (
                                            <span
                                                key={s}
                                                className="text-[11.5px] px-2.5 py-1 rounded-full"
                                                style={{ background: 'rgba(34,197,94,0.09)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}
                                            >
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Weaknesses */}
                            {review.weaknesses?.length > 0 && (
                                <div>
                                    <p className="text-[10.5px] font-mono uppercase tracking-widest text-black/30 mb-2">Areas to Improve</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {review.weaknesses.map((w: string) => (
                                            <span
                                                key={w}
                                                className="text-[11.5px] px-2.5 py-1 rounded-full"
                                                style={{ background: `${ORANGE}10`, color: '#b83010', border: `1px solid ${ORANGE}30` }}
                                            >
                                                {w}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Topics to revise */}
                            {review.topics_to_revise?.length > 0 && (
                                <div>
                                    <p className="text-[10.5px] font-mono uppercase tracking-widest text-black/30 mb-2">Topics to Revise</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {review.topics_to_revise.map((t: string) => (
                                            <span
                                                key={t}
                                                className="text-[11.5px] font-mono px-2.5 py-1 rounded-full border"
                                                style={{ color: 'rgba(0,0,0,0.45)', borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.03)' }}
                                            >
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Detailed feedback */}
                            {review.detailed_feedback && (
                                <div>
                                    <p className="text-[10.5px] font-mono uppercase tracking-widest text-black/30 mb-2">Feedback</p>
                                    <p className="text-[13px] text-black/55 font-light leading-[1.75] whitespace-pre-line">
                                        {review.detailed_feedback}
                                    </p>
                                </div>
                            )}

                            {/* Re-attempt link */}
                            <Link
                                to={`/problem/${review.problem_id}`}
                                className="inline-flex items-center gap-1.5 text-[12.5px] font-medium transition-colors duration-150 mt-1"
                                style={{ color: ORANGE }}
                            >
                                Re-attempt this problem
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
// All scores are 0-100 raw; displayed as x/10
function StatsBar({ reviews }: { reviews: any[] }) {
    if (reviews.length === 0) return null;
    const rawAvg = reviews.reduce((s, r) => s + (r.score ?? 0), 0) / reviews.length;
    const avgDisplay = (rawAvg / 10).toFixed(1);        // e.g. 60 → '6.0'
    const rawBest = Math.max(...reviews.map((r) => r.score ?? 0));
    const bestDisplay = (rawBest / 10).toFixed(1);      // e.g. 80 → '8.0'
    const languages = [...new Set(reviews.map((r) => r.language ?? 'python'))];
    const avgColor = rawAvg >= 80 ? '#22c55e' : rawAvg >= 50 ? '#f59e0b' : ORANGE;
    const bestColor = rawBest >= 80 ? '#22c55e' : rawBest >= 50 ? '#f59e0b' : ORANGE;

    return (
        <Glass className="px-7 py-5">
            <div className="grid grid-cols-3 divide-x divide-black/[0.06]">
                {[
                    { label: 'Total solved', value: String(reviews.length), color: '#0A0A0A' },
                    { label: 'Avg score', value: `${avgDisplay}/10`, color: avgColor },
                    { label: 'Best score', value: `${bestDisplay}/10`, color: bestColor },
                ].map(({ label, value, color }) => (
                    <div key={label} className="text-center px-4">
                        <p className="text-[22px] font-semibold tracking-tight leading-none mb-1" style={{ color }}>
                            {value}
                        </p>
                        <p className="text-[11px] text-black/35 font-mono">{label}</p>
                    </div>
                ))}
            </div>
            {languages.length > 1 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-black/[0.05]">
                    <p className="text-[11px] text-black/30 font-mono uppercase tracking-widest">Languages:</p>
                    <div className="flex gap-1.5">
                        {languages.map((l) => (
                            <span key={l} className="text-[11px] font-mono px-2 py-0.5 rounded-full border"
                                style={{ color: 'rgba(0,0,0,0.45)', borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.03)' }}>
                                {l}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </Glass>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ReviewHistory() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(20);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => { loadHistory(20); }, []);

    const loadHistory = async (n: number) => {
        try {
            const { data } = await reviewAPI.history(n);
            setReviews(data.reviews ?? []);
        } catch {
            toast.error('Failed to load review history');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = async () => {
        const next = limit + 20;
        setLimit(next);
        setLoadingMore(true);
        await loadHistory(next);
    };

    // ── Loading ────────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="relative min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}>
                <LandingBackground />
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <span className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: `${ORANGE}40`, borderTopColor: ORANGE }} />
                    <p className="text-[13px] text-black/35 font-light">Loading history…</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative min-h-screen"
            style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif", color: '#0A0A0A' }}
        >
            <LandingBackground />

            <div className="relative z-10 max-w-[860px] mx-auto px-6 py-10 space-y-6">

                {/* Header */}
                <Fade delay={0}>
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-black/30 mb-2">Review · History</p>
                            <h1
                                className="leading-tight tracking-[-0.03em]"
                                style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)' }}
                            >
                                All{' '}
                                <span style={{ color: ORANGE, fontStyle: 'italic' }}>Submissions</span>
                            </h1>
                        </div>
                        <Link
                            to="/problems"
                            className="flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-full text-white transition-all duration-200 hover:shadow-md shrink-0"
                            style={{ background: '#0A0A0A' }}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Solve more
                        </Link>
                    </div>
                </Fade>

                {/* Stats bar */}
                {reviews.length > 0 && (
                    <Fade delay={0.06}>
                        <StatsBar reviews={reviews} />
                    </Fade>
                )}

                {/* List */}
                <Fade delay={0.12}>
                    <Glass className="px-7 py-3">
                        {reviews.length > 0 ? (
                            <>
                                <div>
                                    {reviews.map((r, i) => (
                                        <ReviewRow key={r._id ?? i} review={r} index={i} />
                                    ))}
                                </div>

                                {/* Load more */}
                                {reviews.length === limit && (
                                    <div className="pt-4 pb-2 text-center">
                                        <button
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                            className="flex items-center gap-2 mx-auto text-[12.5px] font-medium px-5 py-2.5 rounded-full border transition-all duration-150 hover:bg-black/[0.03] disabled:opacity-50"
                                            style={{ borderColor: 'rgba(0,0,0,0.10)', color: 'rgba(0,0,0,0.50)' }}
                                        >
                                            {loadingMore ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                            Load more
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-14 text-center">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: `${ORANGE}12` }}>
                                    <CheckCircle className="w-5 h-5" style={{ color: ORANGE }} />
                                </div>
                                <p className="text-[14px] font-medium text-black/50 mb-1">No submissions yet</p>
                                <p className="text-[13px] text-black/35 font-light mb-5 max-w-[240px] leading-relaxed">
                                    Submit your first solution to start tracking your progress here.
                                </p>
                                <Link
                                    to="/problems"
                                    className="text-[13px] font-medium transition-colors duration-150"
                                    style={{ color: ORANGE }}
                                >
                                    Browse problems →
                                </Link>
                            </div>
                        )}
                    </Glass>
                </Fade>

            </div>
        </div>
    );
}
