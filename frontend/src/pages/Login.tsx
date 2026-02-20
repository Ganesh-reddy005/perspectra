import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import LandingBackground from '../components/LandingBackground';

const ORANGE = '#F15A24';
const ease = [0.16, 1, 0.3, 1] as const;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const { data } = await authAPI.login({ email, password });
      login(data.access_token, {
        user_id: data.user_id,
        email: data.email,
        name: data.name,
      });
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.detail || 'Invalid email or password. Please try again.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAFAFA', fontFamily: "'Inter', sans-serif" }}
    >
      {/* Animated node-network canvas */}
      <LandingBackground />

      {/* Very subtle orange radial glow */}
      <div
        className="pointer-events-none fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-[0.06]"
        style={{ background: `radial-gradient(ellipse, ${ORANGE} 0%, transparent 70%)` }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Glassmorphism card */}
        <div
          className="rounded-2xl border border-black/[0.08] shadow-2xl px-10 py-11"
          style={{ background: 'rgba(255,255,255,0.82)', backdropFilter: 'blur(20px)' }}
        >
          {/* Logo + brand */}
          <div className="flex flex-col items-center mb-10">
            <Link to="/" className="flex items-center gap-[7px] select-none mb-8">
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

            <h1
              className="text-[28px] leading-tight tracking-[-0.03em] text-center"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif", color: '#0A0A0A' }}
            >
              Welcome{' '}
              <span style={{ color: ORANGE, fontStyle: 'italic' }}>back.</span>
            </h1>
            <p className="text-[13.5px] text-black/40 mt-2 font-light">
              Sign in to continue your learning path.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-[12px] font-medium text-black/40 uppercase tracking-widest mb-1.5">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl px-4 py-3 text-[14px] text-black/80 placeholder:text-black/25 outline-none transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(0,0,0,0.10)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = `${ORANGE}60`;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${ORANGE}15`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-medium text-black/40 uppercase tracking-widest mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl px-4 py-3 pr-11 text-[14px] text-black/80 placeholder:text-black/25 outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.7)',
                    border: '1px solid rgba(0,0,0,0.10)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = `${ORANGE}60`;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${ORANGE}15`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.10)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/30 hover:text-black/60 transition-colors duration-150"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-full py-3.5 text-[14px] font-medium text-white transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              style={{ backgroundColor: '#0A0A0A' }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Signing in…
                </span>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </button>

            {/* Inline error message */}
            {errorMsg && (
              <div
                className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-[13px] leading-snug"
                style={{
                  background: 'rgba(241,90,36,0.07)',
                  border: '1px solid rgba(241,90,36,0.20)',
                  color: '#b83010',
                }}
              >
                <span className="mt-px shrink-0">⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}
          </form>

          {/* Footer link */}
          <p className="text-center text-[13px] text-black/35 mt-8">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium transition-colors duration-150"
              style={{ color: ORANGE }}
            >
              Create one →
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
