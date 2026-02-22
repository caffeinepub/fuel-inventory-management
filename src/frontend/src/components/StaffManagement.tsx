import { useState } from 'react';
import { useGetStaff, useAddStaff, useUpdateStaff, useRemoveStaff, useCanManageStaff, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, AlertCircle, CheckCircle2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { StaffRole } from '../backend';
import { Principal } from '@dfinity/principal';

// Helper function to format Principal ID as Serial Number
function formatSerialNumber(principalId: string): string {
  if (principalId.length <= 12) return principalId;
  return `${principalId.slice(0, 8)}...${principalId.slice(-4)}`;
}

export default function StaffManagement() {
  const { data: staff = [] } = useGetStaff();
  const { data: canManageStaff, isLoading: canManageLoading } = useCanManageStaff();
  const { data: isAdmin } = useIsCallerAdmin();
  const addStaff = useAddStaff();
  const updateStaff = useUpdateStaff();
  const removeStaff = useRemoveStaff();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<{ id: Principal; name: string; role: StaffRole; commissionRate: number } | null>(null);
  
  const [staffId, setStaffId] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffRole>(StaffRole.attendant);
  const [commissionRate, setCommissionRate] = useState('');
  const [principalIdError, setPrincipalIdError] = useState<string | null>(null);
  const [principalIdValid, setPrincipalIdValid] = useState(false);

  const validatePrincipalId = (id: string) => {
    if (!id.trim()) {
      setPrincipalIdError(null);
      setPrincipalIdValid(false);
      return;
    }

    try {
      Principal.fromText(id);
      setPrincipalIdError(null);
      setPrincipalIdValid(true);
    } catch (error) {
      setPrincipalIdError('Invalid Principal ID format');
      setPrincipalIdValid(false);
    }
  };

  const handleStaffIdChange = (value: string) => {
    setStaffId(value);
    validatePrincipalId(value);
  };

  const handleAddStaff = async () => {
    if (!staffId || !name || !commissionRate) {
      toast.error('Please fill all fields');
      return;
    }

    if (!principalIdValid) {
      toast.error('Please enter a valid Principal ID');
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
      setPrincipalIdError(null);
      setPrincipalIdValid(false);
    } catch (error: any) {
      console.error('Error adding staff:', error);
      let errorMessage = 'Failed to add staff member';
      
      if (error?.message) {
        if (error.message.includes('Invalid principal') || error.message.includes('Invalid: Cannot add anonymous')) {
          errorMessage = 'Invalid Principal ID format';
        } else if (error.message.includes('already exists')) {
          errorMessage = 'A staff member with this Principal ID already exists';
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

  const handleEditStaff = (member: { id: Principal; name: string; role: StaffRole; commissionRate: number }) => {
    setEditingStaff(member);
    setName(member.name);
    setRole(member.role);
    setCommissionRate(member.commissionRate.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !name || !commissionRate) {
      toast.error('Please fill all fields');
      return;
    }

    const commissionValue = parseFloat(commissionRate);
    if (isNaN(commissionValue) || commissionValue < 0 || commissionValue > 100) {
      toast.error('Commission rate must be between 0 and 100');
      return;
    }

    try {
      await updateStaff.mutateAsync({
        staffId: editingStaff.id,
        staff: {
          id: editingStaff.id,
          name,
          role,
          commissionRate: commissionValue,
        },
      });
      toast.success('Staff member updated successfully');
      setIsEditDialogOpen(false);
      setEditingStaff(null);
      setName('');
      setCommissionRate('');
      setRole(StaffRole.attendant);
    } catch (error: any) {
      console.error('Error updating staff:', error);
      let errorMessage = 'Failed to update staff member';
      
      if (error?.message) {
        if (error.message.includes('Unauthorized')) {
          errorMessage = 'You do not have permission to update staff';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Staff member not found';
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
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Staff Member</DialogTitle>
                <DialogDescription>
                  Enter the staff member's Principal ID and details. The Principal ID is a unique identifier from Internet Identity.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="staffId">Principal ID *</Label>
                  <div className="relative">
                    <Input
                      id="staffId"
                      value={staffId}
                      onChange={(e) => handleStaffIdChange(e.target.value)}
                      placeholder="e.g., 2vxsx-fae or aaaaa-aa"
                      className={`pr-10 ${principalIdError ? 'border-destructive' : principalIdValid ? 'border-green-500' : ''}`}
                    />
                    {staffId && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {principalIdValid ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : principalIdError ? (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        ) : null}
                      </div>
                    )}
                  </div>
                  {principalIdError && (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {principalIdError}
                    </p>
                  )}
                  {principalIdValid && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Serial Number: <span className="font-mono">{formatSerialNumber(staffId)}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the complete Principal ID from the staff member's Internet Identity
                  </p>
                </div>
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role *</Label>
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
                  <Label htmlFor="commission">Commission Rate (%) *</Label>
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
                <Button 
                  onClick={handleAddStaff} 
                  className="w-full" 
                  disabled={addStaff.isPending || !principalIdValid || !name || !commissionRate}
                >
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
                <TableHead>Serial Number</TableHead>
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
                  <TableCell className="font-mono text-sm">{formatSerialNumber(member.id.toString())}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{member.id.toString().slice(0, 20)}...</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditStaff(member)}
                          disabled={updateStaff.isPending}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStaff(member.id)}
                          disabled={removeStaff.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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

      {/* Edit Staff Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
            <DialogDescription>
              Update staff member details. Principal ID cannot be changed.
            </DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <div className="space-y-4">
              <div>
                <Label>Principal ID (Read-only)</Label>
                <div className="p-2 bg-muted rounded-md">
                  <p className="font-mono text-xs text-muted-foreground break-all">{editingStaff.id.toString()}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Serial Number: <span className="font-mono">{formatSerialNumber(editingStaff.id.toString())}</span>
                </p>
              </div>
              <div>
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role *</Label>
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
                <Label htmlFor="edit-commission">Commission Rate (%) *</Label>
                <Input
                  id="edit-commission"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="2.5"
                />
              </div>
              <Button 
                onClick={handleUpdateStaff} 
                className="w-full" 
                disabled={updateStaff.isPending || !name || !commissionRate}
              >
                {updateStaff.isPending ? 'Updating...' : 'Update Staff Member'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
