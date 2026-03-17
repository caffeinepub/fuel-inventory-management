import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calculator, Fuel, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FuelInvoice {
  id: string;
  invoiceNumber?: string;
  date: string;
  type: "combined" | "separate";
  price?: number;
  quantity?: number;
  petrolPrice?: number;
  petrolQty?: number;
  dieselPrice?: number;
  dieselQty?: number;
}

const STORAGE_KEY = "fuelInvoices";

function loadInvoices(): FuelInvoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FuelInvoice[];
  } catch {
    return [];
  }
}

function saveInvoices(invoices: FuelInvoice[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

function calcPPL(price?: number, qty?: number): number | null {
  if (!price || !qty || qty === 0) return null;
  return price / qty;
}

function PPLBadge({ price, qty }: { price: string; qty: string }) {
  const ppl = calcPPL(
    price ? Number(price) : undefined,
    qty ? Number(qty) : undefined,
  );
  if (ppl === null)
    return <span className="text-foreground/30 text-sm">—</span>;
  return (
    <div className="flex items-center gap-1.5">
      <Calculator className="w-3.5 h-3.5 text-primary shrink-0" />
      <span className="text-base font-bold text-primary tabular-nums">
        PKR {ppl.toFixed(2)}/L
      </span>
    </div>
  );
}

export default function FuelManagement() {
  const [invoices, setInvoices] = useState<FuelInvoice[]>([]);
  const [separateMode, setSeparateMode] = useState(false);

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(todayString());
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [petrolPrice, setPetrolPrice] = useState("");
  const [petrolQty, setPetrolQty] = useState("");
  const [dieselPrice, setDieselPrice] = useState("");
  const [dieselQty, setDieselQty] = useState("");

  useEffect(() => {
    setInvoices(loadInvoices());
  }, []);

  const resetForm = () => {
    setInvoiceNumber("");
    setDate(todayString());
    setPrice("");
    setQuantity("");
    setPetrolPrice("");
    setPetrolQty("");
    setDieselPrice("");
    setDieselQty("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast.error("Please select an invoice date.");
      return;
    }

    let newInvoices: FuelInvoice[];

    if (separateMode) {
      const entries: FuelInvoice[] = [];
      if (petrolPrice || petrolQty) {
        if (!petrolPrice || !petrolQty) {
          toast.error("Fill both Petrol price and quantity.");
          return;
        }
        entries.push({
          id: `${Date.now()}-petrol`,
          invoiceNumber: invoiceNumber || undefined,
          date,
          type: "separate",
          petrolPrice: Number(petrolPrice),
          petrolQty: Number(petrolQty),
        });
      }
      if (dieselPrice || dieselQty) {
        if (!dieselPrice || !dieselQty) {
          toast.error("Fill both Diesel price and quantity.");
          return;
        }
        entries.push({
          id: `${Date.now()}-diesel`,
          invoiceNumber: invoiceNumber || undefined,
          date,
          type: "separate",
          dieselPrice: Number(dieselPrice),
          dieselQty: Number(dieselQty),
        });
      }
      if (entries.length === 0) {
        toast.error("Please enter fuel details.");
        return;
      }
      newInvoices = [...invoices, ...entries];
    } else {
      if (!price || !quantity) {
        toast.error("Enter invoice price and quantity.");
        return;
      }
      newInvoices = [
        ...invoices,
        {
          id: `${Date.now()}`,
          invoiceNumber: invoiceNumber || undefined,
          date,
          type: "combined",
          price: Number(price),
          quantity: Number(quantity),
        },
      ];
    }

    setInvoices(newInvoices);
    saveInvoices(newInvoices);
    resetForm();
    toast.success("Invoice saved.");
  };

  const handleDelete = (id: string) => {
    const updated = invoices.filter((inv) => inv.id !== id);
    setInvoices(updated);
    saveInvoices(updated);
    toast.success("Invoice deleted.");
  };

  interface DisplayRow {
    id: string;
    invoiceNumber?: string;
    date: string;
    fuelType: string;
    invoicePrice: number;
    invoiceQty: number;
    ppl: number | null;
  }

  const rows: DisplayRow[] = invoices.flatMap((inv) => {
    if (inv.type === "combined") {
      return [
        {
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          date: inv.date,
          fuelType: "Combined",
          invoicePrice: inv.price ?? 0,
          invoiceQty: inv.quantity ?? 0,
          ppl: calcPPL(inv.price, inv.quantity),
        },
      ];
    }
    const result: DisplayRow[] = [];
    if (inv.petrolPrice !== undefined && inv.petrolQty !== undefined) {
      result.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        fuelType: "Petrol",
        invoicePrice: inv.petrolPrice,
        invoiceQty: inv.petrolQty,
        ppl: calcPPL(inv.petrolPrice, inv.petrolQty),
      });
    }
    if (inv.dieselPrice !== undefined && inv.dieselQty !== undefined) {
      result.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        fuelType: "Diesel",
        invoicePrice: inv.dieselPrice,
        invoiceQty: inv.dieselQty,
        ppl: calcPPL(inv.dieselPrice, inv.dieselQty),
      });
    }
    return result;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl glass-card-bright flex items-center justify-center ring-1 ring-primary/30">
          <Fuel className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1
            className="text-2xl sm:text-3xl font-bold page-header-accent"
            style={{ fontFamily: '"Bricolage Grotesque",system-ui' }}
          >
            Fuel Management
          </h1>
          <p className="text-foreground/50 mt-0.5 text-sm">
            Track invoices and auto-calculate price per liter
          </p>
        </div>
      </div>

      {/* Add Invoice Form */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Add Fuel Invoice</CardTitle>
          <CardDescription className="text-foreground/50">
            Price per liter is calculated live as you type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground/70">Invoice Number</Label>
                <Input
                  type="text"
                  placeholder="e.g. INV-2024-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="border-border/60 bg-input/50"
                  data-ocid="fuel.invoice_number.input"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground/70">Invoice Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="border-border/60 bg-input/50"
                  data-ocid="fuel.date.input"
                />
              </div>
            </div>

            {/* Separate toggle */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
              <Switch
                id="sep"
                checked={separateMode}
                onCheckedChange={setSeparateMode}
                data-ocid="fuel.switch"
              />
              <Label
                htmlFor="sep"
                className="cursor-pointer font-medium text-foreground/80"
              >
                Enter separately for Petrol &amp; Diesel
              </Label>
            </div>

            {/* Combined mode */}
            {!separateMode && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground/70">
                      Invoice Price (PKR)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 50000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="border-border/60 bg-input/50"
                      data-ocid="fuel.price.input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-foreground/70">
                      Quantity (Liters)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 500"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="border-border/60 bg-input/50"
                      data-ocid="fuel.quantity.input"
                    />
                  </div>
                </div>
                {/* Live PPL preview */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/25">
                  <span className="text-sm font-medium text-foreground/70">
                    Price Per Liter:
                  </span>
                  <PPLBadge price={price} qty={quantity} />
                </div>
              </div>
            )}

            {/* Separate mode */}
            {separateMode && (
              <div className="space-y-4">
                {/* Petrol */}
                <div className="p-4 rounded-xl glass-card-bright space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.68_0.17_160)]" />
                    <span className="text-sm font-bold text-foreground">
                      Petrol
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-foreground/60 text-xs">
                        Price (PKR)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="30000"
                        value={petrolPrice}
                        onChange={(e) => setPetrolPrice(e.target.value)}
                        className="border-border/60 bg-input/50"
                        data-ocid="fuel.petrol_price.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground/60 text-xs">
                        Quantity (L)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="300"
                        value={petrolQty}
                        onChange={(e) => setPetrolQty(e.target.value)}
                        className="border-border/60 bg-input/50"
                        data-ocid="fuel.petrol_qty.input"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.68_0.17_160)]/10 border border-[oklch(0.68_0.17_160)]/20">
                    <span className="text-xs font-medium text-foreground/60">
                      Petrol PPL:
                    </span>
                    <PPLBadge price={petrolPrice} qty={petrolQty} />
                  </div>
                </div>

                {/* Diesel */}
                <div className="p-4 rounded-xl glass-card-bright space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-[oklch(0.65_0.19_240)]" />
                    <span className="text-sm font-bold text-foreground">
                      Diesel
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-foreground/60 text-xs">
                        Price (PKR)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="20000"
                        value={dieselPrice}
                        onChange={(e) => setDieselPrice(e.target.value)}
                        className="border-border/60 bg-input/50"
                        data-ocid="fuel.diesel_price.input"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground/60 text-xs">
                        Quantity (L)
                      </Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="200"
                        value={dieselQty}
                        onChange={(e) => setDieselQty(e.target.value)}
                        className="border-border/60 bg-input/50"
                        data-ocid="fuel.diesel_qty.input"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[oklch(0.65_0.19_240)]/10 border border-[oklch(0.65_0.19_240)]/20">
                    <span className="text-xs font-medium text-foreground/60">
                      Diesel PPL:
                    </span>
                    <PPLBadge price={dieselPrice} qty={dieselQty} />
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full min-h-[44px]"
              data-ocid="fuel.submit_button"
            >
              Save Invoice
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card className="glass-card border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground">Invoice History</CardTitle>
          <CardDescription className="text-foreground/50">
            All recorded fuel invoices with calculated price per liter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center gap-3"
              data-ocid="fuel.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl glass-card-bright flex items-center justify-center ring-1 ring-primary/20">
                <Fuel className="w-7 h-7 text-primary" />
              </div>
              <p className="font-semibold text-foreground">
                No invoices recorded yet
              </p>
              <p className="text-sm text-foreground/50">
                Add your first fuel invoice above
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="fuel.table">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-foreground/60">Date</TableHead>
                    <TableHead className="text-foreground/60">
                      Invoice No.
                    </TableHead>
                    <TableHead className="text-foreground/60">Fuel</TableHead>
                    <TableHead className="text-right text-foreground/60">
                      Price (PKR)
                    </TableHead>
                    <TableHead className="text-right text-foreground/60">
                      Qty (L)
                    </TableHead>
                    <TableHead className="text-right text-foreground/60">
                      PKR/L
                    </TableHead>
                    <TableHead className="text-right text-foreground/60">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={`${row.id}-${row.fuelType}`}
                      data-ocid={`fuel.item.${index + 1}`}
                      className="border-border/20 hover:bg-white/5 transition-colors"
                    >
                      <TableCell className="font-medium text-sm text-foreground/80">
                        {new Date(row.date).toLocaleDateString("en-PK", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {row.invoiceNumber ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs border-primary/30 text-primary bg-primary/10"
                          >
                            {row.invoiceNumber}
                          </Badge>
                        ) : (
                          <span className="text-foreground/30 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${row.fuelType === "Petrol" ? "bg-[oklch(0.68_0.17_160)]" : row.fuelType === "Diesel" ? "bg-[oklch(0.65_0.19_240)]" : "bg-primary"}`}
                          />
                          <span className="text-sm font-medium text-foreground/80">
                            {row.fuelType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground/80">
                        PKR {row.invoicePrice.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm text-foreground/70">
                        {row.invoiceQty.toLocaleString()} L
                      </TableCell>
                      <TableCell className="text-right">
                        {row.ppl !== null ? (
                          <Badge className="font-bold bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                            PKR {row.ppl.toFixed(2)}/L
                          </Badge>
                        ) : (
                          <span className="text-foreground/30">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(row.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/15"
                          data-ocid={`fuel.delete_button.${index + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
