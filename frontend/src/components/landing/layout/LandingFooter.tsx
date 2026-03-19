import { Link } from "react-router-dom";

const footerLinks = [
  { label: "Terms of Service", to: "/terms" },
  { label: "Privacy Policy", to: "/privacy" },
  { label: "Support", to: "/support" },
  { label: "Careers", to: "/careers" },
];

const LandingFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-200">
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">TradeBridge</p>
            <p className="text-sm text-slate-400">
              Connecting retailers, distributors, and factories across Africa
              with one intelligent marketplace.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {footerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-slate-400 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="border-t border-slate-800 pt-4 text-xs text-slate-500">
          © {new Date().getFullYear()} TradeBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
