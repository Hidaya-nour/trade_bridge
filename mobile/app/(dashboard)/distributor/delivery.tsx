import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function DistributorDeliveryRoute() {
  return (
    <FeaturePlaceholderScreen
      role="distributor"
      title="Delivery Management"
      subtitle="Delivery management remains accessible from the drawer as a secondary operational tool."
      bullets={[
        "Coordinate shipments and driver assignment.",
        "Track delivery exceptions and status changes.",
        "Align with the web delivery management page.",
      ]}
      icon="car-outline"
    />
  );
}
