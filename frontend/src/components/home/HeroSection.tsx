import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section className="flex flex-1 flex-col justify-center px-4 py-10 md:px-10 lg:px-16">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center max-w-6xl mx-auto">
        <div className="space-y-6">
          <p className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            End-to-end trade workflow
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
            A single control center for{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              factories, distributors &amp; retailers
            </span>
            .
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl">
            Orchestrate sourcing, orders, logistics, and payments from one modern dashboard. TradeBridge
            helps each role focus on execution, not spreadsheets.
          </p>
          <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
            >
              Launch workspace
              <span aria-hidden>↗</span>
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700/70 px-4 py-2 text-slate-200 hover:border-emerald-400/70 hover:text-emerald-200 transition-colors"
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

