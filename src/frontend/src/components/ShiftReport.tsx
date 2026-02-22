import { useGetShifts, useGetStaff } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Principal } from '@dfinity/principal';

export default function ShiftReport() {
  const { data: shifts = [] } = useGetShifts();
  const { data: staff = [] } = useGetStaff();

  const getStaffName = (staffId: Principal) => {
    const staffMember = staff.find((s) => s.id.toString() === staffId.toString());
    return staffMember?.name || 'Unknown';
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const calculateShiftRevenue = (sales: any[]) => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getFuelBreakdown = (sales: any[]) => {
    const petrol = sales.filter((s) => s.fuelType === 'petrol');
    const diesel = sales.filter((s) => s.fuelType === 'diesel');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shift Reports</h1>
        <p className="text-muted-foreground mt-1">Detailed shift-wise sales and performance reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shifts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shift ID</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead className="text-right">Sales Count</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts.map((shift) => {
                const revenue = calculateShiftRevenue(shift.sales);
                return (
                  <TableRow key={shift.id.toString()}>
                    <TableCell className="font-medium">#{shift.id.toString()}</TableCell>
                    <TableCell>{getStaffName(shift.staffId)}</TableCell>
                    <TableCell>{formatTimestamp(shift.startTime)}</TableCell>
                    <TableCell>
                      {shift.endTime ? formatTimestamp(shift.endTime) : '-'}
                    </TableCell>
                    <TableCell className="text-right">{shift.sales.length}</TableCell>
                    <TableCell className="text-right">₹{revenue.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={shift.endTime ? 'outline' : 'default'}>
                        {shift.endTime ? 'Completed' : 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {shifts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No shifts to display</p>
          )}
        </CardContent>
      </Card>

      {shifts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {shifts.slice(0, 4).map((shift) => {
            const breakdown = getFuelBreakdown(shift.sales);
            const revenue = calculateShiftRevenue(shift.sales);

            return (
              <Card key={shift.id.toString()}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Shift #{shift.id.toString()}</span>
                    <Badge variant={shift.endTime ? 'outline' : 'default'}>
                      {shift.endTime ? 'Completed' : 'Active'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Staff Member</p>
                    <p className="font-semibold">{getStaffName(shift.staffId)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Started</p>
                      <p className="text-sm font-medium">{formatTimestamp(shift.startTime)}</p>
                    </div>
                    {shift.endTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">Ended</p>
                        <p className="text-sm font-medium">{formatTimestamp(shift.endTime)}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm font-semibold mb-2">Fuel Breakdown</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Petrol:</span>
                        <span className="font-medium">
                          {breakdown.petrol.count} sales, {breakdown.petrol.volume.toFixed(2)}L, ₹
                          {breakdown.petrol.revenue.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Diesel:</span>
                        <span className="font-medium">
                          {breakdown.diesel.count} sales, {breakdown.diesel.volume.toFixed(2)}L, ₹
                          {breakdown.diesel.revenue.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Revenue</span>
                      <span className="text-xl font-bold">₹{revenue.toFixed(2)}</span>
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
