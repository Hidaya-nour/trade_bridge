import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import orderService from "@/services/order.service";
import type { OrderReceiptVerification } from "@/types/order.types";
import { CheckCircle2, XCircle } from "lucide-react";
import { formatDateTime, formatPrice } from "@/lib/formatters";

const VerifyReceiptPage: React.FC = () => {
  const { receiptNumber } = useParams<{ receiptNumber: string }>();
  const [data, setData] = useState<OrderReceiptVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!receiptNumber) {
        setError("Receipt number is required.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await orderService.verifyReceipt(receiptNumber);
        setData(response.data.verification);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Verification failed");
      } finally {
        setIsLoading(false);
      }
    };
    void run();
  }, [receiptNumber]);

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Receipt Verification</h1>
        <p className="text-sm text-muted-foreground">
          Verify receipt authenticity using receipt number.
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Verifying receipt...</CardContent>
        </Card>
      )}

      {!isLoading && error && (
        <Card className="border-red-200">
          <CardContent className="p-6 text-sm text-red-600 flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            {error}
          </CardContent>
        </Card>
      )}

      {!isLoading && data && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Valid Receipt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Receipt Number</span>
              <span className="font-medium">{data.receipt_number}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline">{data.receipt_status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-medium">{data.order_id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span>{formatDateTime(data.order_date)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Buyer</span>
              <span>{data.buyer_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Supplier</span>
              <span>{data.supplier_name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-semibold">{formatPrice(data.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Status</span>
              <span>{data.payment_status}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Button variant="outline" asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
};

export default VerifyReceiptPage;

