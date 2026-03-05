import { useCallback, useEffect, useState } from "react";
import { useActor } from "./useActor";
import { useOnlineStatus } from "./useOnlineStatus";

export function useConnectionMonitor() {
  const isOnline = useOnlineStatus();
  const { actor } = useActor();
  const [isBackendReachable, setIsBackendReachable] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(null);

  const checkBackendHealth = useCallback(async () => {
    if (!actor || !isOnline) {
      setIsBackendReachable(false);
      return false;
    }

    try {
      await actor.getCurrentPrices();
      setIsBackendReachable(true);
      setLastOnlineTime(Date.now());
      return true;
    } catch (_error) {
      setIsBackendReachable(false);
      return false;
    }
  }, [actor, isOnline]);

  useEffect(() => {
    checkBackendHealth();

    const interval = setInterval(() => {
      checkBackendHealth();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  useEffect(() => {
    if (isOnline) {
      checkBackendHealth();
    } else {
      setIsBackendReachable(false);
    }
  }, [isOnline, checkBackendHealth]);

  return {
    isOnline,
    isBackendReachable,
    isConnected: isOnline && isBackendReachable,
    lastOnlineTime,
    checkHealth: checkBackendHealth,
  };
}
