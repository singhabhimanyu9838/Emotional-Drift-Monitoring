import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Brain,
  Heart,
  Zap,
  Sparkles,
  TrendingUp,
  FileText,
  Loader2,
  Activity,
  History,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Message, UserContext } from "../types";
import { gemini } from "../services/geminiService";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  messages: Message[];
  userContext: UserContext;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  messages,
  userContext,
  onLogout,
}) => {
  const navigate = useNavigate();

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerateReport = async () => {
    if (messages.length < 2) return;
    setIsGeneratingReport(true);
    try {
      const report = await gemini.generateSummaryReport(
        [],
        messages,
        userContext,
      );
      setReportData(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const chartData = useMemo(() => {
    const data = messages
      .filter((m) => m.emotion)
      .map((m) => ({
        time: new Date(m.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        intensity: m.emotion?.intensity || 0,
        label: m.emotion?.label || "Neutral",
        timestamp: m.timestamp,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (data.length === 0) {
      return Array.from({ length: 5 }).map((_, i) => ({
        time: `---`,
        intensity: 0,
      }));
    }
    return data;
  }, [messages]);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    messages.forEach((m) => {
      if (m.emotion) {
        counts[m.emotion.label] = (counts[m.emotion.label] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [messages]);

  const COLORS = {
    Happy: "#10b981",
    Sad: "#3b82f6",
    Stress: "#f59e0b",
    Anxiety: "#8b5cf6",
    Anger: "#ef4444",
    Burnout: "#64748b",
    Neutral: "#94a3b8",
    Excited: "#f43f5e",
  };

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            Wellness Dashboard <Activity className="text-indigo-400 w-8 h-8" />
          </h1>
          <p className="text-slate-400 font-medium">
            Real-time visualization of your emotional architecture.
          </p>
        </div>

        {/* <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 mr-4">
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all"
          >
            <LogIn className="w-3.5 h-3.5" /> Login
          </button>

          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" /> Sign Up
          </button>
        </div> */}
      </header>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:border-rose-500/20">
          <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Stability Index
            </p>
            <h2 className="text-3xl font-black text-white">
              {reportData?.stabilityScore || "84"}%
            </h2>
          </div>
        </div>
        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:border-indigo-500/20">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Active Chat Nodes
            </p>
            <h2 className="text-3xl font-black text-white">
              {messages.filter((m) => m.emotion).length}
            </h2>
          </div>
        </div>
        <div className="glass-card p-8 rounded-[2rem] flex items-center gap-6 group hover:border-emerald-500/20">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <History className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Historical Entries
            </p>
            <h2 className="text-3xl font-black text-white">
              {messages.length}
            </h2>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 glass-card p-10 rounded-[2.5rem] h-[450px]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-10 flex items-center gap-2">
            <TrendingUp className="text-indigo-400 w-4 h-4" /> Emotional
            Resonance Trend
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="intensityGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(255,255,255,0.05)"
                />
                <XAxis dataKey="time" hide />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                  itemStyle={{ color: "#fff", fontSize: "12px" }}
                />
                <Area
                  type="monotone"
                  dataKey="intensity"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="url(#intensityGrad)"
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-10 rounded-[2.5rem]">
          <h3 className="text-xs font-black text-white uppercase tracking-widest mb-8">
            Detected Patterns
          </h3>
          <div className="space-y-6">
            {distribution.map((e) => (
              <div key={e.name} className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>{e.name}</span>
                  <span className="text-indigo-400">{e.value} points</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${(e.value / messages.length) * 100}%`,
                      backgroundColor: (COLORS as any)[e.name] || "#6366f1",
                    }}
                  />
                </div>
              </div>
            ))}
            {distribution.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-30">
                <Brain className="w-10 h-10 text-slate-600" />
                <p className="text-xs italic font-medium">
                  Insufficient neural data.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {reportData && (
        <div className="glass-card p-10 rounded-[3rem] border-indigo-500/20 animate-in slide-in-from-bottom-5 duration-700">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full w-fit border border-indigo-500/20">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                  AI Report Synthesis
                </span>
              </div>
              <h3 className="text-3xl font-black text-white">
                Longitudinal Trajectory
              </h3>
              <p className="text-lg text-slate-300 font-medium italic leading-relaxed">
                "{reportData.summary}"
              </p>
              <div className="flex flex-wrap gap-3">
                {reportData.keyThemes.map((theme: string, i: number) => (
                  <span
                    key={i}
                    className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full md:w-80 bg-indigo-500/10 p-10 rounded-[3rem] border border-indigo-500/20 flex flex-col justify-center">
              <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">
                Neural Protocol
              </h4>
              <p className="text-sm font-bold text-white leading-relaxed italic">
                "{reportData.recommendation}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
