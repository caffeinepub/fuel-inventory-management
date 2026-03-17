import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@dfinity/principal";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Droplets,
  Fuel,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FuelType, Sale } from "../backend";
import { useConnectionMonitor } from "../hooks/useConnectionMonitor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useOfflineStorage } from "../hooks/useOfflineStorage";
import {
  useGetCurrentPrices,
  useGetStaff,
  useRecordSale,
} from "../hooks/useQueries";

export default function SalesForm() {
  useInternetIdentity();
  const recordSale = useRecordSale();
  const { data: prices = [] } = useGetCurrentPrices();
  const { data: staff = [] } = useGetStaff();
  const { isConnected } = useConnectionMonitor();
  const { addSale } = useOfflineStorage();

  const [fuelType, setFuelType] = useState<FuelType>("petrol" as FuelType);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [saleDate, setSaleDate] = useState<Date>(new Date());
  const [saleTime, setSaleTime] = useState<string>(format(new Date(), "HH:mm"));
  const [openTotalizer, setOpenTotalizer] = useState("");
  const [endTotalizer, setEndTotalizer] = useState("");
  const [pumpNumber, setPumpNumber] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const currentPrice = prices.find((p) => p[0] === fuelType)?.[1] ?? 0;

  // Live calculations
  const openVal = Number.parseFloat(openTotalizer || "0");
  const endVal = Number.parseFloat(endTotalizer || "0");
  const hasValues = openTotalizer !== "" && endTotalizer !== "";
  const liters = endVal - openVal;
  const isValid = hasValues && liters >= 0;
  const isInvalid = hasValues && liters < 0;
  const total = isValid ? liters * currentPrice : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error("Please select a staff member");
      return;
    }
    if (!openTotalizer || !endTotalizer) {
      toast.error("Please enter both totalizer readings");
      return;
    }
    if (isInvalid) {
      toast.error("End totalizer must be ≥ open totalizer");
      return;
    }

    const staffId = Principal.fromText(selectedStaffId);
    const [hours, minutes] = saleTime.split(":").map(Number);
    const combinedDateTime = new Date(saleDate);
    combinedDateTime.setHours(hours, minutes, 0, 0);
    const saleDateNanos = BigInt(combinedDateTime.getTime() * 1_000_000);

    if (!isConnected) {
      try {
        const offlineSale: Sale = {
          id: BigInt(Date.now()),
          fuelType,
          quantity: liters,
          rate: currentPrice,
          total,
          openTotalizer: openVal,
          endTotalizer: endVal,
          staffId,
          timestamp: BigInt(Date.now() * 1_000_000),
          saleDate: saleDateNanos,
        };
        addSale(offlineSale);
        toast.success("Sale saved offline — will sync when online");
        setOpenTotalizer("");
        setEndTotalizer("");
        setPumpNumber("");
      } catch {
        toast.error("Failed to save sale offline");
      }
      return;
    }

    try {
      await recordSale.mutateAsync({
        fuelType,
        quantity: liters,
        rate: currentPrice,
        openTotalizer: openVal,
        endTotalizer: endVal,
        saleDate: saleDateNanos,
        staffId,
      });
      toast.success("Sale recorded successfully");
      setOpenTotalizer("");
      setEndTotalizer("");
      setPumpNumber("");
    } catch {
      toast.error("Failed to record sale");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-2xl sm:text-3xl font-bold page-header-accent"
          style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
        >
          New Sale
        </h1>
        <p className="text-foreground/50 mt-1 text-sm">
          Record a fuel sale transaction with live calculations
        </p>
      </div>

      {!isConnected && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/15 border border-destructive/30">
          <WifiOff className="w-5 h-5 text-destructive shrink-0" />
          <div>
            <p className="font-medium text-destructive text-sm">Offline Mode</p>
            <p className="text-xs text-foreground/50">
              Sales saved locally and synced when connection restores
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sale Entry Form */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-foreground">
              <span className="flex items-center gap-2">
                <Fuel className="w-5 h-5 text-primary" />
                Sale Details
              </span>
              {!isConnected && (
                <Badge variant="destructive" className="text-xs">
                  Offline
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date & Time */}
              <div>
                <Label className="text-foreground/70">
                  Sale Date &amp; Time
                </Label>
                <div className="flex gap-2 mt-1">
                  <Popover
                    open={isCalendarOpen}
                    onOpenChange={setIsCalendarOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex-1 justify-start text-left font-normal border-border/60 bg-input/50 hover:bg-input/80"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                        {format(saleDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={saleDate}
                        onSelect={(d) => {
                          if (d) {
                            setSaleDate(d);
                            setIsCalendarOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    type="time"
                    value={saleTime}
                    onChange={(e) => setSaleTime(e.target.value)}
                    className="w-32 border-border/60 bg-input/50"
                  />
                </div>
              </div>

              {/* Pump Number */}
              <div>
                <Label htmlFor="pumpNumber" className="text-foreground/70">
                  Pump Number
                </Label>
                <Input
                  id="pumpNumber"
                  type="text"
                  value={pumpNumber}
                  onChange={(e) => setPumpNumber(e.target.value)}
                  placeholder="e.g. Pump 1, P-02"
                  className="mt-1 border-border/60 bg-input/50"
                  data-ocid="sale.pump_number.input"
                />
              </div>

              {/* Fuel Type */}
              <div>
                <Label className="text-foreground/70">Fuel Type</Label>
                <Select
                  value={fuelType}
                  onValueChange={(v) => setFuelType(v as FuelType)}
                >
                  <SelectTrigger className="mt-1 border-border/60 bg-input/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">⛽ Petrol</SelectItem>
                    <SelectItem value="diesel">🔵 Diesel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Totalizers */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="openTotalizer" className="text-foreground/70">
                    Open Totalizer
                  </Label>
                  <Input
                    id="openTotalizer"
                    type="number"
                    step="0.01"
                    value={openTotalizer}
                    onChange={(e) => setOpenTotalizer(e.target.value)}
                    placeholder="0.00"
                    className={`mt-1 border-border/60 bg-input/50 ${isInvalid ? "border-destructive" : ""}`}
                    data-ocid="sale.open_totalizer.input"
                  />
                </div>
                <div>
                  <Label htmlFor="endTotalizer" className="text-foreground/70">
                    End Totalizer
                  </Label>
                  <Input
                    id="endTotalizer"
                    type="number"
                    step="0.01"
                    value={endTotalizer}
                    onChange={(e) => setEndTotalizer(e.target.value)}
                    placeholder="0.00"
                    className={`mt-1 border-border/60 bg-input/50 ${isInvalid ? "border-destructive" : ""}`}
                    data-ocid="sale.end_totalizer.input"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              {isValid && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      Live Calculation
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5" />
                      Liters Dispensed:
                    </span>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      {liters.toFixed(2)} L
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70">
                      Rate per Liter:
                    </span>
                    <span className="font-semibold text-foreground/80 tabular-nums">
                      PKR {currentPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-px bg-white/10 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-foreground">
                      Total Amount:
                    </span>
                    <span className="text-xl font-bold text-primary tabular-nums">
                      PKR {total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {isInvalid && (
                <div className="flex items-center gap-2 p-3 bg-destructive/15 border border-destructive/30 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                  <span className="text-sm text-destructive">
                    End totalizer must be ≥ open totalizer
                  </span>
                </div>
              )}

              {/* Staff */}
              <div>
                <Label className="text-foreground/70">Staff Member</Label>
                <Select
                  value={selectedStaffId}
                  onValueChange={setSelectedStaffId}
                >
                  <SelectTrigger className="mt-1 border-border/60 bg-input/50">
                    <SelectValue placeholder="Select staff" />
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

              {/* Summary line (when no live calc box) */}
              {!isValid && currentPrice > 0 && (
                <div className="flex justify-between text-sm py-2 border-t border-border/30">
                  <span className="text-foreground/60">Rate per Liter:</span>
                  <span className="font-semibold">
                    PKR {currentPrice.toFixed(2)}
                  </span>
                </div>
              )}

              <Button
                type="submit"
                className="w-full min-h-[44px]"
                disabled={recordSale.isPending || isInvalid}
                data-ocid="sale.submit_button"
              >
                {recordSale.isPending
                  ? "Recording..."
                  : isConnected
                    ? "Record Sale"
                    : "Save Offline"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Current Prices Panel */}
        <Card className="glass-card border-0">
          <CardHeader className="pb-3">
            <CardTitle className="text-foreground">
              Current Fuel Prices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {prices.map(([type, price]) => (
                <div
                  key={type}
                  className={`flex justify-between items-center p-4 rounded-xl border transition-all ${type === fuelType ? "border-primary/40 bg-primary/10" : "border-border/30 bg-white/5"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">
                      {type === "petrol" ? "⛽" : "🔵"}
                    </span>
                    <span className="font-semibold text-foreground">
                      {type === "petrol" ? "Petrol" : "Diesel"}
                    </span>
                    {type === fuelType && (
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                        Selected
                      </Badge>
                    )}
                  </div>
                  <span className="text-lg font-bold text-foreground tabular-nums">
                    PKR {price.toFixed(2)}
                    <span className="text-sm font-normal text-foreground/50">
                      /L
                    </span>
                  </span>
                </div>
              ))}
              {prices.length === 0 && (
                <p className="text-center text-foreground/50 py-8 text-sm">
                  No prices configured yet
                </p>
              )}
            </div>

            {/* Calculation helper card */}
            {isValid && (
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-3">
                  Calculation Summary
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/60">End − Open:</span>
                    <span className="font-mono font-semibold">
                      {endVal.toFixed(2)} − {openVal.toFixed(2)} ={" "}
                      <span className="text-accent">{liters.toFixed(2)} L</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground/60">L × Rate:</span>
                    <span className="font-mono font-semibold">
                      {liters.toFixed(2)} × {currentPrice.toFixed(2)} ={" "}
                      <span className="text-primary">
                        PKR {total.toFixed(2)}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
