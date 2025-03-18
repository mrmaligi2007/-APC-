import React, { createContext, useContext, useEffect, useState } from 'react';
import Storage from './storage/Storage';
import type { StorageData } from './storage/Storage';

interface DataContextType {
  storage: Storage | null;
  data: StorageData | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

const DataContext = createContext<DataContextType>({
  storage: null,
  data: null,
  isLoading: true,
  error: null,
  refresh: () => {}
});

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [storage, setStorage] = useState<Storage | null>(null);
  const [data, setData] = useState<StorageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = () => {
    if (storage) {
      setData(storage.getData());
    }
  };

  useEffect(() => {
    const initializeStorage = () => {
      try {
        const storageInstance = Storage.getInstance();
        setStorage(storageInstance);
        setData(storageInstance.getData());
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize storage'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeStorage();
  }, []);

  const value = {
    storage,
    data,
    isLoading,
    error,
    refresh
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}