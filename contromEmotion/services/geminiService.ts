
import { GoogleGenAI, Type } from "@google/genai";
import { TEXT_MODEL, EMOTION_SCHEMA, REPORT_SCHEMA, SYSTEM_PROMPT } from "../constants";
import { UserContext, EmotionData, JournalEntry, Message } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeAndRespond(
    text: string, 
    userContext: UserContext, 
    history: any[] = []
  ) {
    const response = await this.ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        { role: 'user', parts: [{ text }] }
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT(userContext.role, userContext.language),
        responseMimeType: "application/json",
        responseSchema: EMOTION_SCHEMA,
      },
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      console.error("Failed to parse AI response", e);
      return null;
    }
  }

  async analyzeJournal(text: string, userContext: UserContext) {
    const response = await this.ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        { role: 'user', parts: [{ text: `Analyze this journal entry for emotional state. Provide insights appropriate for a ${userContext.role} in ${userContext.language}. \n\nEntry: ${text}` }] }
      ],
      config: {
        systemInstruction: "You are an AI emotion analyst. Output high-fidelity emotion data in JSON format.",
        responseMimeType: "application/json",
        responseSchema: EMOTION_SCHEMA,
      },
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return null;
    }
  }

  async generateSummaryReport(entries: JournalEntry[], messages: Message[], userContext: UserContext) {
    const dataSummary = [
      ...entries.map(e => `[Journal] ${new Date(e.timestamp).toDateString()}: ${e.emotion.label} (${e.emotion.intensity}%)`),
      ...messages.filter(m => m.emotion).map(m => `[Chat] ${new Date(m.timestamp).toDateString()}: ${m.emotion?.label} (${m.emotion?.intensity}%)`)
    ].join('\n');

    const response = await this.ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [
        { role: 'user', parts: [{ text: `Generate a comprehensive emotional wellness report based on the following trajectory data:\n\n${dataSummary}\n\nTarget Context: ${userContext.role}` }] }
      ],
      config: {
        systemInstruction: "You are a world-class AI psychotherapist specialized in data synthesis. Provide a professional wellness report in JSON.",
        responseMimeType: "application/json",
        responseSchema: REPORT_SCHEMA,
      },
    });

    try {
      return JSON.parse(response.text || '{}');
    } catch (e) {
      return null;
    }
  }

  async transcribeVoice(audioBase64: string, mimeType: string) {
    const response = await this.ai.models.generateContent({
      model: TEXT_MODEL,
      contents: {
        parts: [
          { inlineData: { data: audioBase64, mimeType } },
          { text: "Transcribe this audio message accurately. Return only the transcription." }
        ]
      }
    });
    return response.text;
  }
}

export const gemini = new GeminiService();
