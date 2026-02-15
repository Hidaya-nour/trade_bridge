import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CreditCard,
  DollarSign,
  Download,
  Filter,
  Calendar,
  ChevronRight,
  FileText,
  Printer,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet,
  Building,
  Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { StatusBadge, StatsCard, EmptyState } from "@/components/shared";
import { formatPrice, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type PaymentRole = "retailer" | "distributor";

interface Payment {
  id: string;
  orderId: string;
  date: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue" | "refunded";
  method: "Credit" | "Mobile Banking" | "Cash" | "Bank Transfer" | "Cheque";
  reference?: string;
  invoiceUrl?: string;
}

interface CreditSummary {
  totalSpent: number;
  outstanding: number;
  creditLimit: number;
  available: number;
  paymentTerms: string;
  nextPaymentDate: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const retailerCredit: CreditSummary = {
  totalSpent: 385000,
  outstanding: 45200,
  creditLimit: 100000,
  available: 54800,
  paymentTerms: "30 days",
  nextPaymentDate: "2026-03-15",
};

const distributorCredit: CreditSummary = {
  totalSpent: 12450000,
  outstanding: 2350000,
  creditLimit: 5000000,
  available: 2650000,
  paymentTerms: "30 days",
  nextPaymentDate: "2026-03-20",
};

const payments: Payment[] = [
  {
    id: "PAY-001",
    orderId: "ORD-2026-0892",
    date: "2026-02-15",
    dueDate: "2026-03-15",
    amount: 15262.5,
    status: "pending",
    method: "Credit",
    invoiceUrl: "#",
  },
  {
    id: "PAY-002",
    orderId: "ORD-2026-0885",
    date: "2026-02-10",
    dueDate: "2026-03-10",
    amount: 13460,
    status: "pending",
    method: "Credit",
    invoiceUrl: "#",
  },
  {
    id: "PAY-003",
    orderId: "ORD-2026-0878",
    date: "2026-02-05",
    dueDate: "2026-02-05",
    amount: 37300,
    status: "paid",
    method: "Mobile Banking",
    reference: "TRX-78901",
    invoiceUrl: "#",
  },
  {
    id: "PAY-004",
    orderId: "ORD-2026-0862",
    date: "2026-02-01",
    dueDate: "2026-02-01",
    amount: 8028,
    status: "paid",
    method: "Cash",
    invoiceUrl: "#",
  },
  {
    id: "PAY-005",
    orderId: "ORD-2026-0851",
    date: "2026-01-28",
    dueDate: "2026-01-28",
    amount: 99250,
    status: "paid",
    method: "Credit",
    invoiceUrl: "#",
  },
  {
    id: "PAY-006",
    orderId: "ORD-2026-0834",
    date: "2026-01-25",
    dueDate: "2026-02-25",
    amount: 23400,
    status: "overdue",
    method: "Credit",
    invoiceUrl: "#",
  },
];

const paymentMethods = [
  {
    id: "credit",
    name: "Credit (30 days)",
    icon: CreditCard,
    description: "Pay within 30 days",
  },
  {
    id: "mobile",
    name: "Mobile Banking",
    icon: Smartphone,
    description: "Telebirr, M-Pesa",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    icon: Building,
    description: "Direct bank transfer",
  },
  {
    id: "cash",
    name: "Cash on Delivery",
    icon: Wallet,
    description: "Pay when delivered",
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

interface PaymentsPageProps {
  role: PaymentRole;
}

const PaymentsPage: React.FC<PaymentsPageProps> = ({ role }) => {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const credit = role === "retailer" ? retailerCredit : distributorCredit;

  const filteredPayments = payments.filter(
    (p) => filterStatus === "all" || p.status === filterStatus,
  );

  const outstandingPayments = payments.filter(
    (p) => p.status === "pending" || p.status === "overdue",
  );
  const totalOutstanding = outstandingPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground mt-1">
            {role === "retailer"
              ? "Manage your payments and credit"
              : "Track incoming payments and credit"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Statement
          </Button>
        </div>
      </div>

      {/* Credit Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  {role === "retailer" ? "Total Spent" : "Total Received"}
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatPrice(credit.totalSpent)}
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold mt-1 text-amber-600">
                  {formatPrice(credit.outstanding)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {outstandingPayments.length} pending payments
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Credit Limit</p>
                <p className="text-2xl font-bold mt-1">
                  {formatPrice(credit.creditLimit)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {formatPrice(credit.available)}
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Credit Utilization
                </p>
                <p className="text-2xl font-bold mt-1">
                  {Math.round((credit.outstanding / credit.creditLimit) * 100)}%
                </p>
                <Progress
                  value={(credit.outstanding / credit.creditLimit) * 100}
                  className="h-1.5 mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Health Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/20 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Credit Health</h3>
                <p className="text-sm text-muted-foreground">
                  {role === "retailer"
                    ? `Your credit is in good standing. Next payment due: ${formatDate(credit.nextPaymentDate)}`
                    : `All distributors have good standing. Total credit extended: ${formatPrice(credit.creditLimit)}`}
                </p>
              </div>
            </div>
            {role === "retailer" && totalOutstanding > 0 && (
              <Button size="lg" onClick={() => setShowPaymentDialog(true)}>
                <Wallet className="h-4 w-4 mr-2" />
                Make Payment
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    <Link
                      to={`/${role}/orders/${payment.orderId}`}
                      className="hover:text-primary"
                    >
                      {payment.orderId}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>{formatDate(payment.dueDate)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatPrice(payment.amount)}
                  </TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(payment.status)}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={payment.invoiceUrl || "#"}>
                        <FileText className="h-4 w-4" />
                      </Link>
                    </Button>
                    {payment.status === "pending" && role === "retailer" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentDialog(true);
                        }}
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Make Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Make a Payment</DialogTitle>
            <DialogDescription>
              {selectedPayment
                ? `Pay for order ${selectedPayment.orderId}`
                : "Choose an amount to pay towards your outstanding balance"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {!selectedPayment && (
              <div className="space-y-2">
                <Label>Select Amount</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" className="h-16 flex-col">
                    <span className="text-xs text-muted-foreground">Full</span>
                    <span className="font-semibold">
                      {formatPrice(totalOutstanding)}
                    </span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <span className="text-xs text-muted-foreground">Half</span>
                    <span className="font-semibold">
                      {formatPrice(totalOutstanding / 2)}
                    </span>
                  </Button>
                  <Button variant="outline" className="h-16 flex-col">
                    <span className="text-xs text-muted-foreground">
                      Custom
                    </span>
                    <Input
                      type="number"
                      className="mt-1 h-8"
                      placeholder="Amount"
                    />
                  </Button>
                </div>
              </div>
            )}

            {selectedPayment && (
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Order</span>
                  <span className="text-sm font-medium">
                    {selectedPayment.orderId}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Amount Due
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Due Date
                  </span>
                  <span className="text-sm font-medium">
                    {formatDate(selectedPayment.dueDate)}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1">
                      <div className="flex items-center gap-2">
                        <method.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {method.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">
                        {method.description}
                      </p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
            >
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentsPage;
