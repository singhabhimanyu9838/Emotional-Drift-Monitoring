
import React, { useMemo, useState } from 'react';
import { 
  Compass, Sparkles, TrendingUp, Heart, ChevronRight, Zap, 
  Target, Brain, FileText, Loader2, BarChart3, Clock 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';
import { Message, JournalEntry, UserContext } from '../types';
import { gemini } from '../services/geminiService';

interface WellnessPathProps {
  messages: Message[];
  journalEntries: JournalEntry[];
  userContext: UserContext;
}

const WellnessPath: React.FC<WellnessPathProps> = ({ messages, journalEntries, userContext }) => {
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [historyReport, setHistoryReport] = useState<any>(null);

  // Combine all emotional data points into a single timeline for the graph
  const emotionTimeline = useMemo(() => {
    const allData = [
      ...messages.filter(m => m.emotion).map(m => ({
        timestamp: m.timestamp,
        intensity: m.emotion!.intensity,
        label: m.emotion!.label,
        source: 'Chat'
      })),
      ...journalEntries.map(e => ({
        timestamp: e.timestamp,
        intensity: e.emotion.intensity,
        label: e.emotion.label,
        source: 'Journal'
      }))
    ].sort((a, b) => a.timestamp - b.timestamp);

    if (allData.length === 0) {
      return Array.from({ length: 7 }).map((_, i) => ({
        date: `Node ${i + 1}`,
        intensity: 0,
        label: 'N/A'
      }));
    }

    return allData.map(d => ({
      date: new Date(d.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      intensity: d.intensity,
      label: d.label,
      source: d.source,
      fullDate: new Date(d.timestamp).toLocaleString()
    }));
  }, [messages, journalEntries]);

  // Calculate dynamic metrics
  const analytics = useMemo(() => {
    const allEmotions = [
      ...messages.filter(m => m.emotion).map(m => m.emotion!),
      ...journalEntries.map(e => e.emotion)
    ];

    if (allEmotions.length === 0) {
      return { eq: 0, stability: 0, growth: 0, activeNodes: 0 };
    }

    const stability = 100 - (allEmotions.reduce((acc, curr) => acc + Math.abs(50 - curr.intensity), 0) / allEmotions.length);
    const eq = Math.min(10, (allEmotions.length / 5) + (stability / 20));
    const growth = Math.min(100, (allEmotions.length / 20) * 100);
    const activeNodes = Math.min(4, Math.floor(allEmotions.length / 4) + 1);

    return { 
      eq: eq.toFixed(1), 
      stability: Math.round(stability), 
      growth: Math.round(growth),
      activeNodes 
    };
  }, [messages, journalEntries]);

  const handleGenerateHistoryReport = async () => {
    if (messages.length + journalEntries.length < 2) return;
    setIsGeneratingReport(true);
    try {
      const report = await gemini.generateSummaryReport(journalEntries, messages, userContext);
      setHistoryReport(report);
    } catch (e) {
      console.error("Report generation failed", e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const steps = [
    { title: 'Neural Baseline Establishment', description: 'Initial calibration of emotional resonance patterns.', milestone: 1 },
    { title: 'Cognitive Pattern Recognition', description: 'Identifying recurring emotional drift triggers.', milestone: 2 },
    { title: 'Regulation & Drift Control', description: 'Mastery over high-intensity emotional peaks.', milestone: 3 },
    { title: 'Sustained Resilience', description: 'Achieving a stable state of psychological flow.', milestone: 4 },
  ];

  return (
    <div className="p-8 lg:p-12 space-y-12 max-w-[1500px] mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-white/5">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4">
            Wellness Path <Compass className="text-indigo-400 w-10 h-10" />
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
            Your longitudinal emotional blueprint. Tracking your evolution from awareness to mastery.
          </p>
        </div>
        <button 
          onClick={handleGenerateHistoryReport}
          disabled={isGeneratingReport || (messages.length + journalEntries.length < 2)}
          className="px-8 py-4 bg-indigo-500 hover:bg-indigo-600 rounded-[1.5rem] text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-30"
        >
          {isGeneratingReport ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Sync History Report
        </button>
      </header>

      {/* Main Path Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Growth Nodes */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Active Neural Milestones</h2>
          </div>
          {steps.map((step, idx) => {
            const isCompleted = idx + 1 < analytics.activeNodes;
            const isCurrent = idx + 1 === analytics.activeNodes;
            const isLocked = idx + 1 > analytics.activeNodes;

            return (
              <div 
                key={idx} 
                className={`glass-card p-8 rounded-[2.5rem] transition-all relative overflow-hidden group border-white/5 ${
                  isCurrent ? 'border-indigo-500/30 bg-indigo-500/[0.03]' : ''
                } ${isLocked ? 'opacity-30 grayscale' : ''}`}
              >
                <div className="flex items-center gap-6 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg ${
                    isCompleted ? 'bg-emerald-500/10 text-emerald-400' :
                    isCurrent ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 animate-pulse' : 'bg-white/5 text-slate-600'
                  }`}>
                    {isCompleted ? <Zap className="w-6 h-6" /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                      {step.title}
                      {isCompleted && <Sparkles className="w-4 h-4 text-amber-400" />}
                    </h3>
                    <p className="text-slate-500 text-xs font-medium mt-1">{step.description}</p>
                  </div>
                  {isCurrent && (
                    <div className="text-right">
                      <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">In Calibration</span>
                      <div className="h-1.5 w-32 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${analytics.growth}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-10 rounded-[3rem] bg-indigo-500/[0.02] border-indigo-500/10 h-full flex flex-col justify-between">
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="text-indigo-400 w-5 h-5" />
                </div>
                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Neural KPIs</h4>
              </div>
              
              <div className="space-y-12">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">EQ Index</p>
                    <p className="text-white font-black text-5xl neon-text-glow">{analytics.eq}</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full">
                    <div className="h-full bg-indigo-500" style={{ width: `${(Number(analytics.eq)/10)*100}%` }} />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest">Stability Index</p>
                    <p className="text-white font-black text-5xl">{analytics.stability}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full">
                    <div className="h-full bg-emerald-500" style={{ width: `${analytics.stability}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 mt-auto">
               <div className="flex items-center gap-2 mb-2">
                 <Heart className="w-3 h-3 text-rose-500" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Wellness Signal</span>
               </div>
               <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
                 "Your emotional bandwidth is expanding. Consistency is the foundation of growth."
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Emotional Tracking Graph Section */}
      <div className="glass-card p-10 rounded-[3.5rem] relative overflow-hidden border-white/5">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-indigo-400 w-5 h-5" />
            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Emotional Resonance Timeline</h3>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intensity Flux</span>
             </div>
          </div>
        </header>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={emotionTimeline}>
              <defs>
                <linearGradient id="pathIntensityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                dy={15}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-card p-4 rounded-2xl border-indigo-500/20 shadow-2xl">
                        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{data.fullDate}</p>
                        <p className="text-sm font-black text-white mb-1">{data.label} Detected</p>
                        <div className="flex justify-between gap-4 mt-2">
                           <span className="text-[10px] text-slate-400 uppercase tracking-widest">Source: {data.source}</span>
                           <span className="text-[10px] text-indigo-300 font-black">{data.intensity}% Intensity</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                stroke="#6366f1" 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#pathIntensityGrad)" 
                animationDuration={2000}
                dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#020617' }}
                activeDot={{ r: 8, fill: '#6366f1', shadow: '0 0 15px rgba(99,102,241,0.5)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Report Section */}
      {(historyReport || isGeneratingReport) && (
        <div className="glass-card p-12 rounded-[4rem] border-indigo-500/10 animate-in slide-in-from-bottom-10 duration-1000">
          {isGeneratingReport ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                 <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                 <Brain className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-sm font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse text-center">
                Sonia is synthesizing your historical resonance...
              </p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-16">
              <div className="flex-1 space-y-10">
                <header>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Synthesis Complete</span>
                  </div>
                  <h2 className="text-4xl font-black text-white tracking-tighter">Neural History Synthesis</h2>
                </header>

                <div className="space-y-8">
                  <div className="p-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 relative group">
                    <FileText className="w-6 h-6 text-indigo-500 absolute -top-3 -right-3" />
                    <p className="text-xl text-slate-300 font-medium italic leading-relaxed">
                      "{historyReport.summary}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {historyReport.keyThemes.map((theme: string, i: number) => (
                      <div key={i} className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-4 hover:border-indigo-500/20 transition-all">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{theme}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="w-full md:w-96 flex flex-col gap-6">
                <div className="bg-indigo-600/10 p-10 rounded-[3.5rem] border border-indigo-500/20 shadow-xl shadow-indigo-500/5 flex flex-col justify-center h-full">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-8">
                    <Sparkles className="w-6 h-6 text-indigo-400" />
                  </div>
                  <h4 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Longitudinal Recommendation</h4>
                  <p className="text-base font-bold text-white leading-relaxed mb-8">
                    {historyReport.recommendation}
                  </p>
                  <button className="w-full py-5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] transition-all">
                    Commit to Plan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {!historyReport && !isGeneratingReport && (
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
             <FileText className="w-8 h-8 text-slate-600" />
          </div>
          <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Historical Analysis Pending</p>
          <p className="text-[10px] font-medium text-slate-600 mt-2">Generate a report to unlock deeper longitudinal insights.</p>
        </div>
      )}
    </div>
  );
};

export default WellnessPath;
