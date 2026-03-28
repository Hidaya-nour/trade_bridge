import { Link } from "react-router-dom";
import SocialIcon from "./SocialIcon";

export default function HomeFooter() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/95 py-4 text-[11px] text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 md:flex-row md:px-10 lg:px-16">
        <div className="space-y-1 text-center md:text-left">
          <p className="text-slate-400">© {new Date().getFullYear()} TradeBridge. All rights reserved.</p>
          <p className="text-[10px] text-slate-600">Built for factories, distributors, retailers and drivers.</p>
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
            <SocialIcon href="https://facebook.com" label="Facebook">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-2.9h2.5V9.9c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.7-1.6 1.5v1.8H18l-.5 2.9h-2.5v7A10 10 0 0 0 22 12z" />
              </svg>
            </SocialIcon>

            <SocialIcon href="https://x.com" label="X (Twitter)">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18.9 2H22l-6.8 7.8L23.2 22H16l-4.2-6.2L6 22H2.9l7.4-8.5L1 2h7.4l3.8 5.6L18.9 2Zm-1.1 18h1.7L7 3.9H5.2L17.8 20Z" />
              </svg>
            </SocialIcon>

            <SocialIcon href="https://instagram.com" label="Instagram">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7Zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10Zm-1.1 1.8a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8ZM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z" />
              </svg>
            </SocialIcon>

            <SocialIcon href="https://linkedin.com" label="LinkedIn">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.45 2H3.55A1.55 1.55 0 0 0 2 3.55v16.9A1.55 1.55 0 0 0 3.55 22h16.9A1.55 1.55 0 0 0 22 20.45V3.55A1.55 1.55 0 0 0 20.45 2ZM8.1 19H5.2V9h2.9v10ZM6.65 7.8a1.7 1.7 0 1 1 0-3.4 1.7 1.7 0 0 1 0 3.4ZM19 19h-2.9v-4.7c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5V19H9.8V9H12.6v1.4h.04c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2.1 3.7 4.7V19Z" />
              </svg>
            </SocialIcon>
          </div>
        </div>
      </div>
    </footer>
  );
}

