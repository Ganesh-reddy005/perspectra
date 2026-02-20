import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Editor, { useMonaco } from '@monaco-editor/react';
import {
  ChevronLeft, Lightbulb, Send, CheckCircle2,
  AlertCircle, RotateCcw, ChevronDown, Loader2,
} from 'lucide-react';
import { problemsAPI, reviewAPI, tutorAPI } from '../lib/api';
import LandingBackground from '../components/LandingBackground';
import toast from 'react-hot-toast';

// ─── Design tokens ────────────────────────────────────────────────────────────
const ORANGE = '#F15A24';
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  constraints: string[];
}

const DIFF_LABELS: Record<number, string> = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', 5: 'Master' };
const DIFF_STYLES: Record<number, { color: string; bg: string; border: string }> = {
  1: { color: '#15803d', bg: 'rgba(34,197,94,0.09)', border: 'rgba(34,197,94,0.22)' },
  2: { color: '#92400e', bg: 'rgba(245,158,11,0.09)', border: 'rgba(245,158,11,0.28)' },
  3: { color: '#b83010', bg: `${ORANGE}12`, border: `${ORANGE}35` },
  4: { color: '#7c3aed', bg: 'rgba(124,58,237,0.09)', border: 'rgba(124,58,237,0.28)' },
  5: { color: '#be123c', bg: 'rgba(190,18,60,0.09)', border: 'rgba(190,18,60,0.28)' },
};

const LANGUAGES = [
  { id: 'python', label: 'Python', monaco: 'python' },
  { id: 'javascript', label: 'JavaScript', monaco: 'javascript' },
  { id: 'java', label: 'Java', monaco: 'java' },
];

function defaultCode(title: string, lang: string) {
  if (lang === 'python')
    return `# ${title}\n# Write your solution here\n\ndef solution():\n    pass\n`;
  if (lang === 'javascript')
    return `// ${title}\n// Write your solution here\n\nfunction solution() {\n  // your code\n}\n`;
  return `// ${title}\nimport java.util.*;\n\nclass Solution {\n    public void solve() {\n        // your code\n    }\n}\n`;
}

// ─── Glass wrapper ────────────────────────────────────────────────────────────
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

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  // Use the raw 0-100 score for the ring percentage
  const pct = score;
  // Convert the 0-100 score down to a 0-10 scale for the text display
  const displayScore = score / 10;

  // Adjust the color thresholds to match the 0-100 scale
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#f59e0b' : ORANGE;

  const r = 28, circ = 2 * Math.PI * r;

  return (
    <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 -rotate-90" width="80" height="80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke={color} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        />
      </svg>
      <div className="text-center z-10">
        <p className="text-[18px] font-bold leading-none" style={{ color }}>
          {displayScore}
        </p>
        <p className="text-[9px] text-black/30 font-mono">/10</p>
      </div>
    </div>
  );
}

