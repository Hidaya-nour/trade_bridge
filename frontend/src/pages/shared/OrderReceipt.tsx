import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Download, Printer, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import orderService from "@/services/order.service";
import type { OrderReceipt } from "@/types/order.types";
import { formatDateTime, formatPrice } from "@/lib/formatters";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const OrderReceiptPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReceipt = async () => {
      if (!id) {
        setError("Order ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const response = await orderService.getOrderReceipt(id);
        setReceipt(response.data.receipt);
      } catch (err: any) {
        setError(err?.response?.data?.message || err?.message || "Failed to load receipt");
      } finally {
        setIsLoading(false);
      }
    };

    void loadReceipt();
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("print") === "1" && receipt) {
      setTimeout(() => window.print(), 100);
    }
  }, [location.search, receipt]);

  const roleBase = useMemo(() => {
    if (location.pathname.startsWith("/factory/")) return "/factory/orders";
    if (location.pathname.includes("/purchase-orders/")) return "/distributor/purchase-orders";
    if (location.pathname.startsWith("/distributor/")) return "/distributor/orders";
    return "/retailer/orders";
  }, [location.pathname]);
  const verificationUrl = useMemo(() => {
    if (!receipt) return "";
    return `${window.location.origin}/verify/receipt/${receipt.receipt_number}`;
  }, [receipt]);

  const qrImageUrl = useMemo(() => {
    if (!verificationUrl) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(
      verificationUrl,
    )}`;
  }, [verificationUrl]);

  const handleDownloadPdf = () => {
    if (!receipt) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Order Receipt", 14, 16);
    doc.setFontSize(11);
    doc.text(`Receipt No: ${receipt.receipt_number}`, 14, 24);
    doc.text(`Issued: ${new Date(receipt.issued_at).toLocaleString()}`, 14, 30);
    doc.text(`Status: ${receipt.receipt_status.toUpperCase()}`, 14, 36);
    doc.text(`Buyer: ${receipt.buyer.business_name || receipt.buyer.name}`, 14, 44);
    doc.text(
      `Supplier: ${receipt.supplier.business_name || receipt.supplier.name}`,
      14,
      50,
    );

    autoTable(doc, {
      startY: 58,
      head: [["Item", "Qty", "Unit Price", "Line Total"]],
      body: receipt.items.map((item) => [
        `${item.product_name} (${item.unit_type})`,
        String(item.quantity),
        formatPrice(item.unit_price),
        formatPrice(item.line_total),
      ]),
      styles: { fontSize: 10 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 80;
    doc.text(`Subtotal: ${formatPrice(receipt.subtotal)}`, 140, finalY + 10);
    doc.text(`Tax: ${formatPrice(receipt.tax)}`, 140, finalY + 16);
    doc.setFontSize(12);
    doc.text(`Total: ${formatPrice(receipt.total)}`, 140, finalY + 24);
    doc.setFontSize(9);
    doc.text(`Verify: ${verificationUrl}`, 14, finalY + 34);

    doc.save(`receipt-${receipt.receipt_number}.pdf`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">Loading receipt...</CardContent>
      </Card>
    );
  }

  if (error || !receipt) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-red-600">{error || "Receipt not found"}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .receipt-print-root,
          .receipt-print-root * {
            visibility: visible !important;
          }
          .receipt-print-root {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            border: 0 !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order Receipt</h1>
          <p className="text-sm text-muted-foreground">
            {receipt.receipt_number} • Issued {formatDateTime(receipt.issued_at)}
          </p>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" asChild>
            <Link to={`${roleBase}/${receipt.order_id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Order
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.print()}
            disabled={receipt.receipt_status !== "final"}
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={receipt.receipt_status !== "final"}
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="receipt-print-root print-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Receipt Details</CardTitle>
            <Badge
              variant="outline"
              className={
                receipt.receipt_status === "final"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }
            >
              {receipt.receipt_status === "final" ? "Final Receipt" : "Draft Receipt"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {receipt.receipt_status !== "final" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              Receipt becomes printable after payment is completed.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Buyer</p>
              <p className="font-medium">{receipt.buyer.business_name || receipt.buyer.name}</p>
              {receipt.buyer.tin_number && (
                <p className="text-xs text-muted-foreground">TIN: {receipt.buyer.tin_number}</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Supplier</p>
              <p className="font-medium">{receipt.supplier.business_name || receipt.supplier.name}</p>
              {receipt.supplier.tin_number && (
                <p className="text-xs text-muted-foreground">TIN: {receipt.supplier.tin_number}</p>
              )}
            </div>
          </div>

          <div className="rounded-md border p-3 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-3 items-center">
            <div className="flex items-center justify-center">
              {qrImageUrl ? (
                <img src={qrImageUrl} alt="Receipt verification QR" className="h-28 w-28" />
              ) : (
                <QrCode className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-1 text-xs">
              <p className="font-medium">Receipt Verification</p>
              <p className="text-muted-foreground">
                Scan QR or open this link to verify authenticity:
              </p>
              <a
                href={verificationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline break-all no-print"
              >
                {verificationUrl}
              </a>
              <p className="hidden print:block break-all">{verificationUrl}</p>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/60">
                <tr>
                  <th className="text-left p-2">Item</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Unit Price</th>
                  <th className="text-right p-2">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr key={`${item.product_id}-${item.product_name}`} className="border-t">
                    <td className="p-2">
                      <p className="font-medium">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">{item.unit_type}</p>
                    </td>
                    <td className="p-2 text-right">{item.quantity}</td>
                    <td className="p-2 text-right">{formatPrice(item.unit_price)}</td>
                    <td className="p-2 text-right">{formatPrice(item.line_total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-xs space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(receipt.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{formatPrice(receipt.shipping)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatPrice(receipt.tax)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total</span>
              <span>{formatPrice(receipt.total)}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Payment: {receipt.payment.method} • Status: {receipt.payment.status}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderReceiptPage;
