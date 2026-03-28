import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-4 py-4 md:px-10 md:py-5 border-b border-slate-800/70 bg-slate-950/60 backdrop-blur">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-slate-950 font-bold text-lg shadow-lg shadow-emerald-500/30">
          TB
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight">TradeBridge</p>
          <p className="text-[11px] text-slate-400">Unified supply chain hub</p>
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs sm:text-sm">
        <Link
          to="/workspaces"
          className="rounded-lg px-3 py-1.5 text-slate-200 hover:text-emerald-300 transition-colors"
        >
          Workspaces
        </Link>
        <Link
          to="/about"
          className="rounded-lg px-3 py-1.5 text-slate-200 hover:text-emerald-300 transition-colors"
        >
          About
        </Link>
        <Link
          to="/contact"
          className="rounded-lg px-3 py-1.5 text-slate-200 hover:text-emerald-300 transition-colors"
        >
          Contact &amp; Support
        </Link>

        <span className="mx-1 hidden h-5 w-px bg-slate-800 sm:inline-block" />

        <Link
          to="/login"
          className="rounded-lg px-3 py-1.5 text-slate-200 hover:text-emerald-300 transition-colors"
        >
          Log in
        </Link>
        <Link
          to="/register"
          className="rounded-lg bg-emerald-500 px-3.5 py-1.5 font-medium text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}

