
export type EmotionLabel = 'Happy' | 'Sad' | 'Stress' | 'Anxiety' | 'Anger' | 'Burnout' | 'Neutral' | 'Excited';

export interface EmotionData {
  label: EmotionLabel;
  confidence: number;
  intensity: number; // 0-100
  response?: string;
  activities?: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  emotion?: EmotionData;
  type: 'text' | 'voice';
  audioUrl?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  emotion: EmotionData;
}

export interface UserContext {
  role: 'Student' | 'Office worker' | 'Personal life';
  language: 'English' | 'Hindi';
}

export interface AnalyticsSummary {
  healthScore: number;
  stabilityIndex: number;
  burnoutRisk: number;
  improvementRate: number;
}

export interface HistoryEntry {
  date: string;
  emotions: EmotionData[];
}
