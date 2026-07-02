import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'app-cache' });

export const Cache = {
  /**
   * Save any data with type safety
   */
  set: <T>(key: string, value: T) => {
    storage.set(key, JSON.stringify(value));
  },

  /**
   * Retrieve data. Returns null if key doesn't exist.
   */
  get: <T>(key: string): T | null => {
    const json = storage.getString(key);
    if (!json) return null;
    
    try {
      return JSON.parse(json) as T;
    } catch (e) {
      console.error('Failed to parse cache:', e);
      return null;
    }
  },

  /**
   * Delete specific key
   */
  remove: (key: string) => {
    storage.remove(key);
  },

  /**
   * Clear all cached data
   */
  clearAll: () => {
    storage.clearAll();
  }
};

// Cache keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  TEMPLATES: 'templates',
  WORKOUTS: 'workouts',
} as const;
