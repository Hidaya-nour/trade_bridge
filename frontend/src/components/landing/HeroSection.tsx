import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/30 -z-10" />
      
      {/* Animated Blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse -z-10" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000 -z-10" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/50 rounded-full border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-sm font-medium text-primary">🚀 Live Platform</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Bridge the Gap Between{' '}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Trade & Logistics
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Connect retailers, distributors, factories, and drivers on a single platform.
              Streamline your supply chain from order to delivery with real-time tracking.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group px-8 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                Start Selling
                <svg className="w-5 h-5 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/register?role=retailer"
                className="px-8 py-3 border-2 border-primary/30 text-foreground rounded-lg hover:bg-primary/5 hover:border-primary transition-all duration-300 font-medium"
              >
                Start Buying
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary/40 border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">2,000+</span> businesses trust us
              </div>
            </div>
          </div>

          {/* Right Content - Animated Illustration */}
          <div className="relative lg:pl-8">
            <div className="relative z-10">
              {/* Card Stack Effect */}
              <div className="relative">
                {/* Back card */}
                <div className="absolute -top-4 -right-4 w-full h-full bg-primary/5 rounded-2xl border border-primary/20 -z-10" />
                
                {/* Main card */}
                <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-primary/5 to-transparent border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs text-muted-foreground">TradeBridge Dashboard</span>
                    </div>
                  </div>
                  
                  {/* Animated Dashboard Preview */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between animate-in slide-in-from-left-5 delay-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <span className="text-primary text-lg">📦</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Order #TB-2024-001</p>
                          <p className="text-xs text-muted-foreground">2 min ago</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 bg-accent text-accent-foreground rounded-full">Processing</span>
                    </div>
                    
                    <div className="flex items-center justify-between animate-in slide-in-from-left-5 delay-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <span className="text-primary text-lg">🚚</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Delivery #DLV-0842</p>
                          <p className="text-xs text-muted-foreground">In transit</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs text-muted-foreground">Live</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between animate-in slide-in-from-left-5 delay-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                          <span className="text-primary text-lg">💳</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Payment #PAY-5678</p>
                          <p className="text-xs text-muted-foreground">Completed via Chapa</p>
                        </div>
                      </div>
                      <span className="text-xs text-green-600 dark:text-green-400">✓ Paid</span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-6 pt-4 border-t border-border">
                      <div className="flex justify-between text-xs text-muted-foreground mb-2">
                        <span>Today's Volume</span>
                        <span className="font-semibold text-foreground">₿ 12,450</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-3/4 animate-in slide-in-from-left-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-8 -left-8 w-20 h-20 bg-primary/10 rounded-full animate-bounce-slow" />
            <div className="absolute -bottom-8 -right-8 w-16 h-16 bg-accent/30 rounded-full animate-bounce-slow delay-150" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;