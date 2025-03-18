import { Device } from '@shared/schema';

export class SMSService {
  static async isAvailable(): Promise<boolean> {
    // Check if running in a browser environment
    if (typeof window === 'undefined') return false;

    // Check for Web Share API support
    if (navigator.share) {
      return true;
    }

    // Fallback check for basic SMS URI scheme support
    return true; // Most browsers support basic sms: URI scheme
  }

  static async sendCommand(device: Device, command: string): Promise<boolean> {
    try {
      const isAvailable = await this.isAvailable();

      if (!isAvailable) {
        throw new Error('SMS functionality not available on this device');
      }

      // Try Web Share API first
      if (navigator.share) {
        await navigator.share({
          text: command,
          url: `sms:${device.unitNumber}?body=${encodeURIComponent(command)}`
        });
        return true;
      }

      // Fallback to SMS URI scheme
      const smsUrl = `sms:${device.unitNumber}?body=${encodeURIComponent(command)}`;
      window.open(smsUrl, '_blank');
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      throw error;
    }
  }

  static generateAccessCode(device: Device): string {
    return `${device.password}CC`;
  }

  static generateStatusCheck(device: Device): string {
    return `${device.password}EE`;
  }

  static generateAddUser(device: Device, phoneNumber: string, serialNumber: string): string {
    return `${device.password}A${serialNumber}#${phoneNumber}#`;
  }

  static generateDeleteUser(device: Device, serialNumber: string): string {
    return `${device.password}A${serialNumber}##`;
  }

  static generateSetLatchTime(device: Device, seconds: number): string {
    const paddedSeconds = seconds.toString().padStart(3, '0');
    return `${device.password}GOT${paddedSeconds}#`;
  }

  static generateSetAccessControl(device: Device, mode: 'AUT' | 'ALL'): string {
    return `${device.password}${mode}`;
  }
}

export default SMSService;