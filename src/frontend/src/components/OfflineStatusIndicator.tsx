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

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : (
          <WifiOff className="w-4 h-4 text-destructive" />
        )}
        <Badge variant={isConnected ? 'default' : 'destructive'} className="text-xs">
          {isConnected ? 'Online' : 'Offline'}
        </Badge>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {pendingCount} pending
          </Badge>
        </div>
      )}

      {syncStatus.issyncing && (
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <Progress value={syncStatus.progress} className="h-2" />
          <span className="text-xs text-muted-foreground">Syncing...</span>
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
          className="h-7 text-xs"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Sync Now
        </Button>
      )}
    </div>
  );
}
