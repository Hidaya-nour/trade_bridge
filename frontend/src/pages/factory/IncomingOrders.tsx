import React, { useEffect, useMemo } from "react";
import { IncomingOrders } from "@/features/order/IncomingOrders";
import { Factory } from "lucide-react";

import { useOrderStore } from "@/stores/order.store";
import factoryAgentService from "@/services/factory-agent.service";
import { getPaymentMethodLabel } from "@/lib/payment-method-utils";
import type {
  Order,
  IncomingOrdersConfig,
  IncomingOrder,
} from "@/types/order.types";
import { WithAsync } from "@/components/shared/WithAsync";
import toast from "react-hot-toast";

const mapPaymentStatus = (status?: string) => {
  switch (status) {
    case "completed":
      return "paid";
    case "processing":
      return "approved";
    case "refunded":
      return "refunded";
    case "failed":
      return "failed";
    case "pending":
    default:
      return "pending";
  }
};

type FactoryAgentContract = {
  id?: string;
  agent_id?: string;
  end_date?: string | null;
  termination_reason?: string | null;
  agent?: {
    id?: string;
    full_name?: string;
    business_name?: string;
  };
};

const normalizeId = (value: unknown) => String(value ?? "").trim().toLowerCase();

const isContractActive = (contract: FactoryAgentContract) => {
  const contractAgentId = normalizeId(contract?.agent_id || contract?.agent?.id);
  if (!contractAgentId) return false;
  if (contract.termination_reason) return false;
  if (!contract.end_date) return true;
  const endTs = new Date(contract.end_date).getTime();
  if (Number.isNaN(endTs)) return true;
  return endTs >= Date.now();
};

const buildBuyerStats = (orders: Order[], buyerId: string) => {
  const buyerOrders = orders.filter((order) => order.buyer_id === buyerId);
  const completed = buyerOrders.filter((order) =>
    ["delivered", "closed"].includes(order.order_status),
  );
  return {
    customerTotalOrders: buyerOrders.length,
    customerCompletedOrders: completed.length,
    customerCancelledOrders: buyerOrders.filter((order) => order.order_status === "cancelled").length,
    customerTotalSpend: completed.reduce((sum, order) => sum + Number(order.total_price || 0), 0),
  };
};

const mapOrderToIncoming = (
  order: Order,
  allOrders: Order[],
  agentContractsByAgentId: Map<string, FactoryAgentContract>,
): IncomingOrder => {
  const items =
    order.items?.map((item) => ({
      name: item.product?.name || "Item",
      sku: item.product?.sku || item.product_id,
      quantity: item.quantity,
      unit: item.product?.unit_type || "unit",
      price: item.unit_price,
      total: item.unit_price * item.quantity,
    })) || [];

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = order.total_price || subtotal;
  const tax = Math.max(0, total - subtotal);

  const customerName =
    order.buyer?.business_name || order.buyer?.full_name || "Customer";
  const buyerId = normalizeId(order.buyer_id || order.buyer?.id);
  const agentContract = buyerId
    ? agentContractsByAgentId.get(buyerId)
    : undefined;
  const factoryAgentName =
    agentContract?.agent?.business_name ||
    agentContract?.agent?.full_name ||
    undefined;

  return {
    id: order.id,
    deliveryId: order.delivery?.id,
    customerId: Number(order.buyer_id) || 0,
    customerName,
    customerContact: order.buyer?.full_name || customerName,
    customerPhone: "N/A",
    customerLocation:
      order.delivery?.dropoff_location ||
      order.delivery?.pickup_location ||
      "Not provided",
    orderDate: order.created_at,
    requestedDelivery: order.delivery?.completed_at || order.created_at,
    items,
    subtotal,
    shipping: 0,
    tax,
    total,
    status: order.order_status,
    paymentStatus: mapPaymentStatus(order.payment?.payment_status),
    paymentMethod: getPaymentMethodLabel(order.payment?.payment_method),
    paymentAmount: Number((order.payment as any)?.total_amount) || undefined,
    paymentPaid: Number((order.payment as any)?.amount_paid) || undefined,
    paymentProofUrl: (order.payment as any)?.proofDocument?.file_secure_url,
    paymentProofName:
      (order.payment as any)?.proofDocument?.original_file_name ||
      "Payment Proof",
    notes: undefined,
    trackingNumber: undefined,
    driver:
      (order.delivery as any)?.driver?.full_name ||
      (order.delivery as any)?.driver?.driverUser?.full_name,
    driverPhone:
      (order.delivery as any)?.driver?.phone ||
      (order.delivery as any)?.driver?.driverUser?.phone,
    driverId:
      (order.delivery as any)?.driver?.id ||
      (order.delivery as any)?.driver?.driver_id,
    deliveredDate: order.delivery?.completed_at,
    cancelledDate: undefined,
    cancellationReason: undefined,
    customerRating: null,
    previousOrders: buildBuyerStats(allOrders, order.buyer_id).customerCompletedOrders,
    ...buildBuyerStats(allOrders, order.buyer_id),
    isFromFactoryAgent: Boolean(agentContract),
    factoryAgentName,
  };
};

