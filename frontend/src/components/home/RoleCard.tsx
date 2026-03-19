import { Link } from "react-router-dom";

type RoleCardProps = {
  title: string;
  description: string;
  to: string;
  badge: string;
};

export default function RoleCard({
  title,
  description,
  to,
  badge,
}: RoleCardProps) {
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

