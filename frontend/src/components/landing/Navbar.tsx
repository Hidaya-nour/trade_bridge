import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import tradebridgeLogo from "@/assets/image/logo.png";

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
            <Link to="/" className="flex items-center  space-x-2 group">
                <div className="flex justify-center ">
                    <img
                    src={tradebridgeLogo}
                    alt="TradeBridge Logo"
                    className="h-11 object-contain drop-shadow-lg transform hover:scale-110 transition-transform duration-300"
                    />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                TradeBridge
                </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-foreground/70 hover:text-primary transition font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-foreground/70 hover:text-primary transition font-medium"
            >
              How It Works
            </a>
            <a
              href="#roles"
              className="text-foreground/70 hover:text-primary transition font-medium"
            >
              For You
            </a>
            <Link
              to="/login"
              className="text-foreground/70 hover:text-primary transition font-medium"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground/70 hover:bg-secondary transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-3">
              <a
                href="#features"
                className="text-foreground/70 hover:text-primary px-3 py-2 rounded-lg hover:bg-secondary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-foreground/70 hover:text-primary px-3 py-2 rounded-lg hover:bg-secondary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a
                href="#roles"
                className="text-foreground/70 hover:text-primary px-3 py-2 rounded-lg hover:bg-secondary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For You
              </a>
              <Link
                to="/login"
                className="text-foreground/70 hover:text-primary px-3 py-2 rounded-lg hover:bg-secondary transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-center hover:bg-primary/90 transition"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;