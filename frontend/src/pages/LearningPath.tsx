import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Search, Route, Loader2, ChevronRight, Network } from 'lucide-react';
import { graphAPI } from '../lib/api';
import LandingBackground from '../components/LandingBackground';
import toast from 'react-hot-toast';

const ORANGE = '#F15A24';
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Tier colours ──────────────────────────────────────────────────────────────
const TIER_STYLES: Record<number, { bg: string; border: string; color: string; label: string }> = {
    1: { bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.25)', color: '#15803d', label: 'Fundamentals' },
    2: { bg: 'rgba(59,130,246,0.09)', border: 'rgba(59,130,246,0.25)', color: '#1d4ed8', label: 'Core' },
    3: { bg: 'rgba(245,158,11,0.09)', border: 'rgba(245,158,11,0.28)', color: '#92400e', label: 'Intermediate' },
    4: { bg: `${ORANGE}10`, border: `${ORANGE}35`, color: '#b83010', label: 'Advanced' },
    5: { bg: 'rgba(124,58,237,0.09)', border: 'rgba(124,58,237,0.28)', color: '#6d28d9', label: 'Expert' },
};

function tierStyle(tier?: number) {
    return TIER_STYLES[tier ?? 1] ?? TIER_STYLES[1];
}

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

// ─── Path node card ────────────────────────────────────────────────────────────
function PathNode({ node, index, total }: { node: any; index: number; total: number }) {
    const ts = tierStyle(node.tier);
    const isLast = index === total - 1;

    return (
        <div className="flex items-start gap-3">
            {/* Step line */}
            <div className="flex flex-col items-center shrink-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold text-white shrink-0"
                    style={{ background: ts.color }}
                >
                    {index + 1}
                </div>
                {!isLast && <div className="w-px flex-1 min-h-[28px] mt-2" style={{ background: 'rgba(0,0,0,0.09)' }} />}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-6'}`}>
                <div
                    className="rounded-xl px-4 py-3.5 border"
                    style={{ background: ts.bg, borderColor: ts.border }}
                >
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-[14px] font-medium text-[#0A0A0A] leading-snug">{node.name}</p>
                        <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border shrink-0"
                            style={{ color: ts.color, borderColor: ts.border, background: 'rgba(255,255,255,0.6)' }}
                        >
                            Tier {node.tier} · {ts.label}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Concept autocomplete input ────────────────────────────────────────────────
function ConceptInput({
    label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
    return (
        <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-mono uppercase tracking-widest text-black/35 mb-2">{label}</p>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-150"
                style={{
                    background: 'rgba(0,0,0,0.03)',
                    border: '1.5px solid rgba(0,0,0,0.09)',
                    color: '#0A0A0A',
                }}
                onFocus={(e) => (e.target.style.borderColor = ORANGE)}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.09)')}
            />
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LearningPath() {
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [loading, setLoading] = useState(false);
    const [path, setPath] = useState<any[] | null>(null);
    const [hops, setHops] = useState<number | null>(null);
    const [noPath, setNoPath] = useState(false);

    const handleFind = async () => {
        const f = from.trim();
        const t = to.trim();
        if (!f || !t) { toast.error('Enter both concepts'); return; }
        if (f.toLowerCase() === t.toLowerCase()) { toast.error('Pick two different concepts'); return; }
        setLoading(true);
        setPath(null);
        setNoPath(false);
        try {
            // Try requested direction first
            const { data } = await graphAPI.getPath(f, t);
            if (!data.path || data.path.length === 0) {
                setNoPath(true);
            } else {
                setPath(data.path);
                setHops(data.hops ?? data.path.length - 1);
            }
        } catch (e: any) {
            toast.error(e.response?.data?.detail || 'Failed to find path');
        } finally {
            setLoading(false);
        }
    };

    // Swap
    const handleSwap = () => { setFrom(to); setTo(from); setPath(null); setNoPath(false); };

    return (
        <div
            className="relative min-h-screen"
            style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif", color: '#0A0A0A' }}
        >
            <LandingBackground />

            <div className="relative z-10 max-w-[860px] mx-auto px-6 py-10 space-y-8">

                {/* Header */}
                <Fade delay={0}>
                    <div>
                        <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-black/30 mb-2">
                            Graph · Path Finder
                        </p>
                        <h1
                            className="leading-tight tracking-[-0.03em] mb-2"
                            style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontSize: 'clamp(28px, 4vw, 42px)' }}
                        >
                            Learning{' '}
                            <span style={{ color: ORANGE, fontStyle: 'italic' }}>Path Explorer</span>
                        </h1>
                        <p className="text-[13.5px] text-black/40 font-light max-w-[500px] leading-relaxed">
                            Find the shortest dependency chain between any two concepts in your knowledge graph.
                        </p>
                    </div>
                </Fade>

                {/* Search form */}
                <Fade delay={0.08}>
                    <Glass className="px-7 py-6">
                        <div className="flex flex-col sm:flex-row items-end gap-3">
                            <ConceptInput
                                label="From concept"
                                value={from}
                                onChange={setFrom}
                                placeholder="e.g., Arrays"
                            />

                            {/* Swap button */}
                            <button
                                onClick={handleSwap}
                                className="flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-150 hover:bg-black/[0.04] shrink-0 mb-0.5"
                                style={{ borderColor: 'rgba(0,0,0,0.10)', color: 'rgba(0,0,0,0.35)' }}
                                title="Swap concepts"
                            >
                                <ArrowRight className="w-4 h-4" />
                            </button>

                            <ConceptInput
                                label="To concept"
                                value={to}
                                onChange={setTo}
                                placeholder="e.g., Dynamic Programming"
                            />

                            <button
                                onClick={handleFind}
                                disabled={loading}
                                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[13.5px] font-medium text-white transition-all duration-200 hover:shadow-md disabled:opacity-60 shrink-0"
                                style={{ background: '#0A0A0A' }}
                            >
                                {loading ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Finding…</>
                                ) : (
                                    <><Search className="w-4 h-4" /> Find path</>
                                )}
                            </button>
                        </div>
                    </Glass>
                </Fade>

                {/* Results */}
                <AnimatePresence mode="wait">
                    {/* No path found */}
                    {noPath && (
                        <motion.div
                            key="noresult"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4, ease }}
                        >
                            <Glass className="px-7 py-10 text-center">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto"
                                    style={{ background: `${ORANGE}12` }}
                                >
                                    <Route className="w-5 h-5" style={{ color: ORANGE }} />
                                </div>
                                <p className="text-[14px] font-medium text-black/60 mb-2">No path found</p>
                                <p className="text-[13px] text-black/35 font-light max-w-[360px] mx-auto leading-relaxed">
                                    No dependency connection found between{' '}
                                    <strong className="text-black/55">{from}</strong> and{' '}
                                    <strong className="text-black/55">{to}</strong>.
                                </p>
                                <div
                                    className="mt-5 rounded-xl px-5 py-4 text-left max-w-[360px] mx-auto"
                                    style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}
                                >
                                    <p className="text-[11.5px] font-mono text-black/40 mb-2 uppercase tracking-widest">Possible reasons</p>
                                    <ul className="space-y-1.5 text-[12.5px] text-black/45 font-light">
                                        <li>· Concept names are <strong className="text-black/60">case-sensitive</strong> — try exact casing (e.g. <code className="font-mono text-[11.5px]">Dynamic Programming</code>)</li>
                                        <li>· These concepts may not be linked in the knowledge graph yet</li>
                                        <li>· Try browsing the <a href="/knowledge-graph" className="underline" style={{ color: ORANGE }}>Knowledge Graph</a> to find exact concept names</li>
                                    </ul>
                                </div>
                            </Glass>
                        </motion.div>
                    )}

                    {/* Path result */}
                    {path && path.length > 0 && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.45, ease }}
                        >
                            <Glass className="px-7 py-6">
                                {/* Result header */}
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-1">
                                            Learning Path
                                        </p>
                                        <h2
                                            className="text-[20px] tracking-[-0.02em]"
                                            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                                        >
                                            {from} <span className="text-black/25 mx-1">→</span> {to}
                                        </h2>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[26px] font-bold tracking-tight text-[#0A0A0A]">{hops}</p>
                                        <p className="text-[11px] text-black/35 font-mono">prerequisite steps</p>
                                    </div>
                                </div>

                                {/* Summary chips */}
                                <div className="flex flex-wrap gap-2 mb-6 pb-5 border-b border-black/[0.06]">
                                    {path.map((node, i) => (
                                        <span key={node.id ?? i} className="flex items-center gap-1">
                                            <span
                                                className="text-[12px] px-3 py-1 rounded-full border font-medium"
                                                style={{ ...(() => { const ts = tierStyle(node.tier); return { background: ts.bg, borderColor: ts.border, color: ts.color }; })() }}
                                            >
                                                {node.name}
                                            </span>
                                            {i < path.length - 1 && (
                                                <ChevronRight className="w-3 h-3 text-black/20 shrink-0" />
                                            )}
                                        </span>
                                    ))}
                                </div>

                                {/* Step-by-step */}
                                <div>
                                    {path.map((node, i) => (
                                        <PathNode key={node.id ?? i} node={node} index={i} total={path.length} />
                                    ))}
                                </div>

                                {/* CTA */}
                                <div className="mt-6 pt-5 border-t border-black/[0.06] flex items-center justify-between">
                                    <p className="text-[12.5px] text-black/35 font-light">
                                        Master each concept in order to efficiently reach your goal.
                                    </p>
                                    <a
                                        href="/knowledge-graph"
                                        className="flex items-center gap-1.5 text-[12.5px] text-black/40 hover:text-black/70 transition-colors"
                                    >
                                        <Network className="w-3.5 h-3.5" />
                                        View full graph
                                    </a>
                                </div>
                            </Glass>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tip / empty state */}
                {!path && !noPath && !loading && (
                    <Fade delay={0.16}>
                        <div className="text-center py-6">
                            <p className="text-[12.5px] text-black/30 font-mono tracking-wide">
                                Enter two DSA concepts to find the shortest prerequisite path between them.
                            </p>
                            <p className="text-[11.5px] text-black/25 font-light mt-1">
                                Concept names must match exactly as they appear in your Knowledge Graph.
                            </p>
                            <div className="flex flex-wrap justify-center gap-2 mt-5">
                                {[
                                    ['Recursion', 'Graphs'],
                                    ['Arrays', 'Sorting'],
                                    ['Linked Lists', 'Trees'],
                                    ['Stacks', 'Dynamic Programming'],
                                ].map(([f, t]) => (
                                    <button
                                        key={f + t}
                                        onClick={() => { setFrom(f); setTo(t); }}
                                        className="text-[12px] px-3.5 py-1.5 rounded-full border transition-all duration-150 hover:border-black/20"
                                        style={{ borderColor: 'rgba(0,0,0,0.09)', color: 'rgba(0,0,0,0.45)' }}
                                    >
                                        {f} → {t}
                                    </button>
                                ))}
                            </div>
                            <p className="text-[11px] text-black/25 mt-4 font-mono">
                                Not sure of concept names?{' '}
                                <a href="/knowledge-graph" style={{ color: ORANGE }} className="underline underline-offset-2">
                                    Browse the graph
                                </a>{' '}first.
                            </p>
                        </div>
                    </Fade>
                )}

            </div>
        </div>
    );
}
