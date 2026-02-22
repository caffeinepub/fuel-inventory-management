import { useState } from 'react';
import { useGetStaff, useAddStaff, useUpdateStaff, useRemoveStaff, useCanManageStaff, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { StaffRole } from '../backend';
import { Principal } from '@dfinity/principal';

export default function StaffManagement() {
  const { data: staff = [] } = useGetStaff();
  const { data: canManageStaff, isLoading: canManageLoading } = useCanManageStaff();
  const { data: isAdmin } = useIsCallerAdmin();
  const addStaff = useAddStaff();
  const updateStaff = useUpdateStaff();
  const removeStaff = useRemoveStaff();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [staffId, setStaffId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>(StaffRole.attendant);
  const [commissionRate, setCommissionRate] = useState('');

  const handleAddStaff = async () => {
    if (!staffId || !name || !commissionRate) {
      toast.error('Please fill all fields');
      return;
    }

    const commissionValue = parseFloat(commissionRate);
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      toast.error('Commission rate must be between 0 and 100');
      return;
    }

    try {
      const principal = Principal.fromText(staffId);
      await addStaff.mutateAsync({
        id: principal,
        name,
        role,
        commissionRate: commissionValue,
      });
      toast.success('Staff member added successfully');
      setIsAddDialogOpen(false);
      setStaffId('');
      setName('');
      setCommissionRate('');
      setRole(StaffRole.attendant);
    } catch (error: any) {
      console.error('Error adding staff:', error);
      let errorMessage = 'Failed to add staff member';
      
      if (error?.message) {
        if (error.message.includes('Invalid principal')) {
          errorMessage = 'Invalid Principal ID format';
        } else if (error.message.includes('Unauthorized')) {
          errorMessage = 'You do not have permission to add staff';
        } else if (error.message.includes('Actor not available')) {
          errorMessage = 'Connection error. Please try again';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleRemoveStaff = async (id: Principal) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;

    try {
      await removeStaff.mutateAsync(id);
      toast.success('Staff member removed successfully');
    } catch (error: any) {
      console.error('Error removing staff:', error);
      let errorMessage = 'Failed to remove staff member';
      
      if (error?.message) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'You do not have permission to remove staff';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  if (canManageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canManageStaff && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <p className="text-sm text-muted-foreground mt-2">Only Owners and Managers can manage staff.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground mt-1">Manage staff members and their roles</p>
        </div>
        {(canManageStaff || isAdmin) && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="staffId">Principal ID</Label>
                  <Input
                    id="staffId"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    placeholder="Enter principal ID"
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as StaffRole)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={StaffRole.owner}>Owner</SelectItem>
                      <SelectItem value={StaffRole.manager}>Manager</SelectItem>
                      <SelectItem value={StaffRole.operator}>Operator</SelectItem>
                      <SelectItem value={StaffRole.attendant}>Attendant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="commission">Commission Rate (%)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    placeholder="2.5"
                  />
                </div>
                <Button onClick={handleAddStaff} className="w-full" disabled={addStaff.isPending}>
                  {addStaff.isPending ? 'Adding...' : 'Add Staff Member'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Principal ID</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.id.toString()}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {String(member.role).charAt(0).toUpperCase() + String(member.role).slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{member.commissionRate}%</TableCell>
                  <TableCell className="font-mono text-xs">{member.id.toString().slice(0, 20)}...</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStaff(member.id)}
                        disabled={removeStaff.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {staff.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No staff members added yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
