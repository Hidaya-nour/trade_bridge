import AboutContent from "@/components/about/AboutContent";
import AboutFeatures from "@/components/about/AboutFeatures";
import AboutHero from "@/components/about/AboutHero";

type CoreValue = {
  label: string;
  details: string;
};

const CORE_VALUES: CoreValue[] = [
  {
    label: "Visibility",
    details: "Unified timelines for orders, documents, and delivery updates across all roles.",
  },
  {
    label: "Control",
    details: "Role-based permissions with clear accountability for every workflow action.",
  },
  {
    label: "Insight",
    details: "Action-oriented dashboards tailored to operational and commercial priorities.",
  },
];

const IMPACT_METRICS = [
  { value: "4+", label: "Core operational roles supported" },
  { value: "1", label: "Shared workspace across trade lifecycle" },
  { value: "24/7", label: "Real-time visibility for critical decisions" },
] as const;

function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.15),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(59,130,246,0.12),_transparent_55%)]" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-4 py-12 md:px-10 lg:px-16">
        <AboutHero />
        <AboutContent />
        <AboutFeatures features={CORE_VALUES} />

        <section className="grid gap-3 sm:grid-cols-3">
          {IMPACT_METRICS.map((metric) => (
            <div
              key={metric.label}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-center"
            >
              <p className="text-2xl font-semibold text-emerald-300">{metric.value}</p>
              <p className="mt-1 text-xs text-slate-400">{metric.label}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default AboutPage;

