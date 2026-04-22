import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function FactoryProductsRoute() {
  return (
    <FeaturePlaceholderScreen
      role="factory"
      title="Manage Products"
      subtitle="Aligned with the web factory product workspace."
      bullets={[
        "Create and update factory catalog items.",
        "Review product performance and stock levels.",
        "Prepare for product details and inventory actions.",
      ]}
      icon="cube-outline"
    />
  );
}
