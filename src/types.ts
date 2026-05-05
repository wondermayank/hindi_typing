export type LayoutType = 'inscript' | 'remadel';
export type ViewType = 'home' | 'practice' | 'learning' | 'paragraph';
export type ThemeType = 'dark' | 'light';

export interface KeyMap {
  code: string;
  char: string;
  shift: string;
  finger: string;
  row: number;
}

export interface Lesson {
  target: string;
  instruction: string;
  repeat?: number;
}

export interface HeatMapData {
  [key: string]: number;
}

export interface SessionRecord {
  date: string;
  wpm: number;
  accuracy: number;
  mode: string;
}
