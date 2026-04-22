import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function FactoryOrdersRoute() {
  return (
    <FeaturePlaceholderScreen
      role="factory"
      title="Order Management"
      subtitle="This screen is reserved for incoming order review and production flow."
      bullets={[
        "Approve and process incoming distributor orders.",
        "Track production scheduling and fulfillment readiness.",
        "Extend into the full web-aligned order management workflow.",
      ]}
      icon="receipt-outline"
    />
  );
}
