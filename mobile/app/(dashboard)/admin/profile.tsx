import { SettingsScreen } from "@/features/settings/SettingsScreen";

export default function AdminProfileRoute() {
  return <SettingsScreen initialTab="profile" role="admin" />;
}
