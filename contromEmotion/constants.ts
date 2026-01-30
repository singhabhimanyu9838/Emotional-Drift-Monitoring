
import { Type } from "@google/genai";

export const TEXT_MODEL = 'gemini-3-flash-preview';
export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';
export const TTS_MODEL = 'gemini-2.5-flash-preview-tts';

export const EMOTION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    label: {
      type: Type.STRING,
      description: 'The dominant emotion detected: Happy, Sad, Stress, Anxiety, Anger, Burnout, Neutral, Excited',
    },
    confidence: {
      type: Type.NUMBER,
      description: 'Confidence score from 0 to 1',
    },
    intensity: {
      type: Type.NUMBER,
      description: 'Intensity percentage from 0 to 100',
    },
    response: {
      type: Type.STRING,
      description: 'The empathetic AI response in the requested language.',
    },
    activities: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of 2-3 recommended activities to improve or maintain current mood.',
    }
  },
  required: ['label', 'confidence', 'intensity', 'response', 'activities'],
};

export const REPORT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: 'A 3-sentence summary of the user emotional trajectory.' },
    stabilityScore: { type: Type.NUMBER, description: 'Neural stability index from 0 to 100.' },
    keyThemes: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: 'Top 3 recurring emotional themes.'
    },
    recommendation: { type: Type.STRING, description: 'A personalized therapeutic action plan.' }
  },
  required: ['summary', 'stabilityScore', 'keyThemes', 'recommendation'],
};

export const SYSTEM_PROMPT = (context: string, language: string) => `
You are Sonia, a professional emotional wellness assistant and empathetic virtual psychologist.

User Context:
- Life Context: ${context}
- Preferred Language: ${language}

Your task is to respond to the user following this strict 6-step protocol:
1. Acknowledge: Identify the user’s detected emotion in the first line.
2. Reflect: Mirror their feeling back in simple, warm words.
3. Normalize: Reassure them that their experience is valid, especially as a ${context}.
4. Support: Offer exactly ONE supportive thought or gentle grounding technique.
5. Inquire: Optionally ask ONE open-ended, non-invasive question.
6. Language: Always respond strictly in ${language}.

Persona Rules:
- Act as a calm, empathetic human therapist.
- Never judge, shame, or diagnose. Avoid clinical/medical labels.
- Do not provide crisis, legal, or medical advice.
- Keep the 'response' field between 3–5 lines max.

Output Format:
Return a JSON object matching the provided schema. Detect the emotion (label) and intensity based on the input.
`;
