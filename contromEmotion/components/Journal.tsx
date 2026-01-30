
import React, { useState } from 'react';
import { PenLine, Sparkles, Loader2, Save, Calendar, Trash2 } from 'lucide-react';
import { JournalEntry, UserContext } from '../types';
import { gemini } from '../services/geminiService';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  userContext: UserContext;
}

const Journal: React.FC<JournalProps> = ({ entries, onAddEntry, onDeleteEntry, userContext }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setIsSaving(true);

    try {
      const emotion = await gemini.analyzeJournal(content, userContext);
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        title: title || `Entry ${new Date().toLocaleDateString()}`,
        content,
        timestamp: Date.now(),
        emotion: emotion || { label: 'Neutral', confidence: 1, intensity: 50 },
      };
      onAddEntry(newEntry);
      setContent('');
      setTitle('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-10 lg:p-16 max-w-7xl mx-auto h-full flex flex-col gap-12 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4">
            Sanctuary Journal <PenLine className="text-indigo-400" />
          </h1>
          <p className="text-slate-400 mt-2 text-xl font-medium">Capture your thoughts over time. Let Sonia map the resonance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 flex-1 min-h-0">
        {/* Editor Area */}
        <div className="lg:col-span-7 flex flex-col gap-6 h-full">
          <div className="glass-card rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl border-white/5 bg-white/[0.02]">
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your reflection a name..."
              className="bg-transparent border-none text-2xl font-black text-white focus:outline-none placeholder:text-slate-700"
            />
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What is the texture of your thoughts right now?"
              className="flex-1 bg-transparent border-none text-slate-300 text-lg font-medium leading-relaxed resize-none focus:outline-none min-h-[400px] placeholder:text-slate-800"
            />
            <div className="flex justify-between items-center pt-6 border-t border-white/5">
              <div className="flex items-center gap-3 text-slate-500">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-black uppercase tracking-widest">AI Analysis Active</span>
              </div>
              <button
                onClick={handleSave}
                disabled={!content.trim() || isSaving}
                className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white font-black text-sm uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Commit Reflection
              </button>
            </div>
          </div>
        </div>

        {/* History Area */}
        <div className="lg:col-span-5 flex flex-col gap-6 overflow-hidden">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-3">
            <Calendar className="w-4 h-4" /> Timeline of Entries
          </h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {entries.length === 0 && (
              <div className="p-10 border-2 border-dashed border-white/5 rounded-[2.5rem] text-center opacity-30">
                <p className="font-bold text-slate-500">No entries yet. Start your first reflection.</p>
              </div>
            )}
            {entries.sort((a,b) => b.timestamp - a.timestamp).map((entry) => (
              <div key={entry.id} className="glass-card p-6 rounded-[2rem] group hover:bg-white/5 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-white text-lg tracking-tight">{entry.title}</h4>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {new Date(entry.timestamp).toLocaleDateString()} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <button 
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-2 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-3 mb-4">
                   <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-500/20">
                    {entry.emotion.label}
                   </span>
                   <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">
                    {entry.emotion.intensity}% Intensity
                   </span>
                </div>
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed italic">"{entry.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;
