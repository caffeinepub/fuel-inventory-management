import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import { useConnectionMonitor } from "./useConnectionMonitor";
import { useOfflineStorage } from "./useOfflineStorage";
import { useSyncOfflineData } from "./useSyncOfflineData";

export function useAutoSync() {
  const { isConnected, isBackendReachable } = useConnectionMonitor();
  const { syncData, syncStatus, pendingCount } = useSyncOfflineData();
  const { hasPendingData } = useOfflineStorage();
  const queryClient = useQueryClient();
  const lastConnectionState = useRef(false);
  const isSyncingRef = useRef(false);

  const triggerSync = useCallback(async () => {
    if (isSyncingRef.current || !isConnected || !hasPendingData()) {
      return;
    }

    isSyncingRef.current = true;
    const success = await syncData();
    isSyncingRef.current = false;

    if (success) {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["tanks"] });
      queryClient.invalidateQueries({ queryKey: ["cashCollections"] });
    }
  }, [isConnected, hasPendingData, syncData, queryClient]);

  useEffect(() => {
    if (isConnected && !lastConnectionState.current && hasPendingData()) {
      setTimeout(() => {
        triggerSync();
      }, 1000);
    }
    lastConnectionState.current = isConnected;
  }, [isConnected, hasPendingData, triggerSync]);

  useEffect(() => {
    if (isBackendReachable && hasPendingData() && !syncStatus.issyncing) {
      triggerSync();
    }
  }, [isBackendReachable, hasPendingData, syncStatus.issyncing, triggerSync]);

  return {
    triggerSync,
    syncStatus,
    pendingCount,
    isConnected,
  };
}
