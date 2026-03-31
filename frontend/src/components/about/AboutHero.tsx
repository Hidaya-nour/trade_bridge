import { Link } from "react-router-dom";

export default function AboutHero() {
  return (
    <header className="space-y-4">
      <p className="inline-flex w-fit items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/90">
        About TradeBridge
      </p>
      <h1 className="max-w-3xl text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
        A professional operating layer for modern trade collaboration.
      </h1>
      <p className="max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
        TradeBridge connects factories, distributors, and retailers in one real-time workspace so every
        stakeholder can align around accurate data, faster coordination, and reliable execution.
      </p>
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          to="/workspaces"
          className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-emerald-500/30 transition-colors hover:bg-emerald-400"
        >
          Explore workspaces
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center rounded-lg border border-slate-700/70 px-4 py-2 text-sm text-slate-200 transition-colors hover:border-emerald-400/70 hover:text-emerald-200"
        >
          Contact our team
        </Link>
      </div>
    </header>
  );
}

