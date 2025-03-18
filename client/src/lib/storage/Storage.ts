import { Device, User, Log } from '@shared/schema';

export interface StorageData {
  devices: Device[];
  users: User[];
  logs: Record<string, Log[]>;
  settings: {
    adminNumber: string;
    activeDeviceId: string | null;
    completedSteps: string[];
  };
}

const STORAGE_KEY = 'app_data';

export class Storage {
  private static instance: Storage;
  private data: StorageData;

  private constructor() {
    this.data = this.loadFromStorage() || {
      devices: [],
      users: [],
      logs: {},
      settings: {
        adminNumber: '',
        activeDeviceId: null,
        completedSteps: []
      }
    };
  }

  public static getInstance(): Storage {
    if (!Storage.instance) {
      Storage.instance = new Storage();
    }
    return Storage.instance;
  }

  private loadFromStorage(): StorageData | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load from storage:', error);
      return null;
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  public getData(): StorageData {
    return { ...this.data };
  }

  public getDevices(): Device[] {
    return [...this.data.devices];
  }

  public getDeviceById(id: number): Device | undefined {
    return this.data.devices.find(d => d.id === id);
  }

  public addDevice(device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Device {
    const newDevice: Device = {
      ...device,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.devices.push(newDevice);
    this.saveToStorage();
    return { ...newDevice };
  }

  public updateDevice(id: number, updates: Partial<Device>): Device | null {
    const index = this.data.devices.findIndex(d => d.id === id);
    if (index === -1) return null;

    const updatedDevice = {
      ...this.data.devices[index],
      ...updates,
      updatedAt: new Date()
    };
    this.data.devices[index] = updatedDevice;
    this.saveToStorage();
    return { ...updatedDevice };
  }

  public setActiveDevice(deviceId: number | null): boolean {
    this.data.settings.activeDeviceId = deviceId?.toString() || null;
    this.saveToStorage();
    return true;
  }

  private generateId(): number {
    return Date.now();
  }
}

export default Storage;
