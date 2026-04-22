import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function FactoryAgentsRoute() {
  return (
    <FeaturePlaceholderScreen
      role="factory"
      title="Agents"
      subtitle="Factory agent management is now routed through the shared shell."
      bullets={[
        "View and manage assigned factory agents.",
        "Prepare for agent performance and assignment tools.",
        "Keep navigation aligned with the existing web agents page.",
      ]}
      icon="people-outline"
    />
  );
}