// ─── Expandable section ───────────────────────────────────────────────────────
function Accordion({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-[11px] font-mono uppercase tracking-widest text-black/35">{label}</span>
        <ChevronDown
          className="w-3.5 h-3.5 text-black/25 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Per-language syntax validators ──────────────────────────────────────────
// Monaco only gives rich diagnostics for JS/TS; for Python & Java we add
// lightweight client-side structural checks as a fast first gate.

function checkPython(code: string): string[] {
  const errors: string[] = [];
  const lines = code.split('\n');

  // Bracket/paren/bracket balance
  let round = 0, square = 0, curly = 0;
  lines.forEach((line, i) => {
    const inStr = /(['"`]).*?\1/g;
    const stripped = line.replace(inStr, '""');         // ignore string contents
    const comment = stripped.indexOf('#');
    const src = comment >= 0 ? stripped.slice(0, comment) : stripped;
    for (const ch of src) {
      if (ch === '(') round++; else if (ch === ')') round--;
      if (ch === '[') square++; else if (ch === ']') square--;
      if (ch === '{') curly++; else if (ch === '}') curly--;
    }
    if (round < 0) { errors.push(`Line ${i + 1}: Unexpected ')'`); round = 0; }
    if (square < 0) { errors.push(`Line ${i + 1}: Unexpected ']'`); square = 0; }
    if (curly < 0) { errors.push(`Line ${i + 1}: Unexpected '}'`); curly = 0; }
  });
  if (round > 0) errors.push('Unclosed parenthesis \'(\'');
  if (square > 0) errors.push('Unclosed bracket \'[\'');
  if (curly > 0) errors.push('Unclosed brace \'{\'');

  // Indentation consistency: detect mixed tabs/spaces per file
  const usesSpaces = lines.some(l => /^  /.test(l));
  const usesTabs = lines.some(l => /^\t/.test(l));
  if (usesSpaces && usesTabs)
    errors.push('Mixed tabs and spaces — use one consistently');

  // def/class must end with colon
  lines.forEach((line, i) => {
    const trimmed = line.trimStart();
    if (/^(def |class )/.test(trimmed) && !trimmed.includes(':'))
      errors.push(`Line ${i + 1}: Missing ':' after def/class`);
  });

  return errors;
}

function checkJava(code: string): string[] {
  const errors: string[] = [];
  let curly = 0;
  const lines = code.split('\n');
  lines.forEach((line, i) => {
    // Strip string literals and comments for bracket counting
    const stripped = line
      .replace(/"[^"]*"/g, '""')
      .replace(/\/\/.*/, '')
      .replace(/\/\*.*?\*\//g, '');
    for (const ch of stripped) {
      if (ch === '{') curly++;
      else if (ch === '}') curly--;
    }
    if (curly < 0) { errors.push(`Line ${i + 1}: Unexpected '}'`); curly = 0; }
  });
  if (curly > 0) errors.push(`${curly} unclosed brace(s) '{'`);

  // Statements must end with semicolons (simple heuristic)
  const noSemiNeeded = /^\s*(\{|\}|class |public |private |protected |@|import |package |if |else|for |while |do\s*\{|try\s*\{|catch |finally\s*\{|\/\/|\*|\/\*)/;
  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t || noSemiNeeded.test(t)) return;
    if (t.length > 2 && !t.endsWith(';') && !t.endsWith('{') && !t.endsWith('}') && !t.endsWith(','))
      errors.push(`Line ${i + 1}: Missing semicolon`);
  });

  return errors;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function ProblemSolve() {
  const { id } = useParams<{ id: string }>();
  const monaco = useMonaco();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [review, setReview] = useState<any>(null);
  const [syntaxErrors, setSyntaxErrors] = useState<string[]>([]);

  // Validation state: true while Monaco is still settling after a keystroke
  const [isValidating, setIsValidating] = useState(false);
  // Whether current code is identical to last-reviewed code
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Tutor
  const [tutorOpen, setTutorOpen] = useState(false);
  const [tutorQuestion, setTutorQuestion] = useState('');
  const [tutorResponse, setTutorResponse] = useState('');
  const [hint, setHint] = useState('');
  const [tutorLoading, setTutorLoading] = useState(false);

  // Guard: store last-reviewed code so we don't re-send unchanged code
  const lastReviewedCode = useRef<string>('');
  const validationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { if (id) loadProblem(); }, [id]);

  // ── Per-language validation (debounced 600ms after code changes) ──────────
  useEffect(() => {
    setIsValidating(true);
    if (validationTimer.current) clearTimeout(validationTimer.current);

    validationTimer.current = setTimeout(async () => {
      const errors: string[] = [];

      if (language === 'python') {
        // Client-side structural check (Monaco has no Python runtime)
        errors.push(...checkPython(code));
      } else if (language === 'java') {
        // Client-side structural check for Java
        errors.push(...checkJava(code));
      }
      // JavaScript: Monaco's built-in TS language service writes error
      // markers automatically — collected in the shared marker sweep below.

      // Also merge any Monaco markers the editor itself has flagged (for any lang)
      if (monaco) {
        monaco.editor.getModels().forEach(model => {
          monaco.editor.getModelMarkers({ resource: model.uri }).forEach(m => {
            if (m.severity === monaco.MarkerSeverity.Error) {
              const msg = `Line ${m.startLineNumber}: ${m.message}`;
              if (!errors.includes(msg)) errors.push(msg);
            }
          });
        });
      }

      setSyntaxErrors(errors);
      setIsValidating(false);
    }, 600);

    return () => { if (validationTimer.current) clearTimeout(validationTimer.current); };
  }, [code, language, monaco]);

  // Track duplicate code
  useEffect(() => {
    setIsDuplicate(
      lastReviewedCode.current.trim().length > 0 &&
      code.trim() === lastReviewedCode.current.trim()
    );
  }, [code]);

  const loadProblem = async () => {
    try {
      const { data } = await problemsAPI.getById(id!);
      setProblem(data);
      setCode(defaultCode(data.title, 'python'));
    } catch {
      toast.error('Failed to load problem');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    if (problem) setCode(defaultCode(problem.title, lang));
    setReview(null);
    lastReviewedCode.current = '';
    setSyntaxErrors([]);
    setIsDuplicate(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!code.trim()) { toast.error('Write some code first'); return; }

    // Guard 1: still validating — wait for Monaco/checks to settle
    if (isValidating) {
      toast('Still checking your code…', { icon: '⏳', style: { fontSize: '13px' } });
      return;
    }

    // Guard 2: compilation / syntax errors
    if (syntaxErrors.length > 0) {
      toast.error(`Fix ${syntaxErrors.length} error${syntaxErrors.length > 1 ? 's' : ''} before submitting`);
      return;
    }

    // Guard 3: identical code — no point re-reviewing
    if (isDuplicate) {
      toast('You already got feedback on this exact code. Make changes and try again.', {
        icon: '🔁',
        style: { fontSize: '13px' },
        duration: 3500,
      });
      return;
    }

    setSubmitting(true);
    setReview(null);
    try {
      const { data } = await reviewAPI.submit({ problem_id: id!, code, language });
      setReview(data);
      lastReviewedCode.current = code;
      setIsDuplicate(false);
      toast.success('Review complete!');
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }, [code, syntaxErrors, isValidating, isDuplicate, id, language]);

  const handleGetHint = async () => {
    setTutorLoading(true);
    try {
      const { data } = await tutorAPI.hint(id!);
      setHint(data.hint);
      setTutorOpen(true);
    } catch { toast.error('Failed to get hint'); }
    finally { setTutorLoading(false); }
  };

  const handleAskTutor = async () => {
    if (!tutorQuestion.trim()) return;
    setTutorLoading(true);
    setTutorResponse('');
    try {
      const { data } = await tutorAPI.ask({ problem_id: id!, question: tutorQuestion });
      setTutorResponse(data.response);
      setTutorQuestion('');
    } catch { toast.error('Tutor failed'); }
    finally { setTutorLoading(false); }
  };

  // ── Loading / not found ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <LandingBackground />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <span className="w-10 h-10 rounded-full border-2 animate-spin"
            style={{ borderColor: `${ORANGE}40`, borderTopColor: ORANGE }} />
          <p className="text-[13px] text-black/35 font-light">Loading…</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAFAFA' }}>
        <p className="text-black/40 font-light">Problem not found.</p>
      </div>
    );
  }

  const ds = DIFF_STYLES[problem.difficulty] ?? DIFF_STYLES[3];

  return (
    <div className="relative min-h-screen" style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif", color: '#0A0A0A' }}>
      <LandingBackground />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 py-8">

        {/* ── Back + title strip ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease }}
          className="flex items-center gap-3 mb-6"
        >
          <Link
            to="/problems"
            className="flex items-center gap-1 text-[12.5px] text-black/35 hover:text-black/65 transition-colors duration-150 font-mono"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Problems
          </Link>
          <span className="text-black/15">/</span>
          <span className="text-[12.5px] text-black/50 font-mono truncate max-w-[300px]">{problem.title}</span>
          <span
            className="ml-auto text-[10.5px] font-mono px-2.5 py-0.5 rounded-full border shrink-0"
            style={{ color: ds.color, background: ds.bg, borderColor: ds.border }}
          >
            {DIFF_LABELS[problem.difficulty]}
          </span>
        </motion.div>

        {/* ── Two-column layout ────────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-5 items-start">

          {/* ── LEFT: Problem description ──────────────────────────────────── */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.07, duration: 0.5, ease }}>
              <Glass className="px-7 py-6">
                <h1 className="text-[22px] tracking-[-0.02em] mb-4" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                  {problem.title}
                </h1>
                <p className="text-[13.5px] text-black/65 leading-[1.75] font-light whitespace-pre-line">
                  {problem.description}
                </p>

                {problem.examples?.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-black/30">Examples</p>
                    {problem.examples.map((ex, i) => (
                      <div key={i} className="rounded-xl px-4 py-3 text-[12.5px] font-mono" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <p><span className="text-black/40">Input: </span><span className="text-[#0A0A0A]">{ex.input}</span></p>
                        <p className="mt-1"><span className="text-black/40">Output: </span><span className="text-[#0A0A0A]">{ex.output}</span></p>
                        {ex.explanation && <p className="mt-1 text-black/40 font-sans">{ex.explanation}</p>}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints?.length > 0 && (
                  <div className="mt-5">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-2">Constraints</p>
                    <ul className="space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="text-[12.5px] text-black/50 font-mono flex gap-2">
                          <span className="text-black/20">·</span>{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </Glass>
            </motion.div>
          </div>

          {/* ── RIGHT: Editor + Tutor ──────────────────────────────────────── */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1, duration: 0.5, ease }}>
              <Glass className="overflow-hidden">

                {/* Editor toolbar */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-black/[0.07]">
                  {/* Language pills */}
                  <div className="flex gap-1.5">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.id}
                        onClick={() => handleLanguageChange(l.id)}
                        className="text-[11px] font-mono px-3 py-1 rounded-full border transition-all duration-150"
                        style={
                          language === l.id
                            ? { background: '#0A0A0A', color: '#fff', borderColor: '#0A0A0A' }
                            : { background: 'transparent', color: 'rgba(0,0,0,0.40)', borderColor: 'rgba(0,0,0,0.10)' }
                        }
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleGetHint}
                      disabled={tutorLoading}
                      className="flex items-center gap-1.5 text-[12px] px-3.5 py-1.5 rounded-full border transition-all duration-150 disabled:opacity-50"
                      style={{ color: '#92400e', background: 'rgba(245,158,11,0.07)', borderColor: 'rgba(245,158,11,0.25)' }}
                    >
                      {tutorLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
                      Hint
                    </button>
                    <button
                      onClick={() => setTutorOpen(v => !v)}
                      className="flex items-center gap-1.5 text-[12px] px-3.5 py-1.5 rounded-full border transition-all duration-150"
                      style={
                        tutorOpen
                          ? { background: '#0A0A0A', color: '#fff', borderColor: '#0A0A0A' }
                          : { color: 'rgba(0,0,0,0.45)', borderColor: 'rgba(0,0,0,0.12)', background: 'transparent' }
                      }
                    >
                      Ask AI
                    </button>
                    <button
                      onClick={() => { setCode(defaultCode(problem.title, language)); setReview(null); lastReviewedCode.current = ''; setSyntaxErrors([]); }}
                      className="p-1.5 rounded-full border transition-all duration-150 hover:bg-black/[0.04]"
                      style={{ color: 'rgba(0,0,0,0.30)', borderColor: 'rgba(0,0,0,0.10)' }}
                      title="Reset code"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Monaco Editor */}
                <div style={{ height: '420px' }}>
                  <Editor
                    height="100%"
                    language={LANGUAGES.find(l => l.id === language)?.monaco ?? 'python'}
                    value={code}
                    onChange={v => setCode(v ?? '')}
                    theme="vs-dark"
                    options={{
                      fontSize: 13.5,
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                      fontLigatures: true,
                      lineNumbers: 'on',
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      padding: { top: 14, bottom: 14 },
                      renderLineHighlight: 'gutter',
                      smoothScrolling: true,
                      cursorBlinking: 'smooth',
                      tabSize: 4,
                      wordWrap: 'on',
                    }}
                  />
                </div>

                {/* Syntax error banner */}
                <AnimatePresence>
                  {syntaxErrors.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 py-3 border-t border-red-200 flex items-start gap-2" style={{ background: 'rgba(239,68,68,0.06)' }}>
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" strokeWidth={1.8} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-mono text-red-600 font-medium mb-0.5">Syntax errors — fix before submitting</p>
                          {syntaxErrors.slice(0, 3).map((e, i) => (
                            <p key={i} className="text-[11px] font-mono text-red-500 truncate">{e}</p>
                          ))}
                          {syntaxErrors.length > 3 && <p className="text-[10px] text-red-400 font-mono">+{syntaxErrors.length - 3} more</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <div className="px-5 py-4 border-t border-black/[0.07] space-y-2">

                  {/* Duplicate code hint */}
                  <AnimatePresence>
                    {isDuplicate && !syntaxErrors.length && !isValidating && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-1"
                          style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)' }}>
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" strokeWidth={1.8} />
                          <p className="text-[12px] text-amber-700 font-light">
                            This code was already reviewed. Edit your solution to submit again.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || isValidating}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 disabled:cursor-not-allowed"
                    style={
                      isValidating
                        ? { background: 'rgba(0,0,0,0.06)', color: 'rgba(0,0,0,0.40)' }
                        : syntaxErrors.length > 0
                          ? { background: 'rgba(0,0,0,0.25)', color: '#fff' }
                          : isDuplicate
                            ? { background: 'rgba(245,158,11,0.12)', color: '#92400e', border: '1px solid rgba(245,158,11,0.30)' }
                            : { background: '#0A0A0A', color: '#fff' }
                    }
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Reviewing…</>
                    ) : isValidating ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Checking code…</>
                    ) : syntaxErrors.length > 0 ? (
                      <><AlertCircle className="w-4 h-4" /> Fix {syntaxErrors.length} error{syntaxErrors.length > 1 ? 's' : ''} first</>
                    ) : isDuplicate ? (
                      <><RotateCcw className="w-4 h-4" /> Already reviewed — edit to resubmit</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Submit for Review</>
                    )}
                  </button>
                </div>

              </Glass>
            </motion.div>

            {/* ── Tutor panel ─────────────────────────────────────────────── */}
            <AnimatePresence>
              {tutorOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.3, ease }}
                >
                  <Glass className="px-6 py-5">
                    <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-4">AI Tutor</p>

                    {hint && (
                      <div className="rounded-xl px-4 py-3 mb-4 text-[13px] leading-relaxed font-light" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.20)', color: '#92400e' }}>
                        <span className="font-medium mr-1.5">💡 Hint:</span>{hint}
                      </div>
                    )}

                    {tutorResponse && (
                      <div className="rounded-xl px-4 py-3 mb-4 text-[13px] leading-relaxed font-light whitespace-pre-line" style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', color: 'rgba(0,0,0,0.65)' }}>
                        {tutorResponse}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tutorQuestion}
                        onChange={e => setTutorQuestion(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !tutorLoading && handleAskTutor()}
                        placeholder="Ask the tutor anything…"
                        className="flex-1 text-[13px] px-4 py-2.5 rounded-xl outline-none transition-all duration-150"
                        style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
                        onFocus={e => (e.target.style.borderColor = ORANGE)}
                        onBlur={e => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')}
                      />
                      <button
                        onClick={handleAskTutor}
                        disabled={tutorLoading || !tutorQuestion.trim()}
                        className="flex items-center justify-center w-10 h-10 rounded-xl text-white transition-all duration-150 disabled:opacity-40"
                        style={{ background: '#0A0A0A' }}
                      >
                        {tutorLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </Glass>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>

        {/* ── BOTTOM: Full-width Review Results ────────────────────────────── */}
        <div className="mt-8 w-full">
          <AnimatePresence>
            {review && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.45, ease }}
              >
                <Glass className="px-7 py-10">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-1">Review</p>
                      <h2 className="text-[18px] tracking-[-0.02em]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                        Your Results
                      </h2>
                    </div>
                    <ScoreRing score={review.score ?? 0} />
                  </div>

                  <div className="space-y-5">
                    {/* Thinking style */}
                    {review.thinking_style && (
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-1.5">Thinking style</p>
                        <p className="text-[13px] text-black/55 font-light capitalize">{review.thinking_style}</p>
                      </div>
                    )}

                    {/* Strengths */}
                    {review.strengths?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-2">Strengths</p>
                        <div className="flex flex-wrap gap-1.5">
                          {review.strengths.map((s: string) => (
                            <span key={s} className="text-[11.5px] px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.09)', color: '#15803d', border: '1px solid rgba(34,197,94,0.20)' }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Weaknesses */}
                    {review.weaknesses?.length > 0 && (
                      <div>
                        <p className="text-[11px] font-mono uppercase tracking-widest text-black/30 mb-2">Areas to improve</p>
                        <div className="flex flex-wrap gap-1.5">
                          {review.weaknesses.map((w: string) => (
                            <span key={w} className="text-[11.5px] px-2.5 py-1 rounded-full" style={{ background: `${ORANGE}10`, color: '#b83010', border: `1px solid ${ORANGE}30` }}>{w}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Detailed feedback — expandable */}
                    {review.detailed_feedback && (
                      <Accordion label="Detailed feedback">
                        <p className="text-[13px] text-black/55 font-light leading-[1.75] whitespace-pre-line">{review.detailed_feedback}</p>
                      </Accordion>
                    )}

                    {/* Topics to revise */}
                    {review.topics_to_revise?.length > 0 && (
                      <Accordion label="Topics to revise">
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {review.topics_to_revise.map((t: string) => (
                            <span key={t} className="text-[11px] font-mono px-2.5 py-1 rounded-full border" style={{ color: 'rgba(0,0,0,0.45)', borderColor: 'rgba(0,0,0,0.10)', background: 'rgba(0,0,0,0.03)' }}>{t}</span>
                          ))}
                        </div>
                      </Accordion>
                    )}
                  </div>
                </Glass>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}