import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Award, Target, TrendingUp,
  ArrowRight, BookOpen, Network, Lightbulb, Sparkles, ChevronDown,
  Pencil, X, AlertTriangle, Loader2, Save,
} from 'lucide-react';
import { profileAPI, insightsAPI, graphAPI, problemsAPI, reviewAPI } from '../lib/api';
import { useProfileStore } from '../store/profileStore';
import { useAuthStore } from '../store/authStore';
import LandingBackground from '../components/LandingBackground';
import toast from 'react-hot-toast';

// ─── Design tokens ────────────────────────────────────────────────────────────
const ORANGE = '#F15A24';
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function greeting(name: string): { time: string; first: string } {
  const h = new Date().getHours();
  const time = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  const first = name.split(' ')[0];
  return { time, first };
}

function difficultyStars(d: number) {
  const filled = Math.round(d);
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < filled ? ORANGE : 'rgba(0,0,0,0.15)', fontSize: 12 }}>★</span>
  ));
}

// ─── Glass card wrapper ────────────────────────────────────────────────────────
function Glass({
  children, className = '',
}: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-black/[0.08] ${className}`}
      style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)' }}
    >
      {children}
    </div>
  );
}

// ─── Animated section ─────────────────────────────────────────────────────────
function Fade({
  children, delay = 0, className = '',
}: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Stat pill (expandable) ───────────────────────────────────────────────────
function StatPill({
  icon: Icon, label, value, accent = false, items, chipColor,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent?: boolean;
  items?: string[];
  chipColor?: string;
}) {
  const [open, setOpen] = useState(false);
  const expandable = items && items.length > 0;

  return (
    <Glass className="overflow-hidden">
      <div
        className={`flex items-center gap-4 px-6 py-5 ${expandable ? 'cursor-pointer select-none' : ''}`}
        onClick={() => expandable && setOpen((v) => !v)}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: accent ? `${ORANGE}15` : 'rgba(0,0,0,0.04)' }}
        >
          <Icon
            className="w-5 h-5"
            strokeWidth={1.6}
            style={{ color: accent ? ORANGE : 'rgba(0,0,0,0.45)' }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[22px] font-semibold tracking-tight text-[#0A0A0A] leading-none">
            {value}
          </p>
          <p className="text-[12px] text-black/40 mt-1 font-light">{label}</p>
        </div>
        {expandable && (
          <ChevronDown
            className="w-4 h-4 text-black/25 transition-transform duration-200 shrink-0"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          />
        )}
      </div>

      {expandable && (
        <motion.div
          initial={false}
          animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="overflow-hidden"
        >
          <div className="px-6 pb-5 pt-0 flex flex-wrap gap-1.5 border-t border-black/[0.05] mt-0 pt-3">
            {items!.map((item) => (
              <span
                key={item}
                className="text-[11.5px] px-2.5 py-1 rounded-full"
                style={{
                  background: chipColor ? `${chipColor}12` : 'rgba(0,0,0,0.05)',
                  color: chipColor ?? 'rgba(0,0,0,0.55)',
                  border: `1px solid ${chipColor ? `${chipColor}30` : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                {item}
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </Glass>
  );
}

// ─── Skill bar ────────────────────────────────────────────────────────────────
function SkillBar({ name, level }: { name: string; level: number }) {
  const pct = Math.round(level * 100);
  const color = level >= 0.7 ? '#22c55e' : level >= 0.4 ? '#f59e0b' : ORANGE;
  return (
    <div className="min-w-[140px] max-w-[160px] shrink-0">
      <div className="flex justify-between text-[11px] mb-1.5">
        <span className="text-black/60 font-medium truncate pr-2">{name}</span>
        <span className="text-black/35 font-mono shrink-0">{pct}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-black/[0.07]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.4, duration: 0.8, ease }}
          className="h-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ─── Recommendation card ──────────────────────────────────────────────────────
