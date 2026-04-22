import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function DistributorPurchaseOrdersRoute() {
  return (
    <FeaturePlaceholderScreen
      role="distributor"
      title="Purchase Orders"
      subtitle="Purchasing history and inbound procurement tracking live in the drawer for the distributor role."
      bullets={[
        "Review previously placed purchase orders.",
        "Track procurement status and receiving progress.",
        "Align the mobile route map with the web workspace.",
      ]}
      icon="document-text-outline"
    />
  );
}
