import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function DistributorProductsRoute() {
  return (
    <FeaturePlaceholderScreen
      role="distributor"
      title="Manage Products"
      subtitle="Distributor product management now has a dedicated shared-navigation destination."
      bullets={[
        "Maintain distributor-owned product listings.",
        "Extend into stock, pricing, and product detail actions.",
        "Stay aligned with the web manage products flow.",
      ]}
      icon="cube-outline"
    />
  );
}
