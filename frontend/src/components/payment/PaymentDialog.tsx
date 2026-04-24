import React, { useEffect, useMemo, useState } from "react";
import {
  CreditCard,
  Smartphone,
  Upload,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/formatters";
import toast from "react-hot-toast";
import type {
  PaymentDetails,
  PaymentDialogConfig,
  PaymentDialogProps,
  PaymentMethod,
  PaymentMethodConfig,
} from "@/types/payment.types";

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    id: "app_payment",
    name: "App Payment",
    icon: CreditCard,
    description: "Pay securely in the app with the online checkout flow",
    enabled: true,
  },
  {
    id: "mobile_banking",
    name: "Mobile Banking",
    icon: Smartphone,
    description: "Send payment manually and upload proof after transfer",
    requiresDocument: true,
    enabled: true,
  },
];

const DEFAULT_MOBILE_PROVIDERS = [
  { id: "m-pesa", name: "M-Pesa" },
  { id: "airtel-money", name: "Airtel Money" },
  { id: "tele-birr", name: "Telebirr" },
  { id: "hello-cash", name: "Hello Cash" },
  { id: "amole", name: "Amole" },
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const isSupplierMobileMethodType = (methodType: string) =>
  methodType === "mobile_money" || methodType === "mobile_banking";

const isSupplierAppMethodType = (methodType: string) =>
  methodType === "credit_card" || methodType === "chapa";

const getSupplierMethodLabel = (methodType: string) => {
  switch (methodType) {
    case "credit_card":
    case "chapa":
      return "App Payment";
    case "mobile_money":
    case "mobile_banking":
      return "Mobile Banking";
    default:
      return methodType;
  }
};

const getMethodSpecificSupplierDetails = (
  config: PaymentDialogConfig,
  selectedMethod: PaymentMethod,
) => {
  if (!config.supplierPaymentMethods?.length) return [];

  return config.supplierPaymentMethods.filter((method) =>
    selectedMethod === "app_payment"
      ? isSupplierAppMethodType(method.method_type)
      : isSupplierMobileMethodType(method.method_type),
  );
};

export const PaymentDialog: React.FC<PaymentDialogProps> = ({
  open,
  onOpenChange,
  orderNumber,
  amount,
  onPaymentSubmit,
  isProcessing = false,
  config = {},
}) => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>("app_payment");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const availableMethods = useMemo(() => {
    const baseMethods = PAYMENT_METHODS.filter(
      (method) =>
        method.enabled &&
        (!config.allowedMethods || config.allowedMethods.includes(method.id)) &&
        (!config.supplierAllowedMethods ||
          config.supplierAllowedMethods.includes(method.id)),
    );

    return baseMethods.length > 0 ? baseMethods : PAYMENT_METHODS;
  }, [config.allowedMethods, config.supplierAllowedMethods]);

  const supplierMethodDetails = useMemo(
    () => getMethodSpecificSupplierDetails(config, selectedMethod),
    [config, selectedMethod],
  );

  const supplierHasMobileProviders = useMemo(() => {
    return (
      config.supplierPaymentMethods?.some((method) =>
        isSupplierMobileMethodType(method.method_type),
      ) ?? false
    );
  }, [config.supplierPaymentMethods]);

  const mobileProviderOptions = useMemo(() => {
    if (selectedMethod !== "mobile_banking") return [];

    if (supplierHasMobileProviders) {
      const sorted = [...supplierMethodDetails].sort(
        (a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)),
      );
      const seen = new Set<string>();
      return sorted
        .map((method) => method.provider_name?.trim())
        .filter((providerName): providerName is string => Boolean(providerName))
        .filter((providerName) => {
          const key = providerName.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .map((providerName) => ({ value: providerName, label: providerName }));
    }

    return DEFAULT_MOBILE_PROVIDERS.map((provider) => ({
      value: provider.name,
      label: provider.name,
    }));
  }, [selectedMethod, supplierHasMobileProviders, supplierMethodDetails]);

  useEffect(() => {
    if (!availableMethods.some((method) => method.id === selectedMethod)) {
      setSelectedMethod(availableMethods[0]?.id || "app_payment");
    }
  }, [availableMethods, selectedMethod]);

  useEffect(() => {
    if (selectedMethod !== "mobile_banking") return;
    const current = (paymentDetails.mobileProvider || "").trim();
    if (!current) return;
    if (!mobileProviderOptions.some((opt) => opt.value === current)) {
      setPaymentDetails((prev) => ({ ...prev, mobileProvider: "" }));
    }
  }, [mobileProviderOptions, paymentDetails.mobileProvider, selectedMethod]);

  useEffect(() => {
    if (!open) {
      setPaymentDetails({});
      setUploadedFiles([]);
      setUploadError(null);
      setSelectedMethod(availableMethods[0]?.id || "app_payment");
    }
  }, [open, availableMethods]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    const file = files[0];
    const maxSizeMb = config.maxDocumentSize || 5;
    if (file.size > maxSizeMb * 1024 * 1024) {
      setUploadError(`File size exceeds ${maxSizeMb}MB limit`);
      return;
    }

    const allowedTypes = config.allowedDocumentTypes || ALLOWED_FILE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Please upload PDF, JPEG, or PNG");
      return;
    }

    setUploadedFiles([file]);
    setUploadError(null);
  };

  const handleSubmit = async () => {
    if (selectedMethod === "mobile_banking") {
      if (supplierHasMobileProviders && mobileProviderOptions.length === 0) {
        toast.error("Supplier has not configured any mobile providers");
        return;
      }
      if (!paymentDetails.mobileProvider?.trim()) {
        toast.error("Please select the mobile provider");
        return;
      }
      if (uploadedFiles.length === 0) {
        toast.error("Please upload mobile banking payment proof");
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
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden sm:max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Complete Payment{orderNumber ? ` for Order #${orderNumber}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto pr-1">
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">Amount due</p>
                <p className="text-2xl font-semibold">{formatPrice(amount)}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Select Payment Method</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {availableMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={cn(
                      "rounded-lg border p-4 text-left transition-colors",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <span className="font-medium">{method.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {supplierMethodDetails.length > 0 && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm font-medium">Supplier payment details</p>
              </div>
              <div className="space-y-3">
                {supplierMethodDetails.map((method) => (
                  <div key={method.id} className="rounded-md bg-muted/40 p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {method.provider_name}
                      </span>
                      {method.is_primary && <Badge>Primary</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {getSupplierMethodLabel(method.method_type)}
                    </p>
                    <p className="text-sm">
                      {method.account_display || method.account_holder_name}
                    </p>
                    <p className="text-sm">
                      {`Name: ${method.account_holder_name}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedMethod === "app_payment" && (
            <div className="space-y-3 rounded-lg border p-4">
              <p className="font-medium">App Payment</p>
              <p className="text-sm text-muted-foreground">
                You’ll continue to the in-app online checkout to finish payment
                securely.
              </p>
              <div className="space-y-2">
                <Label htmlFor="app-payment-notes">Notes</Label>
                <Textarea
                  id="app-payment-notes"
                  placeholder="Optional payment note"
                  value={paymentDetails.notes || ""}
                  onChange={(event) =>
                    setPaymentDetails((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
          )}

          {selectedMethod === "mobile_banking" && (
            <div className="space-y-4 rounded-lg border p-4">
              <p className="font-medium">Mobile Banking</p>
              <p className="text-sm text-muted-foreground">
                Transfer the payment using the supplier details above, then
                upload your payment proof.
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mobile-provider">Mobile Provider</Label>
                  <select
                    id="mobile-provider"
                    value={paymentDetails.mobileProvider || ""}
                    onChange={(event) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        mobileProvider: event.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">
                      {mobileProviderOptions.length === 0
                        ? "No provider available"
                        : "Select provider"}
                    </option>
                    {mobileProviderOptions.map((provider) => (
                      <option key={provider.value} value={provider.value}>
                        {provider.label}
                      </option>
                    ))}
                  </select>
                  {supplierHasMobileProviders &&
                    mobileProviderOptions.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        The supplier hasn’t added any mobile providers yet.
                      </p>
                    )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-phone">Sender Phone Number</Label>
                  <Input
                    id="mobile-phone"
                    placeholder="+251..."
                    value={paymentDetails.phoneNumber || ""}
                    onChange={(event) =>
                      setPaymentDetails((prev) => ({
                        ...prev,
                        phoneNumber: event.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile-banking-notes">Notes</Label>
                <Textarea
                  id="mobile-banking-notes"
                  placeholder="Optional payment note"
                  value={paymentDetails.notes || ""}
                  onChange={(event) =>
                    setPaymentDetails((prev) => ({
                      ...prev,
                      notes: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment-proof">Upload Payment Proof</Label>
                <label
                  htmlFor="payment-proof"
                  className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed p-6 text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Upload className="h-5 w-5" />
                    <span>
                      {uploadedFiles[0]?.name || "Click to upload proof"}
                    </span>
                  </div>
                </label>
                <Input
                  id="payment-proof"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {uploadError && (
                  <p className="text-sm text-destructive">{uploadError}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={() => void handleSubmit()} disabled={isProcessing}>
            {isProcessing
              ? "Processing..."
              : selectedMethod === "app_payment"
                ? "Continue to App Payment"
                : "Submit Payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
