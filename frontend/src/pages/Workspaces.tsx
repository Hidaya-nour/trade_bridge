import { Link } from "react-router-dom";

type RoleCardProps = {
  title: string;
  description: string;
  to: string;
  badge: string;
};

function WorkspacesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 py-10 md:px-10 lg:px-16">
        <header className="space-y-2 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            Choose your workspace
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Dashboards tailored to each role in your network.
          </h1>
          <p className="text-sm text-slate-300 sm:text-base">
            Pick the workspace that matches how you participate in the trade flow. Each one focuses on the data and
            actions that matter to your team.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <RoleCard
            title="Retailer"
            badge="Demand"
            description="Source from verified suppliers, compare offers, and track deliveries to your locations."
            to="/retailer/dashboard"
          />
          <RoleCard
            title="Distributor"
            badge="Orchestration"
            description="Manage multi‑channel inventory, margins, and downstream orders in one view."
            to="/distributor/dashboard"
          />
          <RoleCard
            title="Factory"
            badge="Supply"
            description="Align production plans with real‑time demand signals and confirmed orders."
            to="/factory/dashboard"
          />
          <RoleCard
            title="Driver"
            badge="Delivery"
            description="Handle route updates, deliveries, and status confirmations with dispatch-ready info."
            to="/driver/dashboard"
          />
        </section>
      </div>
    </main>
  );
}

function RoleCard({ title, description, to, badge }: RoleCardProps) {
  return (
    <Link
      to={to}
      className="group flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 hover:border-emerald-400/70 hover:bg-slate-900 transition-colors"
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-medium text-slate-50">{title}</h2>
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-[10px] text-slate-300">
            {badge}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
      </div>
      <span className="mt-3 text-[11px] text-emerald-300 opacity-0 group-hover:opacity-100 transition-opacity">
        Open dashboard →
      </span>
    </Link>
  );
}

export default WorkspacesPage;

