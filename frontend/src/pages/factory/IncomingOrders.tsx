import React from "react";
import {
  IncomingOrders,
  type IncomingOrdersConfig,
} from "@/components/shared/IncomingOrders";
import { factoryOrders } from "./data"; // Your factory-specific mock data
import { Factory } from "lucide-react";

const FactoryIncomingOrdersPage: React.FC = () => {
  const stats = {
    pending: factoryOrders.filter((o) => o.status === "pending").length,
    processing: factoryOrders.filter((o) => o.status === "processing").length,
    approved: factoryOrders.filter((o) => o.status === "approved").length,
    totalRevenue: factoryOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0),
  };

  const config: IncomingOrdersConfig = {
    role: "factory",
    title: "Distributor Orders",
    description: "Review and process orders from your distributor partners",
    customerLabel: "Distributor",
    customerPath: "/distributors",
    icon: Factory,
    stats,
  };

  return (
    <IncomingOrders
      config={config}
      orders={factoryOrders}
      onApproveOrder={(id) => console.log("Approve", id)}
      onRejectOrder={(id, reason) => console.log("Reject", id, reason)}
      onProcessOrder={(id) => console.log("Process", id)}
      // No onAssignDriver for factory
    />
  );
};

export default FactoryIncomingOrdersPage;
