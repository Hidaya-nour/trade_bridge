import React from 'react';

const features = [
  {
    name: 'Real‑time tracking',
    description: 'Follow your deliveries live with driver location sharing and instant status updates.',
    icon: '🚚',
  },
  {
    name: 'AI demand forecasts',
    description: 'Predict stock needs with our ML engine — reduce overstock and missed sales.',
    icon: '📈',
  },
  {
    name: 'Secure payments',
    description: 'Chapa‑powered escrow and split payments. Your money moves safely.',
    icon: '💳',
  },
  {
    name: 'Unified messaging',
    description: 'Chat directly with suppliers, buyers, and drivers — all in one place.',
    icon: '💬',
  },
  {
    name: 'Document hub',
    description: 'Upload, verify, and manage all your business documents seamlessly.',
    icon: '📄',
  },
  {
    name: 'Analytics & reports',
    description: 'Understand your business with sales, inventory, and performance dashboards.',
    icon: '📊',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Everything you need to scale
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Powerful tools for every step of the supply chain — from first order to final delivery.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-xl font-semibold leading-7 text-foreground">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                    {feature.icon}
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-muted-foreground">
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;