import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square } from 'lucide-react';
import { Message, UserContext } from '../types';
import { gemini } from '../services/geminiService';

/* ================= BACKEND API ================= */

const CHAT_API = "http://localhost:5000/api/chat";

const generateId = () =>
  Date.now().toString() + Math.random().toString(36).slice(2);

const saveMessage = async (role: string, text: string) => {
  const token = localStorage.getItem("token");

  await fetch(`${CHAT_API}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || ""
    },
    body: JSON.stringify({ role, text })
  });
};

const loadHistory = async () => {
  const token = localStorage.getItem("token");

  const res = await fetch(`${CHAT_API}/history`, {
    headers: { Authorization: token || "" }
  });

  return res.json();
};

/* ================= COMPONENT ================= */

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

  /* ===== LOAD CHAT HISTORY ===== */

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await loadHistory();

        history.forEach((msg: any) => {
          onSendMessage({
            id: generateId(),
            role: msg.role,
            content: msg.text,
            timestamp: new Date(msg.time).getTime(),
            type: 'text'
          });
        });
      } catch (err) {
        console.error("History load failed", err);
      }
    };

    fetchHistory();
  }, []);

  /* ===== AUTO SCROLL ===== */

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isLoading]);

  /* ===== SEND TEXT ===== */

  const handleSendText = async () => {
    if (!input.trim() || isLoading) return;

    const text = input.trim();
    setInput('');
    setIsLoading(true);

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
      type: 'text',
    };

    onSendMessage(userMsg);
    await saveMessage("user", text);

    try {
      const aiResponse = await gemini.analyzeAndRespond(text, userContext);

      if (aiResponse) {
        const aiMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: aiResponse.response,
          timestamp: Date.now(),
          type: 'text',
          emotion: {
            label: aiResponse.label,
            confidence: aiResponse.confidence,
            intensity: aiResponse.intensity,
          }
        };

        onSendMessage(aiMsg);
        await saveMessage("assistant", aiResponse.response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===== VOICE RECORDING ===== */

  const startRecording = async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert("Microphone not supported or permission blocked.");
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);

    mediaRecorderRef.current = recorder;
    audioChunksRef.current = [];

    recorder.ondataavailable = e => audioChunksRef.current.push(e.data);

    recorder.onstop = async () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();

      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        await handleVoiceMessage(base64, blob);
      };
    };

    recorder.start();
    setIsRecording(true);
  } catch (err) {
    alert("Please allow microphone access in browser settings.");
  }
};


  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
    setIsRecording(false);
  };

  /* ===== VOICE MESSAGE ===== */

  const handleVoiceMessage = async (base64: string, blob: Blob) => {
    setIsLoading(true);

    try {
      const transcription = await gemini.transcribeVoice(base64, 'audio/webm');

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content: transcription || 'Voice Message',
        timestamp: Date.now(),
        type: 'voice'
      };

      onSendMessage(userMsg);
      await saveMessage("user", transcription || "Voice Message");

      const aiResponse = await gemini.analyzeAndRespond(
        transcription || "...",
        userContext
      );

      if (aiResponse) {
        const aiMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: aiResponse.response,
          timestamp: Date.now(),
          type: 'text',
          emotion: {
            label: aiResponse.label,
            confidence: aiResponse.confidence,
            intensity: aiResponse.intensity,
          }
        };

        onSendMessage(aiMsg);
        await saveMessage("assistant", aiResponse.response);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ===== UI ===== */

  return (
    <div className="flex flex-col h-full p-6">

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="bg-white/10 p-4 rounded-xl max-w-[70%]">
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <p className="text-slate-400">Sonia is typing...</p>}
      </div>

      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSendText()}
          className="flex-1 p-3 rounded-xl bg-white/10"
          placeholder="Type here..."
        />

        <button onClick={handleSendText} className="bg-indigo-500 p-3 rounded-xl">
          <Send />
        </button>

        <button onClick={isRecording ? stopRecording : startRecording} className="bg-white/10 p-3 rounded-xl">
          {isRecording ? <Square /> : <Mic />}
        </button>
      </div>
    </div>
  );
};

export default Chat;
