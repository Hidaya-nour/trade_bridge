import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AnimatedBackground } from '@/components/animated-background'
import { AnimatedClouds } from '@/components/animated-clouds'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ShoppingCart, Truck, BarChart3, MessageSquare, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

export default function HowItWorksPage() {
  const navigate = useNavigate()

  const steps = [
    {
      icon: ShoppingCart,
      title: 'Browse & Order',
      description: 'Retailers browse available products from factories and distributors, and place orders with just a few clicks.',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: BarChart3,
      title: 'Track & Manage',
      description: 'Real-time tracking and inventory management helps optimize stock levels and reduce wastage.',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Truck,
      title: 'Deliver & Complete',
      description: 'Drivers receive delivery assignments and provide real-time location updates to ensure timely delivery.',
      color: 'from-blue-500 to-purple-600',
    },
    {
      icon: MessageSquare,
      title: 'Communicate',
      description: 'Direct messaging between all stakeholders enables quick problem resolution and builds strong relationships.',
      color: 'from-purple-500 to-blue-600',
    },
  ]

  const roles = [
    {
      role: 'Retailers',
      icon: ShoppingCart,
      benefits: [
        'Easy product discovery and ordering',
        'Multiple supplier options',
        'Real-time order tracking',
        'Direct communication with suppliers',
        'Competitive pricing',
        'Flexible payment options',
      ],
    },
    {
      role: 'Factories',
      icon: BarChart3,
      benefits: [
        'Direct access to retailers',
        'Sales analytics and insights',
        'Inventory management tools',
        'Bulk order management',
        'Production planning',
        'Customer relationship management',
      ],
    },
    {
      role: 'Distributors',
      icon: Truck,
      benefits: [
        'Network of buyers and sellers',
        'Logistics optimization',
        'Warehouse management',
        'Cross-selling opportunities',
        'Real-time demand forecasting',
        'Performance analytics',
      ],
    },
    {
      role: 'Drivers',
      icon: MessageSquare,
      benefits: [
        'Clear delivery assignments',
        'Real-time routing',
        'Navigation assistance',
        'Delivery proof capture',
        'Direct communication',
        'Performance tracking',
      ],
    },
  ]

  const features = [
    {
      title: 'Unified Dashboard',
      description: 'All stakeholders have access to customized dashboards with relevant metrics and insights.',
    },
    {
      title: 'Real-Time Analytics',
      description: 'Track performance metrics, sales, inventory, and deliveries in real-time for better decision-making.',
    },
    {
      title: 'Secure Transactions',
      description: 'Bank-level security ensures all transactions and communications are protected.',
    },
    {
      title: 'Mobile-First Design',
      description: 'Seamlessly work on desktop, tablet, or smartphone with our responsive platform.',
    },
    {
      title: 'Advanced Search',
      description: 'Find products, orders, and contacts quickly with our intelligent search system.',
    },
    {
      title: 'Integration Ready',
      description: 'API access allows integration with your existing business systems.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted relative overflow-hidden">
     

      <div className="relative z-10">
        <Navigation />
 
        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-56 my-8 text-center relative">
          <AnimatedBackground />
          {/* <AnimatedClouds /> */}
          <div className="relative z-10">
              <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white py-4 mb-6 animate-slide-in-top">
            How It{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              Works
            </span>
          </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
              TradeBridge connects all participants in the supply chain for seamless collaboration and efficiency.
            </p>
          </div>
        </section>

        {/* Process Steps */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background Glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Title */}
  <h2 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
    The{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
      Process
    </span>
  </h2>

  {/* Steps Grid */}
  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    {steps.map((step, index) => {
      const Icon = step.icon

      return (
        <div
          key={index}
          className="relative animate-slide-in-bottom"
          style={{ animationDelay: `${index * 0.1}s` }}
        >

          {/* Glass Card */}
          <Card className="relative overflow-hidden p-6 rounded-3xl border border-white/40 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg hover:scale-[1.03] transition-all duration-500 h-full">

            {/* Mirror shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-4">
              
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                <Icon className="w-6 h-6 text-white animate-float" />
              </div>

              <span className="text-3xl font-bold text-gray-300 dark:text-gray-600">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>

            {/* Title */}
            <h3 className="relative z-10 text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {step.title}
            </h3>

            {/* Description */}
            <p className="relative z-10 text-sm text-gray-700 dark:text-gray-300">
              {step.description}
            </p>

          </Card>

          {/* Connector line */}
          {index < steps.length - 1 && (
            <div className="hidden lg:block absolute -right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-6 h-1 bg-gradient-to-r from-blue-500 to-cyan-400 blur-sm animate-pulse" />
            </div>
          )}

        </div>
      )
    })}

  </div>
</section>

        {/* Role-Based Benefits */}
        {/* For Every Role */}
<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background Glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Title */}
  <h2 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
    For{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
      Every Role
    </span>
  </h2>

  {/* Roles Grid */}
  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6">

    {roles.map((roleItem, index) => {
      const Icon = roleItem.icon

      return (
        <Card
          key={index}
          className="relative overflow-hidden p-6 rounded-3xl border border-white/40 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg hover:scale-[1.03] transition-all duration-500"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* mirror shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

          {/* Icon */}
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-md">
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* Role */}
          <h3 className="relative z-10 text-lg font-semibold text-gray-900 dark:text-white mb-6">
            {roleItem.role}
          </h3>

          {/* Benefits */}
          <ul className="relative z-10 space-y-3">
            {roleItem.benefits.map((benefit, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )
    })}
  </div>
</section>


{/* Platform Features */}
<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background Glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
  </div>

  {/* Title */}
  <h2 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
    Platform{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
      Features
    </span>
  </h2>

  {/* Features Grid */}
  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    {features.map((feature, index) => (
      <Card
        key={index}
        className="relative overflow-hidden p-6 rounded-3xl border border-white/40 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg hover:scale-[1.03] transition-all duration-500"
      >
        {/* mirror shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

        {/* Icon */}
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 relative z-10">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>

        {/* Title */}
        <h3 className="relative z-10 font-semibold text-gray-900 dark:text-white mb-2">
          {feature.title}
        </h3>

        {/* Description */}
        <p className="relative z-10 text-sm text-gray-700 dark:text-gray-300">
          {feature.description}
        </p>

      </Card>
    ))}
  </div>
</section>

    {/* FAQ Section */}
<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background Glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
  </div>

  {/* Title */}
  <h2 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
    Frequently{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
      Asked Questions
    </span>
  </h2>

  {/* FAQ Cards */}
  <div className="relative z-10 max-w-2xl mx-auto space-y-5">

    {[
      {
        q: 'How do I get started?',
        a: 'Sign up for a free account, select your role (retailer, factory, distributor, driver, or admin), and complete your profile. You can start using TradeBridge immediately.',
      },
      {
        q: 'Is there a trial period?',
        a: 'Yes, we offer a 30-day free trial with full access to all features for new users.',
      },
      {
        q: 'How secure is my data?',
        a: 'We use bank-level encryption and comply with international security standards to protect your data.',
      },
      {
        q: 'Can I integrate with my existing systems?',
        a: 'Yes, our API allows seamless integration with your existing business systems and workflows.',
      },
    ].map((item, index) => (
      <Card
        key={index}
        className="relative overflow-hidden p-6 rounded-3xl border border-white/40 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg hover:scale-[1.02] transition-all duration-500"
      >
        {/* mirror shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

        <h3 className="relative z-10 font-semibold text-gray-900 dark:text-white mb-2">
          {item.q}
        </h3>

        <p className="relative z-10 text-sm text-gray-700 dark:text-gray-300">
          {item.a}
        </p>
      </Card>
    ))}

  </div>
</section>


{/* CTA Section */}
<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background Glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Glass Card */}
  <div className="relative z-10 rounded-3xl p-12 text-center bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-white/40 shadow-xl">

    {/* mirror shine */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

    
<h2 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
    Ready to{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
      Transform Your Supply Chain?
    </span>
    </h2>
    <p className="relative z-10 text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
      Join thousands of businesses already using TradeBridge to streamline their operations.
    </p>

    <Button
      onClick={() => navigate('/login')}
      size="lg"
      className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg px-8"
    >
      Get Started Now
    </Button>

  </div>
</section>

        <Footer />
      </div>
    </div>
  )
}
