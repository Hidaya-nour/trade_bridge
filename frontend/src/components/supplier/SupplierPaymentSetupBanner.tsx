import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";
import supplierPaymentMethodService from "@/services/supplier-payment-method.service";

export const SupplierPaymentSetupBanner: React.FC = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [needsSetup, setNeedsSetup] = React.useState(false);

  const refresh = React.useCallback(async () => {
    const supplierId = user?.id;
    if (!supplierId) return;
    if (user.role !== "distributor" && user.role !== "factory") {
      setNeedsSetup(false);
      return;
    }

    try {
      const response =
        await supplierPaymentMethodService.getActiveBySupplierId(supplierId);
      const active = (response as any)?.data ?? response;
      setNeedsSetup(!Array.isArray(active) || active.length === 0);
    } catch {
      // If we can't verify, don't block the UI with a banner.
      setNeedsSetup(false);
    }
  }, [user?.id, user?.role]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  React.useEffect(() => {
    const handler = () => void refresh();
    window.addEventListener("focus", handler);
    window.addEventListener("supplier-payment-methods-updated", handler as any);
    return () => {
      window.removeEventListener("focus", handler);
      window.removeEventListener(
        "supplier-payment-methods-updated",
        handler as any,
      );
    };
  }, [refresh]);

  if (!user?.id) return null;
  if (user.role !== "distributor" && user.role !== "factory") return null;
  if (!needsSetup) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-900 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="font-semibold">Payment method required</div>
        <div className="mt-1 text-sm text-yellow-800">
          Buyers cannot place orders until you add at least one active payment
          method in Settings.
        </div>
      </div>
      <Button
        type="button"
        className="bg-yellow-700 hover:bg-yellow-800"
        onClick={() => navigate("/settings?tab=payment")}
      >
        Add Payment Method
      </Button>
    </div>
  );
};

