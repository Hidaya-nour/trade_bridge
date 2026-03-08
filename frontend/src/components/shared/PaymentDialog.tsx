import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CreditCard,
  Wallet,
  Building,
  Smartphone,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// ============================================================================
// TYPES
// ============================================================================

export type PaymentMethod =
  | "cash"
  | "credit"
  | "cheque"
  | "mobile_banking"
  | "chapa";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  icon: React.ElementType;
  description: string;
  requiresDocument?: boolean;
  requiresApproval?: boolean;
  enabled: boolean;
}

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  orderNumber?: string;
  amount: number;
  onPaymentSubmit: (
    method: PaymentMethod,
    details: PaymentDetails,
    documents?: File[],
  ) => Promise<boolean>;
  isProcessing?: boolean;
  config?: {
    allowedMethods?: PaymentMethod[];
    creditTerms?: {
      enabled: boolean;
      maxCreditAmount?: number;
      dueDays?: number;
      interestRate?: number;
    };
    bankAccounts?: {
      bankName: string;
      accountNumber: string;
      accountName: string;
      branch?: string;
    }[];
    chapaEnabled?: boolean;
    requireApprovalFor?: PaymentMethod[];
    maxDocumentSize?: number; // in MB
    allowedDocumentTypes?: string[];
  };
}

export interface PaymentDetails {
  // Common fields
  notes?: string;

  // Credit fields
  creditCustomerName?: string;
  creditDueDate?: string;
  creditTerms?: string;

  // Cheque fields
  chequeNumber?: string;
  bankName?: string;
  branch?: string;
  chequeDate?: string;
  drawerName?: string;

  // Mobile banking fields
  transactionId?: string;
  mobileProvider?: string;
  phoneNumber?: string;
  transferDate?: string;

  // Chapa fields
  chapaEmail?: string;
  chapaFirstName?: string;
  chapaLastName?: string;
  chapaTxRef?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "cash",
    name: "Cash on Delivery",
    icon: Wallet,
    description: "Pay with cash when you receive your order",
    enabled: true,
  },
  {
    id: "credit",
    name: "Credit Service",
    icon: Landmark,
    description: "Pay later with credit terms",
    requiresApproval: true,
    enabled: true,
  },
  {
    id: "cheque",
    name: "Cheque",
    icon: Receipt,
    description: "Pay by cheque with document upload",
    requiresDocument: true,
    enabled: true,
  },
  {
    id: "mobile_banking",
    name: "Mobile Banking",
    icon: Smartphone,
    description: "Pay via mobile money transfer",
    requiresDocument: true,
    enabled: true,
  },
  {
    id: "chapa",
    name: "Chapa",
    icon: CreditCard,
    description: "Pay securely with Chapa payment gateway",
    enabled: true,
  },
];

