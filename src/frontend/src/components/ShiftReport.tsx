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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@dfinity/principal";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useGetShifts, useGetStaff } from "../hooks/useQueries";

function nanosToDateTimeLocal(nanos: bigint): string {
  const ms = Number(nanos) / 1_000_000;
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function dateTimeLocalToNanos(value: string): bigint {
  return BigInt(new Date(value).getTime()) * BigInt(1_000_000);
}

type EditableShift = {
  staffId: string;
  startTime: string;
  endTime: string;
};

export default function ShiftReport() {
  const { data: shifts = [] } = useGetShifts();
  const { data: staff = [] } = useGetStaff();

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

  const visibleShifts = shifts.filter(
    (s) => !deletedShiftIds.has(s.id.toString()),
  );

  const getStaffName = (staffId: Principal | string) => {
    const idStr = typeof staffId === "string" ? staffId : staffId.toString();
    const staffMember = staff.find((s) => s.id.toString() === idStr);
    return staffMember?.name || "Unknown";
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const getShiftStartTime = (shift: (typeof shifts)[0]): bigint => {
    const override = editedShifts[shift.id.toString()];
    return override?.startTime
      ? dateTimeLocalToNanos(override.startTime)
      : shift.startTime;
  };

  const getShiftEndTime = (shift: (typeof shifts)[0]): bigint | undefined => {
    const override = editedShifts[shift.id.toString()];
    if (override?.endTime) return dateTimeLocalToNanos(override.endTime);
    return shift.endTime ?? undefined;
  };

  const getShiftStaffId = (shift: (typeof shifts)[0]): string => {
    return (
      editedShifts[shift.id.toString()]?.staffId ?? shift.staffId.toString()
    );
  };

  const handleDeleteShift = (shiftId: string) => {
    setDeletedShiftIds((prev) => new Set([...prev, shiftId]));
    toast.success("Shift report deleted");
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
    toast.success("Shift report updated");
  };

  const calculateShiftRevenue = (sales: any[]) => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getFuelBreakdown = (sales: any[]) => {
    const petrol = sales.filter((s) => s.fuelType === "petrol");
    const diesel = sales.filter((s) => s.fuelType === "diesel");
    return {
      petrol: {
        count: petrol.length,
        volume: petrol.reduce((sum, s) => sum + s.quantity, 0),
        revenue: petrol.reduce((sum, s) => sum + s.total, 0),
      },
      diesel: {
        count: diesel.length,
        volume: diesel.reduce((sum, s) => sum + s.quantity, 0),
        revenue: diesel.reduce((sum, s) => sum + s.total, 0),
      },
    };
  };

  const sortedShifts = visibleShifts
    .slice()
    .sort((a, b) => Number(b.id) - Number(a.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Shift Reports</h1>
        <p className="text-muted-foreground mt-1">
          Detailed shift-wise sales and performance reports
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shifts</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Shift ID</TableHead>
                  <TableHead className="whitespace-nowrap">Staff</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Start Time
                  </TableHead>
                  <TableHead className="whitespace-nowrap">End Time</TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Sales
                  </TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Revenue
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Status</TableHead>
                  <TableHead className="whitespace-nowrap">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedShifts.map((shift, index) => {
                  const revenue = calculateShiftRevenue(shift.sales);
                  const startTime = getShiftStartTime(shift);
                  const endTime = getShiftEndTime(shift);
                  const staffId = getShiftStaffId(shift);
                  return (
                    <TableRow
                      key={shift.id.toString()}
                      data-ocid={`shift_reports.item.${index + 1}`}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        #{shift.id.toString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStaffName(staffId)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {formatTimestamp(startTime)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {endTime ? formatTimestamp(endTime) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {shift.sales.length}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        ₹{revenue.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={shift.endTime ? "outline" : "default"}>
                          {shift.endTime ? "Completed" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => openEditDialog(shift)}
                            data-ocid={`shift_reports.edit_button.${index + 1}`}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                data-ocid={`shift_reports.delete_button.${index + 1}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent data-ocid="shift_reports.delete.dialog">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Delete Shift Report
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete Shift #
                                  {shift.id.toString()} report? This action
                                  cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="shift_reports.delete.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteShift(shift.id.toString())
                                  }
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-ocid="shift_reports.delete.confirm_button"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {sortedShifts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No shifts to display
            </p>
          )}
        </CardContent>
      </Card>

      {sortedShifts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedShifts.slice(0, 4).map((shift, index) => {
            const breakdown = getFuelBreakdown(shift.sales);
            const revenue = calculateShiftRevenue(shift.sales);
            const startTime = getShiftStartTime(shift);
            const endTime = getShiftEndTime(shift);
            const staffId = getShiftStaffId(shift);

            return (
              <Card key={shift.id.toString()}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center gap-2">
                    <span>Shift #{shift.id.toString()}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={shift.endTime ? "outline" : "default"}>
                        {shift.endTime ? "Completed" : "Active"}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(shift)}
                        data-ocid={`shift_reports.card.edit_button.${index + 1}`}
                      >
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                            data-ocid={`shift_reports.card.delete_button.${index + 1}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Shift Report
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Delete Shift #{shift.id.toString()} report?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteShift(shift.id.toString())
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Staff Member
                    </p>
                    <p className="font-semibold">{getStaffName(staffId)}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-sm font-medium">
                        {formatTimestamp(startTime)}
                      </p>
                    </div>
                    {endTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">Ended</p>
                        <p className="text-sm font-medium">
                          {formatTimestamp(endTime)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm font-semibold mb-2">Fuel Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-muted-foreground shrink-0">
                          Petrol:
                        </span>
                        <span className="font-medium text-right">
                          {breakdown.petrol.count} sales,{" "}
                          {breakdown.petrol.volume.toFixed(2)}L, ₹
                          {breakdown.petrol.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm gap-2">
                        <span className="text-muted-foreground shrink-0">
                          Diesel:
                        </span>
                        <span className="font-medium text-right">
                          {breakdown.diesel.count} sales,{" "}
                          {breakdown.diesel.volume.toFixed(2)}L, ₹
                          {breakdown.diesel.revenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Revenue</span>
                      <span className="text-xl font-bold">
                        ₹{revenue.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Shift Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="shift_reports.edit.dialog"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Shift Report
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
              <Label htmlFor="reportEditStart">Start Date &amp; Time</Label>
              <Input
                id="reportEditStart"
                type="datetime-local"
                value={editForm.startTime}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="mt-1 min-h-[44px]"
                data-ocid="shift_reports.edit.start_input"
              />
            </div>
            <div>
              <Label htmlFor="reportEditEnd">
                End Date &amp; Time (optional)
              </Label>
              <Input
                id="reportEditEnd"
                type="datetime-local"
                value={editForm.endTime}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, endTime: e.target.value }))
                }
                className="mt-1 min-h-[44px]"
                data-ocid="shift_reports.edit.end_input"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="min-h-[44px]"
              data-ocid="shift_reports.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="min-h-[44px]"
              data-ocid="shift_reports.edit.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
