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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
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
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Droplets,
  Fuel,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { FuelType } from "../backend";
import {
  useAddTank,
  useGetTanks,
  useUpdateTankLevel,
} from "../hooks/useQueries";

export default function TankMonitor() {
  const queryClient = useQueryClient();
  const { data: tanks = [], isLoading } = useGetTanks();
  const updateTankLevel = useUpdateTankLevel();
  const addTank = useAddTank();

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedTank, setSelectedTank] = useState<string | null>(null);
  const [newVolume, setNewVolume] = useState("");
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTankId, setNewTankId] = useState("");
  const [newTankType, setNewTankType] = useState<FuelType>(
    "petrol" as FuelType,
  );
  const [newTankCapacity, setNewTankCapacity] = useState("");
  const [newTankVolume, setNewTankVolume] = useState("");
  const [newTankThreshold, setNewTankThreshold] = useState("");
  const [deletedTankIds, setDeletedTankIds] = useState<Set<string>>(new Set());

  const visibleTanks = tanks.filter((t) => !deletedTankIds.has(t.id));

  // 30-second real-time polling
  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["tanks"] });
      setLastUpdated(new Date());
    };
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const handleDeleteTank = (tankId: string) => {
    setDeletedTankIds((prev) => new Set([...prev, tankId]));
    toast.success(`Tank ${tankId} deleted`);
  };

  const handleUpdateLevel = async () => {
    if (!selectedTank || !newVolume) return;
    try {
      await updateTankLevel.mutateAsync({
        id: selectedTank,
        volume: Number.parseFloat(newVolume),
      });
      toast.success("Tank level updated");
      setIsUpdateDialogOpen(false);
      setSelectedTank(null);
      setNewVolume("");
      setLastUpdated(new Date());
    } catch {
      toast.error("Failed to update tank level");
    }
  };

  const handleAddTank = async () => {
    if (!newTankId || !newTankCapacity || !newTankVolume || !newTankThreshold) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await addTank.mutateAsync({
        id: newTankId,
        fuelType: newTankType,
        capacity: Number.parseFloat(newTankCapacity),
        currentVolume: Number.parseFloat(newTankVolume),
        threshold: Number.parseFloat(newTankThreshold),
      });
      toast.success("Tank added");
      setIsAddDialogOpen(false);
      setNewTankId("");
      setNewTankCapacity("");
      setNewTankVolume("");
      setNewTankThreshold("");
      setLastUpdated(new Date());
    } catch {
      toast.error("Failed to add tank");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="tanks.loading_state">
        <div className="flex justify-between items-center">
          <div className="h-8 w-40 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-white/5 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold page-header-accent"
            style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
          >
            Tank Monitor
          </h1>
          <p className="text-foreground/50 mt-1 text-sm">
            Monitor fuel levels across all tanks
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <div className="flex items-center gap-1.5 glass-card px-3 py-2 text-xs text-foreground/50">
              <span className="live-dot" />
              <span>Updated {lastUpdated.toLocaleTimeString()}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["tanks"] });
              setLastUpdated(new Date());
            }}
            className="glass-card p-2.5 text-foreground/50 hover:text-foreground transition-colors"
            data-ocid="tanks.refresh.button"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="min-h-[44px] shrink-0"
                data-ocid="tanks.add_tank.open_modal_button"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Tank
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="tanks.add_tank.dialog">
              <DialogHeader>
                <DialogTitle>Add New Tank</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tankId">Tank ID</Label>
                  <Input
                    id="tankId"
                    value={newTankId}
                    onChange={(e) => setNewTankId(e.target.value)}
                    placeholder="e.g., TANK-001"
                    className="mt-1"
                    data-ocid="tanks.tank_id.input"
                  />
                </div>
                <div>
                  <Label>Fuel Type</Label>
                  <Select
                    value={newTankType}
                    onValueChange={(v) => setNewTankType(v as FuelType)}
                  >
                    <SelectTrigger
                      className="mt-1"
                      data-ocid="tanks.fuel_type.select"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petrol">⛽ Petrol</SelectItem>
                      <SelectItem value="diesel">🔵 Diesel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="cap">Capacity (Liters)</Label>
                  <Input
                    id="cap"
                    type="number"
                    value={newTankCapacity}
                    onChange={(e) => setNewTankCapacity(e.target.value)}
                    placeholder="10000"
                    className="mt-1"
                    data-ocid="tanks.capacity.input"
                  />
                </div>
                <div>
                  <Label htmlFor="vol">Current Volume (Liters)</Label>
                  <Input
                    id="vol"
                    type="number"
                    value={newTankVolume}
                    onChange={(e) => setNewTankVolume(e.target.value)}
                    placeholder="5000"
                    className="mt-1"
                    data-ocid="tanks.current_volume.input"
                  />
                </div>
                <div>
                  <Label htmlFor="thr">Low Alert Threshold (Liters)</Label>
                  <Input
                    id="thr"
                    type="number"
                    value={newTankThreshold}
                    onChange={(e) => setNewTankThreshold(e.target.value)}
                    placeholder="2000"
                    className="mt-1"
                    data-ocid="tanks.threshold.input"
                  />
                </div>
                <Button
                  onClick={handleAddTank}
                  className="w-full min-h-[44px]"
                  disabled={addTank.isPending}
                  data-ocid="tanks.add_tank.submit_button"
                >
                  {addTank.isPending ? "Adding..." : "Add Tank"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary bar */}
      {visibleTanks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Petrol Tanks",
              value: visibleTanks.filter((t) => t.fuelType === "petrol").length,
              colorClass: "text-[oklch(0.68_0.17_160)]",
            },
            {
              label: "Diesel Tanks",
              value: visibleTanks.filter((t) => t.fuelType === "diesel").length,
              colorClass: "text-[oklch(0.65_0.19_240)]",
            },
            {
              label: "Low Alerts",
              value: visibleTanks.filter((t) => t.currentVolume < t.threshold)
                .length,
              colorClass: "text-destructive",
            },
            {
              label: "Total (kL)",
              value: `${(visibleTanks.reduce((s, t) => s + t.currentVolume, 0) / 1000).toFixed(1)}k`,
              colorClass: "text-primary",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="glass-card rounded-xl p-3 sm:p-4 text-center"
            >
              <div
                className={`text-xl sm:text-2xl font-bold tabular-nums ${s.colorClass}`}
              >
                {s.value}
              </div>
              <div className="text-[11px] text-foreground/50 font-semibold mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tank cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTanks.map((tank, index) => {
          const pct = Math.min((tank.currentVolume / tank.capacity) * 100, 100);
          const isLow = tank.currentVolume < tank.threshold;
          const isWarn = !isLow && pct < 60;
          const isPetrol = tank.fuelType === "petrol";

          const barClass = isLow
            ? "tank-bar-low animate-pulse"
            : isWarn
              ? "tank-bar-warning"
              : isPetrol
                ? "tank-bar-petrol"
                : "tank-bar-diesel";

          const pctColor = isLow
            ? "text-destructive"
            : isWarn
              ? "text-yellow-400"
              : isPetrol
                ? "text-[oklch(0.68_0.17_160)]"
                : "text-[oklch(0.65_0.19_240)]";

          const accentTop = isLow
            ? "border-t-destructive"
            : isPetrol
              ? "border-t-[oklch(0.68_0.17_160)]"
              : "border-t-[oklch(0.65_0.19_240)]";

          return (
            <div
              key={tank.id}
              data-ocid={`tanks.tank.item.${index + 1}`}
              className={`glass-card border-t-2 ${accentTop} rounded-2xl overflow-hidden transition-all hover:scale-[1.01]`}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl glass-card-bright flex items-center justify-center shrink-0">
                    <Fuel
                      className={`w-4 h-4 ${isPetrol ? "text-[oklch(0.68_0.17_160)]" : "text-[oklch(0.65_0.19_240)]"}`}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground truncate">
                    {tank.id}
                  </span>
                </div>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isPetrol ? "bg-[oklch(0.68_0.17_160)]/15 text-[oklch(0.68_0.17_160)]" : "bg-[oklch(0.65_0.19_240)]/15 text-[oklch(0.65_0.19_240)]"}`}
                >
                  {isPetrol ? "⛽ Petrol" : "🔵 Diesel"}
                </span>
              </div>

              <div className="px-4 pb-4 space-y-4">
                {/* Level bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-foreground/50 font-medium">
                      Fuel Level
                    </span>
                    <span
                      className={`text-base font-bold tabular-nums ${pctColor}`}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="relative h-5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out flex items-center justify-end ${barClass}`}
                      style={{ width: `${pct}%` }}
                    >
                      {pct >= 25 && (
                        <span className="text-[10px] font-bold text-white/90 pr-2 leading-none select-none">
                          {pct.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between text-[10px] text-foreground/40 mt-1 tabular-nums">
                    <span>{tank.currentVolume.toFixed(0)} L</span>
                    <span>{tank.capacity.toFixed(0)} L max</span>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "Current",
                      value: `${tank.currentVolume.toFixed(0)} L`,
                      icon: Droplets,
                    },
                    {
                      label: "Capacity",
                      value: `${tank.capacity.toFixed(0)} L`,
                      icon: null,
                    },
                    {
                      label: "Threshold",
                      value: `${tank.threshold.toFixed(0)} L`,
                      icon: null,
                      danger: isLow,
                    },
                    {
                      label: "Free Space",
                      value: `${(tank.capacity - tank.currentVolume).toFixed(0)} L`,
                      icon: null,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="bg-white/5 rounded-lg p-2.5"
                    >
                      <p className="text-[10px] text-foreground/40 mb-0.5 font-medium">
                        {stat.label}
                      </p>
                      <p
                        className={`font-bold text-sm tabular-nums ${stat.danger ? "text-destructive" : "text-foreground"}`}
                      >
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Low alert */}
                {isLow && (
                  <div className="flex items-center gap-2 bg-destructive/15 border border-destructive/30 text-destructive text-xs p-2.5 rounded-xl font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Low fuel — Refill required
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <Dialog
                    open={isUpdateDialogOpen && selectedTank === tank.id}
                    onOpenChange={(open) => {
                      setIsUpdateDialogOpen(open);
                      if (!open) setSelectedTank(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px] font-semibold text-sm border-white/15 hover:bg-white/10"
                        onClick={() => {
                          setSelectedTank(tank.id);
                          setNewVolume(tank.currentVolume.toString());
                        }}
                        data-ocid={`tanks.update_level.button.${index + 1}`}
                      >
                        Update Level
                      </Button>
                    </DialogTrigger>
                    <DialogContent data-ocid="tanks.update_level.dialog">
                      <DialogHeader>
                        <DialogTitle>Update Tank Level — {tank.id}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="newVol">New Volume (Liters)</Label>
                          <Input
                            id="newVol"
                            type="number"
                            value={newVolume}
                            onChange={(e) => setNewVolume(e.target.value)}
                            max={tank.capacity}
                            className="mt-1"
                            data-ocid="tanks.new_volume.input"
                          />
                          <p className="text-xs text-foreground/50 mt-1.5">
                            Max: {tank.capacity} L
                          </p>
                        </div>
                        <Button
                          onClick={handleUpdateLevel}
                          className="w-full min-h-[44px]"
                          disabled={updateTankLevel.isPending}
                          data-ocid="tanks.update_level.submit_button"
                        >
                          {updateTankLevel.isPending
                            ? "Updating..."
                            : "Update Level"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="min-h-[44px] min-w-[44px] border-destructive/30 text-destructive hover:bg-destructive/15 hover:border-destructive/60"
                        data-ocid={`tanks.delete_button.${index + 1}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent data-ocid="tanks.delete.dialog">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tank</AlertDialogTitle>
                        <AlertDialogDescription>
                          Delete tank <strong>{tank.id}</strong>? This cannot be
                          undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-ocid="tanks.delete.cancel_button">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteTank(tank.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-ocid="tanks.delete.confirm_button"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleTanks.length === 0 && (
        <div
          className="glass-card rounded-2xl py-16 text-center"
          data-ocid="tanks.empty_state"
        >
          <div className="text-6xl mb-4">⛽</div>
          <h3 className="font-bold text-lg mb-1 text-foreground">
            No tanks configured
          </h3>
          <p className="text-foreground/50 text-sm max-w-xs mx-auto">
            Add your first fuel tank to start monitoring levels and receiving
            alerts.
          </p>
          <Button
            className="mt-5 min-h-[44px]"
            onClick={() => setIsAddDialogOpen(true)}
            data-ocid="tanks.empty.add_tank.button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Tank
          </Button>
        </div>
      )}
    </div>
  );
}
