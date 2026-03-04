import { useState } from 'react';
import { useActor } from './useActor';
import { useOfflineStorage } from './useOfflineStorage';
import type { OfflineData } from '../backend';

export interface SyncStatus {
  issyncing: boolean;
  progress: number;
  error: string | null;
  lastSyncTime: number | null;
}

export function useSyncOfflineData() {
  const { actor } = useActor();
  const { pendingData, clearAll, reload } = useOfflineStorage();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    issyncing: false,
    progress: 0,
    error: null,
    lastSyncTime: null,
  });

  const syncData = async (): Promise<boolean> => {
    if (!actor) {
      setSyncStatus((prev) => ({ ...prev, error: 'Backend not available' }));
      return false;
    }

    const totalItems = pendingData.sales.length + pendingData.expenses.length;
    if (totalItems === 0) {
      return true;
    }

    setSyncStatus({
      issyncing: true,
      progress: 0,
      error: null,
      lastSyncTime: null,
    });

    try {
      const offlineData: OfflineData = {
        sales: pendingData.sales,
        expenses: pendingData.expenses,
      };

      await actor.syncOfflineData(offlineData);

      clearAll();
      setSyncStatus({
        issyncing: false,
        progress: 100,
        error: null,
        lastSyncTime: Date.now(),
      });

      return true;
    } catch (error: any) {
      console.error('Sync failed:', error);
      setSyncStatus({
        issyncing: false,
        progress: 0,
        error: error.message || 'Sync failed',
        lastSyncTime: null,
      });
      return false;
    }
  };

  return {
    syncData,
    syncStatus,
    pendingCount: pendingData.sales.length + pendingData.expenses.length,
  };
}
