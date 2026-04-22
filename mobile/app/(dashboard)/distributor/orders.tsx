import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function DistributorOrdersRoute() {
  return (
    <FeaturePlaceholderScreen
      role="distributor"
      title="Incoming Orders"
      subtitle="This primary tab matches the distributor incoming orders workflow on web."
      bullets={[
        "Review new retailer orders quickly.",
        "Approve, reject, and prepare fulfillment tasks.",
        "Connect order updates with shared notifications and messages.",
      ]}
      icon="receipt-outline"
    />
  );
}
