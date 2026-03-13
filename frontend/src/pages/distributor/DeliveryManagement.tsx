import React from "react";
import { DeliveryManagement } from "@/features/delivery/DeliveryManagement";

const DistributorDeliveryPage: React.FC = () => {
  return (
    <DeliveryManagement
      config={{
        role: "distributor",
        hasDrivers: true, // This distributor has drivers
        offersDelivery: true, // This distributor offers delivery service
        defaultDeliveryCost: 500, // Default cost if not specified
        customerLabel: "Retailer",
        customerPath: "/retailers",
      }}
    />
  );
};

export default DistributorDeliveryPage;
