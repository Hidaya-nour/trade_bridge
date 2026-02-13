import { Badge } from "@/components/ui/badge";
import { Store, Package, Factory, Shield } from "lucide-react";

interface WelcomeHeaderProps {
  user: {
    name: string;
    business: string;
    id: string;
    verified?: boolean;
    role: "retailer" | "distributor" | "factory";
  };
}

const roleIcons = {
  retailer: Store,
  distributor: Package,
  factory: Factory,
};

const roleTitles = {
  retailer: "retail business",
  distributor: "distribution business",
  factory: "production facility",
};

export const WelcomeHeader = ({ user }: WelcomeHeaderProps) => {
  const RoleIcon = roleIcons[user.role];
  const title = roleTitles[user.role];
  const firstName = user.name.split(" ")[0];

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {firstName}! 👋
          </h1>
          {user.verified && (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <Shield className="h-3 w-3 mr-1" />
              Verified {user.role}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your {title} today.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="px-3 py-1">
          <RoleIcon className="h-3.5 w-3.5 mr-1" />
          {user.business}
        </Badge>
        <Badge variant="secondary" className="px-3 py-1">
          ID: {user.id}
        </Badge>
      </div>
    </div>
  );
};
