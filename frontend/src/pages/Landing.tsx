import React from 'react';
import NetworkBackground from './NetworkBackground'; // Adjust path as needed
import { Link } from 'react-router-dom';
import { Gift, Terminal, Brain, Network, TrendingUp, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-[#fafafa] overflow-hidden font-sans text-gray-900">
      
      {/* Background Network Graphic & Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Glowing Orbs */}
        <div className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-yellow-100/40 rounded-full blur-[120px] mix-blend-multiply" />
        <div className="absolute top-[10%] right-[20%] w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] mix-blend-multiply" />
        
        {/* Subtle Network Lines (Approximation of the background) */}
        <svg className="absolute w-full h-full opacity-[0.15]" stroke="#000" strokeWidth="0.5" fill="none">
          <path d="M100 200 L300 100 L450 350 L200 500 Z" />
          <path d="M300 100 L700 150 L800 400 L450 350" />
          <path d="M800 400 L1100 250 L1200 600 L900 700 Z" />
          <path d="M200 500 L500 800 L900 700" />
          <circle cx="100" cy="200" r="2" fill="#000" />
          <circle cx="300" cy="100" r="2" fill="#000" />
          <circle cx="450" cy="350" r="2" fill="#000" />
          <circle cx="700" cy="150" r="2" fill="#000" />
          <circle cx="800" cy="400" r="2" fill="#000" />
        </svg>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 w-full bg-transparent pt-6 pb-4">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-12">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-[2px] w-4 h-4">
                <div className="bg-[#0a0f1c]"></div>
                <div className="bg-[#0a0f1c]"></div>
                <div className="bg-[#ff6b00]"></div>
                <div className="bg-blue-300"></div>
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0a0f1c]">
                AntiNotes<span className="text-[#ff6b00]">.</span>
              </span>
            </div>
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-500">
              <a href="#demo" className="hover:text-gray-900 transition-colors">Demo</a>
              <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
              <a href="#roadmap" className="hover:text-gray-900 transition-colors">Roadmap</a>
              <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
            </div>

            {/* Nav CTA */}
            <Link
              to="/login"
              className="px-5 py-2.5 bg-[#0a0f1c] text-white text-xs font-mono tracking-wider hover:bg-gray-800 transition-colors"
            >
              Get_Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-20 px-4 flex flex-col items-center justify-center text-center min-h-[80vh]">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Version Badge */}
          <div className="mb-10 flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 text-[11px] font-mono tracking-widest text-gray-500 uppercase shadow-sm">
            <span className="w-1.5 h-1.5 bg-[#ff6b00]"></span>
            V1.0 // PUBLIC_BETA
          </div>

          {/* Headline */}
          <h1 className="text-[5rem] md:text-[6.5rem] font-serif font-medium text-[#1a1f2e] mb-6 leading-[1.05] tracking-tight">
            Logic, <span className="text-[#ff6b00] italic">not</span> syntax.
            <br />
            Thinking, not typing.
          </h1>

          {/* Subheadline */}
          <p className="text-[17px] text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            The first AI tutor that ignores your semicolons and grades your mental 
            models. Stop grinding LeetCode blind.
          </p>

          {/* Promo Text */}
          <div className="mb-6 flex items-center gap-2 px-4 py-1.5 bg-[#fff8f3] border border-[#ffe4d1] rounded text-[11px] font-mono font-semibold tracking-wider text-[#ff6b00] uppercase">
            <Gift className="w-3.5 h-3.5" />
            Waitlist Offer: 1-Month Pro Free
          </div>

          {/* Input & CTA Group */}
          <div className="flex flex-col sm:flex-row gap-0 justify-center items-center mb-16">
            <input
              type="email"
              placeholder="example@gmail.com"
              className="h-[52px] w-full sm:w-[320px] px-5 bg-white border border-gray-200 text-[13px] font-mono text-gray-700 focus:outline-none focus:border-gray-400 focus:ring-0 placeholder:text-gray-400"
            />
            
            <div className="relative h-[52px] w-full sm:w-auto mt-4 sm:mt-0">
              {/* Offset Shadow Layer */}
              <div className="absolute inset-0 bg-[#ff6b00] translate-x-[4px] translate-y-[4px]"></div>
              {/* Button */}
              <button className="relative w-full h-full px-8 bg-[#0a0f1c] text-white text-[13px] font-mono font-bold tracking-widest uppercase hover:translate-x-[2px] hover:translate-y-[2px] transition-transform active:translate-x-[4px] active:translate-y-[4px]">
                Start_Engine
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="text-[11px] font-mono tracking-widest text-gray-400 uppercase">
            System Status: 400+ Engineers in queue
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full border-t border-gray-200/60 relative z-10"></div>

      {/* Adapted Problem Section (Now styled minimalistically) */}
      <section className="relative z-10 py-24 px-4 bg-white/50 backdrop-blur-sm">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#1a1f2e] mb-8 leading-tight">
                The "Tutorial Hell" <span className="text-[#ff6b00] italic">Loop</span>.
              </h2>
              
              <div className="space-y-6 text-[15px] font-mono text-gray-600">
                <div className="flex gap-4 items-start border-l-2 border-gray-200 pl-4 hover:border-[#ff6b00] transition-colors">
                  <span className="text-[#ff6b00] font-bold">01_</span>
                  <p>You memorize the solution to pass the test.</p>
                </div>
                <div className="flex gap-4 items-start border-l-2 border-gray-200 pl-4 hover:border-[#ff6b00] transition-colors">
                  <span className="text-[#ff6b00] font-bold">02_</span>
                  <p>You forget the core logic exactly 2 days later.</p>
                </div>
                <div className="flex gap-4 items-start border-l-2 border-gray-200 pl-4 hover:border-[#ff6b00] transition-colors">
                  <span className="text-[#ff6b00] font-bold">03_</span>
                  <p>The interviewer changes one constraint. Panic ensues.</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 border border-gray-200 shadow-sm">
                <div className="flex items-start gap-4 mb-3">
                  <div className="w-8 h-8 bg-[#0a0f1c] flex items-center justify-center flex-shrink-0">
                    <Terminal className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[15px] text-gray-800 mb-3 font-medium leading-relaxed">
                      "Your Hash Map solution is <span className="bg-[#fff8f3] text-[#ff6b00] px-1.5 py-0.5 border border-[#ffe4d1] font-mono text-sm">O(n)</span>. Correct.
                      But <span className="italic">why</span> choose a Map over a Set here?"
                    </p>
                    <div className="flex items-center gap-2 text-[#ff6b00] font-mono text-[11px] tracking-widest uppercase">
                      <span>↳</span>
                      <span className="font-bold">+10 LOGIC POINTS</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#fff8f3] p-6 border border-[#ffe4d1]">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-[#ff6b00] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-mono text-sm font-bold">YOU</span>
                  </div>
                  <div className="font-mono text-[13px]">
                    <p className="text-gray-800 mb-2">
                      &gt; "Because we need to store the index of the complement?"
                    </p>
                    <p className="text-[#ff6b00] italic">
                      &gt; SYSTEM: "Exactly. You just derived the Space/Time trade-off."
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 px-4 bg-[#fafafa] border-y border-gray-200/60">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-[#1a1f2e] mb-4">
              How the Engine <span className="text-[#ff6b00] italic">Works</span>
            </h2>
            <p className="text-[15px] font-mono text-gray-500 uppercase tracking-widest">
              [ 3 AI Agents // 1 Unified System ]
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Reviewer_Agent", icon: Brain, desc: "Analyzes code for learning signals. Identifies concept gaps and mistake tendencies.", action: "Builds cognitive profile" },
              { title: "Tutor_Agent", icon: Network, desc: "Socratic teaching. Asks guiding questions to help you discover solutions yourself.", action: "Teaches thinking" },
              { title: "Background_Agent", icon: TrendingUp, desc: "Analyzes progress trends every 5 submissions. Recommends optimal next steps.", action: "Tracks journey" }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 border border-gray-200 group hover:border-[#0a0f1c] transition-colors">
                <div className="mb-6">
                  <feature.icon className="w-6 h-6 text-[#ff6b00]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[15px] font-mono font-bold text-[#0a0f1c] mb-3 uppercase tracking-wider">
                  {feature.title}
                </h3>
                <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
                  {feature.desc}
                </p>
                <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest group-hover:text-[#ff6b00] transition-colors">
                  ↳ {feature.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-4 bg-white border-t border-gray-200">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-[2px] w-3 h-3 opacity-50">
                <div className="bg-[#0a0f1c]"></div>
                <div className="bg-[#0a0f1c]"></div>
                <div className="bg-[#ff6b00]"></div>
                <div className="bg-blue-300"></div>
              </div>
              <span className="text-sm font-bold tracking-tight text-gray-400">
                AntiNotes.
              </span>
            </div>
            
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-widest">
              © 2024 // Built for learners who think.
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}