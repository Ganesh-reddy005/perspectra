import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { graphAPI } from '../lib/api';
import { Search, ZoomIn, ZoomOut, Maximize2, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Design tokens ──────────────────────────────────────────────────────────
const ORANGE = '#F15A24';
const BG = '#0D0D0F';

// ─── Types ──────────────────────────────────────────────────────────────────
interface GNode {
  id: string;
  name: string;
  tier: number;
  difficulty: number;
  status?: string;
  skill_level?: number;
  x: number;
  y: number;
}
interface GEdge { source: string; target: string; }

// ─── Palette ────────────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  mastered: '#22c55e',
  learning: '#f59e0b',
  gap: ORANGE,
  untouched: '#3a3a3a',
};
const STATUS_GLOW: Record<string, string> = {
  mastered: '#22c55e40',
  learning: '#f59e0b40',
  gap: `${ORANGE}40`,
};
const TIER_LABELS = ['', 'Foundations', 'Core DS', 'Non-Linear DS', 'Core Algorithms', 'Advanced'];
const TIER_RADII = [0, 0, 200, 360, 510, 650]; // ring radius per tier (tier 1 = centre cluster)

function nodeColor(n: GNode) { return STATUS_COLOR[n.status ?? 'untouched'] ?? '#3a3a3a'; }
function nodeR(tier: number) { return Math.max(18, 34 - (tier - 1) * 3); }