const MOBILE_PROVIDERS = [
  { id: "m-pesa", name: "M-Pesa" },
  { id: "airtel-money", name: "Airtel Money" },
  { id: "tele-birr", name: "Tele Birr" },
  { id: "hello-cash", name: "Hello Cash" },
  { id: "amole", name: "Amole" },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

// ============================================================================
// COMPONENT
// ============================================================================

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  orderId,
  orderNumber,
  amount,
  onPaymentSubmit,
  isProcessing = false,
  config = {},
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("method");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Filter available payment methods based on config
  const availableMethods = PAYMENT_METHODS.filter(
    (method) =>
      method.enabled &&
      (!config.allowedMethods || config.allowedMethods.includes(method.id)),
  );

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Check file size
    const maxSize = config.maxDocumentSize || 5;
    if (file.size > maxSize * 1024 * 1024) {
      setUploadError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Check file type
    const allowedTypes = config.allowedDocumentTypes || ALLOWED_FILE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload PDF, JPEG, or PNG");
      return;
    }

    setUploadedFiles([file]);
    setUploadError(null);
  };

  // Handle payment submission
  const handleSubmit = async () => {
    // Validate based on payment method
    if (selectedMethod === "credit" && config.creditTerms?.enabled) {
      if (!paymentDetails.creditCustomerName) {
        toast.error("Please enter customer name for credit");
        return;
      }
      if (amount > (config.creditTerms.maxCreditAmount || Infinity)) {
        toast.error(
          `Credit amount exceeds maximum allowed (${formatPrice(config.creditTerms.maxCreditAmount || 0)})`,
        );
        return;
      }
    }

    if (selectedMethod === "cheque") {
      if (!paymentDetails.chequeNumber) {
        toast.error("Please enter cheque number");
        return;
      }
      if (!paymentDetails.bankName) {
        toast.error("Please enter bank name");
        return;
      }
      if (uploadedFiles.length === 0) {
        toast.error("Please upload cheque image/document");
        return;
      }
    }

    if (selectedMethod === "mobile_banking") {
      if (!paymentDetails.transactionId) {
        toast.error("Please enter transaction ID");
        return;
      }
      if (!paymentDetails.mobileProvider) {
        toast.error("Please select mobile provider");
        return;
      }
      if (uploadedFiles.length === 0) {
        toast.error("Please upload payment receipt/screenshot");
        return;
      }
    }

    if (selectedMethod === "chapa") {
      if (!paymentDetails.chapaEmail) {
        toast.error("Please enter email address for Chapa payment");
        return;
      }
      if (!paymentDetails.chapaFirstName || !paymentDetails.chapaLastName) {
        toast.error("Please enter your full name");
        return;
      }
    }

    const success = await onPaymentSubmit(
      selectedMethod,
      paymentDetails,
      uploadedFiles,
    );
    if (success) {
      onOpenChange(false);
      // Reset form
      setSelectedMethod("cash");
      setPaymentDetails({});
      setUploadedFiles([]);
      setActiveTab("method");
    }
  };

  // Render payment method icon
  const renderMethodIcaon = (method: PaymentMethodConfig) => {
    const Icon = method.icon;
    return (
      <div className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-accent">
        <Icon className="h-6 w-6 mb-2" />
        <span className="text-xs font-medium text-center">{method.name}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            {orderNumber && <span>Order #{orderNumber} - </span>}
            Total Amount:{" "}
            <span className="font-bold text-primary">
              {formatPrice(amount)}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="method">Payment Method</TabsTrigger>
            <TabsTrigger value="details" disabled={!selectedMethod}>
              Payment Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value="method" className="space-y-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                const requiresApproval =
                  config.requireApprovalFor?.includes(method.id) ||
                  method.requiresApproval;

                return (
                  <div
                    key={method.id}
                    className={cn(
                      "relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-primary/50 hover:bg-accent",
                    )}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <Icon
                      className={cn(
                        "h-8 w-8 mb-2",
                        isSelected ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="text-sm font-medium text-center">
                      {method.name}
                    </span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {method.description}
                    </span>
                    {requiresApproval && (
                      <Badge
                        variant="outline"
                        className="mt-2 bg-yellow-50 text-yellow-700 border-yellow-200"
                      >
                        Requires Approval
                      </Badge>
                    )}
                    {method.requiresDocument && (
                      <Badge
                        variant="outline"
                        className="mt-1 bg-blue-50 text-blue-700 border-blue-200"
                      >
                        Upload Required
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setActiveTab("details")}
                disabled={!selectedMethod}
              >
                Continue to Details
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 py-4">
            {/* Cash on Delivery */}
            {selectedMethod === "cash" && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800 mb-1">
                        Cash on Delivery Selected
                      </h4>
                      <p className="text-sm text-green-700">
                        You will pay {formatPrice(amount)} in cash when you
                        receive your order. Please ensure you have the exact
                        amount ready at delivery.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cash-notes">
                    Additional Notes (Optional)
                  </Label>
                  <Textarea
                    id="cash-notes"
                    placeholder="Any special instructions for delivery?"
                    value={paymentDetails.notes || ""}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Credit Service */}
            {selectedMethod === "credit" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-1">
                        Credit Service Terms
                      </h4>
                      <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
                        <li>
                          Credit limit:{" "}
                          {formatPrice(
                            config.creditTerms?.maxCreditAmount || 50000,
                          )}
                        </li>
                        <li>
                          Payment due within {config.creditTerms?.dueDays || 30}{" "}
                          days
                        </li>
                        {config.creditTerms?.interestRate && (
                          <li>
                            Interest rate: {config.creditTerms.interestRate}%
                            after due date
                          </li>
                        )}
                        <li>
                          Credit requires approval before order processing
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="credit-name">Customer Name *</Label>
                    <Input
                      id="credit-name"
                      placeholder="Full name"
                      value={paymentDetails.creditCustomerName || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          creditCustomerName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit-due">Preferred Due Date</Label>
                    <Input
                      id="credit-due"
                      type="date"
                      value={paymentDetails.creditDueDate || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          creditDueDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credit-terms">Credit Terms / Agreement</Label>
                  <Textarea
                    id="credit-terms"
                    placeholder="Any special credit terms or agreements"
                    value={paymentDetails.creditTerms || ""}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        creditTerms: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="credit-agree"
                    className="rounded border-gray-300"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                  />
                  <Label htmlFor="credit-agree" className="text-sm">
                    I agree to the credit terms and conditions
                  </Label>
                </div>
              </div>
            )}

            {/* Cheque */}
            {selectedMethod === "cheque" && (
              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Receipt className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-purple-800 mb-1">
                        Cheque Payment
                      </h4>
                      <p className="text-sm text-purple-700">
                        Please upload a clear image of your cheque. The order
                        will be processed after cheque verification.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cheque-number">Cheque Number *</Label>
                    <Input
                      id="cheque-number"
                      placeholder="Enter cheque number"
                      value={paymentDetails.chequeNumber || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          chequeNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cheque-bank">Bank Name *</Label>
                    <Input
                      id="cheque-bank"
                      placeholder="Bank name"
                      value={paymentDetails.bankName || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          bankName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cheque-branch">Branch</Label>
                    <Input
                      id="cheque-branch"
                      placeholder="Branch name"
                      value={paymentDetails.branch || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          branch: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cheque-date">Cheque Date</Label>
                    <Input
                      id="cheque-date"
                      type="date"
                      value={paymentDetails.chequeDate || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          chequeDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drawer-name">
                    Drawer Name (Account Holder)
                  </Label>
                  <Input
                    id="drawer-name"
                    placeholder="Name on cheque"
                    value={paymentDetails.drawerName || ""}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        drawerName: e.target.value,
                      })
                    }
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload Cheque Image *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="cheque-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="cheque-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">
                        {uploadedFiles[0]?.name ||
                          "Click to upload cheque image"}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        PDF, JPEG, PNG up to {config.maxDocumentSize || 5}MB
                      </span>
                    </label>
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cheque-notes">Additional Notes</Label>
                  <Textarea
                    id="cheque-notes"
                    placeholder="Any additional information"
                    value={paymentDetails.notes || ""}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Mobile Banking */}
            {selectedMethod === "mobile_banking" && (
              <div className="space-y-4">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Smartphone className="h-5 w-5 text-indigo-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-indigo-800 mb-1">
                        Mobile Banking Payment
                      </h4>
                      <p className="text-sm text-indigo-700">
                        Please upload your payment receipt/screenshot after
                        completing the transfer.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bank Account Details */}
                {config.bankAccounts && config.bankAccounts.length > 0 && (
                  <div className="space-y-2">
                    <Label>Bank Account Details</Label>
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      {config.bankAccounts.map((account, index, accounts) => (
                        <div key={index} className="text-sm">
                          <p className="font-medium">{account.bankName}</p>
                          <p className="text-muted-foreground">
                            Account: {account.accountNumber}
                          </p>
                          <p className="text-muted-foreground">
                            Name: {account.accountName}
                          </p>
                          {account.branch && (
                            <p className="text-muted-foreground">
                              Branch: {account.branch}
                            </p>
                          )}
                          {index < accounts.length - 1 && (
                            <Separator className="my-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="transaction-id">Transaction ID *</Label>
                    <Input
                      id="transaction-id"
                      placeholder="Enter transaction ID"
                      value={paymentDetails.transactionId || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          transactionId: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile-provider">Mobile Provider *</Label>
                    <Select
                      value={paymentDetails.mobileProvider || ""}
                      onValueChange={(value) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          mobileProvider: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        {MOBILE_PROVIDERS.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone-number">Phone Number</Label>
                    <Input
                      id="phone-number"
                      placeholder="+251 91 234 5678"
                      value={paymentDetails.phoneNumber || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transfer-date">Transfer Date</Label>
                    <Input
                      id="transfer-date"
                      type="date"
                      value={paymentDetails.transferDate || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          transferDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <Label>Upload Payment Receipt/Screenshot *</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                    <input
                      type="file"
                      id="receipt-upload"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm font-medium">
                        {uploadedFiles[0]?.name || "Click to upload receipt"}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1">
                        PDF, JPEG, PNG up to {config.maxDocumentSize || 5}MB
                      </span>
                    </label>
                  </div>
                  {uploadError && (
                    <p className="text-xs text-red-500 mt-1">{uploadError}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-notes">Additional Notes</Label>
                  <Textarea
                    id="mobile-notes"
                    placeholder="Any additional information"
                    value={paymentDetails.notes || ""}
                    onChange={(e) =>
                      setPaymentDetails({
                        ...paymentDetails,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Chapa (Placeholder) */}
            {selectedMethod === "chapa" && (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-emerald-800 mb-1">
                        Chapa Secure Payment
                      </h4>
                      <p className="text-sm text-emerald-700">
                        You will be redirected to Chapa's secure payment gateway
                        to complete your payment.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapa-email">Email Address *</Label>
                    <Input
                      id="chapa-email"
                      type="email"
                      placeholder="your@email.com"
                      value={paymentDetails.chapaEmail || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          chapaEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chapa-phone">Phone Number</Label>
                    <Input
                      id="chapa-phone"
                      placeholder="+251 91 234 5678"
                      value={paymentDetails.phoneNumber || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          phoneNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapa-firstname">First Name *</Label>
                    <Input
                      id="chapa-firstname"
                      placeholder="First name"
                      value={paymentDetails.chapaFirstName || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          chapaFirstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="chapa-lastname">Last Name *</Label>
                    <Input
                      id="chapa-lastname"
                      placeholder="Last name"
                      value={paymentDetails.chapaLastName || ""}
                      onChange={(e) =>
                        setPaymentDetails({
                          ...paymentDetails,
                          chapaLastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> You will be redirected to Chapa's
                    secure payment page after clicking "Proceed to Payment".
                    Your payment information is encrypted and secure.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setActiveTab("method")}>
                Back to Methods
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  isProcessing ||
                  (selectedMethod === "credit" && !agreedToTerms) ||
                  (selectedMethod === "cheque" && uploadedFiles.length === 0) ||
                  (selectedMethod === "mobile_banking" &&
                    uploadedFiles.length === 0)
                }
                className="min-w-[150px]"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {selectedMethod === "chapa"
                      ? "Proceed to Chapa"
                      : "Submit Payment"}
                    <CreditCard className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
