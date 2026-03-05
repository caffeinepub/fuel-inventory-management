import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { useGetSalesAndExpenses } from "../hooks/useQueries";

export default function ProfitLossDashboard() {
  const { data, isLoading } = useGetSalesAndExpenses();
  const [sales = [], expenses = []] = data || [];

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  if (isLoading) {
    return <div>Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profit & Loss Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Financial overview and performance metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sales.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Expenses
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalExpenses.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.length} entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Net Profit/Loss
            </CardTitle>
            {netProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-destructive"}`}
            >
              ₹{netProfit.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {netProfit >= 0 ? "Profit" : "Loss"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${profitMargin >= 0 ? "text-green-600" : "text-destructive"}`}
            >
              {profitMargin.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Of total revenue
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Petrol Sales</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹
                    {sales
                      .filter((s) => s.fuelType === "petrol")
                      .reduce((sum, s) => sum + s.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {sales.filter((s) => s.fuelType === "petrol").length}{" "}
                  transactions
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Diesel Sales</span>
                  <span className="text-lg font-bold text-blue-600">
                    ₹
                    {sales
                      .filter((s) => s.fuelType === "diesel")
                      .reduce((sum, s) => sum + s.total, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {sales.filter((s) => s.fuelType === "diesel").length}{" "}
                  transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {["maintenance", "electricity", "salaries", "supplies"].map(
                (cat) => {
                  const categoryExpenses = expenses.filter(
                    (e) => e.category === cat,
                  );
                  const total = categoryExpenses.reduce(
                    (sum, e) => sum + e.amount,
                    0,
                  );
                  const percentage =
                    totalExpenses > 0 ? (total / totalExpenses) * 100 : 0;

                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium capitalize">{cat}</span>
                        <span className="text-muted-foreground">
                          ₹{total.toFixed(2)} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-destructive transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <span className="font-medium">Gross Revenue</span>
              <span className="text-lg font-bold">
                ₹{totalRevenue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 border rounded-lg">
              <span className="font-medium">Total Operating Expenses</span>
              <span className="text-lg font-bold text-destructive">
                -₹{totalExpenses.toFixed(2)}
              </span>
            </div>
            <div
              className={`flex justify-between items-center p-4 rounded-lg ${netProfit >= 0 ? "bg-green-50 dark:bg-green-950" : "bg-red-50 dark:bg-red-950"}`}
            >
              <span className="font-bold">
                Net {netProfit >= 0 ? "Profit" : "Loss"}
              </span>
              <span
                className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-destructive"}`}
              >
                ₹{netProfit.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
