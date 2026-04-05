import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  AlertCircle,
  CheckCircle2,
  Edit,
  Percent,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StaffRole } from "../backend";
import {
  useAddStaff,
  useCanManageStaff,
  useGetStaff,
  useIsCallerAdmin,
  useRemoveStaff,
  useUpdateStaff,
} from "../hooks/useQueries";

type StaffMember = {
  id: Principal;
  serialNumber: bigint;
  name: string;
  role: StaffRole;
  commissionRate: number;
};

function getRoleStyle(role: StaffRole) {
  const r = String(role);
  if (r === "owner")
    return {
      badge: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
      avatar: "bg-yellow-500/30 text-yellow-300",
    };
  if (r === "manager")
    return {
      badge: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
      avatar: "bg-purple-500/30 text-purple-300",
    };
  if (r === "operator")
    return {
      badge: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
      avatar: "bg-blue-500/30 text-blue-300",
    };
  return {
    badge: "bg-gray-500/20 text-gray-300 border border-gray-500/30",
    avatar: "bg-gray-500/30 text-gray-300",
  };
}

function StaffFormFields({
  staffId,
  onStaffIdChange,
  name,
  onNameChange,
  role,
  onRoleChange,
  commissionRate,
  onCommissionRateChange,
  showPrincipalField,
  principalIdValid,
  principalIdError,
}: {
  staffId?: string;
  onStaffIdChange?: (v: string) => void;
  name: string;
  onNameChange: (v: string) => void;
  role: StaffRole;
  onRoleChange: (v: StaffRole) => void;
  commissionRate: string;
  onCommissionRateChange: (v: string) => void;
  showPrincipalField?: boolean;
  principalIdValid?: boolean;
  principalIdError?: string | null;
}) {
  return (
    <div className="space-y-4">
      {showPrincipalField && (
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Label htmlFor="staffId">Principal ID</Label>
            <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-orange-500/20 text-orange-300 border border-orange-500/30">
              Required for login
            </span>
          </div>
          <div className="relative">
            <Input
              id="staffId"
              value={staffId}
              onChange={(e) => onStaffIdChange?.(e.target.value)}
              placeholder="Staff member's Internet Identity Principal ID"
              className={`pr-10 ${
                principalIdError
                  ? "border-destructive"
                  : principalIdValid
                    ? "border-green-500"
                    : ""
              }`}
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
          <p
            className="text-xs mt-1"
            style={{ color: "oklch(0.75 0.15 55 / 0.7)" }}
          >
            Staff must share their Principal ID from Internet Identity. Without
            it, they cannot log in.
          </p>
        </div>
      )}
      <div>
        <Label htmlFor="staff-name" className="mb-1.5 block">
          Full Name <span className="text-primary">*</span>
        </Label>
        <Input
          id="staff-name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Ahmed Hassan"
          data-ocid="staff.input"
        />
      </div>
      <div>
        <Label htmlFor="staff-role" className="mb-1.5 block">
          Role <span className="text-primary">*</span>
        </Label>
        <Select
          value={role}
          onValueChange={(v) => onRoleChange(v as StaffRole)}
        >
          <SelectTrigger data-ocid="staff.select">
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
        <Label htmlFor="staff-commission" className="mb-1.5 block">
          Commission Rate (%) <span className="text-primary">*</span>
        </Label>
        <Input
          id="staff-commission"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={commissionRate}
          onChange={(e) => onCommissionRateChange(e.target.value)}
          placeholder="e.g. 2.5"
        />
      </div>
    </div>
  );
}

