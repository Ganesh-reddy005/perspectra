import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { profileAPI } from '../lib/api';
import { useProfileStore } from '../store/profileStore';
import toast from 'react-hot-toast';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const ORANGE = '#F15A24';
const ease = [0.16, 1, 0.3, 1] as const;

// ─── Question Configuration ───────────────────────────────────────────────────
type QuestionType = 'mcq' | 'text';

interface Question {
  id: string;
  type: QuestionType;
  title: string;
  options?: string[];
  placeholder?: string;
}

const ONBOARDING_QUESTIONS: Question[] = [
  {
    id: 'q1',
    type: 'mcq',
    title: 'How comfortable are you with Data Structures and Algorithms right now?',
    options: [
      'Absolute beginner — I need to start from scratch.',
      'I know the basics, but struggle with implementation.',
      'I can solve easy problems, but get stuck on mediums.',
      'Confident — I am looking for advanced optimization.'
    ]
  },
  {
    id: 'q2',
    type: 'mcq',
    title: 'What is your primary goal for using Perspectra?',
    options: [
      'Preparing for upcoming job placements / interviews.',
      'Building a strong, long-term foundational knowledge.',
      'Passing upcoming college exams.',
      'Just exploring and improving my problem-solving skills.'
    ]
  },
  {
    id: 'q3',
    type: 'mcq',
    title: 'Which programming language do you prefer to focus on?',
    options: [
      'Python',
      'Java',
      'C++',
      'JavaScript / TypeScript'
    ]
  },
  {
    id: 'q4',
    type: 'text',
    title: 'Are there any specific topics you find particularly challenging or want to prioritize?',
    placeholder: 'e.g., Dynamic Programming, Graph Traversal, Trees... (You can leave this blank if you aren\'t sure yet)'
  }
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Onboarding() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const navigate = useNavigate();
  const setProfile = useProfileStore((state) => state.setProfile);

  const currentQ = ONBOARDING_QUESTIONS[currentStep];
  const isLastStep = currentStep === ONBOARDING_QUESTIONS.length - 1;

  const handleNext = () => {
    // Require an answer for MCQs
    if (currentQ.type === 'mcq' && !answers[currentQ.id]) {
      toast.error('Please select an option to continue.', {
        icon: '👀',
        style: { fontSize: '13px', borderRadius: '12px' }
      });
      return;
    }

    if (!isLastStep) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Submitting the answers mapping to your backend
      const { data } = await profileAPI.submitOnboarding(answers);
      setProfile(data.profile);
      toast.success('Profile calibrated. Let\'s begin.', {
        style: { fontSize: '13px', borderRadius: '12px' }
      });
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  const progressPct = ((currentStep + 1) / ONBOARDING_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif", color: '#0A0A0A' }}>

      {/* Background accents to match the screenshot vibe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] pointer-events-none"
        style={{ background: `radial-gradient(circle, ${ORANGE} 0%, transparent 70%)` }} />

      <div className="w-full max-w-2xl px-6 relative z-10">

        {/* Header / Progress */}
        <div className="mb-12 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-black/[0.08] bg-black/[0.02] mb-6">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: ORANGE }}></span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-black/40">
              Calibration · Step {currentStep + 1} of {ONBOARDING_QUESTIONS.length}
            </span>
          </div>

          <h1 className="text-[42px] leading-[1.1] tracking-[-0.03em] text-[#0A0A0A]" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
            Let's tailor the engine <br />
            <span className="italic" style={{ color: ORANGE }}>around how you reason.</span>
          </h1>
        </div>

        {/* Question Card area */}
        <div className="relative min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.4, ease }}
              className="absolute inset-0 w-full"
            >
              <h2 className="text-[18px] font-medium text-black/80 mb-6 text-center leading-relaxed">
                {currentQ.title}
              </h2>

              {/* MCQ Renderer */}
              {currentQ.type === 'mcq' && (
                <div className="flex flex-col gap-3">
                  {currentQ.options?.map((opt, i) => {
                    const isSelected = answers[currentQ.id] === opt;
                    return (
                      <button
                        key={i}
                        onClick={() => setAnswers({ ...answers, [currentQ.id]: opt })}
                        className="w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 group text-[14px]"
                        style={{
                          background: isSelected ? 'rgba(241, 90, 36, 0.04)' : 'transparent',
                          border: isSelected ? `1px solid ${ORANGE}` : '1px solid rgba(0,0,0,0.08)',
                          color: isSelected ? '#0A0A0A' : 'rgba(0,0,0,0.6)',
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors"
                            style={{
                              borderColor: isSelected ? ORANGE : 'rgba(0,0,0,0.15)',
                              background: isSelected ? ORANGE : 'transparent'
                            }}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <span className="group-hover:text-black transition-colors">{opt}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Text Area Renderer */}
              {currentQ.type === 'text' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                  <textarea
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => setAnswers({ ...answers, [currentQ.id]: e.target.value })}
                    placeholder={currentQ.placeholder}
                    className="w-full h-40 bg-white/50 px-5 py-4 rounded-2xl outline-none text-[14px] leading-relaxed transition-all duration-200 resize-none shadow-sm"
                    style={{
                      border: '1px solid rgba(0,0,0,0.08)',
                      color: '#0A0A0A'
                    }}
                    onFocus={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.2)')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(0,0,0,0.08)')}
                  />
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Controls */}
        <div className="mt-10 flex items-center justify-between pt-6 border-t border-black/[0.05]">
          <button
            onClick={handleBack}
            disabled={currentStep === 0 || loading}
            className="flex items-center gap-2 text-[13px] font-medium text-black/40 hover:text-black/80 transition-colors disabled:opacity-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-[#0A0A0A] hover:bg-black text-white text-[14px] font-medium rounded-full transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Finalizing...</>
            ) : isLastStep ? (
              <>Complete Setup <ArrowRight className="w-4 h-4" /></>
            ) : (
              <>Continue <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

      </div>

      {/* Very subtle minimalist progress bar fixed at the bottom */}
      <div className="fixed bottom-0 left-0 w-full h-1 bg-black/[0.03]">
        <motion.div
          className="h-full"
          style={{ backgroundColor: ORANGE }}
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.5, ease }}
        />
      </div>

    </div>
  );
}