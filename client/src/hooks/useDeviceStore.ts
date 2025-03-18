import { useState, useEffect } from 'react';
import { useDataContext } from '../lib/DataContext';
import { Device, User, Log } from '@shared/schema';

export function useDeviceStore() {
  const { dataStore, isLoading: isDataStoreLoading, error: dataStoreError } = useDataContext();
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevice, setActiveDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!dataStore || isDataStoreLoading) return;

    const loadDevices = async () => {
      try {
        const allDevices = dataStore.getDevices();
        setDevices(allDevices);
        
        const activeId = dataStore.getGlobalSettings().activeDeviceId;
        if (activeId) {
          const active = dataStore.getDeviceById(activeId);
          setActiveDevice(active);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load devices'));
      } finally {
        setIsLoading(false);
      }
    };

    loadDevices();
  }, [dataStore, isDataStoreLoading]);

  const addDevice = async (device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!dataStore) throw new Error('DataStore not initialized');
    const newDevice = await dataStore.addDevice(device);
    setDevices([...devices, newDevice]);
    return newDevice;
  };

  const updateDevice = async (deviceId: string, updates: Partial<Device>) => {
    if (!dataStore) throw new Error('DataStore not initialized');
    const updated = await dataStore.updateDevice(deviceId, updates);
    if (updated) {
      setDevices(devices.map(d => d.id === deviceId ? updated : d));
      if (activeDevice?.id === deviceId) {
        setActiveDevice(updated);
      }
    }
    return updated;
  };

  const deleteDevice = async (deviceId: string) => {
    if (!dataStore) throw new Error('DataStore not initialized');
    const success = await dataStore.deleteDevice(deviceId);
    if (success) {
      setDevices(devices.filter(d => d.id !== deviceId));
      if (activeDevice?.id === deviceId) {
        setActiveDevice(null);
      }
    }
    return success;
  };

  const setActiveDeviceById = async (deviceId: string | null) => {
    if (!dataStore) throw new Error('DataStore not initialized');
    const success = await dataStore.setActiveDevice(deviceId);
    if (success && deviceId) {
      const device = dataStore.getDeviceById(deviceId);
      setActiveDevice(device);
    } else {
      setActiveDevice(null);
    }
    return success;
  };

  return {
    devices,
    activeDevice,
    isLoading: isLoading || isDataStoreLoading,
    error: error || dataStoreError,
    addDevice,
    updateDevice,
    deleteDevice,
    setActiveDevice: setActiveDeviceById
  };
}
