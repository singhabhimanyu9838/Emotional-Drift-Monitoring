
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, Loader2, Smile, Headphones, Sparkles, Brain, Zap, Heart, ShieldCheck } from 'lucide-react';
import { Message, UserContext } from '../types';
import { gemini } from '../services/geminiService';

interface ChatProps {
  messages: Message[];
  onSendMessage: (msg: Message) => void;
  userContext: UserContext;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, userContext }) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendText = async () => {
    if (!input.trim() || isLoading) return;
    
    const text = input.trim();
    setInput('');
    setIsLoading(true);

    // Initial placeholder for user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      type: 'text',
    };
    onSendMessage(userMsg);

    try {
      // AI processes the message to extract emotion and generate response
      const aiResponse = await gemini.analyzeAndRespond(text, userContext, messages);
      
      if (aiResponse) {
        // We update the user message in history with the emotion detected at that timestamp
        // (In a more complex app, we'd update state by ID, here we just push the AI response which contains the metadata)
        onSendMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.response,
          timestamp: Date.now(),
          type: 'text',
          emotion: {
            label: aiResponse.label,
            confidence: aiResponse.confidence,
            intensity: aiResponse.intensity,
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          await handleVoiceMessage(base64, audioBlob);
        };
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    setIsRecording(false);
  };

  const handleVoiceMessage = async (base64: string, blob: Blob) => {
    setIsLoading(true);
    const audioUrl = URL.createObjectURL(blob);

    try {
      const transcription = await gemini.transcribeVoice(base64, 'audio/webm');
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: transcription || 'Voice Message',
        timestamp: Date.now(),
        type: 'voice',
        audioUrl,
      };
      onSendMessage(userMsg);

      const aiResponse = await gemini.analyzeAndRespond(transcription || '...', userContext, messages);
      if (aiResponse) {
        onSendMessage({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse.response,
          timestamp: Date.now(),
          type: 'text',
          emotion: {
            label: aiResponse.label,
            confidence: aiResponse.confidence,
            intensity: aiResponse.intensity,
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const latestAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
  const currentEmotion = latestAssistantMsg?.emotion;

  return (
    <div className="flex flex-col lg:flex-row h-full gap-8 max-w-[1600px] mx-auto w-full p-4 lg:p-12 animate-in fade-in duration-1000">
      
      {/* Session Data Context Panel */}
      <div className="hidden lg:flex flex-col w-80 shrink-0 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-bold text-white text-lg">Live Analytics</h3>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Detected Mood</p>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${currentEmotion ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`}></span>
                <p className="text-sm font-bold text-white">{currentEmotion?.label || 'Calibrating...'}</p>
              </div>
            </div>
            
            <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Drift Intensity</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-black text-indigo-300">{currentEmotion?.intensity || 0}%</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-white/5">
             <div className="flex items-center gap-3 px-4 py-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest">Storage Persistent</span>
             </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] flex-1 flex flex-col gap-4">
          <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Brain className="w-3 h-3 text-purple-400" /> Session Goal
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Continue sharing your thoughts. Sonia is building your emotional arc for the Neural Dashboard.
          </p>
        </div>
      </div>

      {/* Primary Interaction Interface */}
      <div className="flex-1 flex flex-col glass-card rounded-[3rem] overflow-hidden relative shadow-2xl shadow-black/40">
        
        {/* Chat Interface Header */}
        <header className="px-10 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-black text-xl">
              S
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Sonia</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Listening</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:block text-[10px] font-black text-slate-600 uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
            Secure Session Token: {Date.now().toString(36).toUpperCase()}
          </div>
        </header>

        {/* Messages Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 max-w-sm mx-auto opacity-50">
              <div className="p-8 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                <Smile className="w-12 h-12 text-indigo-400" />
              </div>
              <p className="text-slate-400 text-lg leading-relaxed font-medium italic">
                "Hello. I'm Sonia. I'm here to listen and help you track your emotional trajectory. How are you feeling today?"
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
              <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-6 rounded-[2rem] shadow-xl relative ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none' 
                    : 'glass-card border-white/10 text-slate-100 rounded-tl-none'
                }`}>
                  {msg.type === 'voice' && (
                    <div className="mb-4 flex items-center gap-3 bg-black/10 p-3 rounded-2xl border border-white/5">
                      <Headphones className="w-4 h-4" />
                      <audio controls src={msg.audioUrl} className="h-6 w-full filter invert" />
                    </div>
                  )}
                  <p className="text-base leading-relaxed font-medium">{msg.content}</p>
                </div>

                {msg.emotion && (
                  <div className="mt-4 flex items-center gap-3 px-5 py-2 glass-card rounded-full border-indigo-500/10 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                    <Zap className="w-3 h-3" /> {msg.emotion.label} Detected • {msg.emotion.intensity}% Intensity
                  </div>
                )}
                
                <span className="text-[9px] text-slate-600 mt-2 font-black uppercase tracking-widest px-4">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-card p-6 rounded-[2rem] rounded-tl-none border-indigo-500/20 flex items-center gap-4 animate-pulse">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Sonia is analyzing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Controls */}
        <footer className="p-8 bg-white/[0.02] border-t border-white/5">
          <div className="flex items-center gap-6 max-w-5xl mx-auto">
            <div className="flex-1 relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
                placeholder={isRecording ? "Listening..." : "Share your feelings here..."}
                disabled={isRecording || isLoading}
                className="w-full pl-8 pr-16 py-5 bg-white/5 border border-white/10 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-base font-medium"
              />
              <div className="absolute right-3 flex items-center gap-2">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-4 rounded-2xl transition-all ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'text-slate-500 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {isRecording ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>
              </div>
            </div>
            <button
              onClick={handleSendText}
              disabled={!input.trim() || isLoading}
              className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-[1.5rem] shadow-xl shadow-indigo-500/20 hover:scale-105 active:scale-95 disabled:opacity-30 transition-all"
            >
              <Send className="w-7 h-7" />
            </button>
          </div>
          <div className="mt-8 flex justify-center gap-6 opacity-30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">AI-Emotion Core v4.0</p>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Neural Persistence Active</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Chat;
