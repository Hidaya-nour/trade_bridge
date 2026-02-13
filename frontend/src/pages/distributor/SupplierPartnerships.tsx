import React from "react";
import { Partnerships } from "@/components/shared/Partnerships";
import { Factory } from "lucide-react";
import { supplierPartners } from "./data";

const DistributorSupplierPartnershipsPage: React.FC = () => {
  return (
    <Partnerships
      config={{
        role: "distributor",
        title: "Supplier Partnerships",
        description:
          "Manage your factory and manufacturer relationships, contracts, and performance",
        partnerType: "Supplier",
        partnerPath: "/factories",
        icon: Factory,
        showAgents: false,
        showCredit: true,
        showContracts: true,
      }}
      partners={supplierPartners}
      onAddPartner={() => console.log("Add supplier")}
      onEditPartner={(id) => console.log("Edit", id)}
      onViewPartner={(id) => console.log("View", id)}
      onContactPartner={(id) => console.log("Contact", id)}
    />
  );
};

export default DistributorSupplierPartnershipsPage;
