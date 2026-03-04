import { useState } from 'react';
import { useGetShifts, useStartShift, useEndShift, useGetStaff } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Clock, Play, Square, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { format } from 'date-fns';

function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function dateTimeLocalToNanos(value: string): bigint {
  const ms = new Date(value).getTime();
  return BigInt(ms) * BigInt(1_000_000);
}

export default function ShiftManagement() {
  const { identity } = useInternetIdentity();
  const { data: shifts = [] } = useGetShifts();
  const { data: staff = [] } = useGetStaff();
  const startShift = useStartShift();
  const endShift = useEndShift();

  // Start shift form state
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [startDateTime, setStartDateTime] = useState<string>(getCurrentDateTimeLocal());

  // End shift dialog state
  const [endShiftDialogOpen, setEndShiftDialogOpen] = useState(false);
  const [shiftToEnd, setShiftToEnd] = useState<bigint | null>(null);
  const [endDateTime, setEndDateTime] = useState<string>(getCurrentDateTimeLocal());

  const activeShifts = shifts.filter((s) => !s.endTime);
  const completedShifts = shifts.filter((s) => !!s.endTime);

  const handleStartShift = async () => {
    if (!selectedStaffId) {
      toast.error('Please select a staff member');
      return;
    }
    if (!startDateTime) {
      toast.error('Please select a start date and time');
      return;
    }

    try {
      const staffId = Principal.fromText(selectedStaffId);
      const startNanos = dateTimeLocalToNanos(startDateTime);

      await startShift.mutateAsync({
        staffId,
        shiftDate: startNanos,
        startTime: startNanos,
      });
      toast.success('Shift started successfully');
      setSelectedStaffId('');
      setStartDateTime(getCurrentDateTimeLocal());
    } catch (error: any) {
      toast.error(error?.message || 'Failed to start shift');
    }
  };

  const openEndShiftDialog = (shiftId: bigint) => {
    setShiftToEnd(shiftId);
    setEndDateTime(getCurrentDateTimeLocal());
    setEndShiftDialogOpen(true);
  };

  const handleEndShift = async () => {
    if (!shiftToEnd) return;
    if (!endDateTime) {
      toast.error('Please select an end date and time');
      return;
    }

    try {
      const endNanos = dateTimeLocalToNanos(endDateTime);
      await endShift.mutateAsync({ shiftId: shiftToEnd, endTime: endNanos });
      toast.success('Shift ended successfully');
      setEndShiftDialogOpen(false);
      setShiftToEnd(null);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to end shift');
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getStaffName = (staffId: Principal) => {
    const staffMember = staff.find((s) => s.id.toString() === staffId.toString());
    return staffMember?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Shift Management</h1>
        <p className="text-muted-foreground mt-1">Manage staff shifts and attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Start New Shift */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start New Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="startDateTime">Shift Start Date &amp; Time</Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="mt-1 min-h-[44px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Defaults to current date &amp; time. You can change it for backdated entries.
                </p>
              </div>

              <div>
                <Label htmlFor="staff">Select Staff Member</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger className="mt-1 min-h-[44px]">
                    <SelectValue placeholder="Choose staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id.toString()} value={s.id.toString()}>
                        #{s.serialNumber.toString()} — {s.name} ({String(s.role).charAt(0).toUpperCase() + String(s.role).slice(1)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleStartShift}
                className="w-full min-h-[44px]"
                disabled={startShift.isPending}
              >
                <Play className="w-4 h-4 mr-2" />
                {startShift.isPending ? 'Starting...' : 'Start Shift'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Shifts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Shifts
              {activeShifts.length > 0 && (
                <Badge className="ml-auto">{activeShifts.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeShifts.length > 0 ? (
              <div className="space-y-3">
                {activeShifts.map((shift) => (
                  <div key={shift.id.toString()} className="p-4 bg-primary/10 rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">Shift ID</p>
                        <p className="text-lg font-bold">#{shift.id.toString()}</p>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Staff:</span>
                        <span className="font-medium">{getStaffName(shift.staffId)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span className="font-medium text-right">{formatTimestamp(shift.startTime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sales:</span>
                        <span className="font-medium">{shift.sales.length} transactions</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => openEndShiftDialog(shift.id)}
                      variant="destructive"
                      className="w-full min-h-[44px]"
                      disabled={endShift.isPending}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Shift
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active shifts</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Shifts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shifts
              .slice()
              .sort((a, b) => Number(b.id) - Number(a.id))
              .slice(0, 10)
              .map((shift) => (
                <div key={shift.id.toString()} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">Shift #{shift.id.toString()}</p>
                      <p className="text-sm text-muted-foreground">{getStaffName(shift.staffId)}</p>
                    </div>
                    <Badge variant={shift.endTime ? 'outline' : 'default'}>
                      {shift.endTime ? 'Completed' : 'Active'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Started</p>
                      <p className="font-medium">{formatTimestamp(shift.startTime)}</p>
                    </div>
                    {shift.endTime ? (
                      <div>
                        <p className="text-muted-foreground">Ended</p>
                        <p className="font-medium">{formatTimestamp(shift.endTime)}</p>
                      </div>
                    ) : (
                      <div className="flex items-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEndShiftDialog(shift.id)}
                          className="min-h-[36px]"
                          disabled={endShift.isPending}
                        >
                          <Square className="w-3 h-3 mr-1" />
                          End Shift
                        </Button>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground">Sales</p>
                      <p className="font-medium">{shift.sales.length} transactions</p>
                    </div>
                  </div>
                </div>
              ))}
            {shifts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No shifts recorded yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* End Shift Dialog */}
      <Dialog open={endShiftDialogOpen} onOpenChange={setEndShiftDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="w-5 h-5" />
              End Shift
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Select the date and time when this shift ended.
            </p>
            <div>
              <Label htmlFor="endDateTime">Shift End Date &amp; Time</Label>
              <Input
                id="endDateTime"
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className="mt-1 min-h-[44px]"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Defaults to current date &amp; time. You can adjust for the actual end time.
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEndShiftDialogOpen(false)}
              className="min-h-[44px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleEndShift}
              disabled={endShift.isPending}
              className="min-h-[44px]"
            >
              <Square className="w-4 h-4 mr-2" />
              {endShift.isPending ? 'Ending...' : 'Confirm End Shift'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
