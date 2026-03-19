import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import WorkspaceSection from "@/components/home/WorkspaceSection";
import HomeFooter from "@/components/home/HomeFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <WorkspaceSection />
        <HomeFooter />
      </div>
    </main>
  );
}

const __legacyHomeTsx = `
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import WorkspaceSection from "@/components/home/WorkspaceSection";
import HomeFooter from "@/components/home/HomeFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <WorkspaceSection />
        <HomeFooter />
      </div>
    </main>
  );
}

/*
import Navbar from "@/components/home/Navbar";
import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import WorkspaceSection from "@/components/home/WorkspaceSection";
import HomeFooter from "@/components/home/HomeFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <WorkspaceSection />
        <HomeFooter />
      </div>
    </main>
  );
}

import { Link } from "react-router-dom";

function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      {/* Glow background */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.14),_transparent_60%)]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar */}
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

        {/* Hero */}
        <section className="flex flex-1 flex-col justify-center px-4 py-10 md:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center max-w-6xl mx-auto">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                End‑to‑end trade workflow
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">
                A single control center for{" "}
                <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                  factories, distributors &amp; retailers
                </span>
                .
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl">
                Orchestrate sourcing, orders, logistics, and payments from one modern dashboard.
                TradeBridge helps each role focus on execution, not spreadsheets.
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

        {/* Features */}
        <section className="border-t border-slate-800/80 bg-slate-950/70">
          <div className="mx-auto max-w-6xl px-4 py-10 md:px-10 lg:px-16 space-y-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">Features built for real operations</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  From order creation to delivery confirmation, TradeBridge keeps your workflows clean and consistent.
                </p>
              </div>
              <div className="text-[11px] text-slate-400">
                Designed for factories, distributors, retailers and drivers
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                title="Real-time order tracking"
                description="See status updates, approvals, and exceptions as they happen—no waiting, no guessing."
              />
              <FeatureCard
                title="Secure role-based access"
                description="Each role gets the tools and permissions they need, with a clear audit trail."
              />
              <FeatureCard
                title="Documents & approvals"
                description="Centralize documents and make approvals consistent across the network."
              />
              <FeatureCard
                title="Delivery management"
                description="Coordinate shipments with delivery plans, status updates, and dispatch-ready workflows."
              />
              <FeatureCard
                title="Analytics that drive action"
                description="Understand trends, lead times, and performance to make better decisions faster."
              />
              <FeatureCard
                title="Exception handling"
                description="Resolve disputes and issues quickly with dedicated workflows and visibility."
              />
            </div>
          </div>
        </section>

        {/* Role cards */}
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
              <RoleCard
                title="Retailer"
                description="Browse suppliers, compare offers and place purchase orders."
                to="/retailer/dashboard"
                badge="Demand"
              />
              <RoleCard
                title="Distributor"
                description="Balance inventory, margins and outbound deliveries across regions."
                to="/distributor/dashboard"
                badge="Orchestration"
              />
              <RoleCard
                title="Factory"
                description="Align production capacity with real‑time order signals."
                to="/factory/dashboard"
                badge="Supply"
              />
              <RoleCard
                title="Driver"
                description="Update delivery statuses and confirmations with dispatch-ready info."
                to="/driver/dashboard"
                badge="Delivery"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-slate-950/95 py-4 text-[11px] text-slate-500">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 md:flex-row md:px-10 lg:px-16">
            <div className="space-y-1 text-center md:text-left">
              <p className="text-slate-400">
                © {new Date().getFullYear()} TradeBridge. All rights reserved.
              </p>
              <p className="text-[10px] text-slate-600">
                Built for factories, distributors, retailers and drivers.
              </p>
            </div>
            <div className="flex w-full flex-col items-center gap-3 md:w-auto md:items-end">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
                <Link to="/workspaces" className="hover:text-emerald-300">
                  Workspaces
                </Link>
                <Link to="/about" className="hover:text-emerald-300">
                  About us
                </Link>
                <Link to="/contact" className="hover:text-emerald-300">
                  Contact &amp; Support
                </Link>
                <Link to="/login" className="hover:text-emerald-300">
                  Login
                </Link>
              </div>

              <div className="flex items-center gap-3" aria-label="Social media">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.9c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5v1.8H18l-.5 2.9h-2.5v7A10 10 0 0 0 22 12z" />
                  </svg>
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 transition-colors"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.9 2H22l-6.8 7.8L23.2 22H16l-4.2-6.2L6 22H2.9l7.4-8.5L1 2h7.4l3.8 5.6L18.9 2Zm-1.1 18h1.7L7 3.9H5.2L17.8 20Z" />
                  </svg>
                </a>

                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7Zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10Zm-1.1 1.8a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
                  </svg>
                </a>

                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8.1 19H5.2V9h2.9v10ZM6.65 7.8a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM19 19h-2.9v-4.7c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V19H9.8V9H12.6v1.4h.04c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2.1 3.7 4.7V19Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

type RoleCardProps = {
  title: string;
  description: string;
  to: string;
  badge: string;
};

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

type FeatureCardProps = {
  title: string;
  description: string;
};

function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-2 hover:border-emerald-400/50 transition-colors">
      <p className="text-sm font-semibold text-slate-50">{title}</p>
      <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}

export default HomePage;
*/
`;