const FactoryIncomingOrdersPage: React.FC = () => {
  const {
    orders: storeOrders,
    fetchOrdersAsSupplier,
    updateOrderStatus,
    cancelOrder,
    isLoading,
    error,
  } = useOrderStore();
  const [agentContracts, setAgentContracts] = React.useState<FactoryAgentContract[]>([]);

  useEffect(() => {
    fetchOrdersAsSupplier();
  }, [fetchOrdersAsSupplier]);

  useEffect(() => {
    const loadAgentContracts = async () => {
      try {
        const response = await factoryAgentService.getFactoryAgents();
        const data = Array.isArray(response?.data) ? response.data : [];
        setAgentContracts(data as FactoryAgentContract[]);
      } catch {
        setAgentContracts([]);
      }
    };

    loadAgentContracts();
  }, []);

  const activeAgentContractsByAgentId = useMemo(() => {
    const map = new Map<string, FactoryAgentContract>();
    agentContracts.filter(isContractActive).forEach((contract) => {
      const contractAgentId = normalizeId(contract.agent_id || contract.agent?.id);
      if (contractAgentId) {
        map.set(contractAgentId, contract);
      }
    });
    return map;
  }, [agentContracts]);

  const orders = useMemo(
    () =>
      (storeOrders as Order[]).map((order) =>
        mapOrderToIncoming(
          order,
          storeOrders as Order[],
          activeAgentContractsByAgentId,
        ),
      ),
    [storeOrders, activeAgentContractsByAgentId],
  );

  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending").length,
      processing: orders.filter((o) => o.status === "processing").length,
      approved: orders.filter((o) => o.status === "approved").length,
      totalRevenue: orders
        .filter((o) => o.status !== "cancelled")
        .reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  const config: IncomingOrdersConfig = {
    role: "factory",
    title: "Distributor Orders",
    description: "Review and process orders from your distributor partners",
    customerLabel: "Distributor",
    customerPath: "/distributors",
    icon: Factory,
    stats,
  };

  const showLoader = isLoading && orders.length === 0;
  const resolvedError =
    !isLoading && error && orders.length === 0 ? error : null;

  return (
    <WithAsync
      isLoading={showLoader}
      error={resolvedError}
      loadingComponent={
        <div className="p-6 text-sm text-muted-foreground">
          Loading incoming orders...
        </div>
      }
      errorComponent={
        <div className="p-6 text-sm text-muted-foreground">{resolvedError}</div>
      }
    >
      <IncomingOrders
        config={config}
        orders={orders}
        onApproveOrder={async (id, fee) => {
          const ok = await useOrderStore.getState().approveOrder(id, fee ?? 0);
          if (ok) {
            await fetchOrdersAsSupplier();
            toast.success("Order approved.");
          }
        }}
        onRejectOrder={(id, reason) => cancelOrder(id, reason)}
        onProcessOrder={(id) => updateOrderStatus(id, { status: "processing" })}
        onAssignDriver={async (_orderId, _deliveryId, _driverId) => {
          await fetchOrdersAsSupplier();
        }}
      />
    </WithAsync>
  );
};

export default FactoryIncomingOrdersPage;