function RecCard({ rec }: { rec: any }) {
  const isRevisit = rec._type === 'revisit';
  const isConcept = rec._type === 'concept';
  const diff = rec.difficulty ?? 1;
  const label = rec.title ?? rec.name ?? 'Untitled';

  return (
    <Link to="/problems" className="group block">
      <div
        className="rounded-xl border border-black/[0.07] px-5 py-3.5 transition-all duration-200 group-hover:border-black/20 group-hover:shadow-sm"
        style={{ background: 'rgba(255,255,255,0.6)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-medium text-[#0A0A0A] leading-snug truncate">
              {label}
            </p>
            <div className="flex items-center gap-2 mt-1.5">
              {isRevisit && (
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: '#15803d', borderColor: 'rgba(34,197,94,0.30)', background: 'rgba(34,197,94,0.09)' }}
                >
                  Revisit ✓
                </span>
              )}
              {isConcept && rec.tier && (
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: ORANGE, borderColor: `${ORANGE}40`, background: `${ORANGE}10` }}
                >
                  Tier {rec.tier}
                </span>
              )}
              {!isRevisit && (
                <span
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                  style={{ color: 'rgba(0,0,0,0.4)', borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.04)' }}
                >
                  {diff <= 1 ? 'Easy' : diff <= 3 ? 'Medium' : 'Hard'}
                </span>
              )}
              {isRevisit && rec._score != null && (
                <span className="text-[10px] font-mono text-black/30">
                  Last score: {rec._score}/10
                </span>
              )}
              {!isRevisit && <span className="flex gap-0.5">{difficultyStars(diff)}</span>}
            </div>
          </div>
          <ArrowRight
            className="w-3.5 h-3.5 text-black/20 group-hover:text-black/50 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
          />
        </div>
      </div>
    </Link>
  );
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
const EXPERIENCE_OPTIONS = ['beginner', 'intermediate', 'advanced'];
const STYLE_OPTIONS = ['visual', 'verbal', 'example-based', 'conceptual'];

