// HowItWorks.tsx
import { StepCard } from '../../components/landing/shared';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up as a retailer, distributor, or factory. Complete your business profile and get verified.",
      icon: "📝"
    },
    {
      number: 2,
      title: "Discover Products",
      description: "Browse products from verified suppliers. Use filters to find exactly what you need.",
      icon: "🔍"
    },
    {
      number: 3,
      title: "Place Bulk Orders",
      description: "Add items to cart, compare suppliers, and place bulk orders with just a few clicks.",
      icon: "🛒"
    },
    {
      number: 4,
      title: "Get Approved",
      description: "Suppliers review and approve your orders. Receive real-time notifications.",
      icon: "✅"
    },
    {
      number: 5,
      title: "Track Delivery",
      description: "Follow your order from warehouse to doorstep with live tracking.",
      icon: "📍"
    },
    {
      number: 6,
      title: "Rate & Review",
      description: "Share your experience to help other businesses make informed decisions.",
      icon: "⭐"
    }
  ];

  const roleSections = [
    {
      role: "For Retailers",
      description: "Find the best suppliers and products for your store.",
      points: [
        "Browse thousands of products from verified suppliers",
        "Compare prices and supplier ratings",
        "Place bulk orders in minutes",
        "Track deliveries in real-time"
      ],
      icon: "🏪",
      color: "blue"
    },
    {
      role: "For Distributors",
      description: "Expand your market reach and manage inventory efficiently.",
      points: [
        "List your products and reach more retailers",
        "Manage orders and track deliveries",
        "Access sales analytics and insights",
        "Build lasting business relationships"
      ],
      icon: "📦",
      color: "purple"
    },
    {
      role: "For Factories",
      description: "Connect directly with distributors and optimize production.",
      points: [
        "Showcase your products to qualified buyers",
        "Get accurate demand forecasts",
        "Manage bulk orders efficiently",
        "Analyze production trends"
      ],
      icon: "🏭",
      color: "green"
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">How TradeBridge Works</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Simple steps to transform your business procurement process.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Get Started in 6 Easy Steps</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From sign-up to delivery, we've made the process simple and transparent.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {steps.map((step) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
                icon={<span className="text-2xl">{step.icon}</span>}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Role Sections */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tailored for Your Role</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              TradeBridge adapts to your business needs, whether you're buying or selling.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {roleSections.map((role, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{role.icon}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{role.role}</h3>
                <p className="text-gray-600 mb-4">{role.description}</p>
                <ul className="space-y-2">
                  {role.points.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-green-500 mt-1">✓</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using TradeBridge.
          </p>
          <a 
            href="/register" 
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Free Account
          </a>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;