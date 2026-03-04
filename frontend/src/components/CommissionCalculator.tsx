import { useGetStaff, useGetSales } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Principal } from '@dfinity/principal';

export default function CommissionCalculator() {
  const { data: staff = [] } = useGetStaff();
  const { data: sales = [] } = useGetSales();

  const commissionData = staff.map((member) => {
    const staffSales = sales.filter((s) => s.staffId.toString() === member.id.toString());
    const totalSales = staffSales.reduce((sum, s) => sum + s.total, 0);
    const commission = (totalSales * member.commissionRate) / 100;

    return {
      id: member.id,
      name: member.name,
      role: member.role,
      commissionRate: member.commissionRate,
      salesCount: staffSales.length,
      totalSales,
      commission,
    };
  });

  const totalCommissions = commissionData.reduce((sum, d) => sum + d.commission, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commission Calculator</h1>
        <p className="text-muted-foreground mt-1">Calculate staff commissions based on sales performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{staff.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{sales.reduce((sum, s) => sum + s.total, 0).toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{totalCommissions.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Sales Count</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Commission Rate</TableHead>
                <TableHead className="text-right">Earned Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissionData.map((data) => (
                <TableRow key={data.id.toString()}>
                  <TableCell className="font-medium">{data.name}</TableCell>
                  <TableCell>
                    {String(data.role).charAt(0).toUpperCase() + String(data.role).slice(1)}
                  </TableCell>
                  <TableCell className="text-right">{data.salesCount}</TableCell>
                  <TableCell className="text-right">₹{data.totalSales.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{data.commissionRate}%</TableCell>
                  <TableCell className="text-right font-semibold">₹{data.commission.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {commissionData.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No commission data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
