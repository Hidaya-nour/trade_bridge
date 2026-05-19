import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AnimatedBackground } from '@/components/animated-background'
import { AnimatedClouds } from '@/components/animated-clouds'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

export default function PricingPage() {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small businesses just starting',
      price: '$29',
      period: '/month',
      popular: false,
      features: [
        'Up to 5 users',
        'Basic product catalog',
        'Order management',
        'Email support',
        'Basic analytics',
        'Mobile app access',
        'Community forum access',
      ],
      cta: 'Get Started',
    },
    {
      name: 'Professional',
      description: 'For growing businesses with more demands',
      price: '$99',
      period: '/month',
      popular: true,
      features: [
        'Up to 50 users',
        'Advanced product management',
        'Order & inventory tracking',
        'Priority email support',
        'Advanced analytics & reports',
        'Mobile app access',
        'API access',
        'Custom integrations',
        'Team collaboration tools',
      ],
      cta: 'Get Started',
    },
    {
      name: 'Enterprise',
      description: 'For large-scale operations',
      price: 'Custom',
      period: 'pricing',
      popular: false,
      features: [
        'Unlimited users',
        'Custom features',
        'Multi-warehouse support',
        '24/7 dedicated support',
        'Custom analytics & reporting',
        'Advanced security features',
        'White-label options',
        'Dedicated account manager',
        'Custom SLA',
        'On-premise deployment option',
      ],
      cta: 'Contact Sales',
    },
  ]

  const addOns = [
    { name: 'Advanced Analytics', price: '$49', description: 'Deep insights and custom reports' },
    { name: 'API Access', price: '$25', description: 'Full API for integrations' },
    { name: 'Priority Support', price: '$99', description: '24/7 dedicated support team' },
    { name: 'White Label', price: '$199', description: 'Customize branding and domain' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        <Navigation />

        {/* Hero Section */}
{/* HERO + TOGGLE (FULL CENTER) */}
<section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center overflow-hidden">

  {/* Background Glow */}
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Glass Container */}
  <div className="relative z-10 w-full max-w-5xl rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-white/40 shadow-xl p-10 md:p-14">

    {/* Mirror shine */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

    {/* TITLE */}
    <h1 className="relative z-10 text-5xl md:text-7xl font-black text-gray-900 dark:text-white mb-6 animate-slide-in-top">
      Simple,{" "}
      <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
        Transparent Pricing
      </span>
    </h1>

    {/* SUBTITLE */}
    <p className="relative z-10 text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-10 animate-slide-in-bottom">
      Choose the plan that best fits your business needs. All plans include a 14-day free trial.
    </p>

    {/* TOGGLE */}
    <div className="relative z-10 flex justify-center">

      <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/20 dark:bg-gray-900/20 backdrop-blur-xl border border-white/40 shadow-lg">

        {/* Monthly */}
        <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium shadow-md hover:scale-105 transition">
          Monthly
        </button>

        {/* Annual */}
        <button className="px-6 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:text-white hover:bg-white/20 transition flex items-center gap-2">
          Annual
          <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-400 text-white px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        </button>

      </div>

    </div>

  </div>
</section>
{/* PRICING CARDS */}
<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background Glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Grid */}
  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">

    {plans.map((plan, index) => (
      <Card
        key={index}
        className={`relative overflow-hidden p-8 rounded-3xl border backdrop-blur-xl shadow-xl transition-all duration-500 animate-slide-in-bottom
        ${
          plan.popular
            ? "bg-white/40 dark:bg-gray-900/40 border-white/50 scale-105"
            : "bg-white/30 dark:bg-gray-900/30 border-white/30 hover:scale-[1.03]"
        }`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >

        {/* Mirror shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

        {/* Most Popular Badge */}
        {plan.popular && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
              Most Popular
            </span>
          </div>
        )}

        {/* Plan Info */}
        <div className="relative z-10 mb-6">

          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {plan.name}
          </h3>

          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {plan.description}
          </p>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              {plan.price}
            </span>

            {plan.period !== "pricing" && (
              <span className="text-gray-600 dark:text-gray-400">
                {plan.period}
              </span>
            )}
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={() => navigate("/login")}
          className={`relative z-10 w-full mb-8 rounded-xl shadow-md transition-all duration-300 ${
            plan.popular
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white hover:from-blue-700 hover:to-cyan-600"
              : "bg-white/40 dark:bg-gray-800/40 text-gray-900 dark:text-white border border-white/40 hover:bg-white/60"
          }`}
        >
          {plan.cta}
        </Button>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {plan.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <Check className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {feature}
              </span>
            </div>
          ))}
        </div>

      </Card>
    ))}
  </div>
