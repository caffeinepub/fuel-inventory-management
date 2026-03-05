import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccess() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-6 h-6" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your payment has been processed successfully. Thank you for your
            purchase!
          </p>
          <Link to="/">
            <Button className="w-full">Return to Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
