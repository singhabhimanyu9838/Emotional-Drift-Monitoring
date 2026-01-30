
import React from 'react';
import { ShieldCheck, Brain, Heart, Zap, Sparkles, Globe, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-white/5 bg-black/20 pt-20 pb-12 px-8 lg:px-16 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/10">
                S
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter">Sonia Neural Ecosystem</h2>
            </div>
            <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-md">
              Sonia is a privacy-first emotional intelligence engine designed to synchronize your daily reflections into a longitudinal map of psychological well-being.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Globe className="w-3 h-3" /> Edge Computing
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                <Lock className="w-3 h-3" /> Local-First Vault
              </div>
            </div>
          </div>

          {/* Services Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-10">
            <div className="space-y-4">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Brain className="w-4 h-4" /> Neural Analysis
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Leveraging Gemini's multimodal reasoning to extract sentiment, intensity, and semantic drift from text and voice interactions.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Privacy Protocol
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Your data never leaves your device. We use end-to-end encrypted local persistence to ensure your sanctuary remains yours alone.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-amber-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Longitudinal Tracking
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Visualize emotional trends over weeks and months through the Wellness Path and automated AI synthesis reports.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black text-rose-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Heart className="w-4 h-4" /> Empathetic Reflection
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Sonia acts as a virtual mirror, reflecting your emotional state with non-judgmental empathy and cognitive reframing techniques.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-10">
            <Link to="/about" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">Philosophy</Link>
            <Link to="/wellness" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">Growth Path</Link>
            <Link to="/settings" className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-indigo-400 transition-colors">Privacy Settings</Link>
          </div>
          
          <div className="flex items-center gap-3 opacity-30 grayscale pointer-events-none">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Powered by Gemini 3.0 Flash</span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural Core v4.5</span>
          </div>
        </div>

        {/* Disclaimer Reminder */}
        <div className="mt-12 text-center">
          <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest leading-relaxed max-w-3xl mx-auto">
            Disclaimer: Sonia is an emotional support AI and not a clinical diagnostic tool. If you are experiencing a mental health emergency, please contact local emergency services immediately.
          </p>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none translate-y-1/2 translate-x-1/2"></div>
    </footer>
  );
};

export default Footer;
