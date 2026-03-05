import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { XCircle } from "lucide-react";

export default function PaymentFailure() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="w-6 h-6" />
            Payment Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment was cancelled or failed to process. Please try again or
            contact support if the issue persists.
          </p>
          <Link to="/">
            <Button className="w-full">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
