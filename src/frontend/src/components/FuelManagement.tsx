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
import { Fuel, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface FuelInvoice {
  id: string;
  invoiceNumber?: string;
  date: string;
  type: "combined" | "separate";
  // combined mode
  price?: number;
  quantity?: number;
  // separate mode
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

function calcPricePerLiter(price?: number, qty?: number): string {
  if (!price || !qty || qty === 0) return "—";
  return (price / qty).toFixed(2);
}

export default function FuelManagement() {
  const [invoices, setInvoices] = useState<FuelInvoice[]>([]);
  const [separateMode, setSeparateMode] = useState(false);

  // combined form state
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [date, setDate] = useState(todayString());
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  // separate form state
  const [petrolPrice, setPetrolPrice] = useState("");
  const [petrolQty, setPetrolQty] = useState("");
  const [dieselPrice, setDieselPrice] = useState("");
  const [dieselQty, setDieselQty] = useState("");

  useEffect(() => {
    setInvoices(loadInvoices());
  }, []);

  const pricePerLiterCombined = calcPricePerLiter(
    price ? Number(price) : undefined,
    quantity ? Number(quantity) : undefined,
  );
  const petrolPPL = calcPricePerLiter(
    petrolPrice ? Number(petrolPrice) : undefined,
    petrolQty ? Number(petrolQty) : undefined,
  );
  const dieselPPL = calcPricePerLiter(
    dieselPrice ? Number(dieselPrice) : undefined,
    dieselQty ? Number(dieselQty) : undefined,
  );

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
      if (!petrolPrice && !petrolQty && !dieselPrice && !dieselQty) {
        toast.error("Please enter at least petrol or diesel details.");
        return;
      }

      const entries: FuelInvoice[] = [];
      if (petrolPrice || petrolQty) {
        if (!petrolPrice || !petrolQty) {
          toast.error("Please fill both Petrol price and quantity.");
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
          toast.error("Please fill both Diesel price and quantity.");
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
        toast.error("Please enter invoice price and quantity.");
        return;
      }
      const entry: FuelInvoice = {
        id: `${Date.now()}`,
        invoiceNumber: invoiceNumber || undefined,
        date,
        type: "combined",
        price: Number(price),
        quantity: Number(quantity),
      };
      newInvoices = [...invoices, entry];
    }

    setInvoices(newInvoices);
    saveInvoices(newInvoices);
    resetForm();
    toast.success("Invoice saved successfully.");
  };

  const handleDelete = (id: string) => {
    const updated = invoices.filter((inv) => inv.id !== id);
    setInvoices(updated);
    saveInvoices(updated);
    toast.success("Invoice deleted.");
  };

  // Flatten invoices for table display
  interface DisplayRow {
    id: string;
    invoiceNumber?: string;
    date: string;
    fuelType: string;
    invoicePrice: number;
    invoiceQty: number;
    pricePerLiter: string;
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
          pricePerLiter: calcPricePerLiter(inv.price, inv.quantity),
        },
      ];
    }
    // separate
    const result: DisplayRow[] = [];
    if (inv.petrolPrice !== undefined && inv.petrolQty !== undefined) {
      result.push({
        id: inv.id,
        invoiceNumber: inv.invoiceNumber,
        date: inv.date,
        fuelType: "Petrol",
        invoicePrice: inv.petrolPrice,
        invoiceQty: inv.petrolQty,
        pricePerLiter: calcPricePerLiter(inv.petrolPrice, inv.petrolQty),
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
        pricePerLiter: calcPricePerLiter(inv.dieselPrice, inv.dieselQty),
      });
    }
    return result;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 page-header-accent">
        <div className="w-11 h-11 rounded-xl bg-orange-500/15 flex items-center justify-center ring-2 ring-orange-400/20">
          <Fuel className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Fuel Management</h1>
          <p className="text-muted-foreground mt-0.5">
            Track fuel invoices and calculate price per liter
          </p>
        </div>
      </div>

      {/* Add Invoice Form */}
      <Card className="card-gradient shadow-sm border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 rounded-full bg-gradient-to-b from-orange-400 to-orange-600" />
            <CardTitle>Add Fuel Invoice</CardTitle>
          </div>
          <CardDescription>
            Enter invoice details to calculate price per liter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Invoice Number + Invoice Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  type="text"
                  placeholder="e.g. INV-2024-001"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  data-ocid="fuel.invoice_number.input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice-date">Invoice Date</Label>
                <Input
                  id="invoice-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-ocid="fuel.input"
                />
              </div>
            </div>

            {/* Separate Mode Toggle */}
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
              <Switch
                id="separate-mode"
                checked={separateMode}
                onCheckedChange={setSeparateMode}
                data-ocid="fuel.switch"
              />
              <Label
                htmlFor="separate-mode"
                className="cursor-pointer font-medium"
              >
                Enter separately for Petrol &amp; Diesel
              </Label>
            </div>

            {/* Combined Mode */}
            {!separateMode && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label htmlFor="invoice-price">Invoice Price (₹)</Label>
                  <Input
                    id="invoice-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 5000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    data-ocid="fuel.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-qty">Invoice Quantity (L)</Label>
                  <Input
                    id="invoice-qty"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 50"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    data-ocid="fuel.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price Per Liter (₹/L)</Label>
                  <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/50">
                    <span className="text-sm font-semibold text-primary">
                      {pricePerLiterCombined !== "—"
                        ? `₹${pricePerLiterCombined}`
                        : "—"}
                    </span>
                    {pricePerLiterCombined !== "—" && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        Auto
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Separate Mode */}
            {separateMode && (
              <div className="space-y-4">
                {/* Petrol Row */}
                <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                    <span className="text-sm font-semibold">Petrol</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="petrol-price">Price (₹)</Label>
                      <Input
                        id="petrol-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 3000"
                        value={petrolPrice}
                        onChange={(e) => setPetrolPrice(e.target.value)}
                        data-ocid="fuel.input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="petrol-qty">Quantity (L)</Label>
                      <Input
                        id="petrol-qty"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 30"
                        value={petrolQty}
                        onChange={(e) => setPetrolQty(e.target.value)}
                        data-ocid="fuel.input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price Per Liter (₹/L)</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/50">
                        <span className="text-sm font-semibold text-primary">
                          {petrolPPL !== "—" ? `₹${petrolPPL}` : "—"}
                        </span>
                        {petrolPPL !== "—" && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Diesel Row */}
                <div className="p-4 rounded-lg border border-border bg-card space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-sm font-semibold">Diesel</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="diesel-price">Price (₹)</Label>
                      <Input
                        id="diesel-price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 2000"
                        value={dieselPrice}
                        onChange={(e) => setDieselPrice(e.target.value)}
                        data-ocid="fuel.input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="diesel-qty">Quantity (L)</Label>
                      <Input
                        id="diesel-qty"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 20"
                        value={dieselQty}
                        onChange={(e) => setDieselQty(e.target.value)}
                        data-ocid="fuel.input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price Per Liter (₹/L)</Label>
                      <div className="flex items-center h-10 px-3 rounded-md border border-input bg-muted/50">
                        <span className="text-sm font-semibold text-primary">
                          {dieselPPL !== "—" ? `₹${dieselPPL}` : "—"}
                        </span>
                        {dieselPPL !== "—" && (
                          <Badge
                            variant="secondary"
                            className="ml-auto text-xs"
                          >
                            Auto
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" data-ocid="fuel.submit_button">
              Save Invoice
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Invoice History Table */}
      <Card className="shadow-sm border border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 rounded-full bg-gradient-to-b from-teal-400 to-teal-600" />
            <CardTitle>Invoice History</CardTitle>
          </div>
          <CardDescription>
            All recorded fuel invoices with calculated price per liter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rows.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-center gap-3"
              data-ocid="fuel.empty_state"
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center ring-2 ring-orange-400/15">
                <Fuel className="w-7 h-7 text-orange-400" />
              </div>
              <p className="font-semibold text-foreground">
                No invoices recorded yet
              </p>
              <p className="text-sm text-muted-foreground">
                Add your first fuel invoice above to get started
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="fuel.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Invoice No.</TableHead>
                    <TableHead className="font-semibold">Fuel Type</TableHead>
                    <TableHead className="text-right font-semibold">
                      Invoice Price (₹)
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Quantity (L)
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Price Per Liter (₹/L)
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow
                      key={`${row.id}-${row.fuelType}`}
                      data-ocid={`fuel.item.${index + 1}`}
                      className="hover:bg-orange-50/40 transition-colors"
                    >
                      <TableCell className="font-medium text-sm">
                        {new Date(row.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>
                        {row.invoiceNumber ? (
                          <Badge
                            variant="outline"
                            className="font-mono text-xs border-orange-300/60 text-orange-700 bg-orange-50"
                          >
                            {row.invoiceNumber}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              row.fuelType === "Petrol"
                                ? "bg-green-500"
                                : row.fuelType === "Diesel"
                                  ? "bg-blue-500"
                                  : "bg-orange-400"
                            }`}
                          />
                          <span className="text-sm font-medium">
                            {row.fuelType}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ₹{row.invoicePrice.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {row.invoiceQty.toLocaleString("en-IN")} L
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge className="font-bold text-sm bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 hover:from-orange-600 hover:to-orange-700">
                          ₹{row.pricePerLiter}/L
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(row.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
