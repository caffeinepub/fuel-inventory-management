import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import type { StaffRole } from "../backend";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetup() {
  const saveProfile = useSaveCallerUserProfile();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [staffRole, setStaffRole] = useState<StaffRole>(
    "attendant" as StaffRole,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number");
      return;
    }

    try {
      await saveProfile.mutateAsync({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        staffRole,
      });
      toast.success("Profile created successfully");
    } catch (_error) {
      toast.error("Failed to create profile");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <Label htmlFor="role">Staff Role</Label>
              <Select
                value={staffRole}
                onValueChange={(v) => setStaffRole(v as StaffRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="operator">Operator</SelectItem>
                  <SelectItem value="attendant">Attendant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saveProfile.isPending}
            >
              {saveProfile.isPending ? "Creating Profile..." : "Create Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