export default function StaffManagement() {
  const { data: staff = [] } = useGetStaff();
  const { data: canManageStaff, isLoading: canManageLoading } =
    useCanManageStaff();
  const { data: isAdmin } = useIsCallerAdmin();
  const addStaff = useAddStaff();
  const updateStaff = useUpdateStaff();
  const removeStaff = useRemoveStaff();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>(StaffRole.attendant);
  const [commissionRate, setCommissionRate] = useState("");
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
    } catch (_error) {
      setPrincipalIdError("Invalid Principal ID format");
      setPrincipalIdValid(false);
    }
  };

  const handleStaffIdChange = (value: string) => {
    setStaffId(value);
    validatePrincipalId(value);
  };

  const resetAddForm = () => {
    setStaffId("");
    setName("");
    setCommissionRate("");
    setRole(StaffRole.attendant);
    setPrincipalIdError(null);
    setPrincipalIdValid(false);
  };

  const handleAddStaff = async () => {
    if (!name || !commissionRate) {
      toast.error("Please fill all required fields");
      return;
    }
    if (staffId && !principalIdValid) {
      toast.error("Please enter a valid Principal ID or leave it empty");
      return;
    }
    const commissionValue = Number.parseFloat(commissionRate);
    if (
      Number.isNaN(commissionValue) ||
      commissionValue < 0 ||
      commissionValue > 100
    ) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }
    try {
      const principal = staffId
        ? Principal.fromText(staffId)
        : Principal.fromUint8Array(crypto.getRandomValues(new Uint8Array(29)));
      await addStaff.mutateAsync({
        id: principal,
        name,
        role,
        commissionRate: commissionValue,
      });
      toast.success("Staff member added successfully");
      setIsAddDialogOpen(false);
      resetAddForm();
    } catch (error: any) {
      const msg = error?.message ?? "";
      if (
        msg.includes("Invalid principal") ||
        msg.includes("Cannot add anonymous")
      ) {
        toast.error("Invalid Principal ID format");
      } else if (msg.includes("already exists")) {
        toast.error("A staff member with this ID already exists");
      } else if (msg.includes("Unauthorized")) {
        toast.error("You do not have permission to add staff");
      } else if (msg.includes("Actor not available")) {
        toast.error("Connection error. Please try again");
      } else {
        toast.error(msg || "Failed to add staff member");
      }
    }
  };

  const handleEditStaff = (member: StaffMember) => {
    setEditingStaff(member);
    setName(member.name);
    setRole(member.role);
    setCommissionRate(member.commissionRate.toString());
    setIsEditDialogOpen(true);
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff || !name || !commissionRate) {
      toast.error("Please fill all fields");
      return;
    }
    const commissionValue = Number.parseFloat(commissionRate);
    if (
      Number.isNaN(commissionValue) ||
      commissionValue < 0 ||
      commissionValue > 100
    ) {
      toast.error("Commission rate must be between 0 and 100");
      return;
    }
    try {
      await updateStaff.mutateAsync({
        staffId: editingStaff.id,
        staff: {
          id: editingStaff.id,
          serialNumber: editingStaff.serialNumber,
          name,
          role,
          commissionRate: commissionValue,
        },
      });
      toast.success("Staff member updated successfully");
      setIsEditDialogOpen(false);
      setEditingStaff(null);
      setName("");
      setCommissionRate("");
      setRole(StaffRole.attendant);
    } catch (error: any) {
      const msg = error?.message ?? "";
      if (msg.includes("Unauthorized")) {
        toast.error("You do not have permission to update staff");
      } else {
        toast.error(msg || "Failed to update staff member");
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeStaff.mutateAsync(deleteTarget.id);
      toast.success("Staff member removed successfully");
    } catch (error: any) {
      const msg = error?.message ?? "";
      if (msg.includes("Unauthorized")) {
        toast.error("You do not have permission to remove staff");
      } else {
        toast.error(msg || "Failed to remove staff member");
      }
    } finally {
      setDeleteTarget(null);
    }
  };

  if (canManageLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="glass-card p-8 text-center"
          data-ocid="staff.loading_state"
        >
          <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading staff data...</p>
        </div>
      </div>
    );
  }

  if (!canManageStaff && !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="glass-card p-8 text-center max-w-sm"
          data-ocid="staff.error_state"
        >
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-foreground font-medium">Access Restricted</p>
          <p className="text-muted-foreground text-sm mt-1">
            Only Owners and Managers can manage staff.
          </p>
        </div>
      </div>
    );
  }

  const uniqueRoles = new Set(staff.map((m) => String(m.role))).size;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold gradient-text"
            style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
          >
            Staff Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your team members and their access levels
          </p>
          {/* Stats row */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">
                {staff.length}
              </span>
              <span className="text-xs text-muted-foreground">Total Staff</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold text-foreground">
                {uniqueRoles}
              </span>
              <span className="text-xs text-muted-foreground">
                Active Roles
              </span>
            </div>
          </div>
        </div>

        {(canManageStaff || isAdmin) && (
          <Dialog
            open={isAddDialogOpen}
            onOpenChange={(open) => {
              setIsAddDialogOpen(open);
              if (!open) resetAddForm();
            }}
          >
            <DialogTrigger asChild>
              <Button
                data-ocid="staff.open_modal_button"
                className="shrink-0 gap-2 font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
                  color: "white",
                  border: "none",
                  boxShadow: "0 4px 16px oklch(0.65 0.20 45 / 0.35)",
                }}
              >
                <Plus className="w-4 h-4" />
                Add Staff Member
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-md"
              style={{
                background: "oklch(0.14 0.03 260 / 0.95)",
                border: "1px solid oklch(0.22 0.04 260 / 0.7)",
                backdropFilter: "blur(16px)",
              }}
              data-ocid="staff.dialog"
            >
              <DialogHeader>
                <DialogTitle
                  style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
                >
                  Add New Staff Member
                </DialogTitle>
                <DialogDescription>
                  Enter the staff member's Principal ID from their Internet
                  Identity — this is required for them to log in.
                </DialogDescription>
              </DialogHeader>
              {/* Login info box */}
              <div
                className="rounded-xl p-3 text-xs"
                style={{
                  background: "oklch(0.65 0.20 45 / 0.08)",
                  border: "1px solid oklch(0.65 0.20 45 / 0.2)",
                }}
              >
                <p className="font-semibold text-foreground/80 mb-1">
                  How does staff login work?
                </p>
                <p className="text-foreground/55 leading-relaxed">
                  Each staff member must log in using their own{" "}
                  <strong className="text-foreground/70">
                    Internet Identity
                  </strong>
                  . Ask them to open the app, click "Sign In with Internet
                  Identity", and share their Principal ID with you. Then enter
                  it here.
                </p>
              </div>
              <StaffFormFields
                showPrincipalField
                staffId={staffId}
                onStaffIdChange={handleStaffIdChange}
                name={name}
                onNameChange={setName}
                role={role}
                onRoleChange={setRole}
                commissionRate={commissionRate}
                onCommissionRateChange={setCommissionRate}
                principalIdValid={principalIdValid}
                principalIdError={principalIdError}
              />
              <Button
                onClick={handleAddStaff}
                className="w-full mt-2 font-semibold"
                data-ocid="staff.submit_button"
                disabled={
                  addStaff.isPending ||
                  name.trim() === "" ||
                  commissionRate.trim() === "" ||
                  (staffId.trim() !== "" && !principalIdValid)
                }
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
                  color: "white",
                  border: "none",
                }}
              >
                {addStaff.isPending ? "Adding..." : "Add Staff Member"}
              </Button>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Staff Cards Grid */}
      {staff.length === 0 ? (
        <div
          className="glass-card flex flex-col items-center justify-center py-20 text-center"
          data-ocid="staff.empty_state"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "oklch(0.65 0.20 45 / 0.15)" }}
          >
            <Users
              className="w-8 h-8"
              style={{ color: "oklch(0.65 0.20 45)" }}
            />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            No staff members yet
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            Add your first staff member to get started
          </p>
          {(canManageStaff || isAdmin) && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              data-ocid="staff.primary_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
                color: "white",
                border: "none",
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Staff Member
            </Button>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
          data-ocid="staff.list"
        >
          {staff.map((member, idx) => {
            const styles = getRoleStyle(member.role);
            const roleName =
              String(member.role).charAt(0).toUpperCase() +
              String(member.role).slice(1);
            return (
              <div
                key={member.id.toString()}
                className="glass-card overflow-hidden flex flex-col"
                data-ocid={`staff.item.${idx + 1}`}
                style={{
                  transition: "box-shadow 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 32px oklch(0 0 0 / 0.3)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "";
                  e.currentTarget.style.transform = "";
                }}
              >
                {/* Card body */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${styles.avatar}`}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    {/* Serial badge */}
                    <span
                      className="text-[11px] font-mono px-2 py-1 rounded-lg"
                      style={{
                        background: "oklch(0.22 0.04 260 / 0.6)",
                        color: "oklch(0.65 0.04 260)",
                      }}
                    >
                      #{String(Number(member.serialNumber)).padStart(3, "0")}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-base font-bold text-foreground leading-tight">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${styles.badge}`}
                      >
                        {roleName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3">
                    <Percent
                      className="w-3.5 h-3.5"
                      style={{ color: "oklch(0.65 0.15 185)" }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Commission:
                    </span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.65 0.15 185)" }}
                    >
                      {member.commissionRate}%
                    </span>
                  </div>
                </div>

                {/* Action bar */}
                {isAdmin && (
                  <div
                    className="grid grid-cols-2 border-t"
                    style={{ borderColor: "oklch(0.22 0.04 260 / 0.5)" }}
                  >
                    <button
                      type="button"
                      onClick={() => handleEditStaff(member)}
                      disabled={updateStaff.isPending}
                      data-ocid={`staff.edit_button.${idx + 1}`}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors border-r"
                      style={{ borderColor: "oklch(0.22 0.04 260 / 0.5)" }}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(member)}
                      disabled={removeStaff.isPending}
                      data-ocid={`staff.delete_button.${idx + 1}`}
                      className="flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors"
                      style={{ color: "oklch(0.65 0.20 15 / 0.7)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "oklch(0.62 0.22 15 / 0.1)";
                        e.currentTarget.style.color = "oklch(0.72 0.22 15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "";
                        e.currentTarget.style.color =
                          "oklch(0.65 0.20 15 / 0.7)";
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) setEditingStaff(null);
        }}
      >
        <DialogContent
          className="max-w-md"
          style={{
            background: "oklch(0.14 0.03 260 / 0.95)",
            border: "1px solid oklch(0.22 0.04 260 / 0.7)",
            backdropFilter: "blur(16px)",
          }}
          data-ocid="staff.dialog"
        >
          <DialogHeader>
            <DialogTitle
              style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
            >
              Edit Staff Member
            </DialogTitle>
            <DialogDescription>
              Update details for{" "}
              <span className="text-foreground font-medium">
                {editingStaff?.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          {editingStaff && (
            <>
              <StaffFormFields
                name={name}
                onNameChange={setName}
                role={role}
                onRoleChange={setRole}
                commissionRate={commissionRate}
                onCommissionRateChange={setCommissionRate}
              />
              <Button
                onClick={handleUpdateStaff}
                className="w-full mt-2 font-semibold"
                data-ocid="staff.save_button"
                disabled={
                  updateStaff.isPending ||
                  name.trim() === "" ||
                  commissionRate.trim() === ""
                }
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.65 0.20 45), oklch(0.55 0.18 35))",
                  color: "white",
                  border: "none",
                }}
              >
                {updateStaff.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation AlertDialog */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent
          style={{
            background: "oklch(0.14 0.03 260 / 0.97)",
            border: "1px solid oklch(0.22 0.04 260 / 0.7)",
            backdropFilter: "blur(16px)",
          }}
          data-ocid="staff.dialog"
        >
          <AlertDialogHeader>
            <AlertDialogTitle
              style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
            >
              Remove Staff Member?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <span className="text-foreground font-semibold">
                {deleteTarget?.name}
              </span>{" "}
              from the team? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="staff.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              data-ocid="staff.delete_button"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.62 0.22 15), oklch(0.52 0.22 8))",
                color: "white",
                border: "none",
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
