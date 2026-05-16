import React from 'react';
import { Link } from 'react-router-dom';

const roles = [
  {
    title: 'For Retailers',
    description: 'Discover products from verified distributors and factories.',
    benefits: ['Browse & compare products', 'Place orders with ease', 'Track deliveries live', 'Request drivers'],
    icon: '🛒',
    cta: 'Start Buying',
    color: 'blue',
  },
  {
    title: 'For Distributors & Factories',
    description: 'Reach more customers and manage your supply chain efficiently.',
    benefits: ['Manage product catalog', 'Process orders', 'Assign drivers', 'View sales analytics'],
    icon: '🏭',
    cta: 'Start Selling',
    color: 'teal',
  },
  {
    title: 'For Drivers',
    description: 'Join the network and earn by delivering goods.',
    benefits: ['Get delivery assignments', 'Share live location', 'Update delivery status', 'Track earnings'],
    icon: '🚚',
    cta: 'Become a Driver',
    color: 'purple',
  },
];

const RolesSection: React.FC = () => {
  return (
    <section id="roles" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Built for Your Role
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            TradeBridge adapts to your needs whether you're buying, selling, or delivering
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <div
              key={role.title}
              className="relative p-6 bg-gray-50 rounded-2xl hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">{role.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.title}</h3>
              <p className="text-gray-600 mb-4">{role.description}</p>
              <ul className="space-y-2 mb-6">
                {role.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span> {benefit}
                  </li>
                ))}
              </ul>
              <Link
                to={`/register?role=${role.title.toLowerCase().includes('retailer') ? 'retailer' : role.title.toLowerCase().includes('driver') ? 'driver' : 'supplier'}`}
                className={`inline-block px-6 py-2 bg-${role.color}-600 text-white rounded-lg hover:bg-${role.color}-700 transition w-full text-center`}
              >
                {role.cta} →
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RolesSection;