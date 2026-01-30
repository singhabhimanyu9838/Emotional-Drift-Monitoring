
import React, { useState, useEffect, useRef } from 'react';
import { PhoneOff, Mic, MicOff, ShieldCheck, Heart, Sparkles, Wind, Info, MicVocal } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { LIVE_MODEL } from '../constants';
import { decode, encode, createBlob, decodeAudioData } from '../services/audioService';

interface VoiceCallProps {
  language: string;
  context: string;
}

const VoiceCall: React.FC<VoiceCallProps> = ({ language, context }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTranscription, setCurrentTranscription] = useState('');

  const timerRef = useRef<number>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  useEffect(() => {
    if (isCalling) {
      timerRef.current = window.setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
      startLiveSession();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setDuration(0);
      setIsResponding(false);
      stopLiveSession();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopLiveSession();
    };
  }, [isCalling]);

  const startLiveSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const sessionPromise = ai.live.connect({
        model: LIVE_MODEL,
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg) => {
            if (msg.serverContent?.outputTranscription) {
               setCurrentTranscription(msg.serverContent.outputTranscription.text);
            }

            const audioData = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setIsResponding(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setIsResponding(false);
              });
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => {
                try { s.stop(); } catch(e) {}
                sourcesRef.current.delete(s);
              });
              nextStartTimeRef.current = 0;
              setIsResponding(false);
            }
          },
          onerror: (e) => console.error("Live session error:", e),
          onclose: (e) => {
            console.log("Live session closed", e);
            setIsCalling(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are Sonia, a professional emotional wellness assistant. 
          Language: Speak in ${language}. 
          User Context: ${context}.
          
          Persona: Calm, empathetic, warm, and highly supportive therapist.
          Interaction Protocol:
          1. Acknowledge emotion immediately.
          2. Reflect with warmth.
          3. Normalize based on context: ${context}.
          4. Offer one grounding thought.
          5. Ask at most one gentle question.
          6. Keep it very concise (3-5 lines).`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Failed to connect live session", err);
      setIsCalling(false);
    }
  };

  const stopLiveSession = () => {
    sessionRef.current?.close();
    sessionRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    sourcesRef.current.forEach(s => {
       try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-between p-8 lg:p-14 animate-in fade-in duration-1000 relative">
      
      {/* Background Ambience */}
      <div className={`fixed inset-0 pointer-events-none transition-opacity duration-[3000ms] ${isCalling ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-indigo-500/5 blur-[120px] animate-pulse"></div>
      </div>

      <header className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3 px-6 py-3 glass-card rounded-full border-white/5 bg-white/[0.02]">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sonia Sanctuary • Active encryption</span>
        </div>
        {isCalling && (
          <div className="px-6 py-3 glass-card rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 border-indigo-500/20">
            Presence: {formatTime(duration)}
          </div>
        )}
      </header>

      {/* The Presence Orb */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl text-center space-y-16 z-10">
        <div className="relative">
          {/* Outer Ring */}
          <div className={`absolute inset-[-60px] rounded-full border transition-all duration-[2000ms] ${
            isCalling ? 'border-indigo-500/20 scale-100 opacity-100 rotate-45' : 'border-white/5 scale-90 opacity-0'
          }`}></div>
          
          {/* Main Visual Core */}
          <div className={`relative w-80 h-80 rounded-full flex items-center justify-center transition-all duration-[1500ms] ease-out ${
            isCalling 
              ? 'bg-gradient-to-br from-indigo-500/20 via-transparent to-purple-500/20 shadow-[0_0_120px_rgba(99,102,241,0.1)]' 
              : 'bg-white/5'
          }`}>
            <div className={`w-48 h-48 rounded-full transition-all duration-[2000ms] ease-in-out relative ${
              isCalling 
                ? isResponding 
                  ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-indigo-500 scale-110 blur-[8px] opacity-80' 
                  : 'bg-gradient-to-br from-indigo-500 to-indigo-300 scale-100 animate-pulse-glow shadow-[0_0_60px_rgba(99,102,241,0.4)]'
                : 'bg-white/10 scale-90'
            }`}>
              {/* Internal Fluid Motion Layer */}
              {isCalling && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent animate-spin duration-[8s] opacity-30"></div>
              )}
            </div>
            
            {/* Listening Wave Overlays */}
            {isCalling && !isResponding && (
              <>
                <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping duration-[3s]" />
                <div className="absolute inset-[-20px] rounded-full border border-indigo-500/10 animate-ping duration-[4s] delay-700" />
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h1 className="text-5xl font-black text-white tracking-tighter transition-all duration-700">
            {!isCalling ? 'Speak Freely' : isResponding ? 'Sonia is reflecting...' : 'I am listening...'}
          </h1>
          <p className="text-slate-400 text-xl font-medium max-w-lg mx-auto leading-relaxed opacity-80">
            {!isCalling 
              ? 'Find a moment of clarity through conversation. This safe space is yours to explore.' 
              : isResponding 
                ? 'Processing your resonance with care.' 
                : 'Share whatever is on your mind. Take all the time you need.'}
          </p>
        </div>

        {!isCalling && (
          <button
            onClick={() => setIsCalling(true)}
            className="group relative px-16 py-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full text-white font-black text-xl shadow-[0_20px_60px_-15px_rgba(99,102,241,0.5)] hover:scale-105 active:scale-95 transition-all duration-500 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
            Begin your reflection
          </button>
        )}
      </div>

      {/* Trust & Expectations Cards */}
      <div className="w-full max-w-5xl z-10">
        {!isCalling ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-bottom-12 duration-1000">
            <div className="glass-card p-10 rounded-[3rem] group hover:bg-white/[0.05]">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:animate-bounce">
                <Heart className="w-7 h-7 text-indigo-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Safe Sanctuary</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Your voice stays here. Locally encrypted and ephemeral by design.</p>
            </div>
            
            <div className="glass-card p-10 rounded-[3rem] group hover:bg-white/[0.05]">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Wind className="w-7 h-7 text-purple-400 animate-pulse" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">What to expect</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">Breathe deeply. Speak naturally. We’ll navigate your thoughts together.</p>
            </div>

            <div className="glass-card p-10 rounded-[3rem] group hover:bg-white/[0.05]">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-7 h-7 text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Private & Secure</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">A dedicated clinical-grade channel with zero persistent storage.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-10 animate-in fade-in duration-700">
            <div className="flex items-center gap-8">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-8 rounded-[2.5rem] transition-all active:scale-90 border ${
                  isMuted ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'glass-card border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
              
              <button
                onClick={() => setIsCalling(false)}
                className="px-14 py-7 bg-white/[0.03] hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 rounded-full transition-all font-black text-xs uppercase tracking-[0.4em]"
              >
                Leave this space
              </button>
            </div>
            
            <div className="px-10 py-5 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-4 max-w-xl">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest leading-relaxed line-clamp-2 italic">
                {currentTranscription || 'Finding the resonance in your voice...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceCall;
