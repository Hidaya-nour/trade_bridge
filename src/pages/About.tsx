import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { AnimatedBackground } from '@/components/animated-background'
import { AnimatedClouds } from '@/components/animated-clouds'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Users, Target, Award, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate()

  const values = [
    {
      icon: Target,
      title: 'Mission-Driven',
      description: 'We are committed to transforming supply chain management through technology and innovation.',
    },
    {
      icon: Users,
      title: 'People-Focused',
      description: 'Our platform is designed with every stakeholder in mind - from retailers to drivers.',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in every aspect of our product and service delivery.',
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'Continuously innovating to solve real-world supply chain challenges.',
    },
  ]

  const team = [
    {
      name: 'John Smith',
      role: 'CEO & Founder',
      description: 'Serial entrepreneur with 15+ years in supply chain technology.',
      image: '/team/ceo.jpg',
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      description: 'Full-stack engineer passionate about building scalable platforms.',
      image: '/team/ceo.jpg',
    },
    {
      name: 'Michael Chen',
      role: 'VP Product',
      description: 'Product leader dedicated to user-centric design and innovation.',
      image: '/team/product.jpg',
    },
    {
      name: 'Emma Davis',
      role: 'VP Operations',
      description: 'Operations expert with extensive supply chain management experience.',
      image: '/team/ceo.jpg',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted relative overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10">
        <Navigation />

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-56 my-8 text-center relative">
          <AnimatedClouds />
          <div className="relative z-10">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white py-4 mb-6 animate-slide-in-top">
              About{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
                TradeBridge
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-slide-in-bottom" style={{ animationDelay: '0.1s' }}>
              We&apos;re building the future of supply chain management with innovative technology and a commitment to our community.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background glow (like login/register style) */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Glass card */}
  <div className="relative z-10 max-w-3xl mx-auto rounded-3xl bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border border-white/40 shadow-xl p-10">

    {/* mirror shine overlay */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

    {/* Title */}
    <h3 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-8">
      Our{" "}
      <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
        Mission
      </span>
    </h3>

    {/* Text */}
    <p className="relative z-10 text-lg text-gray-700 dark:text-gray-300 text-center leading-relaxed">
      To create the most intuitive and efficient supply-demand management platform that empowers businesses
      to make smarter decisions, reduce costs, and maximize their operational efficiency. We believe that with
      the right tools and connections, every business can thrive in the modern supply chain ecosystem.
    </p>

  </div>
</section>

       {/* Values Section */}
<section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background glow */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Title */}
  <h3 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
    Our{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
      Values
    </span>
  </h3>

  {/* Grid */}
  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

    {values.map((value, index) => {
      const Icon = value.icon

      return (
        <Card
          key={index}
          className="relative overflow-hidden p-6 rounded-3xl border border-white/40 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg hover:scale-[1.03] transition-all duration-500"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* mirror shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

          {/* icon */}
          <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mb-4 shadow-md">
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* title */}
          <h3 className="relative z-10 text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {value.title}
          </h3>

          {/* description */}
          <p className="relative z-10 text-sm text-gray-700 dark:text-gray-300">
            {value.description}
          </p>
        </Card>
      )
    })}

  </div>
</section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background glow (same style as other sections) */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Grid */}
  <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">

    {[
      { number: '5000+', label: 'Active Users' },
      { number: '50+', label: 'Countries' },
      { number: '2M+', label: 'Transactions' },
      { number: '99.9%', label: 'Uptime' },
    ].map((stat, index) => (
      <Card
        key={index}
        className="relative overflow-hidden p-8 text-center rounded-3xl border border-white/40 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg hover:scale-105 transition-all duration-500"
      >
        {/* mirror shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

        {/* number */}
        <p className="relative z-10 text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent mb-2">
          {stat.number}
        </p>

        {/* label */}
        <p className="relative z-10 text-gray-700 dark:text-gray-300">
          {stat.label}
        </p>
      </Card>
    ))}
  </div>
</section>

        {/* Team Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">

  {/* Background Glow (same style as other sections) */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-0 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl"></div>
    <div className="absolute bottom-0 right-10 w-96 h-96 bg-cyan-300/30 rounded-full blur-3xl"></div>
    <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
  </div>

  {/* Title */}
  <h3 className="relative z-10 text-4xl font-black text-center text-gray-900 dark:text-white mb-14">
    Meet{" "}
    <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
      the Team
    </span>
  </h3>

  {/* Grid */}
  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

    {team.map((member, index) => (
      <Card
        key={index}
        className="relative overflow-hidden p-8 text-center rounded-3xl border border-white/40 bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl shadow-lg hover:scale-[1.03] transition-all duration-500"
        style={{ animationDelay: `${index * 0.1}s` }}
      >

        {/* Mirror shine overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

        {/* Image */}
        <div className="relative z-10 w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 border-2 border-white/40 shadow-md">
          <img
            src={member.image}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name */}
        <h3 className="relative z-10 text-lg font-semibold text-gray-900 dark:text-white mb-1">
          {member.name}
        </h3>

        {/* Role */}
        <p className="relative z-10 text-sm font-medium bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent mb-3">
          {member.role}
        </p>

        {/* Description */}
        <p className="relative z-10 text-sm text-gray-700 dark:text-gray-300">
          {member.description}
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

    {/* Mirror shine overlay */}
    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/40 via-transparent to-white/10 pointer-events-none"></div>

    {/* Title */}
    <h3 className="relative z-10 text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
      Ready to{" "}
      <span className="bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent">
        Join TradeBridge?
      </span>
    </h3>

    {/* Description */}
    <p className="relative z-10 text-lg text-gray-700 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
      Start your journey with us today and experience a smarter way to manage your supply chain.
    </p>

    {/* Button */}
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
