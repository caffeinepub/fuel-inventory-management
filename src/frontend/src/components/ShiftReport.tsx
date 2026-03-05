import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Principal } from "@dfinity/principal";
import { useGetShifts, useGetStaff } from "../hooks/useQueries";

export default function ShiftReport() {
  const { data: shifts = [] } = useGetShifts();
  const { data: staff = [] } = useGetStaff();

  const getStaffName = (staffId: Principal) => {
    const staffMember = staff.find(
      (s) => s.id.toString() === staffId.toString(),
    );
    return staffMember?.name || "Unknown";
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
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

  const sortedShifts = shifts
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedShifts.map((shift) => {
                  const revenue = calculateShiftRevenue(shift.sales);
                  return (
                    <TableRow key={shift.id.toString()}>
                      <TableCell className="font-medium whitespace-nowrap">
                        #{shift.id.toString()}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStaffName(shift.staffId)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {formatTimestamp(shift.startTime)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs sm:text-sm">
                        {shift.endTime ? formatTimestamp(shift.endTime) : "—"}
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
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {shifts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No shifts to display
            </p>
          )}
        </CardContent>
      </Card>

      {shifts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedShifts.slice(0, 4).map((shift) => {
            const breakdown = getFuelBreakdown(shift.sales);
            const revenue = calculateShiftRevenue(shift.sales);

            return (
              <Card key={shift.id.toString()}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Shift #{shift.id.toString()}</span>
                    <Badge variant={shift.endTime ? "outline" : "default"}>
                      {shift.endTime ? "Completed" : "Active"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Staff Member
                    </p>
                    <p className="font-semibold">
                      {getStaffName(shift.staffId)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-sm font-medium">
                        {formatTimestamp(shift.startTime)}
                      </p>
                    </div>
                    {shift.endTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">Ended</p>
                        <p className="text-sm font-medium">
                          {formatTimestamp(shift.endTime)}
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
    </div>
  );
}
