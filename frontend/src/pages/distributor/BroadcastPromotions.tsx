import React from "react";
import { BroadcastPage } from "@/components";
import { promotions, retailerSegments } from "./data";

const DistributorBroadcastPage: React.FC = () => {
  const stats = {
    active: promotions.filter((p) => p.status === "active").length,
    scheduled: promotions.filter((p) => p.status === "scheduled").length,
    draft: promotions.filter((p) => p.status === "draft").length,
    totalRedemptions: promotions.reduce((sum, p) => sum + p.redeemedCount, 0),
  };

  return (
    <BroadcastPage
      role="distributor"
      items={promotions}
      segments={retailerSegments}
      stats={stats}
      onCreateItem={(item) => console.log("Create", item)}
      onDeleteItem={(id) => console.log("Delete", id)}
      onDuplicateItem={(item) => console.log("Duplicate", item)}
      onUpdateStatus={(id, status) => console.log("Update", id, status)}
    />
  );
};

export default DistributorBroadcastPage;
