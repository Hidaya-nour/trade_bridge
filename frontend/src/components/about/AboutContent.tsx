type AboutContentProps = {
  title: string;
  description: string;
};

function MissionCard({ title, description }: AboutContentProps) {
  return (
    <article className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
      <h2 className="text-base font-semibold text-slate-50 sm:text-lg">{title}</h2>
      <p className="text-sm leading-relaxed text-slate-300">{description}</p>
    </article>
  );
}

export default function AboutContent() {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <MissionCard
        title="Why we built TradeBridge"
        description="Trade operations often run across fragmented tools. We built TradeBridge to give every team a single source of truth for orders, documents, and delivery decisions."
      />
      <MissionCard
        title="Who we build for"
        description="From factory planners and distributors to retail buyers and admins, the platform is designed for teams that need clarity, ownership, and consistent execution."
      />
    </section>
  );
}

