import React from "react";
import { DeliveryManagement } from "@/features/delivery/DeliveryManagement";

const FactoryDeliveryPage: React.FC = () => {
  return (
    <DeliveryManagement
      config={{
        role: "factory",
        hasDrivers: true, // This factory has drivers
        offersDelivery: true, // This factory offers delivery service
        defaultDeliveryCost: 1000, // Default cost if not specified
        customerLabel: "Distributor",
        customerPath: "/distributors",
      }}
    />
  );
};

export default FactoryDeliveryPage;
