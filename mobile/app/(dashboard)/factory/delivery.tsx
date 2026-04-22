import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function FactoryDeliveryRoute() {
  return (
    <FeaturePlaceholderScreen
      role="factory"
      title="Delivery Management"
      subtitle="Factory delivery operations are accessible from the drawer in the shared navigation model."
      bullets={[
        "Review outbound deliveries tied to factory orders.",
        "Coordinate delivery status with shared notifications and messages.",
        "Prepare for the full delivery management experience from web.",
      ]}
      icon="car-outline"
    />
  );
}
