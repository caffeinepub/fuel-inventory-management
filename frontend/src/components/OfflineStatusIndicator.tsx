import { useConnectionMonitor } from '../hooks/useConnectionMonitor';
import { useAutoSync } from '../hooks/useAutoSync';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { WifiOff, Wifi, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

export default function OfflineStatusIndicator() {
  const { isConnected, isOnline, isBackendReachable } = useConnectionMonitor();
  const { triggerSync, syncStatus, pendingCount } = useAutoSync();
  const lastSyncSuccessRef = useRef(false);

  useEffect(() => {
    if (syncStatus.lastSyncTime && !lastSyncSuccessRef.current) {
      toast.success(`Successfully synced ${pendingCount} items`);
      lastSyncSuccessRef.current = true;
    }
    if (syncStatus.error && lastSyncSuccessRef.current) {
      toast.error(`Sync failed: ${syncStatus.error}`);
      lastSyncSuccessRef.current = false;
    }
  }, [syncStatus.lastSyncTime, syncStatus.error, pendingCount]);

  const handleManualSync = async () => {
    if (pendingCount === 0) {
      toast.info('No pending data to sync');
      return;
    }
    if (!isConnected) {
      toast.error('Cannot sync while offline');
      return;
    }
    await triggerSync();
  };

  // Only show the bar when offline or there's something to show
  const showBar = !isConnected || pendingCount > 0 || syncStatus.issyncing || syncStatus.lastSyncTime || syncStatus.error;

  if (!showBar) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 px-3 sm:px-4 py-2 bg-card border-b border-border text-xs sm:text-sm">
      <div className="flex items-center gap-1.5">
        {isConnected ? (
          <Wifi className="w-3.5 h-3.5 text-green-600 shrink-0" />
        ) : (
          <WifiOff className="w-3.5 h-3.5 text-destructive shrink-0" />
        )}
        <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
          {isConnected ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {pendingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          {pendingCount} pending
        </Badge>
      )}

      {syncStatus.issyncing && (
        <div className="flex items-center gap-2 flex-1 min-w-[120px] max-w-xs">
          <Progress value={syncStatus.progress} className="h-1.5" />
          <span className="text-xs text-muted-foreground whitespace-nowrap">Syncing...</span>
        </div>
      )}

      {syncStatus.lastSyncTime && !syncStatus.issyncing && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span>Synced</span>
        </div>
      )}

      {syncStatus.error && !syncStatus.issyncing && (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          <span>Sync failed</span>
        </div>
      )}

      {pendingCount > 0 && isConnected && !syncStatus.issyncing && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualSync}
          className="h-7 text-xs ml-auto min-w-[80px]"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
}
