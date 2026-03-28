function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-8 px-4 py-10 md:px-10 lg:px-16">
        <header className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300/80">
            About TradeBridge
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            A shared operating system for modern trade networks.
          </h1>
          <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
            TradeBridge connects factories, distributors, and retailers in a single, real‑time workspace
            so every stakeholder can see the same truth about orders, inventory, and deliveries.
          </p>
        </header>

        <section className="grid gap-4 text-sm text-slate-200 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h2 className="text-base font-semibold text-slate-50">Why we built it</h2>
            <p className="text-sm text-slate-300">
              Trade teams are often spread across email threads, spreadsheets, and messaging apps. We wanted a
              single, structured space where each role sees exactly what they need to move work forward.
            </p>
          </div>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <h2 className="text-base font-semibold text-slate-50">Who it&apos;s for</h2>
            <p className="text-sm text-slate-300">
              From factory planners and distributors to retail buyers and platform admins, TradeBridge is designed for
              teams who care about on‑time deliveries, clear responsibilities, and fewer surprises.
            </p>
          </div>
        </section>

        <section className="grid gap-4 text-xs text-slate-300 sm:grid-cols-3">
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <p className="font-medium text-slate-50">Visibility</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Unified timelines for orders, documents and delivery updates across roles.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <p className="font-medium text-slate-50">Control</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Role‑based permissions for admins, finance, operations and external partners.
            </p>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
            <p className="font-medium text-slate-50">Insight</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Dashboards tuned to the metrics each role needs to decide what happens next.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AboutPage;

