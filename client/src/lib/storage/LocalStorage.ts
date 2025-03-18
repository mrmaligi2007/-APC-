import { Device, User, Log } from '@shared/schema';

export interface StorageKeys {
  DEVICES: 'devices';
  USERS: 'users';
  LOGS: 'logs';
  SETTINGS: 'settings';
}

export const STORAGE_KEYS: StorageKeys = {
  DEVICES: 'devices',
  USERS: 'users',
  LOGS: 'logs',
  SETTINGS: 'settings'
};

class LocalStorage {
  static async getItem<T>(key: keyof StorageKeys): Promise<T | null> {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  }

  static async setItem<T>(key: keyof StorageKeys, value: T): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  }

  static async removeItem(key: keyof StorageKeys): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  }

  static async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }
}

export default LocalStorage;
