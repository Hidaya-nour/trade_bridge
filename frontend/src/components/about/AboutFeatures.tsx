type AboutFeature = {
  label: string;
  details: string;
};

type AboutFeaturesProps = {
  features: AboutFeature[];
};

function FeatureItem({ label, details }: AboutFeature) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-sm font-semibold text-slate-50">{label}</p>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{details}</p>
    </article>
  );
}

export default function AboutFeatures({ features }: AboutFeaturesProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5 sm:p-6">
      <div className="mb-4 space-y-2">
        <h2 className="text-lg font-semibold text-slate-50 sm:text-xl">How we create impact</h2>
        <p className="max-w-3xl text-sm text-slate-400">
          Our product principles focus on making cross-company operations faster, clearer, and more
          accountable.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {features.map((item) => (
          <FeatureItem key={item.label} label={item.label} details={item.details} />
        ))}
      </div>
    </section>
  );
}

