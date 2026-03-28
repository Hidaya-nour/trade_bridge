import { Link } from "react-router-dom";
import { LandingButton } from "../shared";

const navLinks = [
  { label: "How it works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "Resources", to: "/resources" },
  { label: "Contact", to: "/contact" },
];

const LandingHeader = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-2xl font-bold tracking-tight text-slate-900">
          TradeBridge
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="hover:text-slate-900 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Sign in
          </Link>
          <LandingButton variant="outline" className="text-sm px-4 py-2">
            Launch App
          </LandingButton>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
