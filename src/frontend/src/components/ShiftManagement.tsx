import { useState } from 'react';
import { useGetShifts, useStartShift, useEndShift, useGetStaff } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Clock, Play, Square, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { format } from 'date-fns';

export default function ShiftManagement() {
  const { identity } = useInternetIdentity();
  const { data: shifts = [] } = useGetShifts();
  const { data: staff = [] } = useGetStaff();
  const startShift = useStartShift();
  const endShift = useEndShift();

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [shiftDate, setShiftDate] = useState<Date>(new Date());
  const [shiftTime, setShiftTime] = useState<string>(format(new Date(), 'HH:mm'));
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const activeShift = shifts.find((s) => !s.endTime);

  const handleStartShift = async () => {
    if (!selectedStaffId) {
      toast.error('Please select a staff member');
      return;
    }

    try {
      const staffId = Principal.fromText(selectedStaffId);
      
      // Combine date and time
      const [hours, minutes] = shiftTime.split(':').map(Number);
      const combinedDateTime = new Date(shiftDate);
      combinedDateTime.setHours(hours, minutes, 0, 0);
      const shiftDateNanos = BigInt(combinedDateTime.getTime() * 1_000_000);

      await startShift.mutateAsync({ staffId, shiftDate: shiftDateNanos });
      toast.success('Shift started successfully');
      setSelectedStaffId('');
      // Reset to current date/time after successful shift start
      setShiftDate(new Date());
      setShiftTime(format(new Date(), 'HH:mm'));
    } catch (error) {
      toast.error('Failed to start shift');
    }
  };

  const handleEndShift = async (shiftId: bigint) => {
    try {
      await endShift.mutateAsync(shiftId);
      toast.success('Shift ended successfully');
    } catch (error) {
      toast.error('Failed to end shift');
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
        <h1 className="text-3xl font-bold">Shift Management</h1>
        <p className="text-muted-foreground mt-1">Manage staff shifts and attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Active Shift
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeShift ? (
              <div className="space-y-4">
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Shift ID</p>
                      <p className="text-lg font-bold">#{activeShift.id.toString()}</p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Staff:</span>
                      <span className="font-medium">{getStaffName(activeShift.staffId)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Started:</span>
                      <span className="font-medium">{formatTimestamp(activeShift.startTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shift Date:</span>
                      <span className="font-medium">{formatTimestamp(activeShift.shiftDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sales:</span>
                      <span className="font-medium">{activeShift.sales.length} transactions</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleEndShift(activeShift.id)}
                  variant="destructive"
                  className="w-full"
                  disabled={endShift.isPending}
                >
                  <Square className="w-4 h-4 mr-2" />
                  {endShift.isPending ? 'Ending...' : 'End Shift'}
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No active shift</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Start New Shift</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="shiftDateTime">Shift Start Date & Time</Label>
                <div className="flex gap-2 mt-1">
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(shiftDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={shiftDate}
                        onSelect={(date) => {
                          if (date) {
                            setShiftDate(date);
                            setIsCalendarOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={shiftTime}
                    onChange={(e) => setShiftTime(e.target.value)}
                    className="w-32"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="staff">Select Staff Member</Label>
                <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id.toString()} value={s.id.toString()}>
                        {s.name} - {String(s.role).charAt(0).toUpperCase() + String(s.role).slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleStartShift}
                className="w-full"
                disabled={startShift.isPending || !!activeShift}
              >
                <Play className="w-4 h-4 mr-2" />
                {startShift.isPending ? 'Starting...' : 'Start Shift'}
              </Button>
              {activeShift && (
                <p className="text-xs text-muted-foreground text-center">
                  End the current shift before starting a new one
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {shifts.slice(0, 10).map((shift) => (
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
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Shift Date</p>
                    <p className="font-medium">{formatTimestamp(shift.shiftDate)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Started</p>
                    <p className="font-medium">{formatTimestamp(shift.startTime)}</p>
                  </div>
                  {shift.endTime && (
                    <div>
                      <p className="text-muted-foreground">Ended</p>
                      <p className="font-medium">{formatTimestamp(shift.endTime)}</p>
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
    </div>
  );
}