</section>
      {/* Add-ons Section */}
     {/* COMPARISON SECTION */}
<section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">

  {/* background glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300/20 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"></div>
  </div>

  <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 relative z-10">
    Feature Comparison
  </h2>

  <div className="relative z-10 overflow-x-auto rounded-2xl border border-white/30 backdrop-blur-xl bg-white/20 shadow-xl">

    <table className="w-full text-sm">

      {/* HEADER */}
      <thead className="bg-white/30 backdrop-blur-md">
        <tr className="border-b border-white/20">
          <th className="text-left py-4 px-6 text-gray-900 dark:text-white font-semibold">Feature</th>
          <th className="text-center py-4 px-6 text-gray-900 dark:text-white font-semibold">Starter</th>
          <th className="text-center py-4 px-6 text-gray-900 dark:text-white font-semibold">Professional</th>
          <th className="text-center py-4 px-6 text-gray-900 dark:text-white font-semibold">Enterprise</th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody>

        {[
          { feature: 'User Accounts', starter: '5', pro: '50', enterprise: 'Unlimited' },
          { feature: 'Product Listings', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
          { feature: 'Order Management', starter: 'Yes', pro: 'Yes', enterprise: 'Yes' },
          { feature: 'Analytics', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom' },
          { feature: 'API Access', starter: 'No', pro: 'Yes', enterprise: 'Yes' },
          { feature: 'Email Support', starter: 'Yes', pro: 'Priority', enterprise: '24/7' },
          { feature: 'Custom Integrations', starter: 'No', pro: 'Yes', enterprise: 'Yes' },
          { feature: 'White Label', starter: 'No', pro: 'No', enterprise: 'Yes' },
        ].map((row, index) => (
          <tr
            key={index}
            className="border-b border-white/10 hover:bg-white/20 transition-all"
          >
            <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">
              {row.feature}
            </td>
            <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">
              {row.starter}
            </td>
            <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">
              {row.pro}
            </td>
            <td className="py-4 px-6 text-center text-gray-600 dark:text-gray-300">
              {row.enterprise}
            </td>
          </tr>
        ))}

      </tbody>
    </table>
  </div>
</section>
 {/* PRICING FAQ */}
<section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">

  {/* Background glow (mirror style) */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
  </div>

  <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12 relative z-10">
    Pricing FAQs
  </h2>

  <div className="relative z-10 max-w-2xl mx-auto space-y-4">

    {[
      {
        q: 'Can I change plans anytime?',
        a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the next billing cycle.',
      },
      {
        q: 'Do you offer a free trial?',
        a: 'Yes, we offer a 30-day free trial with full access to the Professional plan features.',
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit cards, bank transfers, and wire payments for Enterprise plans.',
      },
      {
        q: 'Is there a money-back guarantee?',
        a: 'Yes, we offer a 30-day money-back guarantee if you are not satisfied with our service.',
      },
    ].map((item, index) => (
      <Card
        key={index}
        className="relative overflow-hidden p-6 rounded-2xl backdrop-blur-xl bg-white/30 border border-white/30 shadow-lg hover:scale-[1.02] transition-all duration-300"
      >
        {/* glass shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

        <h3 className="relative z-10 font-semibold text-gray-900 dark:text-white mb-2">
          {item.q}
        </h3>

        <p className="relative z-10 text-sm text-gray-600 dark:text-gray-300">
          {item.a}
        </p>
      </Card>
    ))}
  </div>
</section>
     {/* CTA SECTION */}
<section className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20">

  {/* background glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
  </div>

  <div className="relative z-10 rounded-3xl p-12 text-center backdrop-blur-xl bg-white/30 border border-white/30 shadow-xl">

    
<h3 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
     Start Your{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
     Free Trial Today
    </span>
    </h3>

    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
      No credit card required. Full access to all Professional features for 30 days.
    </p>

    <Button
      onClick={() => navigate('/login')}
      className="px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition-all duration-300 shadow-lg"
    >
      Start Free Trial
    </Button>

  </div>
</section>

        <Footer />
      </div>
    </div>
  )
}
