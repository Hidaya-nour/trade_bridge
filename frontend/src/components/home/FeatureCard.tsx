type FeatureCardProps = {
  title: string;
  description: string;
};

export default function FeatureCard({
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-5 space-y-2 hover:border-emerald-400/50 transition-colors">
      <p className="text-sm font-semibold text-slate-50">{title}</p>
      <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
    </div>
  );
}

