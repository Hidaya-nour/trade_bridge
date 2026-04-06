import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NewPaymentMethod = {
  method_type: string;
  provider_name: string;
  account_holder_name: string;
  account_identifier: string;
  account_display: string;
  is_primary: boolean;
};

type SupplierPaymentMethod = {
  id: string;
  method_type: string;
  provider_name: string;
  account_holder_name: string;
  account_display: string;
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
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash_on_delivery">
                          Cash on Delivery
                        </SelectItem>
                        <SelectItem value="mobile_money">
                          Mobile Banking
                        </SelectItem>
                        <SelectItem value="bank_transfer">
                          Bank Transfer / Cheque
                        </SelectItem>
                        <SelectItem value="credit_card">
                          Chapa Payment
                        </SelectItem>
                        <SelectItem value="other">
                          Credit / Pay Later
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Provider Name</Label>
                    <Input
                      value={newPaymentMethod.provider_name}
                      onChange={(e) =>
                        setNewPaymentMethod((prev) => ({
                          ...prev,
                          provider_name: e.target.value,
                        }))
                      }
                      placeholder="e.g. CBE, Telebirr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Holder</Label>
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
                          {method.provider_name} ({method.method_type})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {method.account_display}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.is_primary ? (
                          <Badge>Primary</Badge>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              void handleSetPrimaryPaymentMethod(method.id)
                            }
                          >
                            Set Primary
                          </Button>
                        )}
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
