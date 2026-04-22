import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function DistributorMarketplaceRoute() {
  return (
    <FeaturePlaceholderScreen
      role="distributor"
      title="Purchase Products"
      subtitle="Distributor purchasing is promoted to a primary tab because it is core to the role."
      bullets={[
        "Browse upstream suppliers and products.",
        "Prepare for marketplace and purchase cart flows from web.",
        "Keep buying operations one tap away in the bottom bar.",
      ]}
      icon="storefront-outline"
    />
  );
}
