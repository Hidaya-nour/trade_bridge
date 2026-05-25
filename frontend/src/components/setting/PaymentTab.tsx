import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import React from "react";

type NewPaymentMethod = {
  method_type: string;
  provider_name: string;
  account_holder_name: string;
  account_identifier: string;
  account_display: string;
  credit_due_days: string;
  credit_limit: string;
  is_primary: boolean;
};

type SupplierPaymentMethod = {
  id: string;
  method_type: string;
  provider_name: string;
  account_holder_name: string;
  account_display: string;
  credit_due_days?: number | null;
  credit_limit?: number | null;
  is_primary: boolean;
};

type PaymentTabProps = {
  canManageSupplierPaymentMethods: boolean;
  newPaymentMethod: NewPaymentMethod;
  setNewPaymentMethod: React.Dispatch<React.SetStateAction<NewPaymentMethod>>;
  supplierPaymentMethods: SupplierPaymentMethod[];
  isPaymentLoading: boolean;
  paymentError: string | null;
  paymentMessage: string | null;
  handleCreatePaymentMethod: () => Promise<void>;
  handleSetPrimaryPaymentMethod: (id: string) => Promise<void>;
  handleDeletePaymentMethod: (id: string) => Promise<void>;
};

const PaymentTab: React.FC<PaymentTabProps> = ({
  canManageSupplierPaymentMethods,
  newPaymentMethod,
  setNewPaymentMethod,
  supplierPaymentMethods,
  isPaymentLoading,
  paymentError,
  paymentMessage,
  handleCreatePaymentMethod,
  handleSetPrimaryPaymentMethod,
  handleDeletePaymentMethod,
}) => {
  const appPaymentProviders = [
    "Telebirr",
    "M-Pesa",
    "Amole",
    "Awash Bank",
    "Coopay Ebirr",
    "CBE Birr",
    "HelloCash",
  ];
  const mobileBankingProviders = [
    "Commercial Bank of Ethiopia",
    "Bank of Abyssinia",
    "Awash Bank",
    "Dashen Bank",
    "Wegagen Bank",
    "Hibret Bank",
    "Nib International Bank",
    "Zemen Bank",
    "Cooperative Bank of Oromia",
    "Oromia Bank",
    "Berhan Bank",
    "Bunna Bank",
    "Abay Bank",
    "Enat Bank",
    "ZamZam Bank",
  ];
  const isCreditMethod = newPaymentMethod.method_type === "credit";
  const providerOptions =
    newPaymentMethod.method_type === "chapa"
      ? appPaymentProviders
      : mobileBankingProviders;

  return (
    <TabsContent value="payment" className="mt-0">
      <Card>
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
          <CardDescription>
            Manage supplier payment methods (factory/distributor only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canManageSupplierPaymentMethods ? (
            <p className="text-sm text-muted-foreground">
              Payment methods are available only for factory and distributor
              accounts.
            </p>
          ) : (
            <>
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-sm font-medium">Add Payment Method</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Method Type</Label>
                    <Select
                      value={newPaymentMethod.method_type}
                      onValueChange={(value) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          method_type: value,
                          provider_name:
                            value === "credit" ? "Supplier Credit" : "",
                          account_identifier:
                            value === "credit" ? "credit" : "",
                          account_display: "",
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mobile_money">
                          Mobile Banking
                        </SelectItem>
                        <SelectItem value="chapa">App Payment</SelectItem>
                        <SelectItem value="credit">Buy on Credit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Provider Name</Label>
                    {isCreditMethod ? (
                      <Input value="Supplier Credit" disabled />
                    ) : (
                      <Select
                        value={newPaymentMethod.provider_name}
                        onValueChange={(value) =>
                          setNewPaymentMethod((prev) => ({
                            ...prev,
                            provider_name: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {providerOptions.map((provider) => (
                            <SelectItem key={provider} value={provider}>
                              {provider}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>{isCreditMethod ? "Credit Policy Name" : "Account Holder"}</Label>
                    <Input
                      value={newPaymentMethod.account_holder_name}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          account_holder_name: e.target.value,
                        }))
                      }
                    />
                  </div>
                  {!isCreditMethod && (
                  <div className="space-y-2">
                    <Label>Account Identifier</Label>
                    <Input
                      value={newPaymentMethod.account_identifier}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          account_identifier: e.target.value,
                        }))
                      }
                      placeholder="Account number / phone"
                    />
                  </div>
                  )}
                  {isCreditMethod && (
                    <>
                      <div className="space-y-2">
                        <Label>Due Days</Label>
                        <Input
                          type="number"
                          min="1"
                          value={newPaymentMethod.credit_due_days || ""}
                          onChange={(e) =>
                            setNewPaymentMethod((prev) => ({
                              ...prev,
                              provider_name: "Supplier Credit",
                              account_identifier: "credit",
                              credit_due_days: e.target.value,
                            }))
                          }
                          placeholder="e.g. 30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Max Credit Limit (ETB)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={newPaymentMethod.credit_limit || ""}
                          onChange={(e) =>
                            setNewPaymentMethod((prev) => ({
                              ...prev,
                              provider_name: "Supplier Credit",
                              account_identifier: "credit",
                              credit_limit: e.target.value,
                            }))
                          }
                          placeholder="e.g. 50000"
                        />
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newPaymentMethod.is_primary}
                      onCheckedChange={(checked) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          is_primary: checked,
                        }))
                      }
                    />
                    <span className="text-sm">Set as primary</span>
                  </div>
                  <Button
                    onClick={() => void handleCreatePaymentMethod()}
                    disabled={isPaymentLoading}
                  >
                    Add Method
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">Saved Payment Methods</h3>
                {supplierPaymentMethods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No payment methods added yet.
                  </p>
                ) : (
                  supplierPaymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {method.provider_name} (
                          {method.method_type === "credit_card" ||
                          method.method_type === "chapa"
                            ? "App Payment"
                            : method.method_type === "credit"
                              ? "Buy on Credit"
                            : "Mobile Banking"}
                          )
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {method.account_display}
                        </p>
                        {method.method_type === "credit" && (
                          <p className="text-xs text-muted-foreground">
                            Due in {method.credit_due_days} days · Limit ETB{" "}
                            {Number(method.credit_limit || 0).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() =>
                            void handleDeletePaymentMethod(method.id)
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {(paymentMessage || paymentError) && (
            <p className="text-sm text-muted-foreground">
              {paymentMessage || paymentError}
            </p>
          )}
        </CardContent>
      </Card>
    </TabsContent>
  );
};

export default PaymentTab;
