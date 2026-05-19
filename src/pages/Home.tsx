import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AnimatedBackground } from '@/components/animated-background'
import { AnimatedClouds } from '@/components/animated-clouds'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, Zap, TrendingUp, Shield, BarChart3, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        <Navigation />

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-48 mt-24 text-center relative">
          <AnimatedClouds />
          <div className="max-w-3xl mx-auto relative z-10">

            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 animate-slide-in-top">
              Smart Supply-Demand{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                Management System
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
              Connect retailers, factories, distributors, and drivers in one unified platform.
              Streamline operations, reduce costs, and maximize efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-bottom" style={{ animationDelay: '0.2s' }}>
              <Button
                onClick={() => navigate('/login')}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border hover:bg-muted"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

          {/* Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">

            {/* Left Glow */}
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl"></div>

            {/* Right Glow */}
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
          </div>

          {/* Section Title */}
         

<h3 className="relative z-10 text-3xl font-bold text-center font-black text-gray-900 dark:text-white mb-6 animate-slide-in-top">
           Powerful {" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              Features for Every Role
            </span>
          </h3>

          {/* Feature Cards */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: 'Real-Time Analytics',
                description:
                  'Track performance metrics and make data-driven decisions instantly',
              },
              {
                icon: Shield,
                title: 'Secure Transactions',
                description:
                  'Bank-level security for all your supply chain operations',
              },
              {
                icon: BarChart3,
                title: 'Advanced Reporting',
                description:
                  'Comprehensive insights into inventory and order management',
              },
              {
                icon: MessageSquare,
                title: 'Direct Communication',
                description:
                  'Seamless messaging between all stakeholders in your supply chain',
              },
              {
                icon: Zap,
                title: 'Lightning Fast',
                description:
                  'Optimized performance for smooth user experience',
              },
              {
                icon: Shield,
                title: 'Multi-Role Support',
                description:
                  'Tailored interfaces for retailers, factories, distributors, and drivers',
              },
            ].map((feature, index) => {
              const Icon = feature.icon

              return (
                <Card
                  key={index}
                  className="relative overflow-hidden p-6 rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-lg hover:scale-[1.03] hover:bg-white/40 transition-all duration-500 animate-slide-in-bottom"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Mirror Shine */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

                  {/* Icon */}
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-5 shadow-lg">
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <h4 className="relative z-10 text-xl font-semibold text-blue-700 dark:text-white mb-3">
                    {feature.title}
                  </h4>

                  {/* Description */}
                  <p className="relative z-10 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              )
            })}
          </div>
        </section>

        {/* User Types Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

          {/* Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">

            {/* Left Glow */}
            <div className="absolute -top-10 left-0 w-72 h-72 bg-blue-300/30 rounded-full blur-3xl"></div>

            {/* Right Glow */}
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-300/30 rounded-full blur-3xl"></div>
          </div>

          {/* Title */}


          <h3 className="relative z-10 text-3xl font-bold text-center font-black text-gray-900 dark:text-white mb-6 animate-slide-in-top">
            Built {" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
              for Everyone
            </span>
          </h3>

          {/* Cards */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                role: 'Retailers',
                description: 'Browse & order products efficiently',
              },
              {
                role: 'Factories',
                description: 'Manage production & sales',
              },
              {
                role: 'Distributors',
                description: 'Optimize inventory & logistics',
              },
              {
                role: 'Drivers',
                description: 'Track & complete deliveries',
              },
              {
                role: 'Admins',
                description: 'Control platform & users',
              },
            ].map((item, index) => (
              <Card
                key={index}
                className="p-6 text-center rounded-3xl border border-white/40 bg-white/30 backdrop-blur-xl shadow-lg hover:scale-105 hover:bg-white/40 transition-all duration-500 animate-slide-in-bottom"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Mirror Shine Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

                <h4 className="relative z-10 text-lg font-semibold text-blue-700 dark:text-white mb-2">
                  {item.role}
                </h4>

                <p className="relative z-10 text-sm text-gray-700 dark:text-gray-300">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

          {/* Background Glow (like your login image style) */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-10 w-80 h-80 bg-blue-300/30 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
          </div>

          {/* Glass Card */}
          <div className="relative z-10 rounded-3xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-xl p-12 text-center">

            {/* Shine overlay (mirror effect) */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

            {/* Content */}



            <h3 className="relative z-10 text-3xl font-bold font-black text-gray-900 dark:text-white mb-6 animate-slide-in-top">
              Ready to {" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                Transform Your Supply Chain?
              </span>
            </h3>
            <p className="relative z-10 text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that are already using TradeBridge to streamline their operations.
            </p>

            <Button
              onClick={() => navigate('/login')}
              size="lg"
              className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-lg"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  )
}
