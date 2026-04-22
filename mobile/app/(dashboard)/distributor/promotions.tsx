import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function DistributorPromotionsRoute() {
  return (
    <FeaturePlaceholderScreen
      role="distributor"
      title="Promotions"
      subtitle="Broadcast promotions are included in the drawer to match the web distributor workspace."
      bullets={[
        "Create and manage promotional broadcasts.",
        "Prepare for supplier and retailer targeting controls.",
        "Keep promotional tools outside the core tab bar.",
      ]}
      icon="megaphone-outline"
    />
  );
}
