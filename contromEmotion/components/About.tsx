
import React from 'react';
import { ShieldCheck, Brain, Heart, Zap, Sparkles, Code2, Globe, ShieldAlert } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="p-10 lg:p-20 max-w-[1200px] mx-auto space-y-20 animate-in fade-in slide-in-from-bottom-10 duration-1000">
      <header className="text-center space-y-6">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-5xl shadow-2xl shadow-indigo-500/20">
          S
        </div>
        <h1 className="text-6xl font-black text-white tracking-tighter">About Sonia</h1>
        <p className="text-2xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          The intersection of advanced neural computing and clinical empathy.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="glass-card p-12 rounded-[3.5rem] space-y-6 hover:bg-white/[0.04] transition-all">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center">
            <Brain className="w-8 h-8 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">The Neural Architecture</h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            Sonia utilizes Gemini's high-fidelity language models to perform real-time sentiment extraction and semantic drift analysis. Every word you share is analyzed to detect patterns of growth, resilience, or distress.
          </p>
        </div>

        <div className="glass-card p-12 rounded-[3.5rem] space-y-6 hover:bg-white/[0.04] transition-all">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">Privacy by Design</h3>
          <p className="text-slate-400 leading-relaxed font-medium">
            Your emotional journey is sacred. Sonia operates on a local-first principle. All transcriptions, journal entries, and emotional metrics are stored exclusively in your browser's persistent memory, ensuring your sanctuary remains truly private.
          </p>
        </div>
      </div>

      <div className="glass-card p-16 rounded-[4rem] border-indigo-500/10 bg-indigo-500/[0.02]">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Our Philosophy</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tight">More than an Assistant.</h2>
            <p className="text-xl text-slate-300 leading-relaxed font-medium italic">
              "We believe that true wellness comes from self-awareness. Sonia doesn't just respond; she reflects. By visualizing your emotional drift, you gain the perspective needed to navigate the complexities of modern life."
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <p className="text-3xl font-black text-white">100%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Local Persistence</p>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-black text-white">Zero</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">External Data Storage</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-96 aspect-square bg-indigo-500/5 rounded-full border border-indigo-500/10 flex items-center justify-center p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-indigo-500/5 animate-pulse blur-3xl"></div>
            <Heart className="w-32 h-32 text-indigo-500/40 animate-pulse relative z-10" />
          </div>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-10">
        <div className="w-20 h-20 bg-amber-500/20 rounded-[2rem] flex items-center justify-center shrink-0">
          <ShieldAlert className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-3">
          <h4 className="text-xl font-black text-amber-200 uppercase tracking-widest">Medical Disclaimer</h4>
          <p className="text-sm text-amber-500/70 leading-relaxed font-medium">
            Sonia is an AI-powered wellness platform designed for emotional tracking and supportive reflection. It is NOT a substitute for professional mental health care, clinical diagnosis, or medical treatment. If you are in a crisis, please seek immediate help from a certified professional or local emergency services.
          </p>
        </div>
      </div>

      <footer className="text-center py-20 opacity-30 border-t border-white/5">
        <div className="flex justify-center gap-10 mb-6">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Sonia Neural Engine v4.5</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Browser-Edge Sanctuary</span>
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Built with Gemini Flash • 2024 Wellness Vision</p>
      </footer>
    </div>
  );
};

export default About;
