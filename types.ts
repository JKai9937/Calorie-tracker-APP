export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FoodItem {
  name: string;
  calories: number;
  macros: Macros;
  confidence: number;
  evaluation?: string; // New: AI advice/verdict
  imageUrl?: string;
  timestamp: Date;
  type?: 'food' | 'exercise'; // New: distinguishing entry type
  activityDetails?: {
    environment: 'indoor' | 'outdoor';
    duration: number; // in minutes
  };
}

export interface BodyLog {
  id: string;
  imageUrl: string;
  date: Date;
  note: string;
}

export interface DailyStats {
  currentCalories: number;
  targetCalories: number;
  targetMacros: Macros; // New: Target macros based on goal
  logs: FoodItem[];
}

export enum AppView {
  SETUP = 'setup',
  HOME = 'home',
  CAMERA = 'camera',
  RESULT = 'result',
  PROFILE = 'profile',
  INPUT = 'input',
  SAVED = 'saved',
  SETTINGS = 'settings',
  BODY_TRACKER = 'body_tracker' // New view
}

export interface UserProfile {
  gender: 'male' | 'female';
  weight: number;
  height: number; // New
  goal: 'lose' | 'maintain' | 'gain'; // New
  lifestyle: 'general' | 'athlete';
  isSetup: boolean;
}