function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: any;
  onClose: () => void;
  onSaved: (updated: any) => void;
}) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    experience_level: profile?.experience_level ?? 'beginner',
    preferred_style: profile?.preferred_style ?? 'visual',
    goal: (profile as any)?.goal ?? '',
    background: (profile as any)?.background ?? '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await profileAPI.update(form);
      onSaved(data);
      toast.success('Profile updated!', { style: { fontSize: '13px', borderRadius: '12px' } });
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.28)', backdropFilter: 'blur(6px)' }}
      />

      {/* Panel */}
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.28, ease }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: 'none' }}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-black/[0.08] shadow-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(30px)',
            pointerEvents: 'auto',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-black/[0.06]">
            <div>
              <p className="text-[10.5px] font-mono uppercase tracking-[0.18em] text-black/30 mb-0.5">
                Profile
              </p>
              <h2
                className="text-[22px] tracking-[-0.025em]"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                Edit your details
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/[0.05] transition-colors"
            >
              <X className="w-4 h-4 text-black/40" />
            </button>
          </div>

          {/* Body */}
          <div className="px-7 py-6 space-y-5">
            {/* Experience level */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-black/35 block mb-2">
                Experience Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {EXPERIENCE_OPTIONS.map((opt) => {
                  const sel = form.experience_level === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setForm((f) => ({ ...f, experience_level: opt }))}
                      className="py-2 rounded-xl text-[12.5px] font-medium capitalize transition-all duration-150"
                      style={{
                        background: sel ? `${ORANGE}10` : 'rgba(0,0,0,0.03)',
                        border: sel ? `1.5px solid ${ORANGE}` : '1.5px solid rgba(0,0,0,0.07)',
                        color: sel ? ORANGE : 'rgba(0,0,0,0.50)',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Learning style */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-black/35 block mb-2">
                Learning Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map((opt) => {
                  const sel = form.preferred_style === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => setForm((f) => ({ ...f, preferred_style: opt }))}
                      className="py-2 px-3 rounded-xl text-[12.5px] font-medium capitalize transition-all duration-150"
                      style={{
                        background: sel ? `${ORANGE}10` : 'rgba(0,0,0,0.03)',
                        border: sel ? `1.5px solid ${ORANGE}` : '1.5px solid rgba(0,0,0,0.07)',
                        color: sel ? ORANGE : 'rgba(0,0,0,0.50)',
                      }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Goal */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-black/35 block mb-2">
                Goal
              </label>
              <input
                type="text"
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
                placeholder="e.g., Crack FAANG interviews by July…"
                className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none transition-all duration-150"
                style={{
                  background: 'rgba(0,0,0,0.025)',
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  color: '#0A0A0A',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.20)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.07)')}
              />
            </div>

            {/* Background */}
            <div>
              <label className="text-[11px] font-mono uppercase tracking-widest text-black/35 block mb-2">
                Background
              </label>
              <textarea
                value={form.background}
                onChange={(e) => setForm((f) => ({ ...f, background: e.target.value }))}
                placeholder="e.g., CS sophomore, comfortable with Python basics…"
                rows={3}
                className="w-full px-4 py-3 rounded-xl text-[13.5px] outline-none resize-none transition-all duration-150"
                style={{
                  background: 'rgba(0,0,0,0.025)',
                  border: '1.5px solid rgba(0,0,0,0.07)',
                  color: '#0A0A0A',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.20)')}
                onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.07)')}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-7 pb-6 flex items-center justify-between border-t border-black/[0.05] pt-5">
            <button
              onClick={() => { onClose(); navigate('/onboarding'); }}
              className="text-[12.5px] text-black/35 hover:text-black/60 transition-colors duration-150 underline underline-offset-2"
            >
              Redo full onboarding →
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-full text-[13px] font-medium text-black/45 hover:text-black/70 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-medium text-white transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-70"
                style={{ background: '#0A0A0A' }}
              >
                {saving ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Save changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Onboarding Incomplete Banner ─────────────────────────────────────────────
function OnboardingBanner({ onEditClick }: { onEditClick: () => void }) {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      className="rounded-2xl border overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${ORANGE}08, ${ORANGE}04)`,
        borderColor: `${ORANGE}30`,
      }}
    >
      <div className="flex items-center gap-4 px-6 py-4">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${ORANGE}15` }}
        >
          <AlertTriangle className="w-4 h-4" style={{ color: ORANGE }} strokeWidth={1.8} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-medium text-[#0A0A0A] leading-snug">
            Your profile setup is incomplete
          </p>
          <p className="text-[12px] text-black/45 mt-0.5 font-light">
            Complete onboarding so Perspectra can personalize your learning path.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onEditClick}
            className="text-[12.5px] font-medium px-4 py-2 rounded-full border transition-all duration-200 hover:bg-black/[0.04]"
            style={{ borderColor: 'rgba(0,0,0,0.12)', color: 'rgba(0,0,0,0.60)' }}
          >
            Edit manually
          </button>
          <button
            onClick={() => navigate('/onboarding')}
            className="flex items-center gap-1.5 text-[12.5px] font-medium px-4 py-2 rounded-full text-white transition-all duration-200 hover:shadow-md"
            style={{ background: ORANGE }}
          >
            Complete setup
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/[0.05] transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5 text-black/30" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const { profile, setProfile } = useProfileStore();
  const [insights, setInsights] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profileRes, insightsRes, recsRes, problemsRes, reviewsRes] = await Promise.all([
        profileAPI.getMe(),
        insightsAPI.getMe().catch(() => ({ data: null })),
        graphAPI.getRecommendations().catch(() => ({ data: { recommendations: [] } })),
        problemsAPI.list().catch(() => ({ data: { problems: [] } })),
        reviewAPI.history(8).catch(() => ({ data: { reviews: [] } })),
      ]);
      setProfile(profileRes.data);
      setInsights(insightsRes.data?.insights);
      const fetchedReviews: any[] = reviewsRes.data.reviews ?? [];
      setReviews(fetchedReviews);

      // Only show problems the user has NOT solved yet
      const solvedIds = new Set(fetchedReviews.map((r: any) => r.problem_id));

      // Graph recs: filter out already-solved concept nodes
      const graphRecs = (recsRes.data.recommendations ?? []).map((r: any) => ({ ...r, _type: 'concept' }));
      const unseenGraphRecs = graphRecs.filter((r: any) => !solvedIds.has(r.id));

      // Unsolved problems from DB
      const allProblems: any[] = problemsRes.data.problems ?? [];
      const unseenProblems = allProblems
        .filter((p: any) => !solvedIds.has(p.id))
        .slice(0, 3)
        .map((p: any) => ({ ...p, _type: 'problem' }));

      if (unseenGraphRecs.length > 0) {
        setRecommendations(unseenGraphRecs.slice(0, 3));
      } else {
        setRecommendations(unseenProblems.slice(0, 3));
      }
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}
      >
        <LandingBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <span
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: `${ORANGE}40`, borderTopColor: ORANGE }}
          />
          <p className="text-[13px] text-black/35 font-light">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const { time, first } = greeting(user?.name || 'there');
  const skills = profile?.skills ? Object.entries(profile.skills)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 8) : [];
  const levelLabel = (profile?.experience_level ?? 'beginner').charAt(0).toUpperCase() +
    (profile?.experience_level ?? 'beginner').slice(1);
  const onboardingDone = (profile as any)?.onboarding_complete === true;

  return (
    <div
      className="relative min-h-screen"
      style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif", color: '#0A0A0A' }}
    >
      <LandingBackground />

      {/* Edit Profile Modal */}
      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onSaved={(updated) => setProfile(updated)}
        />
      )}

      <div className="relative z-10 max-w-[1160px] mx-auto px-6 py-10 space-y-8">

        {/* ── Onboarding incomplete banner ───────────────────────────────────── */}
        {!onboardingDone && (
          <Fade delay={0}>
            <OnboardingBanner onEditClick={() => setEditOpen(true)} />
          </Fade>
        )}

        {/* ── Greeting header ───────────────────────────────────────────────── */}
        <Fade delay={!onboardingDone ? 0.06 : 0}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-mono tracking-[0.18em] uppercase text-black/30 mb-2">
                Dashboard
              </p>
              <h1
                className="leading-tight tracking-[-0.03em]"
                style={{
                  fontFamily: "'Instrument Serif', Georgia, serif",
                  fontSize: 'clamp(30px, 4vw, 46px)',
                }}
              >
                {time},{' '}
                <span style={{ color: ORANGE, fontStyle: 'italic' }}>{first}.</span>
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="text-[11px] font-mono px-3 py-1 rounded-full border"
                  style={{
                    color: ORANGE,
                    borderColor: `${ORANGE}35`,
                    background: `${ORANGE}0D`,
                  }}
                >
                  {levelLabel}
                </span>
                <span className="text-[12px] text-black/30 font-light">
                  {profile?.submissions_count ?? 0} problems solved
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Edit profile button */}
              <button
                onClick={() => setEditOpen(true)}
                title="Edit profile"
                className="group inline-flex items-center gap-1.5 text-[13px] font-medium px-4 py-2.5 rounded-full transition-all duration-200 hover:bg-black/[0.05] border border-black/[0.08]"
                style={{ color: 'rgba(0,0,0,0.55)' }}
              >
                <Pencil className="w-3.5 h-3.5 group-hover:text-black/80 transition-colors" />
                <span>Edit profile</span>
              </button>

              <Link
                to="/problems"
                className="group inline-flex items-center gap-2 text-[13.5px] font-medium px-5 py-2.5 rounded-full text-white transition-all duration-200 hover:shadow-md hover:-translate-y-[1px]"
                style={{ backgroundColor: '#0A0A0A' }}
              >
                <BookOpen className="w-4 h-4" />
                Browse problems
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </Fade>

        {/* ── Stat pills ────────────────────────────────────────────────────── */}
        <Fade delay={0.08}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatPill
              icon={CheckCircle}
              label="Problems solved"
              value={profile?.submissions_count ?? 0}
              accent
            />
            <StatPill
              icon={Award}
              label="Strengths"
              value={profile?.strengths?.length ?? 0}
              items={profile?.strengths}
              chipColor="#22c55e"
            />
            <StatPill
              icon={Target}
              label="Gaps to close"
              value={profile?.gaps?.length ?? 0}
              items={profile?.gaps}
              chipColor={ORANGE}
            />
            <StatPill
              icon={TrendingUp}
              label="Experience level"
              value={levelLabel}
            />
          </div>
        </Fade>

        {/* ── Skills heatmap ────────────────────────────────────────────────── */}
        {skills.length > 0 && (
          <Fade delay={0.15}>
            <Glass className="px-7 py-6">
              <div className="flex items-center justify-between mb-5">
                <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-black/35">
                  Skill map
                </p>
                <Link
                  to="/knowledge-graph"
                  className="flex items-center gap-1 text-[12px] text-black/35 hover:text-black/60 transition-colors duration-150"
                >
                  <Network className="w-3.5 h-3.5" />
                  View full graph
                </Link>
              </div>
              <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
                {skills.map(([name, level]) => (
                  <SkillBar key={name} name={name} level={level as number} />
                ))}
              </div>
            </Glass>
          </Fade>
        )}

        {/* ── Two-column: Next Up + Insights ────────────────────────────────── */}
        <div className="grid lg:grid-cols-[3fr_2fr] gap-6">

          {/* Next Up */}
          <Fade delay={0.22}>
            <Glass className="px-7 py-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-black/35 mb-1">
                    Next up
                  </p>
                  <h2
                    className="text-[18px] tracking-[-0.02em]"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    Recommended for you
                  </h2>
                </div>
                <Sparkles className="w-4 h-4 text-black/20" strokeWidth={1.5} />
              </div>

              {recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.slice(0, 3).map((rec: any) => (
                    <RecCard key={rec.id} rec={rec} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: `${ORANGE}12` }}
                  >
                    <Sparkles className="w-5 h-5" style={{ color: ORANGE }} />
                  </div>
                  <p className="text-[13px] text-black/40 font-light max-w-[220px] leading-relaxed">
                    Solve a few problems to unlock personalised picks.
                  </p>
                  <Link
                    to="/problems"
                    className="mt-4 text-[13px] font-medium transition-colors duration-150"
                    style={{ color: ORANGE }}
                  >
                    Browse all problems →
                  </Link>
                </div>
              )}
            </Glass>
          </Fade>

          {/* Insights */}
          <Fade delay={0.28}>
            <Glass className="px-7 py-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-black/35 mb-1">
                    AI insights
                  </p>
                  <h2
                    className="text-[18px] tracking-[-0.02em]"
                    style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                  >
                    Learning signals
                  </h2>
                </div>
                <Lightbulb className="w-4 h-4 text-black/20" strokeWidth={1.5} />
              </div>

              {insights ? (
                <div className="space-y-5">
                  {/* Summary */}
                  {insights.summary && (
                    <p className="text-[13.5px] text-black/55 font-light leading-[1.75]">
                      {insights.summary}
                    </p>
                  )}

                  {/* Improving */}
                  {insights.improving_concepts?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-2">
                        Improving
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {insights.improving_concepts.map((c: string) => (
                          <span
                            key={c}
                            className="text-[12px] px-2.5 py-1 rounded-full"
                            style={{
                              background: 'rgba(34,197,94,0.10)',
                              color: '#16a34a',
                              border: '1px solid rgba(34,197,94,0.20)',
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Focus areas */}
                  {insights.recommended_focus?.length > 0 && (
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-2">
                        Focus areas
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {insights.recommended_focus.map((c: string) => (
                          <span
                            key={c}
                            className="text-[12px] px-2.5 py-1 rounded-full"
                            style={{
                              background: `${ORANGE}10`,
                              color: '#b83010',
                              border: `1px solid ${ORANGE}30`,
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Motivational note */}
                  {insights.motivational_note && (
                    <div
                      className="rounded-xl px-4 py-3 text-[13px] leading-relaxed font-light"
                      style={{
                        background: 'rgba(245,158,11,0.07)',
                        border: '1px solid rgba(245,158,11,0.20)',
                        color: '#92400e',
                      }}
                    >
                      <span className="mr-1.5">✦</span>
                      {insights.motivational_note}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(245,158,11,0.10)' }}
                  >
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-[13px] text-black/40 font-light max-w-[220px] leading-relaxed">
                    Solve{' '}
                    <span className="font-medium text-black/60">5 problems</span>{' '}
                    to unlock AI‑powered insights about your learning journey.
                  </p>
                </div>
              )}
            </Glass>
          </Fade>

        </div>

        {/* ── Recently Solved ───────────────────────────────────────────────── */}
        <Fade delay={0.36}>
          <Glass className="px-7 py-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-mono tracking-[0.16em] uppercase text-black/35 mb-1">Recently Solved</p>
                <h2
                  className="text-[18px] tracking-[-0.02em]"
                  style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                >
                  Problems solved
                </h2>
              </div>
              <CheckCircle className="w-4 h-4 text-black/20" strokeWidth={1.5} />
            </div>

            {reviews.length > 0 ? (
              <div className="divide-y divide-black/[0.05]">
                {reviews.map((r: any, i: number) => {
                  const score = r.score ?? 0;
                  const scoreColor = score >= 8 ? '#22c55e' : score >= 5 ? '#f59e0b' : ORANGE;
                  const date = r.created_at
                    ? new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : '—';
                  return (
                    <div key={i} className="flex items-center gap-4 py-3.5">
                      {/* Score badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
                        style={{ background: scoreColor }}
                      >
                        {score / 10}/10
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13.5px] font-medium text-[#0A0A0A] truncate">
                          {r.problem_title ?? r.problem_id}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
                            style={{ color: 'rgba(0,0,0,0.40)', borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.04)' }}
                          >
                            {r.language ?? 'python'}
                          </span>
                          {r.concept_gaps?.slice(0, 3).map((g: string) => (
                            <span
                              key={g}
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: `${ORANGE}10`, color: '#b83010', border: `1px solid ${ORANGE}25` }}
                            >
                              {g}
                            </span>
                          ))}
                          {r.concept_gaps?.length > 3 && (
                            <span className="text-[10px] text-black/30 font-mono">+{r.concept_gaps.length - 3} gaps</span>
                          )}
                        </div>
                      </div>

                      {/* Date */}
                      <span className="text-[11px] font-mono text-black/25 shrink-0">{date}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${ORANGE}12` }}
                >
                  <CheckCircle className="w-5 h-5" style={{ color: ORANGE }} />
                </div>
                <p className="text-[13px] text-black/40 font-light max-w-[240px] leading-relaxed">
                  No problems solved yet.{' '}
                  <Link to="/problems" style={{ color: ORANGE }} className="font-medium">Start solving →</Link>
                </p>
              </div>
            )}
          </Glass>
        </Fade>

        {/* ── Profile details strip ─────────────────────────────────────────── */}
        <Fade delay={0.42}>
          <div className="grid md:grid-cols-3 gap-4 pb-2">

            {/* Learning style */}
            <Glass className="px-6 py-5">
              <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-2">Learning style</p>
              <p
                className="text-[20px] font-semibold tracking-tight capitalize leading-tight"
                style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              >
                {(profile as any)?.thinking_style && (profile as any).thinking_style !== 'unknown'
                  ? (profile as any).thinking_style
                  : profile?.preferred_style ?? '—'}
              </p>
              <p className="text-[12px] text-black/35 mt-2 font-light capitalize">
                {levelLabel} level
              </p>
              {(profile as any)?.goal && (
                <p className="text-[11.5px] text-black/40 mt-1 font-light leading-snug">
                  {(profile as any).goal}
                </p>
              )}
            </Glass>

            {/* Mistake patterns */}
            <Glass className="px-6 py-5">
              <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-3">Mistake patterns</p>
              {(profile?.mistake_patterns?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile!.mistake_patterns.slice(0, 5).map((p: string) => (
                    <span
                      key={p}
                      className="text-[11px] px-2.5 py-1 rounded-full"
                      style={{ background: `${ORANGE}10`, color: '#b83010', border: `1px solid ${ORANGE}25` }}
                    >
                      {p}
                    </span>
                  ))}
                  {(profile!.mistake_patterns.length ?? 0) > 5 && (
                    <span className="text-[11px] text-black/30 font-mono self-center">
                      +{profile!.mistake_patterns.length - 5} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-black/35 font-light">No patterns detected yet.</p>
              )}
            </Glass>

            {/* Known concepts */}
            <Glass className="px-6 py-5">
              <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-3">Known concepts</p>
              {(profile?.known_concepts?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {profile!.known_concepts!.slice(0, 6).map((c: string) => (
                    <span
                      key={c}
                      className="text-[11px] px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.09)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}
                    >
                      {c}
                    </span>
                  ))}
                  {(profile!.known_concepts!.length ?? 0) > 6 && (
                    <span className="text-[11px] text-black/30 font-mono self-center">
                      +{profile!.known_concepts!.length - 6} more
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-[13px] text-black/35 font-light">Solve problems to map your knowledge.</p>
              )}
            </Glass>

          </div>
        </Fade>

        {/* ── Footer nudge ──────────────────────────────────────────────────── */}
        <Fade delay={0.48}>
          <p className="text-center text-[11px] font-mono text-black/20 tracking-widest uppercase pb-4">
            Perspectra · AI that learns how you think.
          </p>
        </Fade>

      </div>
    </div>
  );
}
