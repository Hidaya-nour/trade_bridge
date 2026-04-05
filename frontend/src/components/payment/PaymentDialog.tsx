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
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Landmark,
  Receipt,
  ChevronRight,
  Upload,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import { supplierMethodTypeToPaymentMethod } from "@/lib/payment-method-utils";
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
    supplierAllowedMethods?: PaymentMethod[];
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
    supplierPaymentMethods?: {
      id: string;
      method_type: string;
      provider_name: string;
      account_holder_name: string;
      account_identifier: string;
      account_display: string;
      is_primary?: boolean;
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
  mobileProvider?: string;

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
    description: "Pay by cheque and upload proof or scanned cheque",
    requiresDocument: true,
    enabled: true,
  },
  {
    id: "mobile_banking",
    name: "Mobile Banking",
    icon: Smartphone,
    description: "Pay via mobile money and upload screenshot of transfer",
    requiresDocument: true,
    enabled: true,
  },
  {
    id: "chapa",
    name: "Chapa",
    icon: CreditCard,
    description: "Pay securely with in-app Chapa payment",
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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("method");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Filter available payment methods based on config and supplier settings
  const availableMethods = PAYMENT_METHODS.filter((method) => {
    const allowedByConfig =
      !config.allowedMethods || config.allowedMethods.includes(method.id);
    const hasSupplierMethods =
      Array.isArray(config.supplierAllowedMethods) &&
      config.supplierAllowedMethods.length > 0;
    const allowedBySupplier =
      !config.supplierAllowedMethods ||
      (hasSupplierMethods && config.supplierAllowedMethods.includes(method.id));

    return method.enabled && allowedByConfig && allowedBySupplier;
  });

  React.useEffect(() => {
    if (availableMethods.length === 0) {
      setSelectedMethod(null);
      return;
    }

    if (
      !selectedMethod ||
      !availableMethods.some((method) => method.id === selectedMethod)
    ) {
      setSelectedMethod(availableMethods[0].id);
    }
  }, [availableMethods, selectedMethod]);

  const getSupplierMethodsForPaymentMethod = (method: PaymentMethod) => {
    if (!config.supplierPaymentMethods) return [];
    return config.supplierPaymentMethods.filter(
      (supplierMethod) =>
        supplierMethodTypeToPaymentMethod(supplierMethod.method_type) ===
        method,
    );
  };

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
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }
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
      if (uploadedFiles.length === 0) {
        toast.error("Please upload payment receipt/screenshot");
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
            {availableMethods.length === 0 ? (
              <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 text-sm text-yellow-800">
                Supplier has no supported payment methods for your role. Please
                ask the supplier to add a payment method first.
              </div>
            ) : (
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
            )}

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => setActiveTab("details")}
                disabled={!selectedMethod || availableMethods.length === 0}
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
                  <Input
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

                {getSupplierMethodsForPaymentMethod("cheque").length > 0 && (
                  <div className="space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
                    {getSupplierMethodsForPaymentMethod("cheque").map(
                      (method) => (
                        <div key={method.id} className="space-y-1">
                          <p className="font-semibold">
                            {method.provider_name}
                          </p>
                          <p>Account: {method.account_identifier}</p>
                          <p>Holder: {method.account_holder_name}</p>
                          {method.account_display && (
                            <p className="text-muted-foreground">
                              {method.account_display}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}

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
                        Use the supplier’s mobile banking details below and
                        upload a screenshot of your payment.
                      </p>
                    </div>
                  </div>
                </div>

                {getSupplierMethodsForPaymentMethod("mobile_banking").length >
                0 ? (
                  <div className="space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
                    {getSupplierMethodsForPaymentMethod("mobile_banking").map(
                      (method) => (
                        <div key={method.id} className="space-y-1">
                          <p className="font-semibold">
                            {method.provider_name}
                          </p>
                          <p>Account: {method.account_identifier}</p>
                          <p>Holder: {method.account_holder_name}</p>
                          {method.account_display && (
                            <p className="text-muted-foreground">
                              {method.account_display}
                            </p>
                          )}
                        </div>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                    No supplier mobile banking details are available. Please
                    contact the supplier for payment instructions.
                  </div>
                )}

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
                        to complete this order. We will use your registered
                        profile email and name for the checkout.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 rounded-lg border bg-muted/50 p-4 text-sm">
                  <p className="font-semibold">Chapa payment details</p>
                  <p>
                    No additional payment details are required here. After
                    submitting, you will be redirected to Chapa to finish the
                    payment securely.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    If your profile email is invalid, the payment may fail.
                    Please update your account email before continuing.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="chapa-notes">Notes</Label>
                  <Textarea
                    id="chapa-notes"
                    placeholder="Any additional instructions or reference"
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
