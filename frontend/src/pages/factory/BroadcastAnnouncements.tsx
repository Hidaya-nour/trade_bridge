import React from "react";
import { BroadcastPage } from "@/components";
import { announcements, distributorSegments } from "./data";

const FactoryBroadcastPage: React.FC = () => {
  const stats = {
    active: announcements.filter((a) => a.status === "active").length,
    scheduled: announcements.filter((a) => a.status === "scheduled").length,
    draft: announcements.filter((a) => a.status === "draft").length,
    totalRedemptions: announcements.reduce(
      (sum, a) => sum + a.redeemedCount,
      0,
    ),
  };

  return (
    <BroadcastPage
      role="factory"
      items={announcements}
      segments={distributorSegments}
      stats={stats}
      onCreateItem={(item) => console.log("Create", item)}
      onDeleteItem={(id) => console.log("Delete", id)}
      onDuplicateItem={(item) => console.log("Duplicate", item)}
      onUpdateStatus={(id, status) => console.log("Update", id, status)}
    />
  );
};

export default FactoryBroadcastPage;
