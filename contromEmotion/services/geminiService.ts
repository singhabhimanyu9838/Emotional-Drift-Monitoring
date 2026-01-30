/// <reference types="vite/client" />

import { GoogleGenAI } from "@google/genai";
import { TEXT_MODEL, EMOTION_SCHEMA, REPORT_SCHEMA, SYSTEM_PROMPT } from "../constants";
import { UserContext, JournalEntry, Message } from "../types";

/* ================= ENV (VITE SAFE) ================= */

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Missing Gemini API Key. Add VITE_GEMINI_API_KEY in .env.local");
}

/* ================= GEMINI SERVICE ================= */

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({
      apiKey: API_KEY || ""
    });
  }

  /* ---------- CHAT RESPONSE ---------- */

  async analyzeAndRespond(
    text: string,
    userContext: UserContext
  ) {
    try {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [
          { role: "user", parts: [{ text }] }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT(
            userContext.role,
            userContext.language
          ),
          responseMimeType: "application/json",
          responseSchema: EMOTION_SCHEMA
        }
      });

      if (!response.text) return null;

      return JSON.parse(response.text);

    } catch (err: any) {

      /* Gemini overload fallback */
      if (err?.error?.code === 503) {
        return {
          response: "Sonia is currently processing many thoughts. Please try again in a moment.",
          label: "neutral",
          confidence: 0.5,
          intensity: 0
        };
      }

      console.error("❌ Gemini chat error:", err);
      return null;
    }
  }

  /* ---------- JOURNAL ANALYSIS ---------- */

  async analyzeJournal(text: string, userContext: UserContext) {
    try {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Analyze emotions for a ${userContext.role} in ${userContext.language}:\n\n${text}`
              }
            ]
          }
        ],
        config: {
          systemInstruction:
            "You are an expert emotional analysis AI. Return JSON only.",
          responseMimeType: "application/json",
          responseSchema: EMOTION_SCHEMA
        }
      });

      return response.text ? JSON.parse(response.text) : null;

    } catch (err) {
      console.error("❌ Gemini journal error:", err);
      return null;
    }
  }

  /* ---------- SUMMARY REPORT ---------- */

  async generateSummaryReport(
    entries: JournalEntry[],
    messages: Message[],
    userContext: UserContext
  ) {
    try {
      const dataSummary = [
        ...entries.map(
          e =>
            `[Journal] ${new Date(e.timestamp).toDateString()} → ${e.emotion.label} (${e.emotion.intensity}%)`
        ),
        ...messages
          .filter(m => m.emotion)
          .map(
            m =>
              `[Chat] ${new Date(m.timestamp).toDateString()} → ${m.emotion?.label} (${m.emotion?.intensity}%)`
          )
      ].join("\n");

      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Generate emotional wellness report:\n\n${dataSummary}`
              }
            ]
          }
        ],
        config: {
          systemInstruction:
            "You are a clinical psychologist AI generating structured wellness reports.",
          responseMimeType: "application/json",
          responseSchema: REPORT_SCHEMA
        }
      });

      return response.text ? JSON.parse(response.text) : null;

    } catch (err) {
      console.error("❌ Gemini report error:", err);
      return null;
    }
  }

  /* ---------- VOICE TRANSCRIPTION ---------- */

  async transcribeVoice(audioBase64: string, mimeType: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: TEXT_MODEL,
        contents: {
          parts: [
            { inlineData: { data: audioBase64, mimeType } },
            { text: "Transcribe accurately. Return text only." }
          ]
        }
      });

      return response.text || "";

    } catch (err) {
      console.error("❌ Gemini voice error:", err);
      return "";
    }
  }
}

/* ================= EXPORT ================= */

export const gemini = new GeminiService();
