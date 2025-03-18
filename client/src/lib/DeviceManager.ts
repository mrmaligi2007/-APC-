import { Device } from '@shared/schema';
import DataStore from './DataStore';
import { SMSService } from './SMSService';
import { BackupService } from './BackupService';

/**
 * DeviceManager class handles high-level device management operations
 * by coordinating between DataStore, SMSService and BackupService
 */
export class DeviceManager {
  private dataStore: DataStore;

  constructor() {
    this.dataStore = DataStore.getInstance();
  }

  /**
   * Initialize a new device with default settings
   */
  async initializeDevice(device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device> {
    try {
      const newDevice = await this.dataStore.addDevice({
        ...device,
        relaySettings: JSON.stringify({
          accessControl: 'AUT',
          latchTime: '000'
        })
      });

      // Create initial backup after adding new device
      await BackupService.createBackup();

      // Add system log for device creation
      await this.dataStore.addDeviceLog(
        newDevice.id,
        'Device Created',
        `Device ${newDevice.name} (${newDevice.unitNumber}) was initialized`,
        true,
        'system'
      );

      return newDevice;
    } catch (error) {
      console.error('Failed to initialize device:', error);
      throw new Error('Failed to initialize device. Please try again.');
    }
  }

  /**
   * Update device settings and persist changes
   */
  async updateDevice(deviceId: string, updates: Partial<Device>): Promise<Device | null> {
    try {
      const device = await this.dataStore.updateDevice(deviceId, updates);
      
      if (device) {
        // Log the update
        await this.dataStore.addDeviceLog(
          deviceId,
          'Device Updated',
          `Device settings were updated`,
          true,
          'settings'
        );

        // Create backup after significant changes
        await BackupService.createBackup();
      }

      return device;
    } catch (error) {
      console.error('Failed to update device:', error);
      throw new Error('Failed to update device settings. Please try again.');
    }
  }

  /**
   * Delete a device and clean up associated data
   */
  async deleteDevice(deviceId: string): Promise<boolean> {
    try {
      // Get device details before deletion for logging
      const device = this.dataStore.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      // Perform deletion
      const success = await this.dataStore.deleteDevice(deviceId);
      
      if (success) {
        // Create backup after deletion
        await BackupService.createBackup();
      }

      return success;
    } catch (error) {
      console.error('Failed to delete device:', error);
      throw new Error('Failed to delete device. Please try again.');
    }
  }

  /**
   * Send device command via SMS
   */
  async sendDeviceCommand(
    deviceId: string,
    action: 'open' | 'close' | 'status' | 'setLatchTime' | 'setAccessControl',
    params?: { seconds?: number; mode?: 'AUT' | 'ALL' }
  ): Promise<boolean> {
    try {
      const device = this.dataStore.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      let command: string;
      let logAction: string;
      let logDetails: string;

      switch (action) {
        case 'open':
          command = SMSService.generateAccessCode(device);
          logAction = 'Gate Open';
          logDetails = 'Gate open command sent';
          break;
        case 'close':
          command = `${device.password}DD`;
          logAction = 'Gate Close';
          logDetails = 'Gate close command sent';
          break;
        case 'status':
          command = SMSService.generateStatusCheck(device);
          logAction = 'Status Check';
          logDetails = 'Device status check requested';
          break;
        case 'setLatchTime':
          if (typeof params?.seconds !== 'number') {
            throw new Error('Latch time in seconds is required');
          }
          command = SMSService.generateSetLatchTime(device, params.seconds);
          logAction = 'Set Latch Time';
          logDetails = `Latch time set to ${params.seconds} seconds`;
          break;
        case 'setAccessControl':
          if (!params?.mode) {
            throw new Error('Access control mode is required');
          }
          command = SMSService.generateSetAccessControl(device, params.mode);
          logAction = 'Set Access Control';
          logDetails = `Access control set to ${params.mode}`;
          break;
        default:
          throw new Error('Invalid command action');
      }

      // Send command via SMS
      const success = await SMSService.sendCommand(device, command);

      // Log the command
      await this.dataStore.addDeviceLog(
        deviceId,
        logAction,
        logDetails,
        success,
        'relay'
      );

      return success;
    } catch (error) {
      console.error('Failed to send device command:', error);
      throw new Error('Failed to send command to device. Please try again.');
    }
  }

  /**
   * Update device relay settings
   */
  async updateRelaySettings(
    deviceId: string,
    settings: { accessControl: 'AUT' | 'ALL'; latchTime: string }
  ): Promise<Device | null> {
    try {
      const device = this.dataStore.getDeviceById(deviceId);
      if (!device) {
        throw new Error('Device not found');
      }

      // Update local settings
      const updated = await this.dataStore.updateDevice(deviceId, {
        ...device,
        relaySettings: JSON.stringify(settings)
      });

      if (updated) {
        // Send commands to device to sync settings
        await this.sendDeviceCommand(deviceId, 'setAccessControl', { mode: settings.accessControl });
        await this.sendDeviceCommand(deviceId, 'setLatchTime', { seconds: parseInt(settings.latchTime) });

        // Log settings update
        await this.dataStore.addDeviceLog(
          deviceId,
          'Relay Settings Updated',
          `Updated access control to ${settings.accessControl} and latch time to ${settings.latchTime}`,
          true,
          'settings'
        );
      }

      return updated;
    } catch (error) {
      console.error('Failed to update relay settings:', error);
      throw new Error('Failed to update relay settings. Please try again.');
    }
  }
}

export default DeviceManager;
