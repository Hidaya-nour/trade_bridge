import React from 'react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Retail Store Owner',
    content: "TradeBridge transformed how I source products. I can now compare multiple suppliers and track deliveries in real-time.",
    rating: 5,
  },
  {
    name: 'Michael Okonkwo',
    role: 'Distributor',
    content: "The platform helped us scale our distribution network. The driver assignment feature is a game-changer.",
    rating: 5,
  },
  {
    name: 'David Tesfaye',
    role: 'Driver',
    content: "I love how easy it is to get delivery assignments and navigate using the app. The support team is responsive.",
    rating: 4,
  },
];

const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Trusted by Businesses Like Yours
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Join thousands of satisfied users
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="p-6 bg-white rounded-xl shadow-sm">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">
                    {i < testimonial.rating ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;