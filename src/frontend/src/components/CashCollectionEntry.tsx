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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useDeleteCashCollection,
  useGetCashCollections,
  useGetSales,
  useRecordCashCollection,
} from "../hooks/useQueries";

type EditableCollection = {
  amount: string;
  breakdown: string;
};

export default function CashCollectionEntry() {
  const { data: collections = [] } = useGetCashCollections();
  const { data: sales = [] } = useGetSales();
  const recordCashCollection = useRecordCashCollection();
  const deleteCashCollection = useDeleteCashCollection();

  const [amount, setAmount] = useState("");
  const [breakdown, setBreakdown] = useState("");

  // Local overrides for edit
  const [editedCollections, setEditedCollections] = useState<
    Record<string, EditableCollection>
  >({});

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditableCollection>({
    amount: "",
    breakdown: "",
  });

  const handleDeleteCollection = async (id: bigint) => {
    try {
      await deleteCashCollection.mutateAsync(id);
      toast.success("Collection record deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete collection record");
    }
  };

  const openEditDialog = (collection: (typeof collections)[0]) => {
    const override = editedCollections[collection.id.toString()];
    setEditingId(collection.id.toString());
    setEditForm({
      amount: override?.amount ?? collection.amount.toString(),
      breakdown: override?.breakdown ?? collection.breakdown,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    if (!editForm.amount || Number.parseFloat(editForm.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setEditedCollections((prev) => ({ ...prev, [editingId]: editForm }));
    setEditDialogOpen(false);
    setEditingId(null);
    toast.success("Collection record updated");
  };

  const getCollectionAmount = (collection: (typeof collections)[0]): number => {
    const override = editedCollections[collection.id.toString()];
    return override ? Number.parseFloat(override.amount) : collection.amount;
  };

  const getCollectionBreakdown = (
    collection: (typeof collections)[0],
  ): string => {
    return (
      editedCollections[collection.id.toString()]?.breakdown ??
      collection.breakdown
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || Number.parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      await recordCashCollection.mutateAsync({
        amount: Number.parseFloat(amount),
        breakdown: breakdown || "No breakdown provided",
      });
      toast.success("Cash collection recorded successfully");
      setAmount("");
      setBreakdown("");
    } catch (_error) {
      toast.error("Failed to record cash collection");
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString();
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(
    (s) => Number(s.timestamp) / 1_000_000 >= today.getTime(),
  );
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);
  const todayCollections = collections.filter(
    (c) => Number(c.timestamp) / 1_000_000 >= today.getTime(),
  );
  const todayCash = todayCollections.reduce(
    (sum, c) => sum + getCollectionAmount(c),
    0,
  );
  const discrepancy = todayCash - todayRevenue;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cash Collection</h1>
        <p className="text-muted-foreground mt-1">
          Record daily cash collections and reconcile with sales
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{todayRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Cash Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">₹{todayCash.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Discrepancy</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${
                Math.abs(discrepancy) > 0.1
                  ? "text-destructive"
                  : "text-green-600"
              }`}
            >
              {discrepancy > 0 ? "+" : ""}₹{discrepancy.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Cash Collection</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  data-ocid="cash.amount.input"
                />
              </div>

              <div>
                <Label htmlFor="breakdown">
                  Denomination Breakdown (Optional)
                </Label>
                <Textarea
                  id="breakdown"
                  value={breakdown}
                  onChange={(e) => setBreakdown(e.target.value)}
                  placeholder="e.g., 500x10, 200x5, 100x20"
                  rows={3}
                  data-ocid="cash.breakdown.textarea"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={recordCashCollection.isPending}
                data-ocid="cash.record.submit_button"
              >
                {recordCashCollection.isPending
                  ? "Recording..."
                  : "Record Collection"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reconciliation Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Expected (Sales)
                  </span>
                  <span className="font-semibold">
                    ₹{todayRevenue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    Actual (Cash)
                  </span>
                  <span className="font-semibold">₹{todayCash.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Difference</span>
                    <Badge
                      variant={
                        Math.abs(discrepancy) > 0.1 ? "destructive" : "default"
                      }
                    >
                      {discrepancy > 0 ? "+" : ""}₹{discrepancy.toFixed(2)}
                    </Badge>
                  </div>
                </div>
              </div>

              {Math.abs(discrepancy) > 0.1 && (
                <div
                  className={`p-3 rounded-lg ${
                    discrepancy < 0
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  <p className="text-sm font-medium">
                    {discrepancy < 0
                      ? "⚠️ Cash shortage detected"
                      : "ℹ️ Cash surplus detected"}
                  </p>
                  <p className="text-xs mt-1">
                    {discrepancy < 0
                      ? "Please verify all transactions"
                      : "Please verify all collections"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Collection History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date &amp; Time</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Breakdown</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collections.slice(0, 20).map((collection, index) => (
                <TableRow
                  key={collection.id.toString()}
                  data-ocid={`cash.item.${index + 1}`}
                >
                  <TableCell>{formatTimestamp(collection.timestamp)}</TableCell>
                  <TableCell className="text-right font-semibold">
                    ₹{getCollectionAmount(collection).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {getCollectionBreakdown(collection)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditDialog(collection)}
                        data-ocid={`cash.edit_button.${index + 1}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={deleteCashCollection.isPending}
                            data-ocid={`cash.delete_button.${index + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="cash.delete.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete Collection Record
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this collection
                              record of ₹
                              {getCollectionAmount(collection).toFixed(2)}? This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="cash.delete.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDeleteCollection(collection.id)
                              }
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-ocid="cash.delete.confirm_button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {collections.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No collections recorded yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Edit Collection Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md" data-ocid="cash.edit.dialog">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5" />
              Edit Collection Record
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="editAmount">Amount (₹)</Label>
              <Input
                id="editAmount"
                type="number"
                step="0.01"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, amount: e.target.value }))
                }
                className="mt-1"
                data-ocid="cash.edit.amount_input"
              />
            </div>
            <div>
              <Label htmlFor="editBreakdown">Denomination Breakdown</Label>
              <Textarea
                id="editBreakdown"
                value={editForm.breakdown}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    breakdown: e.target.value,
                  }))
                }
                rows={3}
                className="mt-1"
                data-ocid="cash.edit.breakdown_textarea"
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="min-h-[44px]"
              data-ocid="cash.edit.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="min-h-[44px]"
              data-ocid="cash.edit.save_button"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