// ─── Layout: concentric rings per tier ──────────────────────────────────────
function layoutNodes(rawNodes: Omit<GNode, 'x' | 'y'>[]): GNode[] {
  const byTier: Record<number, typeof rawNodes> = {};
  for (const n of rawNodes) {
    (byTier[n.tier] ??= []).push(n);
  }
  const result: GNode[] = [];
  for (const [tierStr, nodes] of Object.entries(byTier)) {
    const tier = Number(tierStr);
    const r = TIER_RADII[tier] ?? (tier * 160);
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      result.push({
        ...n,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    });
  }
  return result;
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GNode[]>([]);
  const [edges, setEdges] = useState<GEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GNode | null>(null);
  const [hovered, setHovered] = useState<GNode | null>(null);
  const [search, setSearch] = useState('');

  // Camera: pan + zoom via SVG transform
  const [cam, setCam] = useState({ x: 0, y: 0, scale: 1 });
  const camRef = useRef(cam);
  camRef.current = cam;

  // Pan state
  const panning = useRef(false);
  const panStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });

  // ── Load data ─────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { data } = await graphAPI.getStudentGraph();
        const raw = (data.nodes ?? []) as Omit<GNode, 'x' | 'y'>[];
        setNodes(layoutNodes(raw));
        setEdges(data.edges ?? []);
      } catch {
        toast.error('Failed to load knowledge graph');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Center camera on load
  useEffect(() => {
    if (!loading && svgRef.current) {
      const { width, height } = svgRef.current.getBoundingClientRect();
      setCam({ x: width / 2, y: height / 2, scale: 1 });
    }
  }, [loading]);

  // ── Zoom ──────────────────────────────────────────────────────────────────
  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.9;
    const rect = svgRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setCam(c => {
      const newScale = Math.min(5, Math.max(0.2, c.scale * factor));
      return {
        x: mx - (mx - c.x) * (newScale / c.scale),
        y: my - (my - c.y) * (newScale / c.scale),
        scale: newScale,
      };
    });
  }, []);

  const zoomIn = () => setCam(c => ({ ...c, scale: Math.min(5, c.scale * 1.25) }));
  const zoomOut = () => setCam(c => ({ ...c, scale: Math.max(0.2, c.scale / 1.25) }));
  const reset = () => {
    if (!svgRef.current) return;
    const { width, height } = svgRef.current.getBoundingClientRect();
    setCam({ x: width / 2, y: height / 2, scale: 1 });
  };

  // ── Pan ───────────────────────────────────────────────────────────────────
  const onSvgMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if ((e.target as SVGElement).closest('[data-node]')) return;
    panning.current = true;
    panStart.current = { mx: e.clientX, my: e.clientY, cx: camRef.current.x, cy: camRef.current.y };
  };
  const onSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!panning.current) return;
    setCam(c => ({
      ...c,
      x: panStart.current.cx + (e.clientX - panStart.current.mx),
      y: panStart.current.cy + (e.clientY - panStart.current.my),
    }));
  };
  const onSvgMouseUp = () => { panning.current = false; };

  // ── Search ────────────────────────────────────────────────────────────────
  const searchLower = search.toLowerCase();
  const matchSet = new Set(searchLower ? nodes.filter(n => n.name.toLowerCase().includes(searchLower)).map(n => n.id) : []);
  const hasSearch = searchLower.length > 0;

  // ── Edge visibility helpers ───────────────────────────────────────────────
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  // ── Selected node computed data ───────────────────────────────────────────
  // Edge semantics: (source)-[:DEPENDS_ON]->(target)
  //   • selected's prerequisites = edges where source === selected.id → targets are prereqs
  //   • concepts unlocked by selected = edges where target === selected.id → sources need selected first
  const prereqNodes = selected
    ? edges.filter(e => e.source === selected.id).map(e => nodeMap.get(e.target)).filter(Boolean) as GNode[]
    : [];
  const unlocksNodes = selected
    ? edges.filter(e => e.target === selected.id).map(e => nodeMap.get(e.source)).filter(Boolean) as GNode[]
    : [];

  // ─── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: BG }}>
        <div className="flex flex-col items-center gap-4">
          <span className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: 'rgba(241,90,36,0.25)', borderTopColor: ORANGE }} />
          <p className="text-[13px] font-mono text-white/30">Mapping your knowledge…</p>
        </div>
      </div>
    );
  }

  // ─── Empty state ──────────────────────────────────────────────────────────
  if (nodes.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: BG }}>
        <div className="flex flex-col items-center gap-3 text-center max-w-xs">
          <Info className="w-8 h-8 text-white/20" />
          <p className="text-[15px] text-white/50">No concepts in the graph yet.</p>
          <p className="text-[12px] font-mono text-white/25">Solve some problems to populate your knowledge map.</p>
        </div>
      </div>
    );
  }


  return (
    <div
      className="fixed inset-0 overflow-hidden select-none"
      style={{ background: BG, fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── SVG Canvas ───────────────────────────────────────────────────── */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: panning.current ? 'grabbing' : 'grab' }}
        onWheel={handleWheel}
        onMouseDown={onSvgMouseDown}
        onMouseMove={onSvgMouseMove}
        onMouseUp={onSvgMouseUp}
        onMouseLeave={onSvgMouseUp}
      >
        <defs>
          {/* Glow filters per status */}
          {Object.entries(STATUS_GLOW).map(([status, color]) => (
            <filter key={status} id={`glow-${status}`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feColorMatrix in="blur" type="matrix"
                values={`0 0 0 0 ${parseInt(color.slice(1, 3), 16) / 255}  0 0 0 0 ${parseInt(color.slice(3, 5), 16) / 255}  0 0 0 0 ${parseInt(color.slice(5, 7), 16) / 255}  0 0 0 1 0`}
                result="coloredBlur"
              />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
          <filter id="glow-selected" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Arrowhead marker */}
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="rgba(255,255,255,0.18)" />
          </marker>
          <marker id="arrow-active" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill={ORANGE} />
          </marker>
        </defs>

        {/* World transform group */}
        <g transform={`translate(${cam.x},${cam.y}) scale(${cam.scale})`}>

          {/* Tier ring guides (subtle) */}
          {[2, 3, 4, 5].map(tier => (
            <circle
              key={tier}
              cx={0} cy={0}
              r={TIER_RADII[tier]}
              fill="none"
              stroke="rgba(255,255,255,0.035)"
              strokeWidth={1}
              strokeDasharray="4 8"
            />
          ))}

          {/* Tier labels */}
          {[2, 3, 4, 5].map(tier => (
            <text
              key={`lbl-${tier}`}
              x={0}
              y={-(TIER_RADII[tier] + 12)}
              textAnchor="middle"
              fill="rgba(255,255,255,0.15)"
              fontSize={10}
              fontFamily="'Inter', sans-serif"
              letterSpacing={2}
              style={{ textTransform: 'uppercase', pointerEvents: 'none' }}
            >
              {TIER_LABELS[tier]}
            </text>
          ))}

          {/* Edges — drawn from TARGET (prerequisite) → SOURCE (dependent)
              so arrows point in the learning direction: prereq → concept  */}
          {edges.map((e, i) => {
            // s = source node (the concept that has a dependency)
            // t = target node (the prerequisite)
            const s = nodeMap.get(e.source);
            const t = nodeMap.get(e.target);
            if (!s || !t) return null;

            const isActive = selected && (selected.id === e.source || selected.id === e.target);
            const isDimmed = hasSearch && !matchSet.has(e.source) && !matchSet.has(e.target);

            // Draw from t (prereq) → s (dependent) so arrow points toward s
            const dx = s.x - t.x, dy = s.y - t.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            const tr = nodeR(t.tier), sr = nodeR(s.tier);
            const x1 = t.x + (dx / len) * tr;           // start: edge of prereq node
            const y1 = t.y + (dy / len) * tr;
            const x2 = s.x - (dx / len) * (sr + 6);    // end: just before dependent node (arrowhead gap)
            const y2 = s.y - (dy / len) * (sr + 6);

            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isActive ? ORANGE : 'rgba(255,255,255,0.12)'}
                strokeWidth={isActive ? 2 : 1.2}
                strokeOpacity={isDimmed ? 0.08 : 1}
                markerEnd={isActive ? 'url(#arrow-active)' : 'url(#arrow)'}
                style={{ transition: 'stroke 0.2s, stroke-opacity 0.2s' }}
              />
            );
          })}

          {/* Nodes */}
          {nodes.map(n => {
            const color = nodeColor(n);
            const r = nodeR(n.tier);
            const isSel = selected?.id === n.id;
            const isHov = hovered?.id === n.id;
            const isMatch = matchSet.has(n.id);
            const isDimmed = hasSearch && !isMatch;
            const glowFilter = isSel ? 'url(#glow-selected)' : STATUS_GLOW[n.status ?? ''] ? `url(#glow-${n.status})` : undefined;

            return (
              <g
                key={n.id}
                data-node="1"
                transform={`translate(${n.x},${n.y})`}
                style={{ cursor: 'pointer', opacity: isDimmed ? 0.15 : 1, transition: 'opacity 0.25s' }}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => setSelected(prev => prev?.id === n.id ? null : n)}
              >
                {/* Outer glow ring for selected / matched */}
                {(isSel || isMatch) && (
                  <circle
                    r={r + (isSel ? 12 : 8)}
                    fill="none"
                    stroke={isSel ? 'rgba(255,255,255,0.18)' : `${ORANGE}60`}
                    strokeWidth={isSel ? 2 : 1.5}
                    style={{ animation: isSel ? 'pulse-ring 2s ease-in-out infinite' : 'none' }}
                  />
                )}

                {/* Node circle */}
                <circle
                  r={r}
                  fill={color}
                  fillOpacity={isDimmed ? 0.3 : 1}
                  stroke={isSel ? '#fff' : isHov ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'}
                  strokeWidth={isSel ? 2.5 : isHov ? 2 : 1.2}
                  filter={!isDimmed ? glowFilter : undefined}
                  style={{ transition: 'stroke 0.15s, stroke-width 0.15s' }}
                />

                {/* Skill arc */}
                {n.skill_level && n.skill_level > 0 && (
                  <circle
                    r={r - 4}
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth={2.5}
                    strokeDasharray={`${(r - 4) * 2 * Math.PI * n.skill_level} 9999`}
                    strokeLinecap="round"
                    transform={`rotate(-90)`}
                  />
                )}

                {/* Label */}
                {(() => {
                  const words = n.name.split(' ');
                  const fs = Math.max(8, Math.min(10, r * 0.32));
                  if (words.length === 1 || r < 24) {
                    const label = n.name.length > 10 ? n.name.slice(0, 9) + '…' : n.name;
                    return (
                      <text textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.9)"
                        fontSize={fs} fontFamily="'Inter',sans-serif" style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {label}
                      </text>
                    );
                  }
                  return (
                    <>
                      <text textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.9)"
                        fontSize={fs} fontFamily="'Inter',sans-serif" dy={-fs * 0.65} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {words[0]}
                      </text>
                      <text textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.9)"
                        fontSize={fs} fontFamily="'Inter',sans-serif" dy={fs * 0.65} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                        {words.slice(1).join(' ').slice(0, 12)}
                      </text>
                    </>
                  );
                })()}
              </g>
            );
          })}
        </g>
      </svg>

      {/* ── Top controls ──────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-10 flex items-center gap-3 px-5 py-3"
        style={{ background: 'linear-gradient(to bottom, rgba(13,13,15,0.92) 55%, transparent)' }}
      >
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" strokeWidth={1.6} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search concepts…"
            className="w-full pl-9 pr-3 py-2 text-[12.5px] rounded-xl outline-none text-white/80 caret-orange-400 placeholder-white/20"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          />
        </div>

        <div className="flex-1" />

        {/* Zoom buttons */}
        <div className="flex items-center gap-1.5">
          {([
            { icon: <ZoomIn className="w-3.5 h-3.5" />, fn: zoomIn, tip: 'Zoom in' },
            { icon: <Maximize2 className="w-3.5 h-3.5" />, fn: reset, tip: 'Reset view' },
            { icon: <ZoomOut className="w-3.5 h-3.5" />, fn: zoomOut, tip: 'Zoom out' },
          ] as const).map((btn, i) => (
            <button
              key={i}
              onClick={btn.fn}
              title={btn.tip}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.07] transition-colors duration-150"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>

      {/* ── Legend ────────────────────────────────────────────────────────── */}
      <div
        className="absolute bottom-6 left-6 z-10 flex items-center gap-4 px-4 py-2.5 rounded-xl"
        style={{ background: 'rgba(13,13,15,0.85)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
      >
        {[
          { label: 'Mastered', color: '#22c55e' },
          { label: 'Learning', color: '#f59e0b' },
          { label: 'Gap', color: ORANGE },
          { label: 'New', color: '#3a3a3a' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            <span className="text-[11px] font-mono text-white/40">{label}</span>
          </div>
        ))}
      </div>

      {/* ── Node count ────────────────────────────────────────────────────── */}
      <div className="absolute bottom-6 right-6 z-10 text-right pointer-events-none">
        <p className="text-[11px] font-mono text-white/20">{nodes.length} concepts · {edges.length} connections</p>
        <p className="text-[10px] font-mono text-white/12 mt-0.5">Scroll to zoom · Drag to pan</p>
      </div>

      {/* ── Hover tooltip ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {hovered && !selected && (
          <motion.div
            key={hovered.id + '-tip'}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute z-20 pointer-events-none px-3 py-1.5 rounded-lg text-[12px] font-mono text-white/80"
            style={{
              background: 'rgba(18,18,22,0.92)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(8px)',
              left: 24, bottom: 80,
            }}
          >
            {hovered.name}
            <span className="ml-2 text-white/30">T{hovered.tier}</span>
            {hovered.status && (
              <span className="ml-2" style={{ color: nodeColor(hovered) }}>· {hovered.status}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Selected node sidebar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-16 right-5 z-20 w-72 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(18,18,22,0.94)',
              border: '1px solid rgba(255,255,255,0.10)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-white/[0.07]">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-1">
                    Tier {selected.tier} · {TIER_LABELS[selected.tier] ?? ''}
                  </p>
                  <h2
                    className="text-[18px] text-white/90 leading-snug tracking-tight"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    {selected.name}
                  </h2>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="mt-1 w-7 h-7 flex items-center justify-center rounded-full text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-colors duration-150 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status chip */}
              <div className="mt-3">
                <span
                  className="inline-flex items-center text-[11px] font-mono px-2.5 py-1 rounded-full capitalize"
                  style={{
                    background: `${nodeColor(selected)}18`,
                    color: nodeColor(selected),
                    border: `1px solid ${nodeColor(selected)}40`,
                  }}
                >
                  {selected.status ?? 'New'}
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Difficulty */}
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">Difficulty</p>
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full"
                      style={{ background: i < selected.difficulty ? nodeColor(selected) : 'rgba(255,255,255,0.10)' }}
                    />
                  ))}
                </div>
              </div>

              {/* Skill level */}
              {selected.skill_level !== undefined && selected.skill_level > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/25">Skill level</p>
                    <p className="text-[11px] font-mono text-white/50">{Math.round(selected.skill_level * 100)}%</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: nodeColor(selected) }}
                      initial={{ width: 0 }}
                      animate={{ width: `${selected.skill_level * 100}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              )}

              {/* Prerequisites */}
              {prereqNodes.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">
                    Requires ({prereqNodes.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {prereqNodes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setSelected(n)}
                        className="text-[11px] font-mono px-2 py-1 rounded-lg transition-colors duration-150 hover:opacity-80"
                        style={{
                          background: `${nodeColor(n)}15`,
                          color: nodeColor(n),
                          border: `1px solid ${nodeColor(n)}30`,
                        }}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unlocks */}
              {unlocksNodes.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-white/25 mb-2">
                    Unlocks ({unlocksNodes.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {unlocksNodes.map(n => (
                      <button
                        key={n.id}
                        onClick={() => setSelected(n)}
                        className="text-[11px] font-mono px-2 py-1 rounded-lg transition-colors duration-150 hover:opacity-80"
                        style={{
                          background: `${nodeColor(n)}15`,
                          color: nodeColor(n),
                          border: `1px solid ${nodeColor(n)}30`,
                        }}
                      >
                        {n.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {prereqNodes.length === 0 && unlocksNodes.length === 0 && (
                <p className="text-[11px] font-mono text-white/20 text-center py-2">No direct connections</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50%       { opacity: 0.2; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
