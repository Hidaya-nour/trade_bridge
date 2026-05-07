import React from 'react';

const steps = [
  {
    id: '01',
    name: 'Create account',
    description: 'Sign up as a retailer, distributor, factory, or driver — then complete your business profile.',
  },
  {
    id: '02',
    name: 'Get verified',
    description: 'Upload the required documents. Our team will review and activate your account.',
  },
  {
    id: '03',
    name: 'Start trading',
    description: 'List products, place orders, assign drivers, and manage your entire workflow.',
  },
  {
    id: '04',
    name: 'Grow with insights',
    description: 'Use AI forecasts, sales analytics, and promotional tools to expand your business.',
  },
];

const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            How to start trading in minutes
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            From sign‑up to first transaction — a simple process built for busy people.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:gap-12">
            {steps.map((step) => (
              <li key={step.id} className="relative flex gap-x-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {step.id}
                </div>
                <div>
                  <h3 className="text-lg font-semibold leading-7 text-foreground">
                    {step.name}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;