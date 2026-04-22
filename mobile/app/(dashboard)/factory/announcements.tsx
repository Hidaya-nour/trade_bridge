import FeaturePlaceholderScreen from "@/features/shared/FeaturePlaceholderScreen";

export default function FactoryAnnouncementsRoute() {
  return (
    <FeaturePlaceholderScreen
      role="factory"
      title="Announcements"
      subtitle="Broadcast workflows are placed in the drawer as a secondary but important capability."
      bullets={[
        "Send platform announcements from the factory workspace.",
        "Mirror the web broadcast announcements behavior.",
        "Keep high-frequency production tasks in the bottom tabs instead.",
      ]}
      icon="megaphone-outline"
    />
  );
}
