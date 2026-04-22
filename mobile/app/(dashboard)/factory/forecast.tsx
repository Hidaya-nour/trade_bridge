import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function FactoryForecastRoute() {
  return (
    <FeaturePlaceholderScreen
      role="factory"
      title="Forecast"
      subtitle="Forecasting remains in the drawer because it is important, but less frequent than core production tasks."
      bullets={[
        "Expose demand forecasting for factory products.",
        "Align inventory planning with the web forecast workflow.",
        "Keep advanced analytics out of the primary tab bar.",
      ]}
      icon="analytics-outline"
    />
  );
}
