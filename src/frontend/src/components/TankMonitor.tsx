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
import { AlertTriangle, Droplets, Fuel, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FuelType } from "../backend";
import {
  useAddTank,
  useGetTanks,
  useUpdateTankLevel,
} from "../hooks/useQueries";

export default function TankMonitor() {
  const { data: tanks = [], isLoading } = useGetTanks();
  const updateTankLevel = useUpdateTankLevel();
  const addTank = useAddTank();

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

  const handleUpdateLevel = async () => {
    if (!selectedTank || !newVolume) return;
    try {
      await updateTankLevel.mutateAsync({
        id: selectedTank,
        volume: Number.parseFloat(newVolume),
      });
      toast.success("Tank level updated successfully");
      setIsUpdateDialogOpen(false);
      setSelectedTank(null);
      setNewVolume("");
    } catch (_error) {
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
      toast.success("Tank added successfully");
      setIsAddDialogOpen(false);
      setNewTankId("");
      setNewTankCapacity("");
      setNewTankVolume("");
      setNewTankThreshold("");
    } catch (_error) {
      toast.error("Failed to add tank");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="tanks.loading_state">
        <div className="flex justify-between items-center">
          <div>
            <div className="h-8 w-40 bg-muted rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-56 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-muted rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-muted rounded-2xl animate-pulse" />
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
          <h1 className="text-2xl sm:text-3xl font-bold page-header-accent">
            Tank Monitor
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Monitor fuel levels across all tanks
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="min-h-[44px] self-start sm:self-auto shrink-0"
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
                  className="w-full mt-1"
                  data-ocid="tanks.tank_id.input"
                />
              </div>
              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={newTankType}
                  onValueChange={(v) => setNewTankType(v as FuelType)}
                >
                  <SelectTrigger
                    className="w-full mt-1"
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
                <Label htmlFor="capacity">Capacity (Liters)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={newTankCapacity}
                  onChange={(e) => setNewTankCapacity(e.target.value)}
                  placeholder="10000"
                  className="w-full mt-1"
                  data-ocid="tanks.capacity.input"
                />
              </div>
              <div>
                <Label htmlFor="currentVolume">Current Volume (Liters)</Label>
                <Input
                  id="currentVolume"
                  type="number"
                  value={newTankVolume}
                  onChange={(e) => setNewTankVolume(e.target.value)}
                  placeholder="5000"
                  className="w-full mt-1"
                  data-ocid="tanks.current_volume.input"
                />
              </div>
              <div>
                <Label htmlFor="threshold">Threshold (Liters)</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newTankThreshold}
                  onChange={(e) => setNewTankThreshold(e.target.value)}
                  placeholder="2000"
                  className="w-full mt-1"
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

      {/* Summary Bar */}
      {tanks.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 sm:p-3.5 text-center border border-emerald-200/80 dark:border-emerald-800/60">
            <div className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {tanks.filter((t) => t.fuelType === "petrol").length}
            </div>
            <div className="text-[11px] sm:text-xs text-emerald-600 dark:text-emerald-500 font-semibold mt-0.5">
              Petrol Tanks
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 sm:p-3.5 text-center border border-blue-200/80 dark:border-blue-800/60">
            <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400 tabular-nums">
              {tanks.filter((t) => t.fuelType === "diesel").length}
            </div>
            <div className="text-[11px] sm:text-xs text-blue-600 dark:text-blue-500 font-semibold mt-0.5">
              Diesel Tanks
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-950/30 rounded-xl p-3 sm:p-3.5 text-center border border-red-200/80 dark:border-red-800/60">
            <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400 tabular-nums">
              {tanks.filter((t) => t.currentVolume < t.threshold).length}
            </div>
            <div className="text-[11px] sm:text-xs text-red-600 dark:text-red-500 font-semibold mt-0.5">
              Low Alerts
            </div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/30 rounded-xl p-3 sm:p-3.5 text-center border border-orange-200/80 dark:border-orange-800/60">
            <div className="text-xl sm:text-2xl font-bold text-orange-700 dark:text-orange-400 tabular-nums">
              {(tanks.reduce((s, t) => s + t.currentVolume, 0) / 1000).toFixed(
                1,
              )}
              k
            </div>
            <div className="text-[11px] sm:text-xs text-orange-600 dark:text-orange-500 font-semibold mt-0.5">
              Total (L)
            </div>
          </div>
        </div>
      )}

      {/* Tank Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tanks.map((tank, index) => {
          const percentage = Math.min(
            (tank.currentVolume / tank.capacity) * 100,
            100,
          );
          const isLow = tank.currentVolume < tank.threshold;
          const isPetrol = tank.fuelType === "petrol";

          const accentColor = isLow
            ? "border-t-red-500"
            : isPetrol
              ? "border-t-emerald-500"
              : "border-t-blue-500";

          const iconBg = isLow
            ? "bg-red-100 dark:bg-red-900/30"
            : isPetrol
              ? "bg-emerald-100 dark:bg-emerald-900/30"
              : "bg-blue-100 dark:bg-blue-900/30";

          const iconColor = isLow
            ? "text-red-600"
            : isPetrol
              ? "text-emerald-600"
              : "text-blue-600";

          const pctColor = isLow
            ? "text-red-500"
            : isPetrol
              ? "text-emerald-600"
              : "text-blue-600";

          const badgeClass = isPetrol
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400";

          const btnClass = isLow
            ? "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-400"
            : isPetrol
              ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-400"
              : "border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-400";

          return (
            <Card
              key={tank.id}
              data-ocid={`tanks.tank.item.${index + 1}`}
              className={`overflow-hidden transition-shadow hover:shadow-lg border-t-4 ${accentColor}`}
            >
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
                    >
                      <Fuel className={`w-4 h-4 ${iconColor}`} />
                    </div>
                    <span className="text-sm font-bold truncate">
                      {tank.id}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeClass}`}
                  >
                    {isPetrol ? "⛽ Petrol" : "🔵 Diesel"}
                  </span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 px-4 pb-4">
                {/* Gauge Section
                    Mobile: percentage shown ABOVE bar (sm:hidden for inline row)
                    Desktop: percentage shown INLINE right of label */}
                <div>
                  {/* Mobile: stacked layout */}
                  <div className="flex items-center justify-between mb-1.5 sm:hidden">
                    <span className="text-xs font-medium text-muted-foreground">
                      Fuel Level
                    </span>
                    <span
                      className={`text-lg font-bold tabular-nums ${pctColor}`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  {/* Desktop: inline label + percentage */}
                  <div className="hidden sm:flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground">
                      Fuel Level
                    </span>
                    <span
                      className={`text-base font-bold tabular-nums ${pctColor}`}
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>

                  {/* Bar track */}
                  <div className="relative h-5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full rounded-full transition-[width] duration-700 ease-out flex items-center justify-end ${
                        isLow
                          ? "tank-bar-low animate-pulse"
                          : isPetrol
                            ? "tank-bar-petrol"
                            : "tank-bar-diesel"
                      }`}
                      style={{ width: `${percentage}%` }}
                    >
                      {/* Percentage label inside fill — shown when bar is wide enough */}
                      {percentage >= 25 && (
                        <span className="text-[10px] font-bold text-white/90 pr-2 leading-none select-none">
                          {percentage.toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1 tabular-nums">
                    <span>{tank.currentVolume.toFixed(0)} L</span>
                    <span>{tank.capacity.toFixed(0)} L max</span>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1 font-medium">
                      <Droplets className="w-2.5 h-2.5" />
                      Current
                    </p>
                    <p className="font-bold text-sm tabular-nums">
                      {tank.currentVolume.toFixed(0)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        L
                      </span>
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                      Capacity
                    </p>
                    <p className="font-bold text-sm tabular-nums">
                      {tank.capacity.toFixed(0)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        L
                      </span>
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                      Threshold
                    </p>
                    <p
                      className={`font-bold text-sm tabular-nums ${isLow ? "text-red-500" : ""}`}
                    >
                      {tank.threshold.toFixed(0)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        L
                      </span>
                    </p>
                  </div>
                  <div className="bg-muted/40 rounded-lg p-2.5">
                    <p className="text-[10px] text-muted-foreground mb-0.5 font-medium">
                      Free Space
                    </p>
                    <p className="font-bold text-sm tabular-nums">
                      {(tank.capacity - tank.currentVolume).toFixed(0)}{" "}
                      <span className="text-xs font-normal text-muted-foreground">
                        L
                      </span>
                    </p>
                  </div>
                </div>

                {/* Low Alert */}
                {isLow && (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-400 text-xs p-2.5 rounded-xl font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Low fuel — Refill required
                  </div>
                )}

                {/* Update Button */}
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
                      className={`w-full min-h-[44px] font-semibold text-sm transition-colors ${btnClass}`}
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
                        <Label htmlFor="volume">New Volume (Liters)</Label>
                        <Input
                          id="volume"
                          type="number"
                          value={newVolume}
                          onChange={(e) => setNewVolume(e.target.value)}
                          max={tank.capacity}
                          className="w-full mt-1"
                          data-ocid="tanks.new_volume.input"
                        />
                        <p className="text-xs text-muted-foreground mt-1.5">
                          Max capacity: {tank.capacity} L
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {tanks.length === 0 && (
        <Card data-ocid="tanks.empty_state">
          <CardContent className="py-16 text-center">
            <div className="text-6xl mb-4">⛽</div>
            <h3 className="font-bold text-lg mb-1">No tanks yet</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
