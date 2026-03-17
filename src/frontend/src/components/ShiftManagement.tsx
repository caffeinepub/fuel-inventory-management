import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@dfinity/principal";
import {
  CalendarClock,
  Clock,
  Pencil,
  Play,
  Square,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useEndShift,
  useGetShifts,
  useGetStaff,
  useStartShift,
} from "../hooks/useQueries";

function getCurrentDateTimeLocal(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function dateTimeLocalToNanos(value: string): bigint {
  const ms = new Date(value).getTime();
  return BigInt(ms) * BigInt(1_000_000);
}

function nanosToDateTimeLocal(nanos: bigint): string {
  const ms = Number(nanos) / 1_000_000;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type EditableShift = {
  staffId: string;
  startTime: string;
  endTime: string;
};

export default function ShiftManagement() {
  useInternetIdentity();
  const { data: shifts = [] } = useGetShifts();
  const { data: staff = [] } = useGetStaff();
  const startShift = useStartShift();
  const endShift = useEndShift();

  // Local overrides
  const [deletedShiftIds, setDeletedShiftIds] = useState<Set<string>>(
    new Set(),
  );
  const [editedShifts, setEditedShifts] = useState<
    Record<string, EditableShift>
  >({});

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditableShift>({
    staffId: "",
    startTime: "",
    endTime: "",
  });

  // Start shift form state
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [startDateTime, setStartDateTime] = useState<string>(
    getCurrentDateTimeLocal(),
  );

  // End shift dialog state
  const [endShiftDialogOpen, setEndShiftDialogOpen] = useState(false);
  const [shiftToEnd, setShiftToEnd] = useState<bigint | null>(null);
  const [endDateTime, setEndDateTime] = useState<string>(
    getCurrentDateTimeLocal(),
  );

  const visibleShifts = shifts.filter(
    (s) => !deletedShiftIds.has(s.id.toString()),
  );
  const activeShifts = visibleShifts.filter((s) => !s.endTime);

  const getShiftData = (shift: (typeof shifts)[0]) => {
    const override = editedShifts[shift.id.toString()];
    return {
      staffId: override?.staffId ?? shift.staffId.toString(),
      startTime: override?.startTime
        ? dateTimeLocalToNanos(override.startTime)
        : shift.startTime,
      endTime: override?.endTime
        ? dateTimeLocalToNanos(override.endTime)
        : shift.endTime,
    };
  };

  const handleDeleteShift = (shiftId: string) => {
    setDeletedShiftIds((prev) => new Set([...prev, shiftId]));
    toast.success("Shift deleted");
  };

  const openEditDialog = (shift: (typeof shifts)[0]) => {
    const override = editedShifts[shift.id.toString()];
    setEditingShiftId(shift.id.toString());
    setEditForm({
      staffId: override?.staffId ?? shift.staffId.toString(),
      startTime: override?.startTime ?? nanosToDateTimeLocal(shift.startTime),
      endTime:
        override?.endTime ??
        (shift.endTime ? nanosToDateTimeLocal(shift.endTime) : ""),
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingShiftId) return;
    setEditedShifts((prev) => ({ ...prev, [editingShiftId]: editForm }));
    setEditDialogOpen(false);
    setEditingShiftId(null);
    toast.success("Shift updated");
  };

  const handleStartShift = async () => {
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }
    if (!startDateTime) {
      toast.error("Please select a start date and time");
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
      toast.success("Shift started successfully");
      setSelectedStaffId("");
      setStartDateTime(getCurrentDateTimeLocal());
    } catch (error: any) {
      toast.error(error?.message || "Failed to start shift");
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
      toast.error("Please select an end date and time");
      return;
    }

    try {
      const endNanos = dateTimeLocalToNanos(endDateTime);
      await endShift.mutateAsync({ shiftId: shiftToEnd, endTime: endNanos });
      toast.success("Shift ended successfully");
      setEndShiftDialogOpen(false);
      setShiftToEnd(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to end shift");
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getStaffName = (staffId: Principal | string) => {
    const idStr = typeof staffId === "string" ? staffId : staffId.toString();
    const staffMember = staff.find((s) => s.id.toString() === idStr);
    return staffMember?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Shift Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage staff shifts and attendance
        </p>
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
                <Label htmlFor="startDateTime">
                  Shift Start Date &amp; Time
                </Label>
                <Input
                  id="startDateTime"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => setStartDateTime(e.target.value)}
                  className="mt-1 min-h-[44px]"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Defaults to current date &amp; time. You can change it for
                  backdated entries.
                </p>
              </div>

              <div>
                <Label htmlFor="staff">Select Staff Member</Label>
                <Select
                  value={selectedStaffId}
                  onValueChange={setSelectedStaffId}
                >
                  <SelectTrigger className="mt-1 min-h-[44px]">
                    <SelectValue placeholder="Choose staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((s) => (
                      <SelectItem key={s.id.toString()} value={s.id.toString()}>
                        #{s.serialNumber.toString()} — {s.name} (
                        {String(s.role).charAt(0).toUpperCase() +
                          String(s.role).slice(1)}
                        )
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
                {startShift.isPending ? "Starting..." : "Start Shift"}
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
                  <div
                    key={shift.id.toString()}
                    className="p-4 bg-primary/10 rounded-lg space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Shift ID
                        </p>
                        <p className="text-lg font-bold">
                          #{shift.id.toString()}
                        </p>
                      </div>
                      <Badge>Active</Badge>
                    </div>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Staff:</span>
                        <span className="font-medium">
                          {getStaffName(
                            editedShifts[shift.id.toString()]?.staffId ??
                              shift.staffId,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Started:</span>
                        <span className="font-medium text-right">
                          {formatTimestamp(
                            getShiftData(shift).startTime as bigint,
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sales:</span>
                        <span className="font-medium">
                          {shift.sales.length} transactions
                        </span>
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
              <p className="text-muted-foreground text-center py-8">
                No active shifts
              </p>
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
            {visibleShifts
              .slice()
              .sort((a, b) => Number(b.id) - Number(a.id))
              .slice(0, 10)
              .map((shift, index) => {
                const data = getShiftData(shift);
                return (
                  <div
                    key={shift.id.toString()}
                    data-ocid={`shifts.item.${index + 1}`}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">
                          Shift #{shift.id.toString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getStaffName(data.staffId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={shift.endTime ? "outline" : "default"}>
                          {shift.endTime ? "Completed" : "Active"}
                        </Badge>
                        {/* Edit Button */}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => openEditDialog(shift)}
                          data-ocid={`shifts.edit_button.${index + 1}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              data-ocid={`shifts.delete_button.${index + 1}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent data-ocid="shifts.delete.dialog">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Shift</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete Shift #
                                {shift.id.toString()}? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="shifts.delete.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  handleDeleteShift(shift.id.toString())
                                }
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                data-ocid="shifts.delete.confirm_button"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Started</p>
                        <p className="font-medium">
                          {formatTimestamp(data.startTime as bigint)}
                        </p>
                      </div>
                      {shift.endTime || data.endTime ? (
                        <div>
                          <p className="text-muted-foreground">Ended</p>
                          <p className="font-medium">
                            {data.endTime
                              ? formatTimestamp(data.endTime as bigint)
                              : ""}
                          </p>
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
                        <p className="font-medium">
                          {shift.sales.length} transactions
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            {visibleShifts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No shifts recorded yet
              </p>
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
                Defaults to current date &amp; time. You can adjust for the
                actual end time.
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
              {endShift.isPending ? "Ending..." : "Confirm End Shift"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Shift Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="shifts.edit.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Shift
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Staff Member</Label>
              <Select
                value={editForm.staffId}
                onValueChange={(v) =>
                  setEditForm((prev) => ({ ...prev, staffId: v }))
                }
              >
                <SelectTrigger className="mt-1 min-h-[44px]">
                  <SelectValue placeholder="Choose staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((s) => (
                    <SelectItem key={s.id.toString()} value={s.id.toString()}>
                      #{s.serialNumber.toString()} — {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editStartTime">Start Date &amp; Time</Label>
              <Input
                id="editStartTime"
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="mt-1 min-h-[44px]"
                data-ocid="shifts.edit.start_input"
              />
            </div>
            <div>
              <Label htmlFor="editEndTime">
                End Date &amp; Time (optional)
              </Label>
              <Input
                id="editEndTime"
                type="datetime-local"
                value={editForm.endTime}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="mt-1 min-h-[44px]"
                data-ocid="shifts.edit.end_input"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="min-h-[44px]"
              data-ocid="shifts.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="min-h-[44px]"
              data-ocid="shifts.edit.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
