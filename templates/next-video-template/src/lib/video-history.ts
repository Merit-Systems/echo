import type { GeneratedVideo } from './types';

const VIDEO_HISTORY_KEY = 'video-history';

export const videoHistoryStorage = {
  getAll(): GeneratedVideo[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(VIDEO_HISTORY_KEY);
      if (!stored) return [];
      const list = JSON.parse(stored) as GeneratedVideo[];
      return list.map(item => ({
        ...item,
        timestamp: new Date(item.timestamp as unknown as string),
      }));
    } catch {
      return [];
    }
  },

  setAll(history: GeneratedVideo[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(VIDEO_HISTORY_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('Failed to persist video history:', error);
    }
  },

  remove(videoId: string): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = this.getAll();
      const filtered = existing.filter(v => v.id !== videoId);
      localStorage.setItem(VIDEO_HISTORY_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove video from history:', error);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(VIDEO_HISTORY_KEY);
    } catch (error) {
      console.error('Failed to clear video history:', error);
    }
  },
};
