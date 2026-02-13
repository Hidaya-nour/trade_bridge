import React from "react";
import { IncomingOrders } from "@/components/shared/IncomingOrders";
import { incomingOrders } from "./data"; // ✅ Import the DATA, not the component
import { Store } from "lucide-react";

const DistributorIncomingOrdersPage: React.FC = () => {
  // ✅ Use incomingOrders (the data), not IncomingOrders (the component)
  const stats = {
    pending: incomingOrders.filter((o) => o.status === "pending").length,
    processing: incomingOrders.filter((o) => o.status === "processing").length,
    approved: incomingOrders.filter((o) => o.status === "approved").length,
    totalRevenue: incomingOrders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0),
  };

  return (
    <IncomingOrders
      config={{
        role: "distributor",
        title: "Incoming Orders",
        description: "Review and process orders from your retail customers",
        customerLabel: "Retailer",
        customerPath: "/retailers",
        icon: Store,
        stats,
      }}
      orders={incomingOrders}
      onApproveOrder={(id) => console.log("Approve", id)}
      onRejectOrder={(id, reason) => console.log("Reject", id, reason)}
      onProcessOrder={(id) => console.log("Process", id)}
      onAssignDriver={(id) => console.log("Assign driver", id)}
    />
  );
};

export default DistributorIncomingOrdersPage;
