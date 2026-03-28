// About.tsx
import { FeatureCard, TeamMember } from '../../components/landing/shared';

const About = () => {
  const features = [
    {
      icon: "🚀",
      title: "Fast & Reliable",
      description: "Quick order processing and real-time updates for your business."
    },
    {
      icon: "🔒",
      title: "Secure Transactions",
      description: "Your data and payments are protected with enterprise-grade security."
    },
    {
      icon: "🌍",
      title: "Global Reach",
      description: "Connect with suppliers and distributors across Ethiopia."
    },
    {
      icon: "📊",
      title: "Data-Driven Insights",
      description: "Make informed decisions with analytics and forecasting tools."
    },
    {
      icon: "💬",
      title: "24/7 Support",
      description: "Our team is always here to help you succeed."
    },
    {
      icon: "🔄",
      title: "Easy Integration",
      description: "Seamlessly integrate with your existing workflow."
    }
  ];

  const team = [
    {
      name: "Hidaya Nurmeika",
      role: "Project Manager",
      bio: "Leads project coordination and ensures timely delivery of milestones.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Hana Kebede",
      role: "System Designer",
      bio: "Architects the system design and database structure.",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Hana Jote",
      role: "Frontend Developer",
      bio: "Creates beautiful and responsive user interfaces.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    },
    {
      name: "Ebisa Gutema",
      role: "Backend Developer",
      bio: "Builds robust APIs and handles server-side logic.",
      social: {
        linkedin: "#",
        github: "#"
      }
    },
    {
      name: "Ilham Mohammedhassen",
      role: "QA & UI/UX Designer",
      bio: "Ensures quality and designs intuitive user experiences.",
      social: {
        linkedin: "#",
        twitter: "#"
      }
    }
  ];

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About TradeBridge</h1>
          <p className="text-xl max-w-2xl mx-auto">
            We're on a mission to transform B2B commerce in Ethiopia by connecting businesses seamlessly.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600">
                To empower Ethiopian businesses with a digital platform that simplifies procurement, 
                enhances visibility, and drives sustainable growth.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl mb-4">👁️</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
              <p className="text-gray-600">
                To become Ethiopia's leading B2B marketplace, connecting every business to endless opportunities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TradeBridge?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to streamline your business operations.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={<span className="text-2xl">{feature.icon}</span>}
                title={feature.title}
                description={feature.description}
                variant="default"
              />
          ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Passionate individuals working together to revolutionize B2B commerce.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {team.map((member, index) => (
              <TeamMember
                key={index}
                name={member.name}
                role={member.role}
                bio={member.bio}
                social={member.social}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;