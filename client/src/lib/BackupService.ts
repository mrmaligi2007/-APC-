import LocalStorage, { STORAGE_KEYS } from './storage/LocalStorage';
import { Device, User, Log } from '@shared/schema';

export interface BackupData {
  version: string;
  timestamp: string;
  devices: Device[];
  users: User[];
  logs: Record<string, Log[]>;
  settings: {
    adminNumber: string;
    activeDeviceId: string | null;
    completedSteps: string[];
  };
}

export class BackupService {
  private static readonly BACKUP_VERSION = '1.0';

  static async createBackup(): Promise<string> {
    try {
      const devices = await LocalStorage.getItem<Device[]>(STORAGE_KEYS.DEVICES) || [];
      const users = await LocalStorage.getItem<User[]>(STORAGE_KEYS.USERS) || [];
      const logs = await LocalStorage.getItem<Record<string, Log[]>>(STORAGE_KEYS.LOGS) || {};
      const settings = await LocalStorage.getItem<BackupData['settings']>(STORAGE_KEYS.SETTINGS) || {
        adminNumber: '',
        activeDeviceId: null,
        completedSteps: []
      };

      const backup: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: new Date().toISOString(),
        devices,
        users,
        logs,
        settings
      };

      return JSON.stringify(backup, null, 2);
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  static async restoreFromBackup(backupData: string): Promise<boolean> {
    try {
      const backup: BackupData = JSON.parse(backupData);

      if (!this.isValidBackup(backup)) {
        throw new Error('Invalid backup format');
      }

      // Restore each data type to local storage
      await LocalStorage.setItem(STORAGE_KEYS.DEVICES, backup.devices);
      await LocalStorage.setItem(STORAGE_KEYS.USERS, backup.users);
      await LocalStorage.setItem(STORAGE_KEYS.LOGS, backup.logs);
      await LocalStorage.setItem(STORAGE_KEYS.SETTINGS, backup.settings);

      return true;
    } catch (error) {
      console.error('Failed to restore from backup:', error);
      throw new Error('Failed to restore from backup');
    }
  }

  private static isValidBackup(backup: any): backup is BackupData {
    return (
      typeof backup === 'object' &&
      typeof backup.version === 'string' &&
      typeof backup.timestamp === 'string' &&
      Array.isArray(backup.devices) &&
      Array.isArray(backup.users) &&
      typeof backup.logs === 'object' &&
      typeof backup.settings === 'object' &&
      typeof backup.settings.adminNumber === 'string' &&
      (backup.settings.activeDeviceId === null || typeof backup.settings.activeDeviceId === 'string') &&
      Array.isArray(backup.settings.completedSteps)
    );
  }
}

export default BackupService;