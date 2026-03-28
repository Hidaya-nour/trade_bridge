import RoleCard from "./RoleCard";

const WORKSPACES = [
  {
    title: "Retailer",
    badge: "Demand",
    description: "Browse suppliers, compare offers and place purchase orders.",
    to: "/retailer/dashboard",
  },
  {
    title: "Distributor",
    badge: "Orchestration",
    description: "Balance inventory, margins and outbound deliveries across regions.",
    to: "/distributor/dashboard",
  },
  {
    title: "Factory",
    badge: "Supply",
    description: "Align production capacity with real-time order signals.",
    to: "/factory/dashboard",
  },
  {
    title: "Driver",
    badge: "Delivery",
    description: "Update delivery statuses and confirmations with dispatch-ready info.",
    to: "/driver/dashboard",
  },
] as const;

export default function WorkspaceSection() {
  return (
    <section className="border-t border-slate-800/80 bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-10 lg:px-16 space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Choose your workspace</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Each role gets a focused experience tailored to daily decisions.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {WORKSPACES.map((w) => (
            <RoleCard
              key={w.title}
              title={w.title}
              badge={w.badge}
              description={w.description}
              to={w.to}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

