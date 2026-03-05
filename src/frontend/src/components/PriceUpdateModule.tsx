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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { FuelType } from "../backend";
import {
  useGetCurrentPrices,
  useGetPriceHistory,
  useIsCallerAdmin,
  useUpdatePrice,
} from "../hooks/useQueries";

export default function PriceUpdateModule() {
  const { data: isAdmin } = useIsCallerAdmin();
  const { data: currentPrices = [] } = useGetCurrentPrices();
  const { data: priceHistory = [] } = useGetPriceHistory();
  const updatePrice = useUpdatePrice();

  const [fuelType, setFuelType] = useState<FuelType>("petrol" as FuelType);
  const [newPrice, setNewPrice] = useState("");

  const handleUpdatePrice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPrice || Number.parseFloat(newPrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    try {
      await updatePrice.mutateAsync({
        fuelType,
        newPrice: Number.parseFloat(newPrice),
      });
      toast.success("Price updated successfully");
      setNewPrice("");
    } catch (_error) {
      toast.error("Failed to update price");
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Price Update Module</h1>
        <p className="text-muted-foreground mt-1">
          Manage fuel prices and view price history
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Prices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentPrices.map(([type, price]) => (
                <div
                  key={type}
                  className="flex justify-between items-center p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <span className="font-medium">
                      {type === "petrol" ? "Petrol" : "Diesel"}
                    </span>
                  </div>
                  <span className="text-2xl font-bold">
                    ₹{price.toFixed(2)}/L
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Update Price</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePrice} className="space-y-4">
              <div>
                <Label htmlFor="fuelType">Fuel Type</Label>
                <Select
                  value={fuelType}
                  onValueChange={(v) => setFuelType(v as FuelType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="diesel">Diesel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="newPrice">New Price (₹/Liter)</Label>
                <Input
                  id="newPrice"
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updatePrice.isPending}
              >
                {updatePrice.isPending ? "Updating..." : "Update Price"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead className="text-right">New Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceHistory
                .slice()
                .reverse()
                .slice(0, 20)
                .map((update) => (
                  <TableRow
                    key={`${update.fuelType}-${update.effectiveDate.toString()}`}
                  >
                    <TableCell>
                      {formatTimestamp(update.effectiveDate)}
                    </TableCell>
                    <TableCell>
                      {update.fuelType === "petrol" ? "Petrol" : "Diesel"}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ₹{update.newPrice.toFixed(2)}/L
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {priceHistory.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No price history available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
