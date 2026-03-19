import FeatureCard from "./FeatureCard";

const FEATURES = [
  {
    title: "Real-time order tracking",
    description:
      "See status updates, approvals, and exceptions as they happen—no waiting, no guessing.",
  },
  {
    title: "Secure role-based access",
    description:
      "Each role gets the tools and permissions they need, with a clear audit trail.",
  },
  {
    title: "Documents & approvals",
    description:
      "Centralize documents and make approvals consistent across the network.",
  },
  {
    title: "Delivery management",
    description:
      "Coordinate shipments with delivery plans, status updates, and dispatch-ready workflows.",
  },
  {
    title: "Analytics that drive action",
    description:
      "Understand trends, lead times, and performance to make better decisions faster.",
  },
  {
    title: "Exception handling",
    description:
      "Resolve disputes and issues quickly with dedicated workflows and visibility.",
  },
] as const;

export default function FeaturesSection() {
  return (
    <section className="border-t border-slate-800/80 bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-10 lg:px-16 space-y-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Features built for real operations</h2>
            <p className="text-xs sm:text-sm text-slate-400">
              From order creation to delivery confirmation, TradeBridge keeps your workflows clean and
              consistent.
            </p>
          </div>
          <div className="text-[11px] text-slate-400">Designed for factories, distributors, retailers and drivers</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} />
          ))}
        </div>
      </div>
    </section>
  );
}

